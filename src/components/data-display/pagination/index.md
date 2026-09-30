---
title: Pagination
group: Data Display
---

<code src="../../../../docs/demos/pagination.tsx"></code>

分页只负责展示页码、页大小和键盘可操作的导航。它完整采用 Ant Design 5 的公开 `PaginationProps`，业务请求、URL 同步、缓存、权限和错误恢复由宿主控制。

## 受控与非受控

传入 `current`、`pageSize` 和 `onChange` 时由宿主维护状态；`defaultCurrent` 与 `defaultPageSize` 可用于非受控初始值。组件不会根据数组长度推导 `total`，也不会自动修正越界页码。

## Ref、样式与键盘

`ref` 指向 AntD 渲染的公开 `<ul>` 根节点，`className` 也落在该节点，不增加外层布局包装。由于 AntD 5 的 Pagination 是函数组件且没有官方 ref API，lx-ui 会给根节点增加内部 marker class，并在提交后查询对应的 `<ul>`。这属于 lx-ui 的适配行为，依赖 AntD 5 当前公开 DOM 契约；升级 AntD 大版本时应重新验证。回调 ref 会在挂载时收到 `<ul>`，卸载时收到 `null`。

SSR 使用服务端安全的 effect 选择，不会因 `useLayoutEffect` 产生服务端警告。若在同一页面挂载多个独立 React root，宿主必须为每个 root 配置不同的 `identifierPrefix`（React `createRoot`/`renderToPipeableStream` 选项），否则 `useId` marker 可能冲突；单个 React root 内的多个 Pagination 实例不受此限制。

`size="small"` 是 AntD 的紧凑呈现。lx-ui 的 compact 主题只提供 token，不改变页码含义；请避免在宿主同时用 CSS 强行改动 item 尺寸。

## 边界

- `total`、`showTotal` 和页码范围由调用方明确提供。
- `onChange` 触发请求时，请由宿主使用 AbortController 或请求代次丢弃旧响应。
- 组件不写入 URL、本地缓存或全局状态。

## 演示与验证边界

此示例映射 `UI/P0 基础组件-Data Display/` 中的对应组件场景。顶部开关只作用于当前演示，可切换明暗、舒适/紧凑密度以及三种外观。数据与操作均在本地 React 状态中运行，不发送网络请求；加载/失败控件用于显式切换展示状态。服务端请求、权限及持久化仍由宿主实现。真实浏览器的主题、键盘和窄屏验收以批次评审记录为准。
