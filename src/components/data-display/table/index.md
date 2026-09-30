---
title: Table 表格
group: Data Display
---

展示带列定义的数据，业务请求、权限和缓存由宿主处理。

## 基础用法：三列采购数据

columns 的 dataIndex 对应记录字段，render 负责单元格展示，dataSource 保存完整记录。rowKey 指向唯一 id；pagination={false} 关闭内建分页。宽表格通过 scroll.x 保持列可读。

<code src="../../../../docs/demos/table-basic.tsx"></code>

## 排序、选择、分页、详情与恢复

金额列可排序，选择支持跨页保留，展开显示付款分期。详情关闭回到原行，原行不可用时回工具栏；空状态与失败可恢复。

<code src="../../../../docs/demos/table.tsx"></code>

## 状态与受控协议

loading、locale.emptyText 与宿主错误区域分别表达加载、空与失败。pagination、rowSelection 和 expandable 的 key 集可分别受控；不传受控字段时遵循 AntD 默认行为。

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/table/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

| 属性           | 类型                              | 默认值      | 说明         |
| -------------- | --------------------------------- | ----------- | ------------ |
| `dataSource`   | `T[]`                             | `—`         | 记录         |
| `columns`      | `LxTableColumns<T>`               | `—`         | 列定义       |
| `rowKey`       | `LxTableProps<T>['rowKey']`       | `key`       | 稳定唯一标识 |
| `pagination`   | `LxTableProps<T>['pagination']`   | `AntD 默认` | 分页配置     |
| `rowSelection` | `LxTableProps<T>['rowSelection']` | `—`         | 受控选择     |
| `expandable`   | `LxTableProps<T>['expandable']`   | `—`         | 展开配置     |
| `loading`      | `LxTableProps<T>['loading']`      | `false`     | 加载         |
| `scroll`       | `LxTableProps<T>['scroll']`       | `—`         | 滚动范围     |
| `virtual`      | `boolean`                         | `false`     | 虚拟滚动     |
| `locale`       | `LxTableProps<T>['locale']`       | `AntD 默认` | 空状态等     |

## 事件、Ref 与键盘

| 事件                            | 类型                                                                 | 触发时机             |
| ------------------------------- | -------------------------------------------------------------------- | -------------------- |
| onChange                        | `LxTableProps<T>['onChange']`                                        | 分页、筛选或排序变化 |
| rowSelection.onChange           | `NonNullable<LxTableProps<T>['rowSelection']>['onChange']`           | 选中项变化           |
| expandable.onExpandedRowsChange | `NonNullable<LxTableProps<T>['expandable']>['onExpandedRowsChange']` | 展开项变化           |

onChange(pagination, filters, sorter, extra) 返回下一配置，sorter 可为数组。rowSelection.onChange 返回 keys/records，onExpandedRowsChange 返回展开 keys。ref 是公开 LxTableRef 实例，不是 HTMLElement。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

固定列提供足够 scroll.x。虚拟化、动态行高、合并单元格、展开与自定义 body 需单独验证。远程排序由宿主查询并避免旧响应覆盖。

## 适配层补充说明

Table 是 Ant Design 5 的薄适配层，适用于中后台的本地数据表和受控数据表。它完整透传公开 `TableProps<T>`、`TableColumnsType<T>`、分页、筛选、排序、行选择、滚动和虚拟化配置；业务请求、权限、缓存和 URL 同步由宿主处理。

## 稳定行标识

业务数据应始终提供稳定唯一的 `rowKey`（字段名或函数）。组件不会自动生成 key，也不会把数组索引当作 key。索引在插入、删除、排序或分页后会变化，可能导致选择状态和输入焦点落到错误行。

## 受控协议

`pagination`、`onChange` 和 `rowSelection` 可以由宿主受控。跨页选择由宿主结合 `preserveSelectedRowKeys` 维护；Table 不请求数据、不去重请求，也不丢弃旧响应。远程数据场景应由宿主使用 `AbortController` 或请求代次保护异步结果，并将最终 `dataSource`、分页和 loading 传给 Table。

## 固定列与虚拟化

固定列需要宿主同时提供足够的 `scroll.x`。`scroll.y` 和 `virtual` 是显式 opt-in，虚拟表格应保持稳定行高；合并单元格、展开行、自定义 body、动态行高和拖拽列等高级组合需按 AntD 5 限制单独验证。组件不封装自定义虚拟滚动引擎或列拖拽协议。

## Ref、样式与键盘

`ref` 指向由 AntD 根入口 `Table` 组件推导出的公开实例类型（`LxTableRef`），不承诺 HTMLElement。该类型遵循 peer 依赖 `antd >=5 <6`，不会要求业务代码引入 `antd/es/*` 或 `rc-table`。组件不增加 wrapper，`className` 直接落在 AntD 根节点，以保持横向滚动、固定列和布局语义。键盘焦点由 AntD 控件和宿主单元格内容负责，lx-ui 仅提供局部 focus-visible token 增强。主题的 light/dark 和 comfortable/compact 由 `LxConfigProvider` 的 token 运行时控制。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有恢复、失败与加载操作均为本地 React 状态，不发送网络请求。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
