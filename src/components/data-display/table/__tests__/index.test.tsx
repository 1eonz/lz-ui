import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Table, type LxTableRef } from '..';

type Customer = { id: string; name: string; active: boolean };

const data: Customer[] = [
  { id: 'c-1', name: 'Alice', active: true },
  { id: 'c-2', name: 'Bob', active: false },
];

const columns = [
  { title: '客户', dataIndex: 'name', key: 'name' },
  { title: '状态', dataIndex: 'active', key: 'active' },
];

describe('Table', () => {
  it('infers generic row data and renders columns', () => {
    render(<Table<Customer> rowKey="id" dataSource={data} columns={columns} />);

    expect(screen.getByRole('columnheader', { name: '客户' })).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('forwards controlled pagination and change events', () => {
    const onChange = vi.fn();
    render(
      <Table<Customer>
        rowKey="id"
        dataSource={data}
        columns={columns}
        pagination={{ current: 1, pageSize: 1, total: 2 }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByTitle('Next Page'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ current: 2, pageSize: 1 }),
      expect.any(Object),
      expect.any(Object),
      expect.any(Object),
    );
  });

  it('forwards sort and filter change events', () => {
    const onChange = vi.fn();
    render(
      <Table<Customer>
        rowKey="id"
        dataSource={data}
        columns={[
          { title: '客户', dataIndex: 'name', key: 'name', sorter: true },
          {
            title: '状态',
            dataIndex: 'active',
            key: 'active',
            filters: [{ text: '启用', value: true }],
          },
        ]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('columnheader', { name: '客户' }));
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'filter' })).toBeInTheDocument();
  });

  it('forwards row selection', () => {
    const onSelectChange = vi.fn();
    render(
      <Table<Customer>
        rowKey="id"
        dataSource={data}
        columns={columns}
        rowSelection={{ onChange: onSelectChange }}
      />,
    );

    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    expect(onSelectChange).toHaveBeenCalledWith(['c-1'], expect.any(Array), expect.any(Object));
  });

  it('forwards ref and className without adding a wrapper contract', () => {
    const ref = createRef<LxTableRef>();
    const { container } = render(
      <Table<Customer>
        ref={ref}
        className="custom-table"
        rowKey="id"
        dataSource={data}
        columns={columns}
      />,
    );

    expect(ref.current).toBeTruthy();
    expect(container.firstElementChild).toHaveClass('custom-table');
    expect(container.firstElementChild?.parentElement).toBe(container);
  });

  it('forwards scroll and virtual options', () => {
    render(
      <Table<Customer>
        rowKey="id"
        dataSource={data}
        columns={columns}
        scroll={{ x: 600, y: 200 }}
        virtual
      />,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
  });
  it('preserves host row events, styles and header attributes while adding density classes', () => {
    const onClick = vi.fn();
    render(
      <Table<Customer>
        rowKey="id"
        dataSource={data}
        columns={columns}
        pagination={false}
        onRow={() => ({ className: 'host-row', style: { height: 72 }, onClick })}
        onHeaderRow={() => ({ className: 'host-header', title: '业务表头' })}
      />,
    );
    const row = screen.getByText('Alice').closest('tr');
    expect(row).toHaveClass('host-row');
    expect(row).toHaveStyle({ height: '72px' });
    fireEvent.click(screen.getByText('Alice'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByTitle('业务表头')).toHaveClass('host-header');
  });
});
