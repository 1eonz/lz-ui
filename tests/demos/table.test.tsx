import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TableDemo from '../../docs/demos/table';

vi.mock('lx-ui', async () => {
  const [{ Button }, { Empty }, { Result }, { Table }, { Tag }] = await Promise.all([
    import('../../src/components/general/button'),
    import('../../src/components/data-display/empty'),
    import('../../src/components/data-display/result'),
    import('../../src/components/data-display/table'),
    import('../../src/components/data-display/tag'),
  ]);

  return { Button, Empty, Result, Table, Tag };
});

vi.mock('../../docs/demos/data-display-demo-frame', () => ({
  DataDisplayDemoFrame: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Table 文档示例', () => {
  it('为行选择和当前页全选提供可访问名称并更新选择数', () => {
    render(<TableDemo />);

    const firstRow = screen.getByRole('checkbox', { name: '选择采购单 PO-2024-1881' });
    const selectCurrentPage = screen.getByRole('checkbox', {
      name: '选择当前页全部采购单',
    });

    fireEvent.click(firstRow);
    expect(screen.getByRole('status')).toHaveTextContent('已选择 1 条');

    fireEvent.click(selectCurrentPage);
    expect(screen.getByRole('status')).toHaveTextContent('已选择 5 条');
  });
});
