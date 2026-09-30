import { createRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Alert } from '..';

// jsdom 缺少浏览器动画事件构造器，会使 AntD 跳过原生动效生命周期。
// 下方标准 transitionend 事件验证真实关闭实现，不模拟组件回调。
vi.hoisted(() => {
  Object.defineProperties(window, {
    AnimationEvent: { configurable: true, value: Event },
    TransitionEvent: { configurable: true, value: Event },
  });
});

describe('Alert', () => {
  it('renders message and preserves host role', () => {
    render(<Alert role="status" message="已保存" />);
    expect(screen.getByRole('status')).toHaveTextContent('已保存');
  });
  it('supports close lifecycle and action', async () => {
    const onClose = vi.fn();
    const afterClose = vi.fn();
    render(
      <Alert
        closable
        message="失败"
        action={<button>重试</button>}
        onClose={onClose}
        afterClose={afterClose}
      />,
    );
    expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument();
    const root = screen.getByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      fireEvent.transitionEnd(root);
      expect(afterClose).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByText('失败')).not.toBeInTheDocument();
  });
  it('exposes the AntD public ref shape', () => {
    const ref = createRef<{ nativeElement: HTMLDivElement }>();
    render(<Alert ref={ref} message="提示" />);
    expect(ref.current?.nativeElement).toBeInstanceOf(HTMLDivElement);
  });
});
