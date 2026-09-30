---
title: Divider 分割线
group: General
demo:
  defaultShowCode: false
---

# Divider 分割线

用于区分内容组或同一操作组中的相邻操作。无标题的水平线渲染原生 hr，带标题的水平线与垂直线暴露 separator 语义。Divider 只表达分隔，不负责折叠、导航或标题级别。

## 使用方法

```tsx pure
import { Divider, LxConfigProvider, Paragraph } from 'lx-ui';
import 'lx-ui/style.css';

export default function CustomerSections() {
  return (
    <LxConfigProvider>
      <Divider orientation="left">客户资料</Divider>
      <Paragraph>负责人：陈晨</Paragraph>
      <Divider variant="dashed" />
      <Paragraph>客户已完成合同确认。</Paragraph>
    </LxConfigProvider>
  );
}
```

使用 `variant` 指定线型，不能套用 AntD Divider 的 dashed、orientationMargin 等参数。标题仍是 separator 的可见名称，不代替 h1–h5；页面标题层级应使用 Title 或原生 heading。

## 水平、标题与垂直分隔

无标题线区分正文，标题可居左、居中或居右，plain 减弱字重；行内垂直线分隔时间与操作者。

<code src="../../../../docs/demos/general-divider-basic.tsx"></code>

## 线型、位置与普通标题

线型、标题位置、文字及 plain 都可实时调整。清空标题后转为无标题 hr；同一线型也应用于行内垂直分隔。

<code src="../../../../docs/demos/general-divider-variants.tsx"></code>

## 业务内容分组

订单操作之间使用垂直线，资料与交付内容使用带标题水平线。展开/收起与归档由宿主状态驱动，Divider 本身不处理点击或折叠生命周期。

<code src="../../../../docs/demos/general-divider-sections.tsx"></code>

## API

从根入口命名导入 `Divider` 与 `DividerProps`。DividerProps 继承 `HTMLAttributes<HTMLElement>`，原生属性与事件作用于实际根节点。

| 参数                           | 类型                              | 默认值                   | 说明                                      |
| ------------------------------ | --------------------------------- | ------------------------ | ----------------------------------------- |
| `children`                     | `ReactNode`                       | —                        | 水平线可见标题；垂直线忽略标题            |
| `type`                         | `'horizontal' \| 'vertical'`      | `'horizontal'`           | 水平内容线或垂直行内线                    |
| `variant`                      | `'solid' \| 'dashed' \| 'dotted'` | `'solid'`                | 实线、虚线或点线                          |
| `orientation`                  | `'left' \| 'center' \| 'right'`   | `'center'`               | 水平标题位置；无标题/垂直时不产生标题布局 |
| `plain`                        | `boolean`                         | `false`                  | 标题字重从强调改为普通，不移除分隔语义    |
| `aria-label / aria-labelledby` | `string`                          | 带标题时自动引用可见标题 | 宿主显式名称优先，不额外生成名称关系      |
| `className`                    | `string`                          | —                        | 实际根节点类名                            |
| `style`                        | `CSSProperties`                   | —                        | 实际根节点样式                            |

无标题以 `children == null` 判断，空字符串仍是标题分支；需要无标题时传 undefined/null 或省略 children。垂直 type 忽略 children，不会把内容放进窄线条。

## 事件与 Ref

没有 onChange、onCollapse 等专用事件。原生 `onClick` 类型为 `MouseEventHandler<HTMLElement>`，但 separator 默认不可聚焦、不能自动通过 Enter/Space 激活；操作应放在独立按钮上。

ref 为 `HTMLElement`，实际节点随内容变化：无标题水平线是 `HTMLHRElement`，带标题水平线是 `HTMLDivElement`，垂直线是 `HTMLSpanElement`。可读 `getBoundingClientRect()`、调用 `scrollIntoView()`；没有 focus/折叠专用协议，不把 ref 固定断言为 div。改变 type 或有无标题可能替换节点。

| Ref 成员                   | 用法                                                | 边界                                                     |
| -------------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| `getBoundingClientRect()`  | 读取当前分隔节点位置与尺寸                          | 根可能是 hr/div/span，不能假设标题宽度等于根宽度         |
| `scrollIntoView(options?)` | `ref.current?.scrollIntoView({ block: 'nearest' })` | 定位到当前分隔节点，不会展开宿主隐藏内容                 |
| `focus(options?) / blur()` | HTMLElement 的原生方法                              | separator 默认不可聚焦；不提供可交互分隔条或 resize 行为 |

使用 `useRef<HTMLElement>(null)`，需要某种原生节点专有字段时先根据 tagName/节点类型收窄。布局测量只在浏览器挂载后执行。

## 主题、边界与验证

线色使用 `--lx-color-split`，标题到边缘偏移使用 `--lx-divider-title-offset`，默认 24px；间距跟随命名 token。可见标题允许换行，过长内容仍应由宿主合理分组。每个示例可独立切换明暗、密度、外观、品牌与东方配色。

设计依据为 `UI/P0 基础组件-General/` 的三种线型、标题位置和垂直操作分隔；业务演示只修改本地状态。静态类型与 lint 不替代真实窄屏、标题布局、可访问名称及主题对比检查，这些浏览器验收仍待完成。
