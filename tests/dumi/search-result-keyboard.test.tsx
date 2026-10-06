import React from 'react';
import { createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { AnchorHTMLAttributes, ComponentProps, FC, ReactNode } from 'react';
import { useId, useRef } from 'react';
import type { ISearchResult } from 'dumi';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SearchResult from '../../node_modules/dumi/theme-default/slots/SearchResult/index.js';

type PatchedSearchResultProps = ComponentProps<typeof SearchResult> & {
  keywords: string;
  inputRef?: { current: HTMLInputElement | null };
  resultsId?: string;
  statusId?: string;
  instructionsId?: string;
};

const PatchedSearchResult = SearchResult as FC<PatchedSearchResultProps>;

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock('dumi', async () => {
  const React = await import('react');

  return {
    FormattedMessage: ({ id }: { id: string }) => React.createElement('span', null, id),
    history: { push: mocks.push },
    Link: ({ to, children, ...props }: MockLinkProps) =>
      React.createElement('a', { ...props, href: to }, children),
    useIntl: () => ({
      locale: 'zh-CN',
      formatMessage: ({ id }: { id: string }) =>
        id === 'search.keyboard.help' ? '使用上下方向键浏览结果，按 Enter 打开。' : id,
    }),
    useLocation: () => ({ pathname: '/docs' }),
  };
});

vi.mock('@ant-design/icons-svg/inline-svg/outlined/inbox.svg', () => ({
  ReactComponent: () => null,
}));
vi.mock('animated-scroll-to', () => ({ default: vi.fn() }));

function createResults(count: number, linkPrefix = '/docs'): ISearchResult {
  if (!count) return [];

  return [
    {
      priority: 0,
      hints: Array.from({ length: count }, (_, index) => ({
        type: 'page',
        link: `${linkPrefix}/${index + 1}`,
        priority: index,
        pageTitle: `页面 ${index + 1}`,
        highlightTitleTexts: [{ text: `页面 ${index + 1}`, highlighted: false }],
        highlightTexts: [{ text: '结果摘要', highlighted: false }],
      })),
    },
  ];
}

function SearchResultFixture({
  data,
  keywords,
  children,
}: {
  data: ISearchResult;
  keywords: string;
  children?: ReactNode;
}) {
  const instanceId = useId();
  const resultsId = `${instanceId}-results`;
  const statusId = `${instanceId}-status`;
  const instructionsId = `${instanceId}-instructions`;
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        aria-label="搜索"
        aria-controls={resultsId}
        aria-describedby={`${instructionsId} ${statusId}`}
        className="dumi-default-search-bar-input"
      />
      {children}
      <PatchedSearchResult
        data={data}
        inputRef={inputRef}
        keywords={keywords}
        loading={false}
        resultsId={resultsId}
        statusId={statusId}
        instructionsId={instructionsId}
      />
    </>
  );
}

