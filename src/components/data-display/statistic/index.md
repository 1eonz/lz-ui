---
title: Statistic 统计数值
group: Data Display
---

# Statistic 统计数值

展示业务指标，不管理请求、轮询或趋势计算。

## 基础用法：金额与订单数

value 传数值，precision 控制显示小数位，prefix="¥" 或 suffix="单" 补充单位。formatter 适合特殊纯展示规则；展示值不参与组件内的业务计算。

<code src="../../../../docs/demos/statistic-basic.tsx"></code>

## 周期切换及加载

本月/本季度切换真实数值；Skeleton 显示占位，恢复后仍保留周期。value 只负责展示，计算由宿主完成。

<code src="../../../../docs/demos/statistic.tsx"></code>

## 状态与受控协议

loading 仅改变展示，失败需要宿主说明。周期切换的受控状态在交互示例中展示；无值与合法零值应区分，不把请求失败映射成 0。

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/statistic/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

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

## 事件、Ref 与键盘

没有值变更事件。formatter 不应请求或修改状态；ref 是 HTMLDivElement 外层，不暴露 AntD StatisticRef。默认等宽数字减少数值改变造成的布局偏移。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

金额需要确定舍入、货币与精度。错误不应伪装成零值，保留上次有效值或给出恢复路径。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有恢复、失败与加载操作均为本地 React 状态，不发送网络请求。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
