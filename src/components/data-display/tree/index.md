---
title: Tree 树形控件
group: Data Display
---

用于目录、组织或权限层级；勾选不会自动授予或保存权限。

## 基础用法：非受控组织目录

treeData 的每个节点都提供唯一 key、title 与可选 children。defaultExpandedKeys 只设置初始展开；需要根据业务状态切换时使用 expandedKeys 与 onExpand。

<code src="../../../../docs/demos/tree-basic.tsx"></code>

## 受控展开、选中与勾选

expandedKeys/selectedKeys/checkedKeys 分别受控；展开、收起、清空更新状态，禁用节点不参与操作。

<code src="../../../../docs/demos/tree.tsx"></code>

## 状态与受控协议

展开、选中和勾选各有独立受控状态；非受控用对应 default* 属性。节点 disabled 禁止交互，异步失败及空树说明由宿主处理。

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/tree/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

| 属性                  | 类型                       | 默认值  | 说明                |
| --------------------- | -------------------------- | ------- | ------------------- |
| `treeData`            | `TreeDataNode[]`           | `—`     | 稳定唯一 key 的节点 |
| `expandedKeys`        | `Key[]`                    | `—`     | 受控展开            |
| `defaultExpandedKeys` | `Key[]`                    | `[]`    | 初始展开            |
| `selectedKeys`        | `Key[]`                    | `—`     | 受控选中            |
| `defaultSelectedKeys` | `Key[]`                    | `[]`    | 初始选中            |
| `checkedKeys`         | `TreeProps['checkedKeys']` | `—`     | 受控勾选            |
| `checkable`           | `boolean`                  | `false` | 复选框              |
| `checkStrictly`       | `boolean`                  | `false` | 父子不关联          |
| `multiple`            | `boolean`                  | `false` | 多选                |
| `loadData`            | `TreeProps['loadData']`    | `—`     | 异步加载            |
| `height`              | `number`                   | `—`     | 视口高度            |
| `virtual`             | `boolean`                  | `true`  | 虚拟布局            |

## 事件、Ref 与键盘

| 事件     | 类型                    | 触发时机                               |
| -------- | ----------------------- | -------------------------------------- |
| onExpand | `TreeProps['onExpand']` | 展开状态变化                           |
| onSelect | `TreeProps['onSelect']` | 选中状态变化                           |
| onCheck  | `TreeProps['onCheck']`  | 勾选变化，checkStrictly 时 keys 为对象 |
| onLoad   | `TreeProps['onLoad']`   | 异步子节点完成                         |

onExpand(keys, info)、onSelect(keys, info)、onCheck(keys, info) 返回下一状态；checkStrictly 下勾选 keys 为对象。ref 是公开 TreeRef 实例。保留方向键与 Enter/Space 语义。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

宿主处理异步去重、缓存、取消和错误。大型树复用节点并设置有限视口，超长换行标题与虚拟行高需验证；拖拽需键盘替代路径。

## 适配层补充说明

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

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有恢复、失败与加载操作均为本地 React 状态，不发送网络请求。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
