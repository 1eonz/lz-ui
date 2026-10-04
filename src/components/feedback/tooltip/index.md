---
demo:
  tocDepth: 4
---

# Tooltip

为按钮、状态文字和图标补充简短上下文。若弹层内需要链接、按钮或多段信息，应先明确交互语义，再选择能承载交互的组件。

## 使用方法

```tsx
import { Tooltip } from 'lx-ui';

<Tooltip title="最近一次同步于 14:32 完成">
  <button type="button">客户同步状态</button>
</Tooltip>;
```

## 代码演示

### 基础提示

`title` 既是提示文案，也是 AntD Tooltip 的内容入口；默认由鼠标悬停或键盘焦点打开。
演示还保留了触发元素和 Tooltip 组件各自提供的 `aria-describedby`，打开后可一起检查。禁用操作的原因放在相邻、可聚焦的帮助按钮上，不依赖禁用按钮接收焦点。

<code src="../../../../docs/demos/feedback-tooltip-basic.tsx" defaultShowCode></code>

### 12 个位置

位置和值域与 AntD 5 公共类型一致：上方和下方的按钮从左对齐、居中到右对齐排列，左侧和右侧的按钮从上对齐、居中到下对齐排列。悬停或键盘聚焦按钮可直接查看弹层的实际锚定位置。演示底部的左右边缘触点可在 320–390px 窄视口检查自动翻转；窗口边界调整由 AntD 处理。

<code src="../../../../docs/demos/feedback-tooltip-placements.tsx" defaultShowCode></code>

### 受控、样式与容器

按钮真实更新 `open`，同时示范 `classNames`、`styles`、自定义颜色和 `getPopupContainer`。演示容器位于主题 Provider 子树内，因此局部 `--lx-*` 变量可供弹层继承。

<code src="../../../../docs/demos/feedback-tooltip-controlled.tsx" defaultShowCode></code>

## API

组件属性基于 AntD `>=5.24 <6` 的 Tooltip 公共类型，继承的属性会继续透传到 AntD。`trigger` 默认额外包含键盘 `focus`；`aria-describedby` 是 lx-ui 的增强项，用于保留触发元素已有说明并与 Tooltip 描述合并。

<p id="tooltip-docs-table-hint" className="lx-docs-table-hint">
  表格可横向滚动；聚焦表格区域后按左右方向键浏览。
</p>

### 常用属性

<div
  className="lx-docs-table lx-tooltip-api-table"
  role="region"
  tabindex="0"
  aria-label="Tooltip 常用属性参数表"
  aria-describedby="tooltip-docs-table-hint"
>

| 参数                      | 类型                             | 默认值               | 说明                                                                                                                                                  |
| ------------------------- | -------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`                | `ReactNode`                      | 必填                 | 单个可接收 ref 和事件属性的触发元素。原生按钮、链接最稳妥；静态元素不会被自动加 `tabIndex`。                                                          |
| `title`                   | `ReactNode \| (() => ReactNode)` | —                    | 短说明；支持同步渲染函数，不接收 Promise。异步数据和加载/失败状态由宿主管理。                                                                         |
| `trigger`                 | `TooltipProps['trigger']`        | `['hover', 'focus']` | `hover`、`focus`、`click`、`contextMenu` 或数组。显式传值整体替换默认项，不做合并。                                                                   |
| `placement`               | `TooltipPlacement`               | `'top'`              | 12 个方位：`top`、`topLeft`、`topRight`、`bottom`、`bottomLeft`、`bottomRight`、`left`、`leftTop`、`leftBottom`、`right`、`rightTop`、`rightBottom`。 |
| `open` / `defaultOpen`    | `boolean`                        | — / `false`          | `open` 为受控显隐；`defaultOpen` 只指定非受控初值。                                                                                                   |
| `onOpenChange`            | `(open: boolean) => void`        | —                    | AntD 请求显隐变化时调用；受控时宿主必须更新 `open`。                                                                                                  |
| `afterOpenChange`         | `(open: boolean) => void`        | —                    | 弹层显隐动画结束后通知；描述关联同步不依赖此动画回调。                                                                                                |
| `id` / `aria-describedby` | `string`                         | React `useId()` / —  | `id` 标识提示；额外描述 ID 会和子元素描述及打开时的 Tooltip ID 合并。                                                                                 |
| `color`                   | `TooltipProps['color']`          | `#1f2937`            | 设置提示表面颜色。自定义浅色时同时通过 `styles.body.color` 设置足够对比度的文字色。                                                                   |
| `classNames`              | `TooltipProps['classNames']`     | —                    | 按 AntD 公开语义部位设置弹层根部或内容的 class；常用部位为 `root`、`body`。                                                                           |
| `styles`                  | `TooltipProps['styles']`         | —                    | 按 AntD 公开语义部位设置弹层根部或内容的内联样式；`styles.body.color` 可覆盖默认白字。                                                                |
| `className` / `style`     | `string` / `CSSProperties`       | —                    | 设置 AntD Tooltip 语义根部样式。                                                                                                                      |
| `ref`                     | `TooltipRef`                     | —                    | 转发 AntD ref：`nativeElement`、`popupElement` 和 `forceAlign()`。                                                                                    |

