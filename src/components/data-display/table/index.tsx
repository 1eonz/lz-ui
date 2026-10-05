import { ConfigProvider, Table as AntTable } from 'antd';
import { forwardRef, useCallback, type ForwardedRef, type RefAttributes } from 'react';
import type { LxTableProps, LxTableRef } from './types';
import styles from './index.module.css';

type TableComponent = (<T extends object>(
  props: LxTableProps<T> & RefAttributes<LxTableRef>,
) => React.ReactElement | null) & {
  displayName?: string;
};

/**
 * 保留 AntD 泛型列与受控协议的表格适配层。
 * 分页、筛选、排序、选择、固定列和虚拟化不另建状态机；请求、rowKey
 * 与 URL 由宿主提供。ref 属于 AntD 公开实例，不增加布局包装层。
 * 通过公开 onRow/onHeaderRow 合并局部行类名，消费独立表格密度 token，
 * 不改写 columns 或依赖 AntD 私有 DOM。普通单行默认 48/36px，长内容
 * 可以增高；显式 middle/small 和虚拟行保留 AntD/宿主的尺寸责任。
 * 通过公开 ConfigProvider.useConfig() 读取宿主的 componentSize；size 显式传入时优先，
 * 只有解析后的默认尺寸或 large 才附加 lx-ui 行高类，避免覆盖宿主的 small/middle 密度。
 * 宿主的行属性、事件与内联样式最后合并，允许按行扩展和覆盖。
 */
function TableRender<T extends object>(props: LxTableProps<T>, ref: ForwardedRef<LxTableRef>) {
  const { className, onRow, onHeaderRow, size, virtual, ...tableProps } = props;
  const { componentSize } = ConfigProvider.useConfig();
  const effectiveSize = size ?? componentSize;
  const rowProps = useCallback<NonNullable<LxTableProps<T>['onRow']>>(
    (record, index) => {
      const host = onRow?.(record, index);
      return {
        ...host,
        className: [
          !virtual && (!effectiveSize || effectiveSize === 'large') && styles.bodyRow,
          host?.className,
        ]
          .filter(Boolean)
          .join(' '),
      };
    },
    [effectiveSize, onRow, virtual],
  );
  const headerProps = useCallback<NonNullable<LxTableProps<T>['onHeaderRow']>>(
    (columns, index) => {
      const host = onHeaderRow?.(columns, index);
      return {
        ...host,
        className: [
          !virtual && (!effectiveSize || effectiveSize === 'large') && styles.headerRow,
          host?.className,
        ]
          .filter(Boolean)
          .join(' '),
      };
    },
    [effectiveSize, onHeaderRow, virtual],
  );
  return (
    <AntTable<T>
      {...tableProps}
      size={size}
      virtual={virtual}
      onRow={rowProps}
      onHeaderRow={headerProps}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
}

// forwardRef 无法保留泛型渲染函数；仅在此边界恢复行类型推导，
// 保持 columns/render/dataSource/rowSelection 与公开 ref 类型一致。
export const Table = forwardRef(TableRender) as unknown as TableComponent;
Table.displayName = 'LxTable';

export type { LxTableColumns, LxTableProps, LxTableRef } from './types';
