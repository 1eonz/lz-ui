// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Tooltip } from '..';

describe('Tooltip SSR', () => {
  it('服务端渲染不会因 useId 或同构布局副作用抛错', () => {
    expect(typeof window).toBe('undefined');
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      const markup = renderToString(
        <Tooltip open id="ssr-tooltip" title="服务端提示">
          <button type="button">查看详情</button>
        </Tooltip>,
      );

      expect(markup).toContain('查看详情');
      expect(markup).toContain('ssr-tooltip');
      const output = error.mock.calls.map((args) => args.join(' ')).join('\n');
      expect(output).not.toContain('useLayoutEffect does nothing on the server');
    } finally {
      error.mockRestore();
    }
  });
});