</div>

### 高级定位与渲染

<details>
<summary>查看高级定位与渲染参数</summary>

<div
  className="lx-docs-table"
  role="region"
  tabindex="0"
  aria-label="Tooltip 高级定位与渲染参数表"
  aria-describedby="tooltip-docs-table-hint"
>

| 参数                                            | 类型                                            | 默认值          | 说明                                                                              |
| ----------------------------------------------- | ----------------------------------------------- | --------------- | --------------------------------------------------------------------------------- |
| `arrow`                                         | `boolean \| { pointAtCenter?: boolean }`        | `true`          | 控制箭头及其是否指向触发元素中心。                                                |
| `autoAdjustOverflow`                            | `boolean \| TooltipProps['autoAdjustOverflow']` | `true`          | 根据可用视口空间翻转或调整弹层位置。                                              |
| `mouseEnterDelay` / `mouseLeaveDelay`           | `number`                                        | `0.1` 秒        | 鼠标进入后打开、离开后关闭的延迟，由 AntD 管理计时器。                            |
| `getPopupContainer`                             | `(triggerNode: HTMLElement) => HTMLElement`     | AntD 默认容器   | 指定 portal 容器。局部容器可能继承 CSS 变量，但需检查 overflow 裁切和层叠上下文。 |
| `align`                                         | `TooltipProps['align']`                         | `{}`            | 低层对齐微调；常规布局优先使用 `placement`。                                      |
| `builtinPlacements`                             | `TooltipProps['builtinPlacements']`             | AntD 12 方位    | 有特殊定位规则时替换内建矩阵。                                                    |
| `zIndex`                                        | `number`                                        | AntD 层级 token | 调整弹层层级；优先由 Provider 统一管理。                                          |
| `fresh`                                         | `boolean`                                       | `false`         | 控制隐藏时是否刷新内容；内容昂贵或有订阅时谨慎开启。                              |
| `rootClassName` / `openClassName` / `prefixCls` | `string`                                        | AntD 默认值     | 自定义弹层根部类名、触发元素打开类名或 AntD 前缀；普通使用无需调整。              |

</div>

</details>

### 兼容与弃用属性

优先使用 `open`、`defaultOpen`、`onOpenChange` 和 `title`。AntD 仍保留以下兼容属性，混用时按下文优先级工作。

<details>
<summary>查看弃用属性和版本迁移说明</summary>

<div
  className="lx-docs-table"
  role="region"
  tabindex="0"
  aria-label="Tooltip 兼容与弃用属性表"
  aria-describedby="tooltip-docs-table-hint"
>

| 属性                                                      | 类型                                  | 说明                                                                                   |
| --------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------- |
| `visible`                                                 | `boolean`                             | 已弃用的受控显隐别名；仅当 `open` 未提供时生效。                                       |
| `defaultVisible`                                          | `boolean`                             | 已弃用的非受控初始值别名；仅当 `defaultOpen` 未提供时生效。                            |
| `onVisibleChange`                                         | `(visible: boolean) => void`          | 已弃用的回调。与 `onOpenChange` 同时传入时，两者都会在显隐请求时收到布尔值。           |
| `afterVisibleChange`                                      | `(visible: boolean) => void`          | 已弃用的动画完成回调；仅当 `afterOpenChange` 未提供时使用。                            |
| `overlay`                                                 | `ReactNode \| (() => ReactNode)`      | 旧内容属性；新用法请使用 `title`。                                                     |
| `arrowPointAtCenter`                                      | `boolean`                             | 已弃用；使用 `arrow={{ pointAtCenter: true }}`。                                       |
| `overlayClassName` / `overlayStyle` / `overlayInnerStyle` | `string` / `CSSProperties`            | 已弃用；分别迁移到 `classNames.root`、`styles.root` 和 `styles.body`。                 |
| `destroyTooltipOnHide`                                    | `boolean \| { keepParent?: boolean }` | 已弃用。`destroyOnHidden` 从 AntD 5.25 才加入，因此不属于 lx-ui 的 `>=5.24` 公共类型。 |

</div>

`TooltipPlacement` 从 AntD 公开 Props 派生。因为包支持最低 AntD `5.24`，类型主动排除 5.25 才加入的 `destroyOnHidden`；升级最低 peer 版本时再评估公开该属性。

迁移旧版 AntD 时可以先保留 `visible`、`defaultVisible` 和 `onVisibleChange`，但新代码请使用 `open`、`defaultOpen` 和 `onOpenChange`。这些兼容属性属于公开类型的一部分，组件不会把它们当作未知 DOM 属性传递给触发元素。

</details>

## 受控与非受控

不传 `open` 时用 `defaultOpen` 指定初值，后续状态由 AntD 根据 `trigger` 管理。传入 `open` 后状态属于宿主；`onOpenChange` 只是显隐请求，组件不会异步回写或在卸载时补发回调。程序化更新 `open` 不模拟用户触发事件。

