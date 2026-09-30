import type {
  TreeDataNode as AntDataNode,
  TreeNodeProps as AntTreeNodeProps,
  TreeProps as AntTreeProps,
} from 'antd';
import type { ComponentRef } from 'react';
import type { Tree as AntTree } from 'antd';

/** Stable public node shape exported by Ant Design 5; each business node needs a unique key. */
export type TreeDataNode = AntDataNode;

/** @deprecated Use TreeDataNode. Kept as a compatibility alias for the first public release. */
export type DataNode = TreeDataNode;

/**
 * Ant Design 5 tree props with a safe public generic boundary.
 *
 * AntD constrains its generic with rc-tree's internal `BasicDataNode`, which
 * is intentionally not imported from a deep implementation path here. The
 * intersection keeps AntD's required node fields while preserving arbitrary
 * business metadata (`meta`, `type`, etc.) for render and loading callbacks.
 */
export type TreeProps<T extends object = TreeDataNode> = AntTreeProps<T & TreeDataNode>;

/** Public instance type inferred from the root antd Tree export. */
export type TreeRef = ComponentRef<typeof AntTree>;

/** Ant Design Tree node event metadata, kept available through the public antd entry point. */
export type TreeNodeProps = AntTreeNodeProps;
