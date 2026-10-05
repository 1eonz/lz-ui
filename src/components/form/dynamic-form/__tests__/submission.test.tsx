import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef, useEffect, useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DynamicForm } from '../index';
import type { DynamicFormRef, FieldSchema } from '../types';

describe('DynamicForm 提交异常协议', () => {
  it('错误回调收到与 omitHidden 提交相同的输出，失败保留存储并允许重试', async () => {
    const failure = new Error('保存失败');
    const finish = vi.fn().mockRejectedValueOnce(failure).mockResolvedValue(undefined);
    const report = vi.fn();
    const ref = createRef<DynamicFormRef>();
    render(
      <DynamicForm
        ref={ref}
        schema={[
          { key: 'phone', name: ['customer', 'phone'], type: 'text', label: '电话' },
          { key: 'secret', name: 'secret', type: 'text', hidden: true },
        ]}
        defaultValue={{ customer: { phone: '123' }, secret: 'private' }}
        omitHidden
        onFinish={finish}
        onFinishError={report}
      />,
    );
    await act(async () => ref.current?.submit());
    await waitFor(() => expect(report).toHaveBeenCalledTimes(1));
    const output = finish.mock.calls[0][0];
    expect(output).toEqual({ customer: { phone: '123' } });
    expect(report).toHaveBeenCalledWith(failure, output);
    expect(report.mock.calls[0][1]).toBe(output);
    expect(ref.current?.form.getFieldsValue(true)).toEqual({
      customer: { phone: '123' },
      secret: 'private',
    });
    expect(screen.getByRole('textbox', { name: '电话' })).toHaveValue('123');
    await act(async () => ref.current?.submit());
    await waitFor(() => expect(finish).toHaveBeenCalledTimes(2));
    expect(report).toHaveBeenCalledTimes(1);
  });

  it('校验成功时直接调用宿主，使提交锁早于同栈排队的微任务生效', async () => {
    const events: string[] = [];
    let observing = false;
    let locked = false;
    const ref = createRef<DynamicFormRef>();
    const schema: FieldSchema[] = [
      {
        key: 'name',
        name: 'name',
        type: 'text',
        label: '姓名',
        visible: () => {
          // 提交过滤发生在 AntD 成功回调中；这里排队的微任务可检测额外延迟。
          if (observing) {
            events.push('过滤');
            queueMicrotask(() => events.push(locked ? '已锁定' : '未锁定'));
          }
          return true;
        },
      },
    ];
    render(
      <DynamicForm
        ref={ref}
        schema={schema}
        onFinish={() => {
          locked = true;
          events.push('提交');
        }}
      />,
    );
    observing = true;
    await act(async () => ref.current?.submit());
    await waitFor(() => expect(events).toContain('提交'));
    expect(events).toEqual(['过滤', '提交', '已锁定']);
  });

  it('错误回调同步抛错时记录兜底日志，不重新通知或泄漏拒绝', async () => {
    const callbackFailure = new Error('错误展示失败');
    const report = vi.fn(() => {
      throw callbackFailure;
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const ref = createRef<DynamicFormRef>();
    try {
      render(
        <DynamicForm
          ref={ref}
          schema={[{ key: 'name', name: 'name', type: 'text', label: '姓名' }]}
          onFinish={async () => {
            throw new Error('提交失败');
          }}
          onFinishError={report}
        />,
      );
      await act(async () => ref.current?.submit());
      await waitFor(() =>
        expect(consoleError).toHaveBeenCalledWith(
          'DynamicForm 提交失败回调执行异常',
          callbackFailure,
        ),
      );
      expect(report).toHaveBeenCalledTimes(1);
    } finally {
      consoleError.mockRestore();
    }
  });

  it('字段校验失败仅通知 onFinishFailed', async () => {
    const finish = vi.fn();
    const report = vi.fn();
    const validationFailed = vi.fn();
    render(
      <DynamicForm
        schema={[{ key: 'name', name: 'name', type: 'text', label: '姓名', required: true }]}
        onFinish={finish}
        onFinishError={report}
        onFinishFailed={validationFailed}
      >
        <button type="submit">保存</button>
      </DynamicForm>,
    );
    fireEvent.click(screen.getByRole('button', { name: '保存' }));
    await waitFor(() => expect(validationFailed).toHaveBeenCalledTimes(1));
    expect(finish).not.toHaveBeenCalled();
    expect(report).not.toHaveBeenCalled();
  });

  it('卸载后处理不可取消的提交拒绝，不泄漏拒绝或更新宿主状态', async () => {
    const failure = new Error('卸载后的提交失败');
    const submittedValues = { name: 'Lin' };
    let rejectRequest!: (reason: Error) => void;
    const request = new Promise<void>((_, reject) => {
      rejectRequest = reject;
    });
    const finish = vi.fn(() => request);
    const report = vi.fn();
    const stateUpdate = vi.fn();
    const unhandledRejections: unknown[] = [];
    const onUnhandledRejection = (reason: unknown) => unhandledRejections.push(reason);
    const ref = createRef<DynamicFormRef>();

    function Host() {
      const mounted = useRef(false);
      const [error, setError] = useState('');

      useEffect(() => {
        mounted.current = true;
        return () => {
          mounted.current = false;
        };
      }, []);

      return (
        <DynamicForm
          ref={ref}
          schema={[{ key: 'name', name: 'name', type: 'text', label: '姓名' }]}
          defaultValue={submittedValues}
          error={error || undefined}
          onFinish={finish}
          onFinishError={(reason, values) => {
            report(reason, values);
            if (mounted.current) {
              stateUpdate();
              setError('提交失败');
            }
          }}
        />
      );
    }

    process.on('unhandledRejection', onUnhandledRejection);
    try {
      const view = render(<Host />);
      await act(async () => ref.current?.submit());
      expect(finish).toHaveBeenCalledWith(submittedValues);

      view.unmount();
      await act(async () => {
        rejectRequest(failure);
        await Promise.resolve();
      });

      expect(report).toHaveBeenCalledTimes(1);
      expect(report).toHaveBeenCalledWith(failure, submittedValues);
      expect(stateUpdate).not.toHaveBeenCalled();
      expect(unhandledRejections).toEqual([]);
    } finally {
      process.off('unhandledRejection', onUnhandledRejection);
    }
  });
});