```tsx
import { useState } from 'react';
import { Tooltip } from 'lx-ui';

function ControlledHint() {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip open={open} onOpenChange={setOpen} title="由页面管理显隐">
      <button type="button">查看提示</button>
    </Tooltip>
  );
}
```

<details>
<summary>查看旧版显隐属性的优先级与迁移示例</summary>

兼容的 `visible` 家族也会进入受控模式：当 `open` 和 `visible` 同时存在时，`open` 优先；没有 `open` 时才读取 `visible`。初始值使用 `defaultOpen ?? defaultVisible ?? false`，所以两者同时提供时 `defaultOpen` 优先。只要 `open` 或 `visible` 有定义，组件就是受控的，所有 default 属性都会被忽略；例如 `<Tooltip visible={false} defaultOpen title="提示">` 初始仍关闭，必须通过 `visible` 更新状态。新旧 `onOpenChange` 回调可同时传入，触发显隐请求时都会收到相同布尔值。

`open`、`visible` 与 default 属性只应在组件的整个生命周期内保持同一种控制模式。wrapper 在受控期间不会同步内部 `internalOpen`；如果先传入 `open` 或 `visible`，再把它们改为 `undefined`，非受控模式可能恢复到受控前遗留的内部初始值，而不是最后一次受控值。需要切换模式时请卸载后重新挂载 Tooltip，或由宿主持续维护同一份状态后再以新的 `defaultOpen` 初始化。

显隐优先级可以按下面的顺序理解：`open`（只要定义就优先）→ `visible`（仅当 `open` 未定义时）→ 内部状态（非受控时由 `defaultOpen ?? defaultVisible ?? false` 初始化）。`onOpenChange` 与 `onVisibleChange` 都是通知回调，不会改变这一级联优先级。

兼容旧属性的最小写法如下。`visible` 一旦提供就是受控状态，`defaultOpen` 不会再接管初始值；因此迁移时要同步更新 `visible`，否则 Tooltip 会一直保持传入的状态。

```tsx
import { Tooltip } from 'lx-ui';

<Tooltip visible={isHintVisible} onVisibleChange={setHintVisible} title="旧版页面仍可沿用的提示">
  <button type="button">查看提示</button>
</Tooltip>;
```

</details>

## 主题与容器

默认箭头、层级和动画使用 AntD `ConfigProvider` 的公开 Tooltip token。深色表面 `colorBgSpotlight` 固定为设计稿的 `#1f2937`，文字使用 `#ffffff`，不随品牌主色变化；`LxConfigProvider` 为 AntD Tooltip 设置该公共 alias，Tooltip wrapper 也显式传入相同表面和文字色，避免主题色污染。AntD 5.24 当前只有 Tooltip 样式消费此 alias。亮色变体通过 AntD 的 `color` 与 `styles` 指定，不新增第二套显隐或定位状态。

`--lx-*` 自定义属性只定义在 `LxConfigProvider` 的 DOM 子树。默认 portal 位于 `document.body`，React 的 Provider context 会保留，但 CSS 自定义属性按 DOM 祖先继承，因此不会自动继承该局部变量。若 `color`、`styles` 或自定义 class 使用 `var(--lx-*)`，请通过 `getPopupContainer` 选择变量可继承的容器，或由宿主在更高层声明变量；靠近触发器的容器可能被滚动区裁切，宿主需按实际布局验证。

## 键盘与描述关系

默认 focus 触发要求子元素本身可聚焦，并能接收 AntD 的 ref 与事件属性。原生按钮、链接和输入控件保留自己的 Tab、Enter、Space 行为；组件不替任意 `span` 添加 `tabIndex`，也不重写 Enter/Escape。Tooltip 打开期间，组件通过 AntD 的公开 ref 和稳定 `id` 合并原描述与提示描述，关闭后保留宿主描述；需要传入 Form.Item 等外层生成的描述时，可在 Tooltip 或触发元素上提供 `aria-describedby`。自定义触发组件必须将该属性转发至实际 DOM。

## 内容与状态职责

静态文字和 disabled 控件不适合作为键盘提示目标。说明禁用原因时，使用相邻的可聚焦帮助入口或始终可见的说明；基础 demo 展示了该模式。短提示不创建额外 live region。

Tooltip 只管理定位与显示，不发请求、不缓存内容，也没有单独的 loading、empty、error 状态。提示应保持精简；需要按钮、链接、表单或长说明时不要塞进 Tooltip。鼠标延迟、自动翻转、z-index、弹层挂载和动效退出遵循 AntD；`LxConfigProvider` 检测到 reduced motion 时通过公开 token 关闭 AntD 动效。

## 交互式锚定弹层

<details>
<summary>查看 Popover 与 Popconfirm 的范围</summary>

首版仅交付 Tooltip。Popover、Popconfirm 等包含可操作内容的锚定弹层，待独立的对话框与锚定交互能力评审后再进入实现范围；详见[Tooltip 与锚定交互弹层决策](/design-review#tooltip-anchor-dialog-decision)。

</details>
