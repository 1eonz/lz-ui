import { Tree as AntTree } from 'antd';
import { forwardRef, type ForwardedRef, type RefAttributes } from 'react';
import type { TreeDataNode, TreeProps, TreeRef } from './types';
import styles from './index.module.css';

type TreeComponent = <T extends object = TreeDataNode>(
  props: TreeProps<T> & RefAttributes<TreeRef>,
) => React.ReactElement;

/**
 * 轻量 Ant Design 5 树适配层。
 *
 * 受控状态、节点身份、异步加载和虚拟布局仍由原生 AntD/宿主负责。
 * 不增加包装层，保留树自身高度、溢出、虚拟化和展示行为。
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

// React forwardRef 无法保留泛型渲染函数；仅在这个已说明的边界转换类型，
// 恢复节点元数据推导，同时明确保持 AntD 公开 TreeRef 契约。
export const Tree = forwardRef(TreeRender) as unknown as TreeComponent;

export type { DataNode, TreeDataNode, TreeNodeProps, TreeProps, TreeRef } from './types';
