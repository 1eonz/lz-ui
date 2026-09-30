---
title: Button 按钮
group: General
demo:
  defaultShowCode: false
---

# Button 按钮

用于保存、提交、查询等明确操作。每个操作组通常保留一个主要操作，其余使用默认、文字或链接外观。导航可通过 `href` 渲染链接；无需按钮外观的导航使用 `Link`。组件沿用 AntD 5.24+ 公开 `ButtonProps`，请求、失败恢复和权限判断由宿主管理。

## 使用方法

```tsx pure
import { Button, LxConfigProvider } from 'lx-ui';
import 'lx-ui/style.css';

export default function SaveButton() {
  return (
    <LxConfigProvider>
      <Button type="primary" onClick={() => console.log('保存客户')}>
        保存客户
      </Button>
    </LxConfigProvider>
  );
}
```

在应用根部引入样式并设置 Provider。`htmlType` 默认是 `button`，进入表单不会意外提交；提交操作显式使用 `htmlType="submit"`，通常在表单 `onSubmit` 中处理校验和请求。lx 默认关闭两字中文自动插空格，必要时传入 `autoInsertSpace`。

## 基础操作层级

主要、默认、虚线、文字和链接外观均保留真实按钮行为。点击后更新操作结果。

<code src="../../../../docs/demos/general-button-basic.tsx"></code>

## 尺寸、形状与状态

small 为 24px，large 为 48px，默认/middle 随 density 使用 40/32px。纯图标操作有独立名称和悬停提示；禁用操作保留可见标签。归档按钮可恢复状态，ghost 用于有色背景，block 占满可用宽度。

<code src="../../../../docs/demos/general-button-variants.tsx"></code>

## 提交、失败与恢复

本地保存演示保留客户名称，先显示加载，再返回可重试失败；恢复服务后再次保存。计时器在卸载时清理。loading 阻止重复激活，但真实请求仍应由宿主处理幂等、取消和服务端校验。

<code src="../../../../docs/demos/general-button-async.tsx"></code>

## API