describe('Dumi 搜索结果键盘状态', () => {
  beforeEach(() => {
    mocks.push.mockClear();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
  });
  afterEach(() => vi.clearAllMocks());

  it('结果缩短后重置活动项并忽略已经不存在的 Enter 目标', async () => {
    const { rerender } = render(<SearchResultFixture data={createResults(2)} keywords="旧查询" />);
    const searchInput = screen.getByRole('textbox', { name: '搜索' });

    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    expect(screen.getAllByRole('link')[1]).toHaveAttribute('data-active', 'true');

    rerender(<SearchResultFixture data={createResults(1)} keywords="新查询" />);
    await waitFor(() => expect(screen.getByRole('link')).not.toHaveAttribute('data-active'));

    fireEvent.keyDown(searchInput, { key: 'Enter' });

    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('空结果时方向键不会留下 NaN 活动索引', async () => {
    const { rerender } = render(<SearchResultFixture data={createResults(0)} keywords="查询" />);
    const searchInput = screen.getByRole('textbox', { name: '搜索' });

    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    rerender(<SearchResultFixture data={createResults(1)} keywords="查询" />);

    const result = await screen.findByRole('link');
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });

    expect(result).toHaveAttribute('data-active', 'true');
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it('未输入关键词时显示中性提示而不是无结果状态', () => {
    render(<SearchResultFixture data={createResults(0)} keywords="" />);

    expect(screen.getByText('search.start')).toBeInTheDocument();
    expect(screen.queryByText('search.not.found')).not.toBeInTheDocument();
  });

  it('无结果时提供更换关键词的恢复建议', () => {
    render(<SearchResultFixture data={createResults(0)} keywords="不存在" />);

    const emptyState = document.querySelector('.dumi-default-search-empty');
    expect(emptyState).toHaveTextContent('search.not.found');
    expect(emptyState).toHaveTextContent('search.try.again');
  });

  it('索引加载失败时显示可操作的刷新按钮', () => {
    const retry = vi.fn();
    render(<PatchedSearchResult data={[]} error keywords="查询" loading={false} onRetry={retry} />);

    expect(document.querySelector('.dumi-default-search-empty')).toHaveTextContent('search.error');
    fireEvent.click(screen.getByRole('button', { name: 'search.reload' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('搜索框关联结果区域、键盘说明和活动结果播报，同时保留链接语义', async () => {
    render(<SearchResultFixture data={createResults(2)} keywords="采购" />);

    const searchInput = screen.getByRole('textbox', { name: '搜索' });
    const resultsRegion = screen.getByRole('region', {
      name: 'search.results',
    });
    const describedByIds = searchInput.getAttribute('aria-describedby')?.split(' ') ?? [];

    expect(searchInput).toHaveAttribute('aria-controls', resultsRegion.id);
    expect(describedByIds).toHaveLength(2);
    expect(describedByIds.map((id) => document.getElementById(id))).toEqual(
      expect.arrayContaining([
        screen.getByText('使用上下方向键浏览结果，按 Enter 打开。'),
        screen.getByRole('status'),
      ]),
    );

    const arrowDown = createEvent.keyDown(searchInput, { key: 'ArrowDown' });
    fireEvent(searchInput, arrowDown);

    expect(await screen.findByRole('link', { name: /页面 1/ })).toHaveAttribute(
      'data-active',
      'true',
    );
    expect(arrowDown.defaultPrevented).toBe(true);
    expect(screen.getByRole('status')).toHaveTextContent('第 1 个搜索结果：页面 1');
    expect(searchInput).not.toHaveAttribute('aria-activedescendant');
  });

  it('无活动项时按 ArrowUp 选择唯一结果', async () => {
    render(<SearchResultFixture data={createResults(1)} keywords="查询" />);
    const searchInput = screen.getByRole('textbox', { name: '搜索' });

    fireEvent.keyDown(searchInput, { key: 'ArrowUp' });

    expect(await screen.findByRole('link')).toHaveAttribute('data-active', 'true');
  });

  it('无活动项时按 ArrowUp 选择多项结果中的最后一项', async () => {
    render(<SearchResultFixture data={createResults(3)} keywords="查询" />);
    const searchInput = screen.getByRole('textbox', { name: '搜索' });

    fireEvent.keyDown(searchInput, { key: 'ArrowUp' });

    const results = await screen.findAllByRole('link');
    expect(results[0]).not.toHaveAttribute('data-active');
    expect(results[1]).not.toHaveAttribute('data-active');
    expect(results[2]).toHaveAttribute('data-active', 'true');
  });

  it('并存的搜索面只响应所属输入，Enter 仅导航一次', async () => {
    render(
      <>
        <SearchResultFixture data={createResults(1, '/topbar')} keywords="顶栏查询" />
        <SearchResultFixture data={createResults(1, '/modal')} keywords="弹窗查询" />
      </>,
    );

    const searchInputs = screen.getAllByRole('textbox', { name: '搜索' });
    const results = await screen.findAllByRole('link');
    const firstScroll = vi.fn();
    const secondScroll = vi.fn();
    Object.defineProperty(results[0], 'scrollIntoView', { value: firstScroll });
    Object.defineProperty(results[1], 'scrollIntoView', {
      value: secondScroll,
    });

    fireEvent.keyDown(searchInputs[0], { key: 'ArrowDown' });

    await waitFor(() => {
      expect(firstScroll).toHaveBeenCalledWith({ block: 'nearest' });
    });
    expect(firstScroll).toHaveBeenCalledTimes(1);
    expect(secondScroll).not.toHaveBeenCalled();
    expect(results[0]).toHaveAttribute('data-active', 'true');
    expect(results[1]).not.toHaveAttribute('data-active');

    fireEvent.keyDown(searchInputs[0], { key: 'Enter' });

    expect(mocks.push).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledWith('/topbar/1');
    expect(results[1]).not.toHaveAttribute('data-active');
  });

  it('清除按钮获焦时 Enter 不导航，按钮点击仍可清除', async () => {
    const clear = vi.fn();
    render(
      <SearchResultFixture data={createResults(1)} keywords="查询">
        <button className="dumi-default-search-clear" onClick={clear} type="button">
          清除
        </button>
      </SearchResultFixture>,
    );

    const searchInput = screen.getByRole('textbox', { name: '搜索' });
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    expect(await screen.findByRole('link')).toHaveAttribute('data-active', 'true');

    const clearButton = screen.getByRole('button', { name: '清除' });
    clearButton.focus();
    fireEvent.keyDown(clearButton, { key: 'Enter' });
    expect(mocks.push).not.toHaveBeenCalled();

    fireEvent.click(clearButton);
    expect(clear).toHaveBeenCalledTimes(1);
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
