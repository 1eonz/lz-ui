---
title: Tree
group: Data Display
---

<code src="../../../../docs/demos/tree.tsx"></code>

Tree 是 Ant Design 5 `Tree` 的薄适配层。节点 key、展开、选择、勾选、加载和虚拟布局均遵循 AntD 公共 API；组件不会生成 key、转换节点数据或发起业务请求。

## 稳定节点与受控状态

每个节点都应提供稳定且唯一的 `key`，不要使用数组索引或每次渲染变化的随机值。`expandedKeys`、`selectedKeys`、`checkedKeys`、`loadedKeys`、`checkStrictly` 以及 `onExpand`、`onSelect`、`onCheck`、`onLoad` 原样透传；传入受控属性后，宿主负责更新对应状态。`TreeDataNode` 是推荐的基础节点类型，`DataNode` 作为兼容别名保留；两者与 `TreeNodeProps` 均从 lx-ui 根入口导出。

## 自定义节点数据

`Tree` 支持泛型节点数据。将业务字段放在节点类型中，`titleRender` 与 `loadData` 的参数会保留这些字段的类型推断：

```tsx
type CustomerNode = TreeDataNode & { customerId: string; segment: 'vip' | 'standard' };

<Tree<CustomerNode>
  treeData={nodes}
  titleRender={(node) => `${node.customerId} (${node.segment})`}
  loadData={async (node) => fetchChildren(node.customerId)}
/>;
```

## 异步加载边界

`loadData` 接收 AntD 的节点并返回 Promise。宿主负责请求、取消、去重、缓存、错误提示、重试和旧响应丢弃；组件不会包装 Promise 或注入请求策略。异步失败的占位和恢复方式由宿主结合节点数据与 `loadedKeys` 决定。

## 虚拟化、尺寸与拖拽

`virtual` 与 `height` 原样传递给 AntD。虚拟树依赖稳定行高和有限视口；动态标题高度、换行、超宽标题、自定义节点行高可能导致滚动定位不准确。启用拖拽时应验证与虚拟化的组合、目标浏览器和键盘替代操作。高频更新大型节点树时应复用节点对象并避免不必要的全量重建。

## 键盘、主题与 Ref

保留 AntD Tree 的键盘语义，包括方向键移动、Enter/Space 操作和焦点管理；不要用非交互标题覆盖树节点原生交互。`className` 加到 AntD 根节点，`ref` 指向 AntD Tree 公开实例，不添加 wrapper，不修改 display、overflow、height 或 virtual 布局。lx-ui 主题只为焦点轮廓提供 token 增强；compact 密度由 AntD/theme token 控制，不自行改变节点高度。

## 演示与验证边界

此示例映射 `UI/P0 基础组件-Data Display/` 中的对应组件场景。顶部开关只作用于当前演示，可切换明暗、舒适/紧凑密度以及三种外观。数据与操作均在本地 React 状态中运行，不发送网络请求；加载/失败控件用于显式切换展示状态。服务端请求、权限及持久化仍由宿主实现。真实浏览器的主题、键盘和窄屏验收以批次评审记录为准。
