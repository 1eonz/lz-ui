---
title: Badge 徽标
group: Data Display
---

用于未读计数、通知提示或状态说明。徽标本身不是操作按钮。

## 基础用法：计数与文本状态

count 传数值，overflowCount 限制展示上限，showZero 控制零值是否可见。status 配合 text 展示语义状态；被标记控件放在 children 中，徽标本身不会获得按钮语义。

<code src="../../../../docs/demos/badge-basic.tsx"></code>

## 消息增减和清零

读一条减少计数，新增 100 条验证溢出，全部已读清零，恢复消息还原。dot 与 count 使用同一份状态。

<code src="../../../../docs/demos/badge.tsx"></code>

## 状态与受控协议

Badge 的空、加载和失败均通过宿主计数/状态与 text 表达；processing 不是请求管理。禁用属于被标记控件，不属于徽标。

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/badge/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

| 属性            | 类型                   | 默认值  | 说明                                     |
| --------------- | ---------------------- | ------- | ---------------------------------------- |
| `count`         | `ReactNode`            | `—`     | 计数或自定义内容                         |
| `overflowCount` | `number`               | `99`    | 计数显示上限                             |
| `showZero`      | `boolean`              | `false` | 显示零值                                 |
| `dot`           | `boolean`              | `false` | 用圆点替代计数                           |
| `status`        | `BadgeProps['status']` | `—`     | success/processing/default/error/warning |
| `text`          | `ReactNode`            | `—`     | 状态文字                                 |
| `children`      | `ReactNode`            | `—`     | 被标记内容                               |
| `title`         | `string`               | `—`     | 悬停说明                                 |

## 事件、Ref 与键盘

没有计数更新事件。ref 指向 Badge 实际根节点，不增加包装层。宿主变更 count，状态消息负责播报；颜色不能替代文字。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

不轮询、不自动清零。高频推送应在宿主合并更新；计数上限不改变实际数据。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有恢复、失败与加载操作均为本地 React 状态，不发送网络请求。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
