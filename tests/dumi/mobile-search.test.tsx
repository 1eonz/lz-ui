import React from 'react';
import {
  act,
  createEvent,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type { AnchorHTMLAttributes } from 'react';
import postcss, { type Root, type Rule } from 'postcss';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SearchBar, {
  SearchMask,
} from '../../node_modules/dumi/theme-default/slots/SearchBar/index.js';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  setKeywords: vi.fn(),
  result: [
    {
      priority: 0,
      hints: [
        {
          type: 'page',
          link: '/docs/customers',
          priority: 0,
          pageTitle: '客户列表',
          highlightTitleTexts: [{ text: '客户列表', highlighted: false }],
          highlightTexts: [{ text: '查看客户记录', highlighted: false }],
        },
      ],
    },
  ],
}));

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

vi.mock('dumi', async () => {
  const React = await import('react');
  const messages: Record<string, string> = {
    'header.search.placeholder': '输入关键字搜索...',
    'search.clear': '清除搜索内容',
    'search.dialog': '站点搜索',
    'search.keyboard.help': '使用上下方向键浏览结果，按 Enter 打开。',
    'search.not.found': '没有找到相关内容',
    'search.results': '搜索结果',
    'search.start': '输入关键字搜索...',
  };

  return {
    FormattedMessage: ({ id }: { id: string }) =>
      React.createElement('span', null, messages[id] ?? id),
    history: { push: mocks.push },
    Link: ({ to, children, onClick, ...props }: MockLinkProps) =>
      React.createElement(
        'a',
        {
          ...props,
          href: to,
          onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
            onClick?.(event);
            event.preventDefault();
          },
        },
        children,
      ),
    useLocation: () => ({ pathname: '/docs' }),
    useIntl: () => ({
      locale: 'zh-CN',
      formatMessage: ({ id }: { id: string }) => messages[id] ?? id,
    }),
    useSiteSearch: () => {
      const [keywords, updateKeywords] = React.useState('');

      return {
        keywords,
        setKeywords: (value: string) => {
          mocks.setKeywords(value);
          updateKeywords(value);
        },
        result: mocks.result,
        loading: false,
        load: vi.fn(),
      };
    },
  };
});

vi.mock('@ant-design/icons-svg/inline-svg/outlined/arrow-down.svg', () => ({
  ReactComponent: () => null,
}));
vi.mock('@ant-design/icons-svg/inline-svg/outlined/arrow-up.svg', () => ({
  ReactComponent: () => null,
}));
vi.mock('@ant-design/icons-svg/inline-svg/outlined/search.svg', () => ({
  ReactComponent: () => null,
}));
vi.mock('@ant-design/icons-svg/inline-svg/outlined/close.svg', () => ({
  ReactComponent: () => null,
}));

function getDeclarations(rule: Rule) {
  const declarations: Record<string, string> = {};
  rule.walkDecls((declaration) => {
    declarations[declaration.prop] = declaration.value;
  });
  return declarations;
}

