import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TagDemo from '../../docs/demos/tag';

vi.mock('lx-ui', async () => {
  const [{ Button }, { CheckableTag, Tag }] = await Promise.all([
    import('../../src/components/general/button'),
    import('../../src/components/data-display/tag'),
  ]);

  return { Button, CheckableTag, Tag };
});

vi.mock('../../docs/demos/data-display-demo-frame', () => ({
  DataDisplayDemoFrame: ({ children }: { children: React.ReactNode }) => (
    <div
      role="group"
      aria-label="标签示例主题作用域"
      style={{ '--lx-motion-tag-exit-duration': '120ms' } as React.CSSProperties}
    >
      {children}
    </div>
  ),
}));

function mockScopedMotionToken(scope: HTMLElement) {
  const getComputedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudoElement) => {
    const computedStyle = getComputedStyle(element, pseudoElement);
    if (!scope.contains(element)) return computedStyle;

    const scopedStyle = Object.create(computedStyle) as CSSStyleDeclaration;
    scopedStyle.getPropertyValue = (property) =>
      property === '--lx-motion-tag-exit-duration'
        ? scope.style.getPropertyValue(property)
        : computedStyle.getPropertyValue(property);
    return scopedStyle;
  });
}

describe('Tag 文档示例', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('验证分类互斥、多选、取消状态和关闭按钮名称', () => {
    render(<TagDemo />);

    const filters = within(screen.getByRole('group', { name: '业务分类' }));
    const all = filters.getByRole('button', { name: '全部业务' });
    const assets = filters.getByRole('button', { name: '固定资产' });
    const research = filters.getByRole('button', { name: '研发开发' });
    const logistics = filters.getByRole('button', { name: '物流分类' });
    const archived = filters.getByRole('button', { name: '历史归档' });
    const archivedReason = screen.getByText('历史归档仅供查看，不能作为当前筛选条件。');
    const status = screen.getByRole('status', { name: '当前分类结果' });

    expect(archived).toBeDisabled();
    expect(archived).toHaveAttribute('aria-describedby', 'tag-archive-disabled-reason');
    expect(archivedReason).toBeVisible();
    fireEvent.click(archived);
    expect(archived).toHaveAttribute('aria-pressed', 'false');
    expect(status).toHaveTextContent('当前选中分类：全部业务');

    fireEvent.click(assets);
    fireEvent.click(research);
    expect(all).toHaveAttribute('aria-pressed', 'false');
    expect(assets).toHaveAttribute('aria-pressed', 'true');
    expect(research).toHaveAttribute('aria-pressed', 'true');
    expect(logistics).toHaveAttribute('aria-pressed', 'false');
    expect(status).toHaveTextContent('当前选中分类：固定资产、研发开发');

    fireEvent.click(assets);
    expect(assets).toHaveAttribute('aria-pressed', 'false');
    expect(research).toHaveAttribute('aria-pressed', 'true');
    expect(status).toHaveTextContent('当前选中分类：研发开发');

    fireEvent.click(all);
    expect(all).toHaveAttribute('aria-pressed', 'true');
    expect(assets).toHaveAttribute('aria-pressed', 'false');
    expect(research).toHaveAttribute('aria-pressed', 'false');
    expect(logistics).toHaveAttribute('aria-pressed', 'false');
    expect(status).toHaveTextContent('当前选中分类：全部业务');

    fireEvent.click(all);
    expect(all).toHaveAttribute('aria-pressed', 'false');
    expect(assets).toHaveAttribute('aria-pressed', 'false');
    expect(research).toHaveAttribute('aria-pressed', 'false');
    expect(logistics).toHaveAttribute('aria-pressed', 'false');
    expect(status).toHaveTextContent('当前选中分类：无');

    const closeButtons = screen.getAllByRole('button', { name: /^移除/ });
    const closeNames = closeButtons.map((button) => button.getAttribute('aria-label'));
    expect(closeNames).toEqual([
      '移除ERP 模块',
      '移除服务 SLA',
      '移除VIP 供应商',
      '移除系统固定标签',
    ]);
    expect(new Set(closeNames).size).toBe(4);
    const fixedClose = screen.getByRole('button', { name: '移除系统固定标签' });
    expect(fixedClose).toBeDisabled();
    expect(fixedClose).toHaveAttribute('aria-describedby', 'tag-fixed-close-disabled-reason');
    expect(screen.getByText('系统固定标签由系统生成，当前示例不可关闭。')).toBeVisible();
  });

  it('plays the exit motion before removal, then restores focus and the label', () => {
    vi.useFakeTimers();
    render(<TagDemo />);
    fireEvent.click(screen.getByRole('button', { name: '移除ERP 模块' }));
    expect(screen.getByText('ERP 模块')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(120));
    expect(screen.queryByText('ERP 模块')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: '标签操作状态' })).toHaveTextContent(
      '已移除“ERP 模块”，可通过“恢复默认标签”还原。',
    );
    const restore = screen.getByRole('button', { name: '恢复默认标签' });
    expect(restore).toHaveFocus();
    fireEvent.click(restore);
    expect(screen.getByText('ERP 模块')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: '标签操作状态' })).toHaveTextContent(
      '已恢复默认标签。',
    );
  });

  it('cancels a pending exit when restoring the labels early', () => {
    vi.useFakeTimers();
    render(<TagDemo />);
    fireEvent.click(screen.getByRole('button', { name: '移除ERP 模块' }));
    fireEvent.click(screen.getByRole('button', { name: '移除服务 SLA' }));
    fireEvent.click(screen.getByRole('button', { name: '恢复默认标签' }));
    act(() => vi.advanceTimersByTime(120));
    expect(screen.getByText('ERP 模块')).toBeInTheDocument();
    expect(screen.getByText('服务 SLA')).toBeInTheDocument();
    expect(screen.getByText('VIP 供应商')).toBeInTheDocument();
  });

  it('示例卸载时会清理等待中的退出计时器', () => {
    vi.useFakeTimers();
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const { unmount } = render(<TagDemo />);
    mockScopedMotionToken(screen.getByRole('group', { name: '标签示例主题作用域' }));
    fireEvent.click(screen.getByRole('button', { name: '移除ERP 模块' }));
    const exitTimerIndex = setTimeoutSpy.mock.calls.findIndex(([, delay]) => delay === 120);
    expect(exitTimerIndex).not.toBe(-1);
    const exitTimer = setTimeoutSpy.mock.results[exitTimerIndex]?.value;

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalledWith(exitTimer);
  });

  it('preserves focus moved elsewhere during the exit motion', () => {
    vi.useFakeTimers();
    render(<TagDemo />);
    fireEvent.click(screen.getByRole('button', { name: '移除ERP 模块' }));
    const filter = screen.getByRole('button', { name: '固定资产' });
    filter.focus();
    act(() => vi.advanceTimersByTime(120));
    expect(filter).toHaveFocus();
    expect(screen.queryByText('ERP 模块')).not.toBeInTheDocument();
  });

  it('restores focus after removal when the close button blurs during the exit motion', () => {
    vi.useFakeTimers();
    render(<TagDemo />);
    const close = screen.getByRole('button', { name: '移除ERP 模块' });
    close.focus();
    fireEvent.click(close);
    close.blur();
    // JSDOM 不会从已禁用按钮的 blur 自动切回 body，显式聚焦 body 模拟浏览器中的失焦结果。
    document.body.tabIndex = -1;
    document.body.focus();
    expect(document.activeElement).toBe(document.body);
    document.body.removeAttribute('tabindex');
    act(() => vi.advanceTimersByTime(120));
    expect(screen.getByRole('button', { name: '恢复默认标签' })).toHaveFocus();
  });

  it('uses the exit duration from the Tag theme scope', () => {
    vi.useFakeTimers();
    render(<TagDemo />);
    const themeScope = screen.getByRole('group', { name: '标签示例主题作用域' });
    themeScope.style.setProperty('--lx-motion-tag-exit-duration', '400ms');
    mockScopedMotionToken(themeScope);
    fireEvent.click(screen.getByRole('button', { name: '移除ERP 模块' }));
    act(() => vi.advanceTimersByTime(120));
    expect(screen.getByText('ERP 模块')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(280));
    expect(screen.queryByText('ERP 模块')).not.toBeInTheDocument();
  });

  it('removes the label immediately when the reduced-motion token is zero', () => {
    vi.useFakeTimers();
    render(<TagDemo />);
    const themeScope = screen.getByRole('group', { name: '标签示例主题作用域' });
    themeScope.style.setProperty('--lx-motion-tag-exit-duration', '0ms');
    mockScopedMotionToken(themeScope);
    fireEvent.click(screen.getByRole('button', { name: '移除ERP 模块' }));
    act(() => vi.advanceTimersByTime(0));
    expect(screen.queryByText('ERP 模块')).not.toBeInTheDocument();
  });

  it('removes the label immediately when the exit duration token is missing', () => {
    vi.useFakeTimers();
    render(<TagDemo />);
    const themeScope = screen.getByRole('group', { name: '标签示例主题作用域' });
    themeScope.style.removeProperty('--lx-motion-tag-exit-duration');
    mockScopedMotionToken(themeScope);
    fireEvent.click(screen.getByRole('button', { name: '移除ERP 模块' }));
    act(() => vi.advanceTimersByTime(0));
    expect(screen.queryByText('ERP 模块')).not.toBeInTheDocument();
  });

  it('removes the label immediately when the exit duration token is invalid', () => {
    vi.useFakeTimers();
    render(<TagDemo />);
    const themeScope = screen.getByRole('group', { name: '标签示例主题作用域' });
    themeScope.style.setProperty('--lx-motion-tag-exit-duration', 'later');
    mockScopedMotionToken(themeScope);
    fireEvent.click(screen.getByRole('button', { name: '移除ERP 模块' }));
    act(() => vi.advanceTimersByTime(0));
    expect(screen.queryByText('ERP 模块')).not.toBeInTheDocument();
  });
});
