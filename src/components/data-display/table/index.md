---
title: Table 表格
group: Data Display
---

# Table 表格

展示带列定义的数据，业务请求、权限和缓存由宿主处理。

## 基础用法：三列采购数据

columns 的 dataIndex 对应记录字段，render 负责单元格展示，dataSource 保存完整记录。rowKey 指向唯一 id；pagination={false} 关闭内建分页。两个示例都以命名、可聚焦的外层区域管理横向滚动，Tab 聚焦区域后可用单独的左右箭头滚动；子控件按键、Alt/Ctrl/Meta/Shift 组合键保留原有行为。示例 Table 提供最小列宽，且不启用固定列，避免内外双重滚动；固定列宿主配置见下文。

<code src="../../../../docs/demos/table-basic.tsx"></code>

## 排序、选择、分页、详情与恢复

金额列可用鼠标或键盘 Enter 排序，表头聚焦时显示主题焦点环。交互示例在标题行展示密度选项，“示例状态”原生 details 默认折叠；审批状态筛选和清空选择并列放在工具栏。快速筛选按“全部状态/已审/待审”过滤本地订单，筛选后回到第一页。业务列保持设计稿的订单编号、供应商、结算金额、履约进度、审批状态顺序；订单编号单元格保持单行并保留完整文本，适度压缩列宽并省略长供应商名称，让履约与审批状态在常见桌面文档视口中更早出现，供应商单元格仍保留完整文本和原生 title。进度列使用公开 `Progress` 展示固定的本地样例比例，并按采购单编号提供可访问名称，不代表请求或实时对账状态。基础示例仍是采购单、供应商、结算金额三列的轻量表格。

交互示例显式使用 `tableLayout="fixed"` 与合计 856px 的横向画布，使列宽在窄视口中保持并由单一滚动区承载；单行表头目标高度为 36px，长表头或单元格内容换行时允许自然增高，不裁切文字。

选择支持跨页与筛选保留；行复选框带采购单编号，全选名称明确覆盖当前页全部采购单。示例设置 `preserveSelectedRowKeys`：筛选隐藏已选订单时，该订单仍计入状态栏选择数，点击“取消选择”可清除全部保留项。行展开使用图标按钮；按钮名称包含采购单编号并报告展开状态，原生按钮保留 Tab、Enter 和 Space 操作。展开内容显示付款分期。详情关闭回到原行，原行不可用时回表格标题；空状态与失败可恢复。

“已选订单”默认折叠，展开后可核对跨页和筛选保留订单的编号、供应商、审批状态及金额。详情是按订单编号命名的非模态区域，打开后焦点落在详情标题，关闭后回到原行详情按钮。筛选、排序、翻页、页大小与加载/失败/空状态切换会关闭详情；若详情卸载导致焦点丢失则回到表格标题，用户已主动聚焦的筛选或分页控件保留焦点。结算金额右对齐并使用等宽数字；表格、已选列表、付款分期和详情金额统一保留两位小数。

<code src="../../../../docs/demos/table.tsx"></code>

## 状态与受控协议

行复选框包含采购单编号的可访问名称，全选复选框标明当前页范围；跨页选择状态仍由宿主通过受控 `rowSelection` 管理。

loading、locale.emptyText 与宿主错误区域分别表达加载、空与失败。pagination、rowSelection 和 expandable 的 key 集可分别受控；不传受控字段时遵循 AntD 默认行为。页面级快速筛选与导出动作属于宿主工具栏，筛选宿主负责更新 `dataSource`，Table 不承载请求逻辑。交互示例用可键盘操作的 Select 演示本地快速筛选。`preserveSelectedRowKeys` 会保留当前 `dataSource` 未包含的已选 key，状态计数应按完整受控 key 集计算；宿主可提供清空选择操作。Ant Design 5.24 的内建列筛选入口无法通过 Tab 聚焦，且确认/重置操作显示英文默认文案，因此本示例暂不启用该交互；Table 仍透传公开列配置的 `filters`、`onFilter` 等筛选属性，并通过 `onChange` 返回筛选结果。升级 Ant Design 后，应重新验证内建筛选的键盘可达性和本地化，再评估是否在示例中使用。

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

展开示例的“主题设置”可切换 light/dark、三种外观、六个品牌色与七套东方配色；Table 示例在通用设置中隐藏重复的密度开关，标题行的舒适 48px / 紧凑 36px 单选控件使用 `useLxTheme` 切换密度。Table 适配层通过公开 `ConfigProvider.useConfig().componentSize` 解析宿主继承尺寸：`size` 显式传入时优先，解析为默认或 `large` 才应用 lx-ui 的表格行高类，`small`/`middle` 继续由宿主控制。其他演示仍保留通用密度开关。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

使用固定列时，由宿主按 AntD 实际滚动容器配置足够的 `scroll.x`，并让 AntD 自身滚动容器负责横向滚动；不要再套一层独立横向滚动容器，否则固定区可能按错误的可视边界定位。虚拟化、动态行高、合并单元格、展开与自定义 body 需单独验证。远程排序由宿主查询并避免旧响应覆盖。

## 适配层补充说明

Table 是 Ant Design 5 的薄适配层，适用于中后台的本地数据表和受控数据表。它完整透传公开 `TableProps<T>`、`TableColumnsType<T>`、分页、筛选、排序、行选择、滚动和虚拟化配置；业务请求、权限、缓存和 URL 同步由宿主处理。

## 稳定行标识

业务数据应始终提供稳定唯一的 `rowKey`（字段名或函数）。组件不会自动生成 key，也不会把数组索引当作 key。索引在插入、删除、排序或分页后会变化，可能导致选择状态和输入焦点落到错误行。

## 受控协议

`pagination`、`onChange` 和 `rowSelection` 可以由宿主受控。跨页选择由宿主结合 `preserveSelectedRowKeys` 维护；Table 不请求数据、不去重请求，也不丢弃旧响应。远程数据场景应由宿主使用 `AbortController` 或请求代次保护异步结果，并将最终 `dataSource`、分页和 loading 传给 Table。

## 固定列与虚拟化

交互示例使用 `scroll.x={856}` 保持列宽，并以单一、可聚焦的外层区域承接横向滚动；示例不启用固定列。固定列属于宿主布局决策：宿主应按真实容器宽度设置 `rowSelection.fixed`、列 `fixed` 与足够的 `scroll.x`，并由 AntD 自身滚动容器管理横向滚动；不要将固定列与额外的外层横向滚动包装混用。基础 Table 不自动决定断点或添加滚动包装。`scroll.y` 和 `virtual` 是显式 opt-in，虚拟表格应保持稳定行高；合并单元格、展开行、自定义 body、动态行高和拖拽列等高级组合需按 AntD 5 限制单独验证。组件不封装自定义虚拟滚动引擎或列拖拽协议。

## Ref、样式与键盘

`ref` 指向由 AntD 根入口 `Table` 组件推导出的公开实例类型（`LxTableRef`），不承诺 HTMLElement。该类型遵循 peer 依赖 `antd >=5 <6`，不会要求业务代码引入 `antd/es/*` 或 `rc-table`。组件不增加 wrapper，`className` 直接落在 AntD 根节点，以保持横向滚动、固定列和布局语义。示例在 Table 外使用可聚焦命名区域承接横向滚动；启用固定列时，宿主应由 AntD 自身的滚动容器承担横向滚动，并按该容器的真实尺寸验证固定区。基础组件不自动改变宿主的焦点顺序。主题的 light/dark 和 comfortable/compact 由 `LxConfigProvider` 的 token 运行时控制。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有恢复、失败与加载操作均为本地 React 状态，不发送网络请求。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
