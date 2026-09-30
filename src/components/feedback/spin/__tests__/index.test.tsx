import { render, screen, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Spin } from '..';
import { ConfigProvider } from 'antd';

describe('Spin', () => {
  afterEach(() => vi.useRealTimers());
  it('keeps children and exposes busy state immediately', () => {
    render(
      <Spin spinning tip="加载中">
        <div>内容</div>
      </Spin>,
    );
    expect(screen.getByText('内容')).toBeInTheDocument();
    expect(screen.getByText('内容').closest('[aria-busy]')).toHaveAttribute('aria-busy', 'true');
  });
  it('shows the nested indicator only after default delay, while its native root is busy immediately', () => {
    vi.useFakeTimers();
    const { container, rerender } = render(
      <Spin spinning indicator={<span data-testid="indicator" />}>
        <div>内容</div>
      </Spin>,
    );
    const root = container.firstElementChild;
    expect(root).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('内容').closest('[aria-busy]')).toBe(root);
    expect(screen.queryByTestId('indicator')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(299));
    expect(screen.queryByTestId('indicator')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByTestId('indicator')).toBeInTheDocument();
    rerender(
      <Spin spinning={false}>
        <div>内容</div>
      </Spin>,
    );
    expect(root).toHaveAttribute('aria-busy', 'false');
    expect(screen.getByText('内容')).toBeInTheDocument();
  });
  it('preserves AntD standalone delayed busy semantics and supports a caller delay', () => {
    vi.useFakeTimers();
    const { container } = render(
      <Spin
        spinning
        delay={200}
        rootClassName="native-root"
        indicator={<span data-testid="indicator" />}
      />,
    );
    expect(container.firstElementChild).toHaveClass('native-root');
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'false');
    act(() => vi.advanceTimersByTime(199));
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'false');
    act(() => vi.advanceTimersByTime(1));
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByTestId('indicator')).toBeVisible();
  });
  it('strips unsupported runtime props from a JavaScript-style object', () => {
    const runtimeProps = { fullscreen: true, percent: 25, spinning: true, delay: 0 };
    const { container } = render(
      <Spin {...runtimeProps}>
        <div>业务区域</div>
      </Spin>,
    );
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('业务区域').closest('[aria-busy]')).toBe(container.firstElementChild);
    expect(container.querySelector('[fullscreen], [percent]')).not.toBeInTheDocument();
  });
  it('owns its local default indicator and preserves explicit custom indicators', () => {
    const { container, rerender } = render(
      <ConfigProvider prefixCls="host" spin={{ indicator: <span>宿主全局图形</span> }}>
        <Spin delay={0} size="small" />
      </ConfigProvider>,
    );
    expect(screen.queryByText('宿主全局图形')).not.toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(container.querySelector('[percent]')).not.toBeInTheDocument();
    rerender(<Spin delay={0} size="large" indicator={<span>显式图形</span>} />);
    expect(screen.getByText('显式图形')).toBeInTheDocument();
  });
  it('cancels pending visual delay when unmounted', () => {
    vi.useFakeTimers();
    const { unmount } = render(
      <Spin spinning>
        <div>区域</div>
      </Spin>,
    );
    unmount();
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByText('区域')).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('does not add a status role to business content', () => {
    render(
      <Spin spinning>
        <div>区域</div>
      </Spin>,
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('forwards rootClassName to the AntD root without imposing a width contract', () => {
    const { container } = render(<Spin rootClassName="host-spin-root" />);
    expect(container.querySelector('.host-spin-root')).toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveStyle({ width: '100%' });
  });
});
