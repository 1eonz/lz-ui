import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DynamicForm } from '../index';
import type {
  DynamicFormRef,
  DynamicFieldOption,
  FieldSchema,
  FormRendererRegistry,
} from '../index';

describe('DynamicForm', () => {
  it('renders fields and emits controlled changes', () => {
    const onChange = vi.fn();
    render(
      <DynamicForm
        schema={[{ key: 'name', name: 'name', type: 'text', label: '姓名' }]}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Lin' } });
    expect(onChange).toHaveBeenCalledWith({ name: 'Lin' }, { name: 'Lin' });
  });

  it('keeps host actions after generated fields', () => {
    render(
      <DynamicForm schema={[{ key: 'name', name: 'name', type: 'text', label: '姓名' }]}>
        <button type="submit">保存</button>
      </DynamicForm>,
    );
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
  });

  it('renders conditional fields from current values', () => {
    render(
      <DynamicForm
        schema={[
          { key: 'enabled', name: 'enabled', type: 'switch', label: '启用' },
          {
            key: 'detail',
            name: 'detail',
            type: 'text',
            label: '详情',
            visible: (values) => values.enabled === true,
          },
        ]}
      />,
    );
    expect(screen.queryByRole('textbox', { name: '详情' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('recomputes conditional fields after an imperative reset', () => {
    const ref = createRef<DynamicFormRef>();
    render(
      <DynamicForm
        ref={ref}
        schema={[
          {
            key: 'level',
            name: 'level',
            type: 'select',
            label: '等级',
            options: [
              { label: '普通', value: 'standard' },
              { label: '重点', value: 'priority' },
            ],
          },
          {
            key: 'owner',
            name: 'owner',
            type: 'text',
            label: '专属负责人',
            visible: (values) => values.level === 'priority',
          },
        ]}
        defaultValue={{ level: 'standard' }}
      />,
    );
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('重点'));
    expect(screen.getByRole('textbox', { name: '专属负责人' })).toBeInTheDocument();
    act(() => ref.current?.reset());
    expect(screen.queryByRole('textbox', { name: '专属负责人' })).not.toBeInTheDocument();
    expect(ref.current?.form.getFieldValue('level')).toBe('standard');
  });

  it('exposes loading, error and empty semantics', () => {
    const { rerender } = render(<DynamicForm schema={[]} loading />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    rerender(<DynamicForm schema={[]} error="加载失败" />);
    expect(screen.getByRole('alert')).toHaveTextContent('加载失败');
    rerender(<DynamicForm schema={[]} empty="没有字段" />);
    expect(screen.getByRole('status')).toHaveTextContent('没有字段');
  });

  it('preserves the field node, value and focus through loading and error', () => {
    const schema: FieldSchema[] = [{ key: 'name', name: 'name', type: 'text', label: '姓名' }];
    const { rerender } = render(<DynamicForm schema={schema} />);
    const input = screen.getByRole('textbox', { name: '姓名' });
    fireEvent.change(input, { target: { value: 'Lin' } });
    act(() => input.focus());

    rerender(<DynamicForm schema={schema} loading />);
    expect(screen.getByRole('status')).toHaveTextContent('正在处理');
    expect(screen.getByRole('textbox', { name: '姓名' })).toBe(input);
    expect(input).toHaveValue('Lin');
    expect(input).toHaveFocus();

    rerender(<DynamicForm schema={schema} error="保存失败，请重试" />);
    expect(screen.getByRole('alert')).toHaveTextContent('保存失败，请重试');
    expect(screen.getByRole('textbox', { name: '姓名' })).toBe(input);
    expect(input).toHaveFocus();
  });

  it('keeps nested paths and omits hidden fields on submit', async () => {
    const onFinish = vi.fn();
    const ref = createRef<DynamicFormRef>();
    const schema: FieldSchema[] = [
      { key: 'phone', name: ['customer', 'phone'], type: 'text', label: '电话' },
      { key: 'secret', name: 'secret', type: 'text', label: '内部字段', hidden: true },
    ];
    render(
      <DynamicForm
        ref={ref}
        schema={schema}
        defaultValue={{ customer: { phone: '123' }, secret: 'private' }}
        omitHidden
        onFinish={onFinish}
      />,
    );
    ref.current?.submit();
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ customer: { phone: '123' } }));
  });

  it('forwards controlled props to a local custom renderer', () => {
    const onChange = vi.fn();
    const registry: FormRendererRegistry = {
      register: vi.fn(),
      resolve:
        () =>
        ({ controlProps }) => (
          <input
            aria-label="自定义编码"
            id={controlProps.id}
            value={String(controlProps.value ?? '')}
            onChange={(event) => controlProps.onChange?.(event)}
          />
        ),
    };
    render(
      <DynamicForm
        schema={[{ key: 'code', name: 'code', type: 'custom', renderer: 'code', label: '编码' }]}
        rendererRegistry={registry}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByRole('textbox', { name: '自定义编码' }), {
      target: { value: 'LX-01' },
    });
    expect(onChange).toHaveBeenCalledWith({ code: 'LX-01' }, { code: 'LX-01' });
  });

  it('passes the form-level disabled state to custom renderers', () => {
    const renderer = vi.fn(({ controlProps, disabled }) => (
      <input
        aria-label="自定义编码"
        data-disabled={String(disabled)}
        id={controlProps.id}
        value={String(controlProps.value ?? '')}
        onChange={(event) => controlProps.onChange?.(event)}
      />
    ));
    const registry: FormRendererRegistry = {
      register: vi.fn(),
      resolve: () => renderer,
    };
    const schema: FieldSchema[] = [
      { key: 'code', name: 'code', type: 'custom', renderer: 'code', label: '编码' },
    ];
    const { rerender } = render(
      <DynamicForm schema={schema} rendererRegistry={registry} disabled />,
    );

    expect(screen.getByRole('textbox', { name: '自定义编码' })).toHaveAttribute(
      'data-disabled',
      'true',
    );
    expect(renderer).toHaveBeenLastCalledWith(expect.objectContaining({ disabled: true }));

    rerender(<DynamicForm schema={schema} rendererRegistry={registry} />);
    expect(screen.getByRole('textbox', { name: '自定义编码' })).toHaveAttribute(
      'data-disabled',
      'false',
    );
    expect(renderer).toHaveBeenLastCalledWith(expect.objectContaining({ disabled: false }));
  });

  it('renders a local upload trigger and keeps read-only controls inert', () => {
    render(
      <DynamicForm
        schema={[
          { key: 'attachment', name: 'attachment', type: 'upload', label: '附件' },
          { key: 'amount', name: 'amount', type: 'number', label: '金额', readOnly: true },
        ]}
      />,
    );
    expect(screen.getByRole('button', { name: '选择文件' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: '金额' })).toBeDisabled();
  });

  it('runs independent async rules without aborting each other', async () => {
    const onFinish = vi.fn();
    const ref = createRef<DynamicFormRef>();
    const signals: AbortSignal[] = [];
    const validator = vi.fn(async (_value: unknown, context: { signal: AbortSignal }) => {
      signals.push(context.signal);
    });
    render(
      <DynamicForm
        ref={ref}
        schema={[
          {
            key: 'code',
            name: 'code',
            type: 'text',
            label: '编码',
            rules: [{ validator }, { validator }],
          },
        ]}
        onFinish={onFinish}
      />,
    );
    await act(async () => ref.current?.submit());
    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(signals).toHaveLength(2);
    expect(signals.every((signal) => !signal.aborted)).toBe(true);
  });

  it('uses the latest async select options when requests finish out of order', async () => {
    // 显式推进业务200ms防抖，避免全量并发测试的实际时钟负载影响请求启动。
    // 仅接管超时计时器，保留组件库其它调度；finally恢复，避免污染后续测试。
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const pending: Record<string, (options: DynamicFieldOption[]) => void> = {};
      const loadOptions = vi.fn(
        (query: string) =>
          new Promise<DynamicFieldOption[]>((resolve) => {
            pending[query] = resolve;
          }),
      );
      render(
        <DynamicForm
          schema={[{ key: 'city', name: 'city', type: 'select', label: '城市', loadOptions }]}
        />,
      );
      fireEvent.mouseDown(screen.getByRole('combobox'));
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'sh' } });
      expect(loadOptions).not.toHaveBeenCalled();
      await act(async () => vi.advanceTimersByTimeAsync(199));
      expect(loadOptions).not.toHaveBeenCalled();
      await act(async () => vi.advanceTimersByTimeAsync(1));
      expect(loadOptions).toHaveBeenCalledTimes(1);
      expect(pending.sh).toBeTypeOf('function');
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'sha' } });
      await act(async () => vi.advanceTimersByTimeAsync(200));
      expect(loadOptions).toHaveBeenCalledTimes(2);
      expect(pending.sha).toBeTypeOf('function');
      await act(async () => {
        pending.sha([{ label: '上海', value: 'shanghai' }]);
        pending.sh([{ label: '旧结果', value: 'old' }]);
      });
      expect(screen.getByText('上海')).toBeInTheDocument();
      expect(screen.queryByText('旧结果')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('clears stale search choices on failure and retries the failed query', async () => {
    const loadOptions = vi
      .fn<(query: string) => Promise<DynamicFieldOption[]>>()
      .mockResolvedValueOnce([{ label: '旧城市', value: 'old' }])
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([{ label: '北京', value: 'beijing' }]);
    render(
      <DynamicForm
        schema={[{ key: 'city', name: 'city', type: 'select', label: '城市', loadOptions }]}
      />,
    );
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);
    fireEvent.change(select, { target: { value: 'old' } });
    await waitFor(() => expect(screen.getByText('旧城市')).toBeInTheDocument());

    fireEvent.change(select, { target: { value: 'bei' } });
    expect(screen.queryByText('旧城市')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument());
    expect(screen.queryByText('旧城市')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '重试' }));
    await waitFor(() => expect(screen.getByText('北京')).toBeInTheDocument());
    expect(loadOptions).toHaveBeenLastCalledWith(
      'bei',
      expect.any(Object),
      expect.any(AbortSignal),
    );
  });
});
