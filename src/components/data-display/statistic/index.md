---
title: Statistic 统计数值
group: Data Display
---

# Statistic 统计数值

展示业务指标，不管理请求、轮询或趋势计算。示例中的金额按“已入账采购金额扣除退款及暂扣款”展示；所有示例数据均为演示值。

## 基础用法：金额与订单数

`value` 传数值，`precision` 控制显示小数位，`prefix="¥"` 或 `suffix="单"` 补充单位。`formatter` 适合特殊纯展示规则；展示值不参与组件内的业务计算。

<code src="../../../../docs/demos/statistic-basic.tsx"></code>

## 周期切换与趋势

本月/本季度切换标题、净清算金额和采购订单数值。增长百分比明确比较上一自然月或上一季度；轻量折线表示最近五个周期的示意走势。数据、统计口径和趋势计算均由宿主提供，组件只负责格式化展示。

<code src="../../../../docs/demos/statistic.tsx"></code>

## 内置 loading 与宿主占位

`Statistic.loading` 只切换当前指标的内置加载展示；如果一个区域由多个指标、图表和说明组成，可以由宿主使用 `Skeleton` 统一占位。两种方式都不负责请求和失败恢复，失败状态应由宿主说明。

<code src="../../../../docs/demos/statistic-loading.tsx"></code>

周期切换由宿主 React 状态控制，交互示例没有发送网络请求。无值与合法零值应区分，不要把请求失败映射为 `0`。

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/statistic/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

<p id="statistic-docs-table-hint" className="lx-docs-table-hint">
  窄屏下可左右滑动参数表，属性列会固定在起始侧；键盘用户聚焦表格区域后按左右方向键浏览。
</p>

<div
  className="lx-docs-table lx-docs-table--statistic"
  role="region"
  tabIndex="0"
  aria-label="Statistic 参数表"
  aria-describedby="statistic-docs-table-hint"
>

| 属性               | 类型                          | 默认值  | 说明              |
| ------------------ | ----------------------------- | ------- | ----------------- |
| `title`            | `ReactNode`                   | `—`     | 指标标题          |
| `value`            | `string \| number`            | `—`     | 指标值            |
| `precision`        | `number`                      | `—`     | 小数位            |
| `prefix / suffix`  | `ReactNode`                   | `—`     | 单位              |
| `formatter`        | `StatisticProps['formatter']` | `—`     | 纯展示格式化      |
| `groupSeparator`   | `string`                      | `,`     | 千分位符号        |
| `decimalSeparator` | `string`                      | `.`     | 小数符号          |
| `loading`          | `boolean`                     | `false` | AntD 内置加载展示 |

</div>

## 事件、Ref 与键盘

没有值变更事件。formatter 不应请求或修改状态；ref 是 HTMLDivElement 外层，不暴露 AntD StatisticRef。默认等宽数字减少数值改变造成的布局偏移。

## 主题与密度

展开任一示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 `palettePreset` 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前示例状态。

主题仅改变指标的外观与间距，不改变示例数值、周期或加载状态。Statistic 没有独立的 `size` 属性；数值样式通过 AntD 公开的 `valueStyle` 调整。

## 边界与性能

金额需由业务确定舍入、货币与精度，并为趋势标明比较区间。错误不应伪装成零值；宿主应保留上次有效值或提供恢复路径。大数值展示应关注等宽数字和容器宽度，避免更新时布局跳动。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的 Statistic 设计场景。交互演示周期切换、宿主级 `Skeleton` 与组件级 `loading`；控件只更新本地 React 状态，不发送网络请求。文档中的趋势线和数据用于说明呈现方式，不代表真实经营口径。主题对比度、键盘、窄屏及 reduced motion 以浏览器验收记录为准。
