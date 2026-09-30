import { Table as AntTable } from 'antd';
import { forwardRef, type ForwardedRef, type RefAttributes } from 'react';
import type { LxTableProps, LxTableRef } from './types';
import styles from './index.module.css';

type TableComponent = (<T extends object>(
  props: LxTableProps<T> & RefAttributes<LxTableRef>,
) => React.ReactElement | null) & {
  displayName?: string;
};

/**
 * Ant Design 5 table adapter for local and controlled data grids.
 *
 * Every public AntD prop is forwarded unchanged. Pagination, filtering,
 * sorting, selection, fixed columns, scrolling, and virtualisation therefore
 * retain their native controlled contracts. The component does not issue
 * requests, generate row keys, synchronise URLs, or add a layout wrapper.
 * `ref` points to AntD's public TableRef instance and `className` is applied
 * to the AntD root so horizontal scrolling and table display remain native.
 */
function TableRender<T extends object>(props: LxTableProps<T>, ref: ForwardedRef<LxTableRef>) {
  const { className, ...tableProps } = props;
  return (
    <AntTable<T>
      {...tableProps}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
}

// React's forwardRef cannot preserve a generic render function. This is the
// single documented boundary cast that restores row inference for columns,
// renderers, dataSource and rowSelection while keeping the public ref type.
export const Table = forwardRef(TableRender) as unknown as TableComponent;
Table.displayName = 'LxTable';

export type { LxTableColumns, LxTableProps, LxTableRef } from './types';
