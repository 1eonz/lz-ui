import { List as AntList } from 'antd';
import { forwardRef, type ForwardedRef, type RefAttributes } from 'react';
import type { ListProps } from './types';
import styles from './index.module.css';
/** 提供明确 loading、empty 和 pagination 插槽的数据列表。 */
type ListComponent = (<T>(
  props: ListProps<T> & RefAttributes<HTMLDivElement>,
) => React.ReactElement) & {
  Item: typeof AntList.Item;
};
function ListRender<T>(props: ListProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  const { className, ...listProps } = props;
  return (
    <div ref={ref} className={[styles.root, className].filter(Boolean).join(' ')}>
      <AntList {...listProps} className={className} />
    </div>
  );
}

// React forwardRef 无法保留泛型渲染函数；仅在此边界转换类型，恢复
// AntD dataSource/renderItem 泛型推导，ref 目标仍明确为 lx 包装根节点。
export const List = Object.assign(forwardRef(ListRender) as unknown as ListComponent, {
  Item: AntList.Item,
});
export type { ListProps } from './types';
