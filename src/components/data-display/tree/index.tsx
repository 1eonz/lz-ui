import { Tree as AntTree } from 'antd';
import { forwardRef, type ForwardedRef, type RefAttributes } from 'react';
import type { TreeDataNode, TreeProps, TreeRef } from './types';
import styles from './index.module.css';

type TreeComponent = <T extends object = TreeDataNode>(
  props: TreeProps<T> & RefAttributes<TreeRef>,
) => React.ReactElement;

/**
 * Thin Ant Design 5 tree adapter.
 *
 * Controlled state, node identity, async loading and virtual layout remain
 * native AntD/host responsibilities. No wrapper is added, preserving the
 * tree's own height, overflow, virtualization and display behavior.
 */
function TreeRender<T extends object>(props: TreeProps<T>, ref: ForwardedRef<TreeRef>) {
  const { className, ...treeProps } = props;
  return (
    <AntTree<T & TreeDataNode>
      {...treeProps}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
}

// React's forwardRef cannot preserve a generic render function. This is the
// single documented boundary cast that restores node metadata inference while
// keeping the public AntD TreeRef contract explicit.
export const Tree = forwardRef(TreeRender) as unknown as TreeComponent;

export type { DataNode, TreeDataNode, TreeNodeProps, TreeProps, TreeRef } from './types';