从根入口命名导入 `Button`、`ButtonProps`、`ButtonRef`。下表覆盖按钮公开的组件参数；其他原生 button/anchor 属性沿用 `ButtonProps`，可传入 `id`、`title`、`aria-*`、`data-*`、表单属性与链接属性。AntD 版本新增能力以宿主安装的 [公开类型](https://ant.design/components/button/cn/) 为准。

| 参数                        | 类型                                                                | 默认值                    | 说明                                                          |
| --------------------------- | ------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------- |
| `children`                  | `ReactNode`                                                         | —                         | 操作标签；纯图标时提供 `aria-label`                           |
| `type`                      | `'default' \| 'primary' \| 'dashed' \| 'text' \| 'link'`            | `'default'`               | 常用操作外观                                                  |
| `color`                     | `ButtonProps['color']`                                              | 由 type/danger 推导       | AntD 公开颜色配置；可选预设随版本，主题品牌色优先使用 primary |
| `variant`                   | `'outlined' \| 'dashed' \| 'solid' \| 'filled' \| 'text' \| 'link'` | 由 type 推导              | 配合 color 使用的公开变体                                     |
| `size`                      | `'small' \| 'middle' \| 'large'`                                    | 继承宿主尺寸；否则 middle | 默认高度随 lx density；显式 small/large 保留固定规格          |
| `shape`                     | `'default' \| 'circle' \| 'round'`                                  | `'default'`               | 原生 AntD 形状                                                |
| `icon`                      | `ReactNode`                                                         | —                         | 前后位置由 iconPosition 指定                                  |
| `iconPosition`              | `'start' \| 'end'`                                                  | `'start'`                 | 图标相对标签的位置                                            |
| `loading`                   | `boolean \| { delay?: number; icon?: ReactNode }`                   | `false`                   | 加载态；delay 单位 ms，仍由宿主更新                           |
| `disabled`                  | `boolean`                                                           | `false`                   | 阻止激活；不进入常规 Tab 顺序                                 |
| `danger`                    | `boolean`                                                           | `false`                   | 强调破坏性操作，不自动弹确认框                                |
| `ghost`                     | `boolean`                                                           | `false`                   | 透明背景外观，宿主须保证背景对比度                            |
| `block`                     | `boolean`                                                           | `false`                   | 占满父容器宽度                                                |
| `href`                      | `string`                                                            | —                         | 存在时渲染 anchor；配合 target/rel 等原生链接属性             |
| `htmlType`                  | `'button' \| 'submit' \| 'reset'`                                   | `'button'`                | 原生按钮类型，不是视觉 type                                   |
| `autoInsertSpace`           | `boolean`                                                           | `false`                   | 两字中文标签自动插空格；lx 默认值与 AntD 不同                 |
| `className / rootClassName` | `string`                                                            | —                         | 公开根节点类名                                                |
| `style`                     | `CSSProperties`                                                     | —                         | 根节点内联样式                                                |
| `classNames / styles`       | `ButtonProps['classNames'] / ButtonProps['styles']`                 | —                         | AntD 公开 icon 语义槽样式；以当前版本类型为准                 |
| `prefixCls`                 | `string`                                                            | 宿主 AntD 前缀            | 原生样式前缀；不要依赖私有 DOM                                |

lx 只导出独立 `Button`，不提供 `Button.Group` 或 `SplitButton`。分组可组合 `Space`；需要原生 AntD 额外能力时从 `lx-ui/antd` 使用对应组件，不能把设计稿中的名称当作已实现 API。

## 事件与 Ref

| 事件                  | 类型                                | 行为                                          |
| --------------------- | ----------------------------------- | --------------------------------------------- |
| `onClick`             | `MouseEventHandler<HTMLElement>`    | 原生按钮/链接激活；loading、disabled 阻止操作 |
| `onFocus / onBlur`    | `FocusEventHandler<HTMLElement>`    | 实际根元素获取、失去焦点                      |
| `onKeyDown / onKeyUp` | `KeyboardEventHandler<HTMLElement>` | 原生键盘事件；通常不需要重复模拟 Enter/Space  |

`ButtonRef` 是 `HTMLButtonElement | HTMLAnchorElement`，取决于 `href`。可调用原生 `focus(options?)`、`blur()`、`click()`、`getBoundingClientRect()`；没有包装层的 loading/reset 方法。按钮支持 Enter/Space，anchor 保留链接的原生键盘行为。纯图标操作同时设置 `aria-label` 和 `title`，可见提示不能代替可访问名称。

| Ref 成员                        | 用法                                          | 边界                                                          |
| ------------------------------- | --------------------------------------------- | ------------------------------------------------------------- |
| `focus(options?: FocusOptions)` | `ref.current?.focus({ preventScroll: true })` | 聚焦实际 button/anchor；禁用按钮无法获得常规焦点              |
| `blur()`                        | `ref.current?.blur()`                         | 移除当前焦点；通常在宿主确定下一焦点目标后使用                |
| `click()`                       | `ref.current?.click()`                        | 原生程序化激活，不是请求完成或 loading 方法；仍需宿主处理操作 |
| `getBoundingClientRect()`       | 读取 `width/height/top/left`                  | 浏览器布局测量，不在 SSR 渲染阶段调用                         |

使用 `useRef<ButtonRef>(null)`，组件挂载后访问；根类型随 href 变化，需要按钮专有字段时先收窄实际节点类型。

## 主题、边界与验证

每个示例的“主题设置”可切换明暗、密度、三种外观、六种品牌与七组东方配色，切换不重置业务状态。尺寸与语义颜色共用 lx/AntD token，系统 reduced-motion 禁用动效。宿主自定义颜色、ghost 背景及长操作标签仍需检查对比度和布局。

示例依据 `UI/P0 基础组件-General/`，采用当前已确认的尺寸协议，不引入设计稿 CDN 或图标字体。请求均为本地状态模拟。文档类型与 lint 是静态证据，焦点、窄屏、实际高度、主题对比及 reduced-motion 仍待独立浏览器验收。
