// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from '..';

describe('Pagination SSR', () => {
  it('renders without browser globals or layout-effect warnings', () => {
    expect(typeof window).toBe('undefined');
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const markup = renderToString(<Pagination total={30} />);
      expect(markup).toContain('<ul');
      const output = error.mock.calls.map((args) => args.join(' ')).join('\n');
      expect(output).not.toContain('useLayoutEffect does nothing on the server');
    } finally {
      error.mockRestore();
    }
  });
});
