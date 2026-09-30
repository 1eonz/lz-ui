---
title: Table
group: Data Display
---

<code src="../../../../docs/demos/table.tsx"></code>

Table 是 Ant Design 5 的薄适配层，适用于中后台的本地数据表和受控数据表。它完整透传公开 `TableProps<T>`、`TableColumnsType<T>`、分页、筛选、排序、行选择、滚动和虚拟化配置；业务请求、权限、缓存和 URL 同步由宿主处理。

## 稳定行标识

业务数据应始终提供稳定唯一的 `rowKey`（字段名或函数）。组件不会自动生成 key，也不会把数组索引当作 key。索引在插入、删除、排序或分页后会变化，可能导致选择状态和输入焦点落到错误行。

## 受控协议

`pagination`、`onChange` 和 `rowSelection` 可以由宿主受控。跨页选择由宿主结合 `preserveSelectedRowKeys` 维护；Table 不请求数据、不去重请求，也不丢弃旧响应。远程数据场景应由宿主使用 `AbortController` 或请求代次保护异步结果，并将最终 `dataSource`、分页和 loading 传给 Table。

## 固定列与虚拟化

固定列需要宿主同时提供足够的 `scroll.x`。`scroll.y` 和 `virtual` 是显式 opt-in，虚拟表格应保持稳定行高；合并单元格、展开行、自定义 body、动态行高和拖拽列等高级组合需按 AntD 5 限制单独验证。组件不封装自定义虚拟滚动引擎或列拖拽协议。

## Ref、样式与键盘

`ref` 指向由 AntD 根入口 `Table` 组件推导出的公开实例类型（`LxTableRef`），不承诺 HTMLElement。该类型遵循 peer 依赖 `antd >=5 <6`，不会要求业务代码引入 `antd/es/*` 或 `rc-table`。组件不增加 wrapper，`className` 直接落在 AntD 根节点，以保持横向滚动、固定列和布局语义。键盘焦点由 AntD 控件和宿主单元格内容负责，lx-ui 仅提供局部 focus-visible token 增强。主题的 light/dark 和 comfortable/compact 由 `LxConfigProvider` 的 token 运行时控制。

## 演示与验证边界

此示例映射 `UI/P0 基础组件-Data Display/` 中的对应组件场景。顶部开关只作用于当前演示，可切换明暗、舒适/紧凑密度以及三种外观。数据与操作均在本地 React 状态中运行，不发送网络请求；加载/失败控件用于显式切换展示状态。服务端请求、权限及持久化仍由宿主实现。真实浏览器的主题、键盘和窄屏验收以批次评审记录为准。
