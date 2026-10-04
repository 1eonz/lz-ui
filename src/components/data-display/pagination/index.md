---
title: Pagination 分页
group: Data Display
---

# Pagination 分页

负责页码导航，数据切片、请求、缓存及 URL 同步由宿主实现。

## 基础用法：非受控页码

defaultCurrent/defaultPageSize 设置非受控初值，组件维护导航状态；total 必须来自业务总数。绑定实际数据时改用 current/pageSize/onChange，避免只传固定 current 导致页码冻结。

<code src="../../../../docs/demos/pagination-basic.tsx"></code>

## 受控切片与页大小

current/pageSize/onChange 配套更新实际订单切片。修改页大小和清空数据都重置第 1 页。基础示例用 defaultCurrent 维护内部导航状态。

<code src="../../../../docs/demos/pagination.tsx"></code>

## 状态与受控协议

current/pageSize 受控时每次事件都需更新值；非受控使用 defaultCurrent/defaultPageSize。空集合将 total 设置为 0，宿主重置 current；请求期间可 disabled。

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/pagination/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

| 属性              | 类型                                 | 默认值         | 说明       |
| ----------------- | ------------------------------------ | -------------- | ---------- |
| `total`           | `number`                             | `0`            | 总数       |
| `current`         | `number`                             | `—`            | 受控页码   |
| `defaultCurrent`  | `number`                             | `1`            | 初始页码   |
| `pageSize`        | `number`                             | `—`            | 受控页大小 |
| `defaultPageSize` | `number`                             | `10`           | 初始页大小 |
| `pageSizeOptions` | `PaginationProps['pageSizeOptions']` | `10/20/50/100` | 页大小选项 |
| `showSizeChanger` | `PaginationProps['showSizeChanger']` | `total > 50`   | 页大小选择 |
| `showQuickJumper` | `PaginationProps['showQuickJumper']` | `false`        | 快速跳页   |
| `showTotal`       | `PaginationProps['showTotal']`       | `—`            | 展示总数   |
| `disabled`        | `boolean`                            | `false`        | 禁用       |

## 事件、Ref 与键盘

| 事件             | 类型                                       | 触发时机           |
| ---------------- | ------------------------------------------ | ------------------ |
| onChange         | `(page: number, pageSize: number) => void` | 页码或每页数量变化 |
| onShowSizeChange | `(current: number, size: number) => void`  | 页大小变化         |

onChange(page, pageSize) 在页码或大小变化时触发；onShowSizeChange(current, size) 专用于大小变化，两处请求需避免重复。ref 是 HTMLUListElement 根节点。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

不自动切片，也不钳制宿主越界页码；总数减少由宿主修正页码。远程请求应取消或代次保护，加载可 disabled 避免重复操作。

## 适配层补充说明

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

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有恢复、失败与加载操作均为本地 React 状态，不发送网络请求。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
