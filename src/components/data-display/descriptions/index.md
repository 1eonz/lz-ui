---
title: Descriptions 描述列表
group: Data Display
---

# Descriptions 描述列表

用于只读键值信息；编辑和校验应使用表单控件。

## 基础用法：合同键值布局

items 中每个条目传 key、label 和 children，span 合并多列。column 可用数值或断点对象，窄屏设置 xs: 1；bordered 开启边框，金额和日期先由宿主格式化。

<code src="../../../../docs/demos/descriptions-basic.tsx"></code>

## 长合同说明

切换完整说明观察长值换行。items 提供稳定 key、label、children；column 使用响应式列对象，不使用不存在的 responsive 属性。

<code src="../../../../docs/demos/descriptions.tsx"></code>

## 状态与受控协议

Descriptions 不请求数据，也没有内建 loading/error。先由宿主渲染 Skeleton 或错误恢复区域，数据就绪后再传 items；空值明确显示“未提供”。

## API

从 `lx-ui` 根入口命名导入组件和对应类型。除扩展项外，其他属性沿用 [Ant Design 5 公开契约](https://ant.design/components/descriptions/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

| 属性            | 类型                          | 默认值       | 说明           |
| --------------- | ----------------------------- | ------------ | -------------- |
| `items`         | `DescriptionsProps['items']`  | `—`          | 条目及 span    |
| `title / extra` | `ReactNode`                   | `—`          | 标题及补充操作 |
| `column`        | `DescriptionsProps['column']` | `3`          | 列数或断点列数 |
| `bordered`      | `boolean`                     | `false`      | 边框           |
| `layout`        | `DescriptionsProps['layout']` | `horizontal` | 水平或垂直     |
| `size`          | `DescriptionsProps['size']`   | `default`    | 展示尺寸       |
| `colon`         | `boolean`                     | `true`       | 标签冒号       |

## 事件、Ref 与键盘

没有受控编辑事件，数据更新替换 items。ref 指向 HTMLDivElement 稳定外层，不暴露单元格内部结构。内容中的链接或操作自行提供键盘语义。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

日期、金额和缺失值由宿主格式化。加载用匹配布局的 Skeleton，失败用恢复提示；大量字段按业务分组。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有恢复、失败与加载操作均为本地 React 状态，不发送网络请求。基础示例供观察单组件，交互示例说明宿主受控状态与恢复协议。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
