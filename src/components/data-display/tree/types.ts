import type {
  TreeDataNode as AntDataNode,
  TreeNodeProps as AntTreeNodeProps,
  TreeProps as AntTreeProps,
} from 'antd';
import type { ComponentRef } from 'react';
import type { Tree as AntTree } from 'antd';

/** Ant Design 5 导出的稳定公开节点形状；每个业务节点需要唯一 key。 */
export type TreeDataNode = AntDataNode;

/** @deprecated 使用 TreeDataNode；为首次公开发布保留此兼容别名。 */
export type DataNode = TreeDataNode;

/**
 * 具备安全公开泛型边界的 Ant Design 5 树属性。
 *
 * AntD 使用 rc-tree 内部 BasicDataNode 约束泛型，这里刻意不从深层实现
 * 路径导入。交叉类型保留 AntD 必需节点字段，同时为渲染和加载回调
 * 保留任意业务元数据（meta、type 等）。
 */
export type TreeProps<T extends object = TreeDataNode> = AntTreeProps<T & TreeDataNode>;

/** 从 antd 根出口 Tree 推导的公开实例类型。 */
export type TreeRef = ComponentRef<typeof AntTree>;

/** Ant Design Tree 节点事件元数据，通过 antd 公开入口提供。 */
export type TreeNodeProps = AntTreeNodeProps;
