import { createRef } from 'react';
import { ConfigProvider } from 'antd';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Table, type LxTableRef } from '..';
import styles from '../index.module.css';
import { Tag } from '../../tag';

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

  it.each([
    ['default', {}, true],
    ['large', { size: 'large' as const }, true],
    ['middle', { size: 'middle' as const }, false],
    ['small', { size: 'small' as const }, false],
    ['virtual', { virtual: true, scroll: { x: 600, y: 200 } }, false],
  ])('仅在默认和 large 表格设置 36px 表头样式：%s', (_label, options, styled) => {
    const { container } = render(
      <Table<Customer> rowKey="id" dataSource={data} columns={columns} {...options} />,
    );
    const header = container.querySelector('thead tr');

    expect(header?.classList.contains(styles.headerRow)).toBe(styled);
  });

  it.each([
    ['default', {}, true],
    ['large', { size: 'large' as const }, true],
    ['middle', { size: 'middle' as const }, false],
    ['small', { size: 'small' as const }, false],
    ['virtual', { virtual: true, scroll: { x: 600, y: 200 } }, false],
  ])('仅在默认和 large 表格为正文行设置密度样式：%s', (_label, options, styled) => {
    const { container } = render(
      <Table<Customer> rowKey="id" dataSource={data} columns={columns} {...options} />,
    );
    const row = container.querySelector('tbody tr');

    expect(row?.classList.contains(styles.bodyRow) ?? false).toBe(styled);
  });

  it.each([
    ['small', false],
    ['middle', false],
  ] as const)('继承 ConfigProvider 的 %s 尺寸时保留宿主行高', (componentSize, styled) => {
    const { container } = render(
      <ConfigProvider componentSize={componentSize}>
        <Table<Customer> rowKey="id" dataSource={data} columns={columns} />
      </ConfigProvider>,
    );
    const header = container.querySelector('thead tr');
    const row = container.querySelector('tbody tr');

    expect(header?.classList.contains(styles.headerRow)).toBe(styled);
    expect(row?.classList.contains(styles.bodyRow) ?? false).toBe(styled);
  });

  it('显式 large 覆盖 ConfigProvider 的 small 尺寸并应用 lx-ui 密度', () => {
    const { container } = render(
      <ConfigProvider componentSize="small">
        <Table<Customer> size="large" rowKey="id" dataSource={data} columns={columns} />
      </ConfigProvider>,
    );
    const header = container.querySelector('thead tr');
    const row = container.querySelector('tbody tr');

    expect(header).toHaveClass(styles.headerRow);
    expect(row).toHaveClass(styles.bodyRow);
  });

  it('状态 Tag 与长文本共存时保留自然增高空间', () => {
    const longName = '一段较长的客户名称，窄列中应允许内容自然换行';
    render(
      <Table<Customer>
        rowKey="id"
        dataSource={[{ id: 'c-1', name: longName, active: true }]}
        columns={[
          { title: '客户', dataIndex: 'name', key: 'name' },
          {
            title: '状态',
            key: 'status',
            render: () => <Tag color="success">已启用</Tag>,
          },
        ]}
        pagination={false}
      />,
    );
    const row = screen.getByText(longName).closest('tr');

    expect(row).toHaveClass(styles.bodyRow);
    expect(row).toContainElement(screen.getByText('已启用'));
    expect(row?.style.height).toBe('');
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
