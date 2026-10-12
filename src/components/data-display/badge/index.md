---
title: Badge 徽标
group: Data Display
---

# Badge 徽标

用于数量提示、状态说明和内容角标；徽标本身不提供操作语义。

## 图标、头像、溢出与状态

<code src="../../../../docs/demos/badge-basic.tsx"></code>

`count` 与 `overflowCount` 显示数量及上限，`showZero` 控制零值；`status` 和 `text` 表达状态。被标记内容放在 `children`，交互由宿主控件提供。

## 受控数量与恢复

读一条减少未读数量，新增 100 条可观察溢出，全部已读将数量清零，恢复消息回到初始数值。图标按钮名称保持为“打开通知摘要”；展开后的摘要和页面状态行播报当前未读数量。

<code src="../../../../docs/demos/badge.tsx"></code>

## 状态、主题与受控协议

processing、success、warning、error 通过颜色与文字共同表达；processing 只表示展示状态，不负责请求管理。Badge 的空、加载和失败由宿主计数或状态与 text 表达；禁用属于被标记控件，不属于徽标。状态点为 10px，processing 周期为 1500ms；系统要求减少动态效果时会停止脉冲。AntD `>=5.24` 公开 `statusSize`，但没有公开 processing 周期 token；lx-ui 仅在没有 `children` 且只渲染状态点的 processing 分支映射静态语义色，并通过 `classNames.indicator` 插槽应用自有 CSS Module 动效，不依赖 AntD 内部伪元素。未提供 `count`、`count={null}` 或被隐藏的零值时按状态点处理；显式计数（包括 `showZero` 的零值）及带 `children` 的组合保留 AntD 原生行为。组件实例通过公开 `styles.indicator.color` 设置的颜色会同时用于圆点和脉冲描边，未单独设置背景时由 `currentColor` 保持一致。组件实例显式设置 `styles.indicator.background` 或 `backgroundColor` 时保留其底色；仅设置 `backgroundImage` 时将底色设为透明，避免 AntD 默认状态色透过透明渐变或 `none` 显示。通过 AntD `ConfigProvider` 的 `badge.styles.indicator` 设置时按样式属性正常合并；若只设置 `backgroundImage` 且需要透明底色，须同时设置 `backgroundColor: 'transparent'`。显式 `color` 属性仍按 AntD 5 的颜色规则生效，预设色不会被 lx 默认色覆盖。周期由 `--lx-badge-processing-duration` 控制，升级 AntD 后仍需回归公开 Props、插槽和状态尺寸。

## Ribbon 角标

`Badge.Ribbon` 未设置 `color` 时默认以橙红渐变斜带标记 `children` 内容块，适合展示服务级别、认证或优先级。`text` 设置文案，`placement` 选择 `start` 或 `end`；显式设置 `color` 保留 AntD 的纯色展示，`style` 可覆盖默认外观。Ribbon 外层保持可见溢出，不裁切宿主内容；斜带要完全落在卡片内时，内容块高度需至少约 88px，窄容器还应限制内容最大宽度。

斜带可通过 Ribbon 元素上的 CSS 变量调整：`--lx-badge-ribbon-width`、`--lx-badge-ribbon-height`、`--lx-badge-ribbon-block-offset`、`--lx-badge-ribbon-inline-offset`、`--lx-badge-ribbon-font-size` 和 `--lx-badge-ribbon-angle`。局部样式通过 `className`/`rootClassName` 传入；显式 `style` 属性优先于组件默认值。

`RibbonProps` 单独描述 Ribbon 参数，不并入 `BadgeProps`；需要类型标注时从 `lx-ui` 命名导入。`Badge.Ribbon` 直接保留 AntD 5 的公开静态组件和属性契约。

## API

从 `lx-ui` 根入口命名导入 `Badge`、`BadgeProps` 和 `RibbonProps`。除扩展项外，Badge 属性沿用 [Ant Design 5 公开契约](https://ant.design/components/badge/cn/)；默认行为随安装的 AntD 5 版本生效，下表列出常用参数。

<p id="badge-docs-table-hint" className="lx-docs-table-hint">
  窄屏下可左右滑动参数表；键盘用户聚焦表格区域后按左右方向键浏览。
</p>

<div
  className="lx-docs-table"
  role="region"
  tabIndex="0"
  aria-label="Badge 属性参数表"
  aria-describedby="badge-docs-table-hint"
>

| 属性            | 类型                   | 默认值  | 说明                                     |
| --------------- | ---------------------- | ------- | ---------------------------------------- |
| `count`         | `ReactNode`            | `—`     | 计数或自定义内容                         |
| `overflowCount` | `number`               | `99`    | 计数显示上限                             |
| `showZero`      | `boolean`              | `false` | 显示零值                                 |
| `dot`           | `boolean`              | `false` | 用圆点替代计数                           |
| `status`        | `BadgeProps['status']` | `—`     | success/processing/default/error/warning |
| `color`         | `string`               | `—`     | AntD 预设色或 CSS 颜色；可覆盖状态默认色 |
| `text`          | `ReactNode`            | `—`     | 状态文字                                 |
| `children`      | `ReactNode`            | `—`     | 被标记内容                               |
| `title`         | `string`               | `—`     | 悬停说明                                 |

</div>

### `Badge.Ribbon` 参数

| 属性            | 类型                      | 默认值  | 说明                           |
| --------------- | ------------------------- | ------- | ------------------------------ |
| `text`          | `RibbonProps['text']`     | `—`     | 角标文字或自定义内容           |
| `color`         | `RibbonProps['color']`    | `—`     | AntD 预设色或 CSS 颜色         |
| `placement`     | `'start' \| 'end'`        | `'end'` | 角标位于内容块的起始侧或末尾侧 |
| `children`      | `RibbonProps['children']` | `—`     | 被角标标记的内容块             |
| `className`     | `string`                  | `—`     | 角标元素的自定义类             |
| `rootClassName` | `string`                  | `—`     | Ribbon 外层容器的自定义类      |
| `style`         | `React.CSSProperties`     | `—`     | 角标元素的内联样式             |

## 事件、Ref 与键盘

没有计数更新事件。children 或计数包装分支中，ref 沿用 AntD Badge 的公开转发行为并指向根节点。AntD 5.29.3 在无 children 且使用 status/color 的状态展示分支不附上 ref，因此该用法的 ref 为 null；需要 DOM ref 时请使用带 children 的 Badge。适配层不添加 wrapper，以保留 className、style、HTML 属性和事件在 AntD 根节点上的落点。宿主变更 count，状态消息负责播报；颜色不能替代文字。

## 主题与密度

展开示例的“主题设置”可切换 light/dark、comfortable/compact、三种外观、六个品牌色与七套东方配色。品牌色选择会清除东方配色；选择东方配色后由 palettePreset 决定视觉色阶。Provider 禁用持久化，主题操作不重置当前业务状态。

主题仅改变外观与间距，不改变记录、权限或页码。需要显式尺寸时使用当前组件公开支持的尺寸参数；表格行高使用独立 token。长内容应允许换行，宽表格在容器内滚动。

## 边界与性能

不轮询、不自动清零。高频推送应在宿主合并更新；计数上限不改变实际数据。

## 设计与验证边界

示例对应 `UI/P0 基础组件-Data Display/` 的当前组件场景，所有数量变化均为本地 React 状态，不发送网络请求。静态检查不能替代明暗对比度、焦点、窄屏及 reduced motion 的独立浏览器验收。
