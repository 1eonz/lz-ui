import { List as AntList } from 'antd';
import { forwardRef, type ForwardedRef, type RefAttributes } from 'react';
import type { ListProps } from './types';
import styles from './index.module.css';
/** Data list with explicit loading, empty and pagination slots. */
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

// React's forwardRef cannot preserve a generic render function. This is the
// single boundary cast that restores AntD's generic `dataSource`/`renderItem`
// inference while keeping the ref target explicit as the lx wrapper root.
export const List = Object.assign(forwardRef(ListRender) as unknown as ListComponent, {
  Item: AntList.Item,
});
export type { ListProps } from './types';
