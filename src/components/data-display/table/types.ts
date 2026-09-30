import type { Table as AntTable, TableColumnsType, TableProps as AntTableProps } from 'antd';
import type { ComponentRef } from 'react';

/**
 * lx-ui Table props are the public Ant Design 5 table contract.
 *
 * The host owns request lifecycles, URL synchronisation, caching, permissions,
 * and cross-page selection state. Keep `rowKey` stable in business data rather
 * than relying on an array index; the adapter never invents a key.
 */
export type LxTableProps<T extends object> = AntTableProps<T>;

/** Public Ant Design column definition with the row type preserved. */
export type LxTableColumns<T extends object> = TableColumnsType<T>;

/**
 * Public Ant Design Table instance reference.
 *
 * Ant Design 5 exposes the table instance through the component type rather
 * than a root-level `TableRef` alias. Deriving it from the root `Table`
 * component keeps this package independent of AntD's `antd/es/*` and
 * `rc-table` implementation paths. The resulting ref contract follows the
 * installed peer range (`antd >=5 <6`).
 */
export type LxTableRef = ComponentRef<typeof AntTable>;
