import { act, renderHook } from '@testing-library/react';
import type { useSiteSearch as UseSiteSearch } from '../../node_modules/dumi/dist/client/theme-api/useSiteSearch/index.js';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type SearchMessage = {
  action: string;
  args?: { keywords?: string };
};

class MockWorker {
  static instances: MockWorker[] = [];

  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  messages: SearchMessage[] = [];

  constructor() {
    MockWorker.instances.push(this);
  }

  postMessage(message: SearchMessage) {
    this.messages.push(message);
  }
}

const mocks = vi.hoisted(() => ({
  data: [[{ id: 'docs', path: '/docs', meta: {} }], [{}]],
  load: vi.fn(),
  navData: [],
}));

vi.mock('dumi', () => ({
  useNavData: () => mocks.navData,
}));

vi.mock('../../node_modules/dumi/dist/client/theme-api/useSiteSearch/useSearchData', () => ({
  default: () => [mocks.data, mocks.load],
}));

let worker: MockWorker;
let useSiteSearch: typeof UseSiteSearch;

beforeAll(async () => {
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:search-worker') });
  vi.stubGlobal('Worker', MockWorker);
  vi.stubGlobal('SEARCH_WORKER_CODE', '');
  ({ useSiteSearch } =
    await import('../../node_modules/dumi/dist/client/theme-api/useSiteSearch/index.js'));
  worker = MockWorker.instances[0];
});

beforeEach(() => {
  vi.useFakeTimers();
  worker.messages = [];
  worker.onmessage = null;
  worker.onerror = null;
  mocks.load.mockClear();
  mocks.load.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

afterAll(() => vi.unstubAllGlobals());

function searchMessages() {
  return worker.messages.filter((message) => message.action === 'get-search-result');
}

describe('Dumi useSiteSearch query transitions', () => {
  it('重复设置相同关键词时保留等待中的防抖查询', async () => {
    const { result } = renderHook(() => useSiteSearch());

    act(() => result.current.setKeywords('保留中的查询'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    act(() => result.current.setKeywords('保留中的查询'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(99);
    });
    expect(searchMessages()).toEqual([]);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(searchMessages().map((message) => message.args?.keywords)).toEqual(['保留中的查询']);
    expect(result.current.loading).toBe(true);
  });

  it('cancels a pending debounce and resets loading when keywords are cleared', async () => {
    const { result } = renderHook(() => useSiteSearch());

    act(() => result.current.setKeywords('待搜索'));
    expect(result.current.loading).toBe(true);

    act(() => result.current.setKeywords(''));

    expect(result.current.loading).toBe(false);
    expect(result.current.result).toEqual([]);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(searchMessages()).toEqual([]);
  });

  it('ignores an in-flight response after clearing and keeps the newer query loading', async () => {
    const { result } = renderHook(() => useSiteSearch());
    const staleResults = [{ stale: true }];
    const currentResults = [{ current: true }];

    act(() => result.current.setKeywords('旧查询'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(searchMessages().map((message) => message.args?.keywords)).toEqual(['旧查询']);

    act(() => result.current.setKeywords(''));
    expect(result.current.loading).toBe(false);
    expect(result.current.result).toEqual([]);

    act(() => result.current.setKeywords('新查询'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(searchMessages().map((message) => message.args?.keywords)).toEqual(['旧查询', '新查询']);

    act(() => worker.onmessage?.({ data: staleResults }));
    expect(result.current.loading).toBe(true);
    expect(result.current.result).toEqual([]);

    act(() => worker.onmessage?.({ data: currentResults }));
    expect(result.current.loading).toBe(false);
    expect(result.current.result).toEqual(currentResults);
  });

  it('exposes a recoverable error when search index loading rejects', async () => {
    mocks.load.mockRejectedValueOnce(new Error('index unavailable'));
    const { result } = renderHook(() => useSiteSearch());

    await act(async () => {
      result.current.setKeywords('查询');
      await Promise.resolve();
    });

    expect(result.current.error).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.retry).toEqual(expect.any(Function));
  });

  it('ignores late worker results and blocks new searches after the worker fails', async () => {
    const { result } = renderHook(() => useSiteSearch());
    act(() => result.current.setKeywords('失败中的查询'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(searchMessages().map((message) => message.args?.keywords)).toEqual(['失败中的查询']);

    act(() => worker.onerror?.());

    expect(result.current.error).toBe(true);
    expect(result.current.loading).toBe(false);

    act(() => worker.onmessage?.({ data: [{ stale: true }] }));
    expect(result.current.result).toEqual([]);

    act(() => result.current.setKeywords('错误后的新查询'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(searchMessages().map((message) => message.args?.keywords)).toEqual(['失败中的查询']);
    expect(result.current.error).toBe(true);
    expect(result.current.loading).toBe(false);
  });
});
