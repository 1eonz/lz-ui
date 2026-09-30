# 1B 数据交互组件协议

> 本文是 Pagination、Table、Tree 的首版架构边界。组件是 Ant Design 5 的公开 API 适配层，业务请求、路由、权限、缓存和 URL 同步由宿主项目负责。

## 1. 批次顺序

1. `Pagination`：锁定受控页码、页大小和 ref 语义。
2. `Table`：复用 AntD 的泛型列、分页、筛选、排序和选择协议。
3. `Tree`：在稳定节点 key 的基础上补齐受控展开、选择、勾选和异步加载。

每个组件必须经过设计映射、GPT-6.1-SOL medium 实现、独立 GPT-6.1-SOL xhigh 代码审查、修复后独立复审、全量门禁、浏览器验证和 Impeccable 记录，才允许进入主入口。历史代码审查结论不能代替当前设计一致性验收；缺少可运行 demo 的组件仍待视觉验收。

## 2. 共同边界

- 组件不发起业务请求，不写路由，不持有权限判断，也不自动写 URL 或缓存。
- `antd` 5 的公开 Props、事件和语义优先；不导出 `rc-table`、`rc-tree` 等私有类型。
- 组件不通过外层 wrapper 改变 `display`、`overflow`、表格滚动或树布局。需要样式时，把 CSS Module class 合并到 AntD 根节点。
- 受控状态由宿主维护；非受控默认值沿用 AntD 5 行为。异步取消、请求去重、旧请求丢弃和错误恢复由宿主适配器负责。
- 样式只使用 `--lx-*` token 和局部 `:global(.ant-*)` 选择器；不依赖 AntD 私有 DOM 层级。

## 3. Pagination

`Pagination` 直接透传 AntD `PaginationProps`，支持 `current`、`pageSize`、`total`、`onChange` 和 `onShowSizeChange` 的受控协议，也保留 `defaultCurrent` 与 `defaultPageSize` 的非受控模式。组件不根据 `dataSource.length` 推导 `total`，不自动修正超出页码，不内置请求和 URL 同步。

ref 指向 AntD Pagination 的公开根节点。组件不包裹额外布局层；`className` 继续落到 AntD 根节点，以保持现有 AntD 选择器和布局语义。紧凑密度只消费主题 token，不改变页码语义。

## 4. Table

首版导出 `LxTableProps<T extends object>`，以 AntD `TableProps<T>` 为基础，`columns` 使用公开 `ColumnsType<T>`，不重定义 `render`、`filter` 或 `sorter`。业务数据建议始终提供稳定 `rowKey`（字段名或函数），禁止依赖数组索引；组件不生成 key。

分页、筛选、排序和行选择全部透传并支持受控模式。跨页选择由宿主结合 `preserveSelectedRowKeys` 维护。固定列需要宿主同时提供 `scroll.x`；`scroll.y`、`virtual` 是显式 opt-in，虚拟表格的行高、合并单元格、展开行和自定义 body 限制写入文档。远程请求协议保留给后续 `ProTable`，由宿主通过 `AbortController` 和 request id 防止旧响应覆盖新结果。

ref 指向 AntD Table 的公开实例类型，不承诺 HTMLElement。组件不增加 wrapper，避免影响局部横向滚动和布局稳定性。

## 5. Tree

首版直接以 AntD `TreeProps` 为主，节点必须拥有稳定唯一 `key`；不自动生成 key，不做节点数据归一化。`expandedKeys`、`selectedKeys`、`checkedKeys`、`loadedKeys` 和 `checkStrictly` 完全透传。`loadData` 是宿主注入的 Promise 协议，组件不注入请求取消、重试或缓存。

树的虚拟化沿用 AntD `height`/`virtual`；拖拽与虚拟化组合、动态行高、超宽标题和异步错误占位需要在文档中明确限制。ref 指向 AntD Tree 公开实例，不依赖私有 DOM。

## 6. 不进入 1B

- `ProTable` 的 `request`、AbortSignal、请求竞态和跨页业务选择。
- 自动 URL 同步、路由联动、权限过滤、字典请求和缓存。
- 自定义虚拟滚动引擎、列拖拽排序、树节点拖拽业务协议。
- AntD 4 兼容层或对 AntD 私有 DOM 的稳定承诺。
