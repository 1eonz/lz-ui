import type { Table as AntTable, TableColumnsType, TableProps as AntTableProps } from 'antd';
import type { ComponentRef } from 'react';

/**
 * lx-ui Table 属性沿用 Ant Design 5 的公开 Table 协议。
 *
 * 请求生命周期、URL 同步、缓存、权限和跨页选中状态由宿主管理。
 * rowKey 应使用业务数据中稳定的标识，避免依赖数组索引；适配层不会生成标识。
 */
export type LxTableProps<T extends object> = AntTableProps<T>;

/** 保留行数据类型的 Ant Design 公开列定义。 */
export type LxTableColumns<T extends object> = TableColumnsType<T>;

/**
 * Ant Design 公开 Table 实例引用。
 *
 * Ant Design 5 通过组件类型提供表格实例，根出口没有独立的 TableRef 别名。
 * 从根出口的 Table 组件推导引用类型，避免依赖 antd/es/* 或 rc-table
 * 实现路径。最终 ref 协议跟随已安装的 peer 范围（antd >=5.24 <6）。
 */
export type LxTableRef = ComponentRef<typeof AntTable>;
