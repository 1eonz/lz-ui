import { createRef, StrictMode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Tooltip } from '..';
import type { TooltipRef } from '..';
import { createMergedRef } from '../merged-ref';

describe('Tooltip', () => {
  it('在 StrictMode 重挂载后保持唯一的 aria-describedby 关系', async () => {
    const { rerender } = render(
      <StrictMode>
        <Tooltip open id="strict-tooltip" title="严格模式提示">
          <button aria-describedby="field-description" type="button">
            查看详情
          </button>
        </Tooltip>
      </StrictMode>,
    );

    const trigger = screen.getByRole('button', { name: '查看详情' });
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveAttribute('id', 'strict-tooltip');
    expect(trigger.getAttribute('aria-describedby')?.split(/\s+/)).toEqual([
      'field-description',
      'strict-tooltip',
    ]);

    rerender(
      <StrictMode>
        <Tooltip open id="strict-tooltip" title="严格模式提示">
          <button aria-describedby="field-description" type="button">
            查看详情
          </button>
        </Tooltip>
      </StrictMode>,
    );

    expect(trigger.getAttribute('aria-describedby')?.split(/\s+/)).toEqual([
      'field-description',
      'strict-tooltip',
    ]);
  });

  it('默认由鼠标悬停和键盘焦点打开，并保留触发元素属性', async () => {
    render(
      <Tooltip title="查看同步状态">
        <button aria-label="同步详情" data-record-id="cust-28" type="button">
          详情
        </button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: '同步详情' });
    expect(trigger).toHaveAttribute('data-record-id', 'cust-28');
    fireEvent.focus(trigger);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('查看同步状态');
  });

  it('键盘焦点离开后关闭 Tooltip，并恢复宿主描述', async () => {
    render(
      <>
        <span id="field-description">字段格式说明</span>
        <span id="form-description">表单校验说明</span>
        <Tooltip id="focus-tooltip" title="当前同步状态" aria-describedby="form-description">
          <button aria-describedby="field-description" type="button">
            同步详情
          </button>
        </Tooltip>
      </>,
    );

    const trigger = screen.getByRole('button', { name: '同步详情' });
    fireEvent.focus(trigger);

    await screen.findByRole('tooltip');
    expect(trigger).toHaveAttribute(
      'aria-describedby',
      'field-description form-description focus-tooltip',
    );

    fireEvent.blur(trigger);

    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    expect(trigger).toHaveAttribute('aria-describedby', 'field-description form-description');
  });

  it('打开时合并触发元素和组件上已有的描述 ID，关闭后保留原描述', async () => {
    const { rerender } = render(
      <>
        <span id="field-description">字段格式说明</span>
        <span id="form-description">表单校验说明</span>
        <Tooltip id="sync-tooltip" open title="当前同步状态" aria-describedby="form-description">
          <button aria-describedby="field-description" type="button">
            同步详情
          </button>
        </Tooltip>
      </>,
    );

    const trigger = screen.getByRole('button', { name: '同步详情' });
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveAttribute('id', 'sync-tooltip');
    expect(trigger).toHaveAttribute(
      'aria-describedby',
      'field-description form-description sync-tooltip',
    );
    expect(tooltip).toHaveStyle({ color: '#ffffff' });

    rerender(
      <>
        <span id="field-description">字段格式说明</span>
        <span id="form-description">表单校验说明</span>
        <Tooltip
          id="sync-tooltip"
          open={false}
          title="当前同步状态"
          aria-describedby="form-description"
        >
          <button aria-describedby="field-description" type="button">
            同步详情
          </button>
        </Tooltip>
      </>,
    );

    expect(trigger).toHaveAttribute('aria-describedby', 'field-description form-description');
  });

  it('标题动态清空时关闭弹层并移除 Tooltip 的描述关系', async () => {
    const { rerender } = render(
      <Tooltip open id="dynamic-tooltip" title="动态提示" aria-describedby="form-description">
        <button aria-describedby="field-description" type="button">
          动态提示目标
        </button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: '动态提示目标' });
    expect(await screen.findByRole('tooltip')).toHaveTextContent('动态提示');
    expect(trigger).toHaveAttribute(
      'aria-describedby',
      'field-description form-description dynamic-tooltip',
    );

    rerender(
      <Tooltip open id="dynamic-tooltip" title={null} aria-describedby="form-description">
        <button aria-describedby="field-description" type="button">
          动态提示目标
        </button>
      </Tooltip>,
    );

    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    expect(trigger).toHaveAttribute('aria-describedby', 'field-description form-description');

    rerender(
      <Tooltip open id="dynamic-tooltip" title={undefined} aria-describedby="form-description">
        <button aria-describedby="field-description" type="button">
          动态提示目标
        </button>
      </Tooltip>,
    );

    expect(trigger).toHaveAttribute('aria-describedby', 'field-description form-description');
  });

  it('合并 ref 在 null detach 时执行暂存的宿主清理并清空内部 ref', () => {
    const innerRef: { current: TooltipRef | null } = { current: null };
    const hostCleanup = vi.fn();
    const hostRef = vi.fn((instance: TooltipRef | null) => {
      if (instance) return hostCleanup;
      return undefined;
    });
    const mergedRef = createMergedRef(innerRef, hostRef);
    const instance = {
      nativeElement: document.createElement('button'),
      popupElement: null,
      forceAlign: vi.fn(),
    } as unknown as TooltipRef;

    const cleanup = mergedRef(instance);
    expect(innerRef.current).toBe(instance);
    expect(cleanup).toBeUndefined();
    expect(hostRef).toHaveBeenCalledTimes(1);
    expect(hostRef).toHaveBeenCalledWith(instance);

    mergedRef(null);

    expect(hostCleanup).toHaveBeenCalledTimes(1);
    expect(hostRef).toHaveBeenCalledTimes(1);
    expect(innerRef.current).toBeNull();
  });

  it('合并 ref 保留 React 18 的 ref(null) 通知和对象 ref 清理', () => {
    const innerRef: { current: TooltipRef | null } = { current: null };
    const hostRef = vi.fn();
    const mergedRef = createMergedRef(innerRef, hostRef);
    const instance = {
      nativeElement: document.createElement('button'),
      popupElement: null,
      forceAlign: vi.fn(),
    } as unknown as TooltipRef;

    mergedRef(instance);
    mergedRef(null);

    expect(hostRef).toHaveBeenNthCalledWith(1, instance);
    expect(hostRef).toHaveBeenNthCalledWith(2, null);
    expect(innerRef.current).toBeNull();

    const objectInnerRef: { current: TooltipRef | null } = { current: null };
    const hostObjectRef: { current: TooltipRef | null } = { current: null };
    const mergedObjectRef = createMergedRef(objectInnerRef, hostObjectRef);
    const cleanup = mergedObjectRef(instance);

    expect(hostObjectRef.current).toBe(instance);
    expect(cleanup).toBeUndefined();
    mergedObjectRef(null);
    expect(hostObjectRef.current).toBeNull();
    expect(objectInnerRef.current).toBeNull();
  });

  it('ReactDOM 挂载和卸载时执行宿主 ref cleanup 且不记录 React 18 警告', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const hostCleanup = vi.fn();
    const hostRef = vi.fn((instance: TooltipRef | null) => {
      if (instance) return hostCleanup;
      return undefined;
    });

    try {
      const { unmount } = render(
        <Tooltip ref={hostRef} title="ref 生命周期">
          <button type="button">ref 生命周期</button>
        </Tooltip>,
      );

      expect(hostRef).toHaveBeenCalledTimes(1);
      expect(hostRef).toHaveBeenCalledWith(
        expect.objectContaining({ forceAlign: expect.any(Function) }),
      );
      unmount();

      expect(hostCleanup).toHaveBeenCalledTimes(1);
      expect(hostRef).toHaveBeenCalledTimes(1);
      expect(
        consoleError.mock.calls.some(([message]) =>
          String(message).includes('Unexpected return value from a callback ref'),
        ),
      ).toBe(false);
    } finally {
      consoleError.mockRestore();
    }
  });

  it('ReactDOM 卸载时在宿主 ref 无 cleanup 时转发 null 且不记录 React 18 警告', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const hostRef = vi.fn();

    try {
      const { unmount } = render(
        <Tooltip ref={hostRef} title="ref null 通知">
          <button type="button">ref null 通知</button>
        </Tooltip>,
      );

      expect(hostRef).toHaveBeenCalledTimes(1);
      unmount();

      expect(hostRef).toHaveBeenCalledTimes(2);
      expect(hostRef).toHaveBeenNthCalledWith(2, null);
      expect(
        consoleError.mock.calls.some(([message]) =>
          String(message).includes('Unexpected return value from a callback ref'),
        ),
      ).toBe(false);
    } finally {
      consoleError.mockRestore();
    }
  });

  it('关闭时同步当前描述 ID，不保留上一次渲染的过期 Props', () => {
    const { rerender } = render(
      <Tooltip id="state-tooltip" open={false} title="状态说明" aria-describedby="form-hint-old">
        <button aria-describedby="field-hint-old" type="button">
          状态
        </button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: '状态' });
    rerender(
      <Tooltip
        id="state-tooltip"
        open={false}
        title="状态说明"
        aria-describedby="form-hint-current"
      >
        <button aria-describedby="field-hint-current" type="button">
          状态
        </button>
      </Tooltip>,
    );

    expect(trigger).toHaveAttribute('aria-describedby', 'field-hint-current form-hint-current');
    expect(trigger).not.toHaveAttribute(
      'aria-describedby',
      'field-hint-old form-hint-old state-tooltip',
    );
  });

  it('无变化的重新渲染不会重复写入或删除 aria-describedby', () => {
    const described = render(
      <Tooltip open={false} title="状态说明" aria-describedby="form-hint">
        <button aria-describedby="field-hint" type="button">
          有描述
        </button>
      </Tooltip>,
    );
    const describedTrigger = screen.getByRole('button', { name: '有描述' });
    const setAttribute = vi.spyOn(describedTrigger, 'setAttribute');
    const removeAttribute = vi.spyOn(describedTrigger, 'removeAttribute');

    described.rerender(
      <Tooltip open={false} title="状态说明" aria-describedby="form-hint">
        <button aria-describedby="field-hint" type="button">
          有描述
        </button>
      </Tooltip>,
    );

    expect(setAttribute).not.toHaveBeenCalled();
    expect(removeAttribute).not.toHaveBeenCalled();
    described.unmount();

    const undescribed = render(
      <Tooltip open={false} title="状态说明">
        <button type="button">无描述</button>
      </Tooltip>,
    );
    const undescribedTrigger = screen.getByRole('button', { name: '无描述' });
    const undescribedSetAttribute = vi.spyOn(undescribedTrigger, 'setAttribute');
    const undescribedRemoveAttribute = vi.spyOn(undescribedTrigger, 'removeAttribute');

    undescribed.rerender(
      <Tooltip open={false} title="状态说明">
        <button type="button">无描述</button>
      </Tooltip>,
    );

    expect(undescribedSetAttribute).not.toHaveBeenCalled();
    expect(undescribedRemoveAttribute).not.toHaveBeenCalled();
  });

  it('保留受控显隐语义，关闭状态下只通知宿主而不自行打开', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Tooltip open={false} onOpenChange={onOpenChange} title="受控提示">
        <button type="button">打开提示</button>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByRole('button', { name: '打开提示' }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    rerender(
      <Tooltip open onOpenChange={onOpenChange} title="受控提示">
        <button type="button">打开提示</button>
      </Tooltip>,
    );
    expect(await screen.findByRole('tooltip')).toHaveTextContent('受控提示');
  });

  it('让 open 优先于 visible，并在 visible 受控时忽略 defaultOpen', async () => {
    const modernOpenWins = render(
      <Tooltip open={false} visible title="新属性优先">
        <button type="button">新旧属性并用</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    modernOpenWins.unmount();

    const controlledVisible = render(
      <Tooltip visible={false} defaultOpen title="受控 visible" onVisibleChange={vi.fn()}>
        <button type="button">旧属性受控</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    controlledVisible.unmount();

    render(
      <Tooltip defaultOpen={false} defaultVisible title="defaultOpen 优先">
        <button type="button">初始值兼容</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('显式 trigger 覆盖默认 hover/focus，并保留原生 ref 能力', async () => {
    const ref = createRef<TooltipRef>();
    render(
      <Tooltip ref={ref} trigger="click" title="点击后显示">
        <button type="button">更多操作</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: '更多操作' });
    fireEvent.focus(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    fireEvent.click(trigger);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('点击后显示');
    expect(ref.current?.nativeElement).toBe(trigger);
    expect(ref.current?.forceAlign).toEqual(expect.any(Function));
  });

  it('将 getPopupContainer 交给 AntD，弹层仍可通过公开 tooltip 语义查询', async () => {
    const popupContainer = document.createElement('div');
    document.body.append(popupContainer);
    const { unmount } = render(
      <Tooltip
        open
        title="局部容器提示"
        getPopupContainer={() => popupContainer}
        classNames={{ body: 'custom-tooltip-body' }}
        styles={{ body: { maxWidth: 240 } }}
      >
        <button type="button">局部容器</button>
      </Tooltip>,
    );

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('局部容器提示');
    expect(popupContainer).toContainElement(tooltip);
    expect(tooltip).toHaveClass('custom-tooltip-body');

    unmount();
    popupContainer.remove();
  });
});