describe('Dumi 移动搜索清除与结果排版', () => {
  beforeEach(() => {
    mocks.setKeywords.mockClear();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
  });
  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('仅在查询非空时显示清除按钮，清除 Dumi 查询并保留焦点及结果文本', async () => {
    render(<SearchBar />);

    const input = screen.getByRole('textbox', { name: '输入关键字搜索...' });
    const topbarClearButton = input.parentElement?.querySelector<HTMLButtonElement>(
      '.dumi-default-search-clear',
    );
    expect(topbarClearButton).toHaveAttribute('hidden');
    expect(screen.queryByRole('button', { name: '清除搜索内容' })).not.toBeInTheDocument();

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '采购' } });

    const clearButton = await screen.findByRole('button', {
      name: '清除搜索内容',
    });
    expect(clearButton).toBe(topbarClearButton);
    const topbarResultsId = input.getAttribute('aria-controls');
    expect(topbarResultsId).toBeTruthy();
    expect(input.getAttribute('aria-describedby')?.split(' ')).toHaveLength(2);
    expect(clearButton.parentElement).toBe(input.parentElement);
    expect(clearButton.parentElement).toHaveClass('dumi-default-search-bar');
    expect(clearButton.parentElement).toHaveClass('dumi-default-search-bar-with-clear');

    const mouseDown = createEvent.mouseDown(clearButton);
    const preventDefault = vi.spyOn(mouseDown, 'preventDefault');
    fireEvent(clearButton, mouseDown);
    expect(preventDefault).toHaveBeenCalled();

    vi.spyOn(input, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, -100, 100, 40));
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    const initialDialog = await screen.findByRole('dialog', {
      name: '站点搜索',
    });
    const modalInput = initialDialog.querySelector('input') as HTMLInputElement;
    await waitFor(() => expect(modalInput).toHaveFocus());
    fireEvent.change(modalInput, { target: { value: '表格' } });

    const modalClearButton = await within(initialDialog).findByRole('button', {
      name: '清除搜索内容',
    });
    expect(topbarClearButton).toBeInTheDocument();
    expect(topbarClearButton).not.toHaveAttribute('hidden');
    expect(topbarClearButton).toHaveAttribute('aria-hidden', 'true');
    expect(topbarClearButton).toHaveAttribute('inert');
    expect(screen.getAllByRole('button', { name: '清除搜索内容' })).toEqual([modalClearButton]);
    expect(modalInput).toHaveAttribute('aria-controls');
    expect(modalInput.getAttribute('aria-controls')).not.toBe(topbarResultsId);
    expect(modalInput.getAttribute('aria-describedby')?.split(' ')).toHaveLength(2);
    expect(modalClearButton.parentElement).toBe(modalInput.parentElement);
    expect(modalInput.parentElement).toHaveStyle({ position: 'relative' });
    expect(input.parentElement).toHaveClass('dumi-default-search-bar-with-clear');
    expect(modalInput.parentElement).toHaveClass('dumi-default-search-input-wrapper');
    expect(modalInput.parentElement).toHaveClass('dumi-default-search-bar-with-clear');
    fireEvent.click(modalClearButton);

    expect(mocks.setKeywords).toHaveBeenLastCalledWith('');
    expect(modalInput).toHaveValue('');
    expect(modalInput).toHaveFocus();
    expect(input).toHaveValue('');
    expect(input.parentElement).not.toHaveClass('dumi-default-search-bar-with-clear');
    expect(modalInput.parentElement).not.toHaveClass('dumi-default-search-bar-with-clear');
    expect(screen.queryByRole('button', { name: '清除搜索内容' })).not.toBeInTheDocument();

    const modalEscape = createEvent.keyDown(document, { key: 'Escape' });
    const preventModalDefault = vi.spyOn(modalEscape, 'preventDefault');
    fireEvent(document, modalEscape);
    expect(preventModalDefault).toHaveBeenCalled();
    await waitFor(() => expect(modalInput).not.toBeInTheDocument());
    expect(topbarClearButton).toHaveAttribute('hidden');
    expect(topbarClearButton).not.toHaveAttribute('aria-hidden');
    expect(topbarClearButton).not.toHaveAttribute('inert');
  });

  it('鼠标选择顶栏结果后清空查询并收起结果', async () => {
    render(<SearchBar />);

    const input = screen.getByRole('textbox', { name: '输入关键字搜索...' });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '客户' } });
    const result = await screen.findByRole('link', { name: /客户列表/ });

    fireEvent.click(result);

    await waitFor(() => expect(screen.queryByRole('region', { name: '搜索结果' })).toBeNull());
    expect(input).toHaveValue('');
    expect(mocks.setKeywords).toHaveBeenLastCalledWith('');
  });

  it('弹窗关闭或卸载时恢复背景原有 inert 与 aria-hidden', () => {
    const outside = document.createElement('main');
    outside.setAttribute('inert', '');
    outside.setAttribute('aria-hidden', 'false');
    document.body.append(outside);
    const originalOverflow = document.body.style.getPropertyValue('overflow');
    const originalOverflowPriority = document.body.style.getPropertyPriority('overflow');
    document.body.style.setProperty('overflow', 'clip', 'important');
    const onMaskClick = vi.fn();
    const onClose = vi.fn();
    const { rerender, unmount } = render(
      <SearchMask visible onClose={onClose} onMaskClick={onMaskClick} dialogLabel="搜索">
        <button type="button">弹窗内容</button>
      </SearchMask>,
    );

    expect(document.body.style.getPropertyValue('overflow')).toBe('hidden');
    expect(document.body.style.getPropertyPriority('overflow')).toBe('important');
    expect(outside).toHaveAttribute('inert');
    expect(outside).toHaveAttribute('aria-hidden', 'true');
    const mask = document.querySelector('.dumi-default-search-modal-mask');
    expect(mask).not.toHaveAttribute('inert');
    fireEvent.click(mask!);
    expect(onMaskClick).toHaveBeenCalledTimes(1);

    rerender(
      <SearchMask visible={false} onClose={onClose} onMaskClick={onMaskClick} dialogLabel="搜索">
        <button type="button">弹窗内容</button>
      </SearchMask>,
    );

    expect(outside).toHaveAttribute('inert', '');
    expect(outside).toHaveAttribute('aria-hidden', 'false');
    expect(document.body.style.getPropertyValue('overflow')).toBe('clip');
    expect(document.body.style.getPropertyPriority('overflow')).toBe('important');
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <SearchMask visible onClose={onClose} onMaskClick={onMaskClick} dialogLabel="搜索">
        <button type="button">弹窗内容</button>
      </SearchMask>,
    );
    unmount();

    expect(outside).toHaveAttribute('inert', '');
    expect(outside).toHaveAttribute('aria-hidden', 'false');
    expect(document.body.style.getPropertyValue('overflow')).toBe('clip');
    expect(document.body.style.getPropertyPriority('overflow')).toBe('important');
    if (originalOverflow) {
      document.body.style.setProperty('overflow', originalOverflow, originalOverflowPriority);
    } else {
      document.body.style.removeProperty('overflow');
    }
    outside.remove();

    render(
      <SearchMask visible onMaskClick={onMaskClick}>
        <button type="button">弹窗内容</button>
      </SearchMask>,
    );
    expect(screen.getByRole('dialog', { name: '站点搜索' })).toBeInTheDocument();
  });

  it('将输入框关联到实际结果区域，并播报当前活动结果', async () => {
    render(<SearchBar />);

    const input = screen.getByRole('textbox', { name: '输入关键字搜索...' });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '客户' } });

    const resultsRegion = await screen.findByRole('region', {
      name: '搜索结果',
    });
    const describedByIds = input.getAttribute('aria-describedby')?.split(' ') ?? [];
    const status = screen.getByRole('status');

    expect(input).toHaveAttribute('aria-controls', resultsRegion.id);
    expect(describedByIds).toHaveLength(2);
    expect(document.getElementById(describedByIds[0])).toHaveTextContent(
      '使用上下方向键浏览结果，按 Enter 打开。',
    );
    expect(status).toHaveTextContent('找到 1 个搜索结果');

    fireEvent.keyDown(input, { key: 'ArrowDown' });

    expect(await screen.findByRole('link', { name: /客户列表/ })).toHaveAttribute(
      'data-active',
      'true',
    );
    expect(status).toHaveTextContent('第 1 个搜索结果：客户列表');
  });

  it('弹窗 Escape 在输入延迟回调前保留关键词并显示顶栏结果', () => {
    vi.useFakeTimers();
    render(<SearchBar />);

    const input = screen.getByRole('textbox', { name: '输入关键字搜索...' });
    vi.spyOn(input, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, -100, 100, 40));
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    act(() => vi.runOnlyPendingTimers());

    const dialog = screen.getByRole('dialog', { name: '站点搜索' });
    const modalInput = dialog.querySelector('input') as HTMLInputElement;
    expect(modalInput).toHaveFocus();
    mocks.setKeywords.mockClear();
    fireEvent.change(modalInput, { target: { value: '表格' } });
    expect(mocks.setKeywords).not.toHaveBeenCalled();

    const escape = createEvent.keyDown(modalInput, { key: 'Escape' });
    const preventDefault = vi.spyOn(escape, 'preventDefault');
    fireEvent(modalInput, escape);

    expect(preventDefault).toHaveBeenCalled();
    expect(modalInput).not.toBeInTheDocument();
    expect(input).toHaveFocus();
    expect(input).toHaveValue('表格');
    expect(screen.getByRole('region', { name: '搜索结果' })).toBeInTheDocument();
    expect(mocks.setKeywords).toHaveBeenCalledTimes(1);
    expect(mocks.setKeywords).toHaveBeenCalledWith('表格');

    act(() => vi.advanceTimersByTime(1));
    expect(mocks.setKeywords).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('region', { name: '搜索结果' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    const reopenedDialog = screen.getByRole('dialog', { name: '站点搜索' });
    const reopenedModalInput = reopenedDialog.querySelector('input') as HTMLInputElement;
    expect(input).toHaveValue('');
    expect(reopenedModalInput).toHaveValue('');
    act(() => vi.runOnlyPendingTimers());
    expect(reopenedModalInput).toHaveFocus();

    const modalMask = document.querySelector('.dumi-default-search-modal-mask');
    if (!modalMask) throw new Error('搜索遮罩未渲染');
    fireEvent.change(reopenedModalInput, { target: { value: '库存' } });
    fireEvent.click(modalMask);

    expect(reopenedModalInput).not.toBeInTheDocument();
    expect(input).toHaveFocus();
    expect(input).toHaveValue('库存');
    expect(reopenedModalInput).toHaveValue('库存');
    expect(mocks.setKeywords).toHaveBeenLastCalledWith('库存');
  });

  it('弹窗限制 Tab 焦点，遮罩关闭时保留查询并将焦点返回顶栏', async () => {
    render(<SearchBar />);

    const input = screen.getByRole('textbox', { name: '输入关键字搜索...' });
    vi.spyOn(input, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, -100, 100, 40));
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    const initialDialog = await screen.findByRole('dialog', {
      name: '站点搜索',
    });
    const modalInput = initialDialog.querySelector('input') as HTMLInputElement;
    await waitFor(() => expect(modalInput).toHaveFocus());
    fireEvent.change(modalInput, { target: { value: '客户' } });

    const result = await screen.findByRole('link', { name: /客户列表/ });
    const dialog = screen.getByRole('dialog', { name: '站点搜索' });
    const focusable = dialog.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(first).toBe(modalInput);
    expect(last).toBe(result);

    modalInput.focus();
    fireEvent.keyDown(modalInput, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(first).toHaveFocus();

    const modalMask = document.querySelector('.dumi-default-search-modal-mask');
    if (!modalMask) throw new Error('搜索遮罩未渲染');
    fireEvent.click(modalMask);

    await waitFor(() => expect(modalInput).not.toBeInTheDocument());
    expect(input).toHaveFocus();
    expect(input).toHaveValue('客户');
    expect(modalInput).toHaveValue('客户');
    expect(mocks.setKeywords).toHaveBeenLastCalledWith('客户');
    expect(screen.getByRole('region', { name: '搜索结果' })).toBeInTheDocument();
  });

  it('空查询弹窗不把隐藏清除按钮纳入 Tab 循环', async () => {
    render(<SearchBar />);

    const input = screen.getByRole('textbox', { name: '输入关键字搜索...' });
    vi.spyOn(input, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, -100, 100, 40));
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    const dialog = await screen.findByRole('dialog', { name: '站点搜索' });
    const modalInput = dialog.querySelector('input') as HTMLInputElement;
    const modalClearButton = dialog.querySelector('.dumi-default-search-clear');
    const result = within(dialog).getByRole('link', { name: /客户列表/ });
    await waitFor(() => expect(modalInput).toHaveFocus());

    expect(modalClearButton).toHaveAttribute('hidden');
    const focusable = dialog.querySelectorAll(
      'a[href]:not([hidden]), button:not([disabled]):not([hidden]), input:not([disabled]):not([hidden]), select:not([disabled]):not([hidden]), textarea:not([disabled]):not([hidden]), [tabindex]:not([tabindex="-1"]):not([hidden])',
    );
    expect(Array.from(focusable)).toEqual([modalInput, result]);
    expect(focusable).not.toContain(modalClearButton);

    fireEvent.keyDown(modalInput, { key: 'Tab', shiftKey: true });
    expect(result).toHaveFocus();
    fireEvent.keyDown(result, { key: 'Tab' });
    expect(modalInput).toHaveFocus();
  });

  it('键盘选择弹窗结果后清空查询且不把焦点拉回顶栏', async () => {
    render(<SearchBar />);

    const input = screen.getByRole('textbox', { name: '输入关键字搜索...' });
    vi.spyOn(input, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, -100, 100, 40));
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    const dialog = await screen.findByRole('dialog', { name: '站点搜索' });
    const modalInput = dialog.querySelector('input') as HTMLInputElement;
    await waitFor(() => expect(modalInput).toHaveFocus());
    fireEvent.change(modalInput, { target: { value: '客户' } });
    await screen.findByRole('link', { name: /客户列表/ });

    fireEvent.keyDown(modalInput, { key: 'ArrowDown' });
    fireEvent.keyDown(modalInput, { key: 'Enter' });

    await waitFor(() => expect(modalInput).not.toBeInTheDocument());
    expect(mocks.push).toHaveBeenCalledWith('/docs/customers');
    expect(input).not.toHaveFocus();
    expect(input).toHaveValue('');
    expect(modalInput).toHaveValue('');
    expect(mocks.setKeywords).toHaveBeenLastCalledWith('');
  });

  it('搜索未打开时不拦截页面级 Escape', () => {
    render(<SearchBar />);

    const escape = createEvent.keyDown(document, { key: 'Escape' });
    const preventDefault = vi.spyOn(escape, 'preventDefault');
    fireEvent(document, escape);

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('Escape 关闭顶栏结果并保留查询内容', async () => {
    render(<SearchBar />);

    const input = screen.getByRole('textbox', { name: '输入关键字搜索...' });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '客户' } });
    await screen.findByRole('region', { name: '搜索结果' });

    const escape = createEvent.keyDown(input, { key: 'Escape' });
    const preventDefault = vi.spyOn(escape, 'preventDefault');
    fireEvent(input, escape);

    expect(preventDefault).toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('region', { name: '搜索结果' })).toBeNull());
    expect(input).toHaveValue('客户');
  });

  it('为搜索结果配置窄屏滚动、换行、触控尺寸和焦点样式', () => {
    const css = readFileSync(resolve(process.cwd(), 'docs/docs-shell.css'), 'utf8');
    const stylesheet: Root = postcss.parse(css);
    const normalizedCss = css.replace(/\s+/g, ' ');
    expect(css).not.toContain(':has(');
    expect(normalizedCss).toContain(
      '.dumi-default-search-bar-with-clear .dumi-default-search-bar-input',
    );
    expect(normalizedCss).toContain(
      '.dumi-default-search-input-wrapper.dumi-default-search-bar-with-clear .dumi-default-search-bar-input',
    );
    const mobileRules: Rule[] = [];
    stylesheet.walkAtRules((atRule) => {
      if (atRule.params === '(max-width: 767px)') {
        atRule.walkRules((rule) => {
          mobileRules.push(rule);
        });
      }
    });
    const allRules: Rule[] = [];
    stylesheet.walkRules((rule) => {
      allRules.push(rule);
    });
    const resultLink = mobileRules.find(
      (rule) => rule.selector.includes('.dumi-default-search-bar') && rule.selector.endsWith('> a'),
    );
    const modalResultLink = mobileRules.find(
      (rule) =>
        rule.selector.includes('.dumi-default-search-modal') && rule.selector.endsWith('> a'),
    );
    const textRule = mobileRules.find(
      (rule) => rule.selector.includes('> h4') && rule.selector.includes('> p'),
    );
    const modalTextRule = mobileRules.find(
      (rule) =>
        rule.selector.includes('.dumi-default-search-modal') &&
        rule.selector.includes('> h4') &&
        rule.selector.includes('> p'),
    );
    const mainClearTarget = mobileRules.find(
      (rule) =>
        rule.selector.includes('.dumi-default-header') &&
        rule.selector.endsWith('.dumi-default-search-clear'),
    );
    const modalClearTarget = mobileRules.find(
      (rule) =>
        rule.selector.includes('.dumi-default-search-modal') &&
        rule.selector.endsWith('.dumi-default-search-clear'),
    );
    const headerResultsScroll = mobileRules.find(
      (rule) =>
        rule.selector.includes('.dumi-default-header .dumi-default-search-popover > section') &&
        rule.selector.includes('.dumi-default-search-modal .dumi-default-search-result'),
    );
    const headerResultsMaxHeight = mobileRules.find(
      (rule) => rule.selector === '.dumi-default-header .dumi-default-search-popover > section',
    );
    const clearFocusRule = allRules.find((rule) =>
      rule.selector.includes('.dumi-default-search-clear:focus-visible'),
    );
    const hiddenClearRule = allRules.find(
      (rule) => rule.selector === '.dumi-default-search-clear[hidden]',
    );
    const touchTargetSize = 'max(44px, var(--lx-control-target-touch-min, 44px))';

    expect(resultLink).toBeDefined();
    expect(resultLink && getDeclarations(resultLink)).toMatchObject({
      'block-size': 'auto',
      'min-block-size': '76px',
    });
    expect(modalResultLink).toBeDefined();
    expect(modalResultLink && getDeclarations(modalResultLink)).toMatchObject({
      'block-size': 'auto',
      'min-block-size': '76px',
    });
    expect(textRule).toBeDefined();
    expect(textRule && getDeclarations(textRule)).toMatchObject({
      'white-space': 'normal',
      'text-overflow': 'clip',
      overflow: 'visible',
      'overflow-wrap': 'anywhere',
    });
    expect(modalTextRule).toBeDefined();
    expect(modalTextRule && getDeclarations(modalTextRule)).toMatchObject({
      'white-space': 'normal',
      'text-overflow': 'clip',
      overflow: 'visible',
      'overflow-wrap': 'anywhere',
    });
    expect(mainClearTarget).toBeDefined();
    expect(mainClearTarget && getDeclarations(mainClearTarget)).toMatchObject({
      'inline-size': touchTargetSize,
      'block-size': touchTargetSize,
    });
    expect(modalClearTarget).toBeDefined();
    expect(modalClearTarget && getDeclarations(modalClearTarget)).toMatchObject({
      'inline-size': touchTargetSize,
      'block-size': touchTargetSize,
    });
    expect(headerResultsScroll && getDeclarations(headerResultsScroll)).toMatchObject({
      'min-block-size': '0',
      'overflow-x': 'hidden',
      'overflow-y': 'auto',
      'overscroll-behavior': 'contain',
      '-webkit-overflow-scrolling': 'touch',
    });
    expect(headerResultsMaxHeight && getDeclarations(headerResultsMaxHeight)).toMatchObject({
      'max-block-size': 'min(460px, calc(100dvh - 120px))',
    });
    expect(clearFocusRule).toBeDefined();
    expect(clearFocusRule?.selector).toContain(
      '.dumi-default-search-bar .dumi-default-search-clear:focus-visible',
    );
    expect(clearFocusRule?.selector).toContain(
      '.dumi-default-search-modal .dumi-default-search-clear:focus-visible',
    );
    expect(clearFocusRule && getDeclarations(clearFocusRule)).toMatchObject({
      outline: '2px solid var(--lx-focus-ring, #146ce8)',
      'outline-offset': '-3px',
    });
    expect(hiddenClearRule).toBeDefined();
    expect(hiddenClearRule?.parent).toBe(stylesheet);
    expect(hiddenClearRule && getDeclarations(hiddenClearRule)).toMatchObject({ display: 'none' });
  });
});
