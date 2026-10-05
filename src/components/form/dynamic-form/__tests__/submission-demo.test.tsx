import { act, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { DynamicFormRef } from '../types';
import DynamicSubmitDemo from '../../../../../docs/demos/dynamic-doc-submit';
import DynamicFormDemo from '../../../../../docs/demos/dynamic-form';
import { scrollDynamicFormFieldIntoView } from '../../../../../docs/demos/dynamic-form-utils';

vi.mock('dumi', () => ({
  usePrefersColor: () => ['dark'],
  useSiteData: () => ({ themeConfig: { prefersColor: { default: 'light' } } }),
}));

// 文档壳依赖 Dumi 运行时；隔离壳而保留真实表单、请求和焦点行为。
vi.mock('../../../../../docs/demos/data-display-demo-frame', () => ({
  DataDisplayDemoFrame: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

async function submitFrom(input: HTMLElement) {
  await act(async () => {
    input.focus();
    fireEvent.submit(input.closest('form')!);
  });
}

function focusBody() {
  // jsdom 对已禁用 input 的 blur 有别于浏览器，直接重现浏览器 BODY 落点。
  document.body.tabIndex = -1;
  document.body.focus();
  document.body.removeAttribute('tabindex');
}

describe('提交 demo 宿主焦点与请求生命周期', () => {
  it('按 Dumi 吸顶顶栏高度滚动页面，并保留嵌套滚动位置', () => {
    const header = document.createElement('div');
    header.className = 'dumi-default-header';
    vi.spyOn(header, 'getBoundingClientRect').mockReturnValue({ bottom: 60 } as DOMRect);
    document.body.append(header);

    const previousScroller = Object.getOwnPropertyDescriptor(document, 'scrollingElement');
    const previousPageScroll = Object.getOwnPropertyDescriptor(
      document.documentElement,
      'scrollTo',
    );
    Object.defineProperty(document, 'scrollingElement', {
      configurable: true,
      value: document.documentElement,
    });
    const pageScroll = vi.fn();
    const fieldScroll = vi.fn();
    Object.defineProperty(document.documentElement, 'scrollTo', {
      configurable: true,
      value: pageScroll,
    });
    const nestedScroller = document.createElement('div');
    Object.defineProperty(nestedScroller, 'scrollTo', {
      configurable: true,
      value: fieldScroll,
    });
    const actions = [
      { el: document.documentElement, top: 300, left: 4 },
      { el: nestedScroller, top: 50, left: 2 },
    ];
    const scrollToField = vi.fn(
      (_name: unknown, options?: { behavior?: (items: typeof actions) => void }) =>
        options?.behavior?.(actions),
    );

    try {
      scrollDynamicFormFieldIntoView(
        { scrollToField } as unknown as DynamicFormRef['form'],
        'name',
      );
      expect(scrollToField).toHaveBeenCalledWith(
        'name',
        expect.objectContaining({ focus: true, block: 'start', scrollMode: 'always' }),
      );
      expect(pageScroll).toHaveBeenCalledWith({ top: 240, left: 4, behavior: 'auto' });
      expect(fieldScroll).toHaveBeenCalledWith({ top: 50, left: 2, behavior: 'auto' });
    } finally {
      header.remove();
      if (previousScroller) {
        Object.defineProperty(document, 'scrollingElement', previousScroller);
      } else {
        Reflect.deleteProperty(document, 'scrollingElement');
      }
      if (previousPageScroll) {
        Object.defineProperty(document.documentElement, 'scrollTo', previousPageScroll);
      } else {
        Reflect.deleteProperty(document.documentElement, 'scrollTo');
      }
    }
  });

  it('完整示例跟随文档暗色，局部明暗选择保持独立', () => {
    const { container } = render(<DynamicFormDemo />);
    const themeRoot = container.querySelector('[data-lx-mode]');
    expect(themeRoot).toHaveAttribute('data-lx-mode', 'dark');
    fireEvent.change(screen.getByRole('combobox', { name: '主题' }), {
      target: { value: 'light' },
    });
    expect(themeRoot).toHaveAttribute('data-lx-mode', 'light');
  });

  it.each([DynamicSubmitDemo, DynamicFormDemo])('空提交聚焦首个错误字段', async (Demo) => {
    // jsdom 没有原生 scrollTo；只补滚动能力，真实 AntD 校验及聚焦仍执行。
    const previous = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo');
    const scroll = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: scroll });
    try {
      render(<Demo />);
      const button = screen.getByRole('button', { name: '保存客户' });
      await act(async () => {
        button.focus();
        fireEvent.submit(button.closest('form')!);
      });
      expect(screen.getByRole('textbox', { name: '客户名称' })).toHaveFocus();
      expect(scroll).toHaveBeenCalled();
    } finally {
      if (previous) Object.defineProperty(HTMLElement.prototype, 'scrollTo', previous);
      else Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo');
    }
  });
  it('首次失败保留值并恢复被禁用后落到 BODY 的输入焦点，重试成功', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      render(
        <StrictMode>
          <DynamicSubmitDemo />
        </StrictMode>,
      );
      const input = screen.getByRole('textbox', { name: '客户名称' });
      fireEvent.change(input, { target: { value: '云栖科技' } });
      await submitFrom(input);
      expect(input).toBeDisabled();
      expect(screen.getByText('正在保存客户')).toBeInTheDocument();
      // jsdom 不自动执行浏览器 disabled 造成的失焦，显式重现该原生结果。
      act(focusBody);
      expect(document.activeElement).toBe(document.body);
      await act(async () => vi.advanceTimersByTimeAsync(600));
      const alert = screen.getByRole('alert');
      const retry = screen.getByRole('button', { name: '重试保存' });
      expect(alert).toHaveTextContent('保存失败，请重试');
      expect(alert.parentElement).toBe(retry.parentElement);
      expect(screen.queryByText('保存未完成，请重试')).not.toBeInTheDocument();
      expect(input).toHaveValue('云栖科技');
      expect(input).toHaveFocus();
      await submitFrom(input);
      await act(async () => vi.advanceTimersByTimeAsync(600));
      expect(screen.getByText('已保存客户：云栖科技')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('保存按钮失败后保留同一节点、焦点和值，并可直接重试成功', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      render(
        <StrictMode>
          <DynamicSubmitDemo />
        </StrictMode>,
      );
      const input = screen.getByRole('textbox', { name: '客户名称' });
      fireEvent.change(input, { target: { value: '云栖科技' } });
      const save = screen.getByRole('button', { name: '保存客户' });

      await act(async () => {
        save.focus();
        fireEvent.submit(save.closest('form')!);
      });
      expect(input).toBeDisabled();
      await act(async () => vi.advanceTimersByTimeAsync(600));

      const retry = screen.getByRole('button', { name: '重试保存' });
      expect(retry).toBe(save);
      expect(retry).toHaveFocus();
      expect(screen.getByRole('alert')).toHaveTextContent('保存失败，请重试');
      expect(input).toHaveValue('云栖科技');

      await act(async () => fireEvent.click(retry));
      expect(input).toBeDisabled();
      await act(async () => vi.advanceTimersByTimeAsync(600));

      expect(screen.getByText('已保存客户：云栖科技')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('用户转向其他控件后即使再次失焦，也不抢回原输入焦点', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      render(
        <>
          <DynamicSubmitDemo />
          <button>其他操作</button>
        </>,
      );
      const input = screen.getByRole('textbox', { name: '客户名称' });
      fireEvent.change(input, { target: { value: '云栖科技' } });
      await submitFrom(input);
      const other = screen.getByRole('button', { name: '其他操作' });
      act(() => {
        other.focus();
        other.blur();
      });
      await act(async () => vi.advanceTimersByTimeAsync(600));
      expect(document.activeElement).toBe(document.body);
      expect(input).not.toHaveFocus();
    } finally {
      vi.useRealTimers();
    }
  });

  it('卸载取消当前请求并清理计时器，不泄漏提交拒绝', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const { unmount } = render(<DynamicSubmitDemo />);
      const input = screen.getByRole('textbox', { name: '客户名称' });
      fireEvent.change(input, { target: { value: '云栖科技' } });
      await submitFrom(input);
      expect(input).toBeDisabled();
      await act(async () => unmount());
      await act(async () => vi.runAllTimersAsync());
      expect(vi.getTimerCount()).toBe(0);
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
      vi.useRealTimers();
    }
  });

  it('完整客户示例失败后恢复输入焦点并保留填写内容', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      render(
        <StrictMode>
          <DynamicFormDemo />
        </StrictMode>,
      );
      const input = screen.getByRole('textbox', { name: '客户名称' });
      fireEvent.change(input, { target: { value: '云栖科技' } });
      fireEvent.change(screen.getByRole('textbox', { name: '联系邮箱' }), {
        target: { value: 'a@example.com' },
      });
      fireEvent.click(screen.getByRole('checkbox', { name: '模拟保存失败（用于演示恢复）' }));
      await submitFrom(input);
      expect(input).toBeDisabled();
      act(focusBody);
      await act(async () => vi.advanceTimersByTimeAsync(550));
      const alert = screen.getByRole('alert');
      const retry = screen.getByRole('button', { name: '重试保存' });
      expect(alert).toHaveTextContent('保存失败');
      expect(alert.parentElement).toBe(retry.parentElement);
      expect(input).toHaveValue('云栖科技');
      expect(input).toHaveFocus();
      await act(async () => fireEvent.click(screen.getByRole('button', { name: '重试保存' })));
      await act(async () => vi.advanceTimersByTimeAsync(550));
      expect(screen.getByText('已保存客户：云栖科技')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('重试按钮在保存中卸载后，按结果聚焦新的恢复动作', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      render(
        <StrictMode>
          <DynamicFormDemo />
        </StrictMode>,
      );
      const input = screen.getByRole('textbox', { name: '客户名称' });
      fireEvent.change(input, { target: { value: '云栖科技' } });
      fireEvent.change(screen.getByRole('textbox', { name: '联系邮箱' }), {
        target: { value: 'a@example.com' },
      });
      fireEvent.click(screen.getByRole('checkbox', { name: '模拟保存失败（用于演示恢复）' }));
      await submitFrom(input);
      await act(async () => vi.advanceTimersByTimeAsync(550));

      const retry = screen.getByRole('button', { name: '重试保存' });
      act(() => retry.focus());
      await act(async () => fireEvent.click(retry));
      await act(async () => vi.advanceTimersByTimeAsync(550));

      expect(screen.getByText('已保存客户：云栖科技')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '查看客户' })).toHaveFocus();
    } finally {
      vi.useRealTimers();
    }
  });

  it('重试期间用户转向其它操作后不抢回焦点', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      render(
        <>
          <DynamicFormDemo />
          <button type="button">其它操作</button>
        </>,
      );
      const input = screen.getByRole('textbox', { name: '客户名称' });
      fireEvent.change(input, { target: { value: '云栖科技' } });
      fireEvent.change(screen.getByRole('textbox', { name: '联系邮箱' }), {
        target: { value: 'a@example.com' },
      });
      fireEvent.click(screen.getByRole('checkbox', { name: '模拟保存失败（用于演示恢复）' }));
      await submitFrom(input);
      await act(async () => vi.advanceTimersByTimeAsync(550));

      await act(async () => fireEvent.click(screen.getByRole('button', { name: '重试保存' })));
      const other = screen.getByRole('button', { name: '其它操作' });
      act(() => other.focus());
      await act(async () => vi.advanceTimersByTimeAsync(550));

      expect(screen.getByText('已保存客户：云栖科技')).toBeInTheDocument();
      expect(other).toHaveFocus();
    } finally {
      vi.useRealTimers();
    }
  });

  it('继续新增恢复客户名称，普通重置保留重置按钮焦点', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const previous = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo');
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: vi.fn(),
    });
    try {
      render(<DynamicFormDemo />);
      const input = screen.getByRole('textbox', { name: '客户名称' });
      fireEvent.change(input, { target: { value: '云栖科技' } });
      fireEvent.change(screen.getByRole('textbox', { name: '联系邮箱' }), {
        target: { value: 'a@example.com' },
      });
      await submitFrom(input);
      await act(async () => vi.advanceTimersByTimeAsync(550));
      const add = screen.getByRole('button', { name: '继续新增' });
      act(() => add.focus());
      fireEvent.click(add);
      expect(screen.getByRole('textbox', { name: '客户名称' })).toHaveFocus();
      const reset = screen.getByRole('button', { name: '重置' });
      act(() => reset.focus());
      fireEvent.click(reset);
      expect(reset).toHaveFocus();
    } finally {
      if (previous) Object.defineProperty(HTMLElement.prototype, 'scrollTo', previous);
      else Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo');
      vi.useRealTimers();
    }
  });
});
