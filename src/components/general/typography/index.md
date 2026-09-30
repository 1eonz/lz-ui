---
title: Typography 排版
group: General
demo:
  defaultShowCode: false
---

# Typography 排版

用于标题、说明、状态与导航文字。`Text`、`Title`、`Paragraph`、`Link` 分别渲染 span、h1–h5、p、a，保留原生语义。它们是 lx-ui 的自定义 API，不能直接套用 AntD Typography 的 editable、ellipsis 配置或复制选项。

## 使用方法

```tsx pure
import { LxConfigProvider, Paragraph, Text, Title } from 'lx-ui';
import 'lx-ui/style.css';

export default function CustomerSummary() {
  return (
    <LxConfigProvider>
      <Title level={2}>客户资料</Title>
      <Paragraph type="secondary">合同已确认，等待交付排期。</Paragraph>
      <Text copyable={{ text: 'KH-1024' }}>KH-1024</Text>
    </LxConfigProvider>
  );
}
```

独立命名导出和 `Typography.Text/Title/Paragraph/Link` 都可用。选 level 时按文档层级组织，不仅按字号选择。正文为 14/22，辅助文字 token 为 12/20；没有额外 Caption 组件，辅助规格可通过宿主 className 消费 token。

## 标题阶梯与正文

五级标题使用字号 38/30/24/20/16、行高 46/38/32/28/24、字重 800/700/600/600/600。紧凑信息区选较低层级，正文和时间说明保留稳定阅读顺序。

<code src="../../../../docs/demos/general-typography-basic.tsx"></code>

## 语义、修饰与截断

成功、警告和失败同时保留文字说明。code、mark、delete、underline 与 strong 采用原生修饰元素。单行与两行截断限制在文字子层，展开操作由宿主状态控制。

<code src="../../../../docs/demos/general-typography-variants.tsx"></code>

## 实际复制、链接禁用与聚焦

编号可编辑，富文本显示通过 `copyable.text` 指定准确复制内容。示例使用实际 Clipboard API，成功后更新记录；无权限或 API 不可用时组件播报失败。合同链接通过 ref 聚焦，禁用时移除 href 与 Tab 焦点。

<code src="../../../../docs/demos/general-typography-copy.tsx"></code>

## 共享 API

Text/Title/Paragraph 共用 `TypographyBaseProps`；Link 共用除 `copyable` 外的选项。其他属性分别继承对应根元素的原生 HTML 属性，`style` 与 `className` 直接作用于根节点。

| 参数        | 类型                                                             | 默认值      | 说明                                                    |
| ----------- | ---------------------------------------------------------------- | ----------- | ------------------------------------------------------- |
| `children`  | `ReactNode`                                                      | —           | 文字或富文本，避免嵌套不合法的段落/交互元素             |
| `type`      | `'default' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Text/Title/Paragraph 为内容色；Link default 为品牌色    |
| `strong`    | `boolean`                                                        | `false`     | 使用 strong 修饰，不改变根元素语义                      |
| `disabled`  | `boolean`                                                        | `false`     | 禁用文字及复制；Link 同时移除 href、onClick 与 Tab 焦点 |
| `code`      | `boolean`                                                        | `false`     | code 修饰与等宽字体，不高亮代码语法                     |
| `mark`      | `boolean`                                                        | `false`     | mark 高亮，保留内容颜色                                 |
| `delete`    | `boolean`                                                        | `false`     | del 删除线                                              |
| `underline` | `boolean`                                                        | `false`     | u 下划线                                                |
| `ellipsis`  | `boolean \| { rows: number }`                                    | `false`     | true 为单行；对象为 CSS 多行截断，rows 应传有效正整数   |
| `copyable`  | `boolean \| CopyableOptions`                                     | `false`     | 独立复制按钮；不适用于 Link                             |
| `className` | `string`                                                         | —           | 根元素类名                                              |
| `style`     | `CSSProperties`                                                  | —           | 根元素样式，宿主可限制文本宽度                          |

### Title 与 Link

| 组件参数            | 类型                    | 默认值   | 说明                                   |
| ------------------- | ----------------------- | -------- | -------------------------------------- |
| `Title.level`       | `1 \| 2 \| 3 \| 4 \| 5` | `1`      | 对应 h1–h5，没有 h6 支持               |
| `Link.href`         | `string`                | —        | 原生导航地址；disabled 时移除          |
| `Link.target / rel` | 原生 anchor 属性        | —        | 打开方式与链接关系；外部链接由宿主配置 |
| `Link.tabIndex`     | `number`                | 原生行为 | disabled 时强制 -1                     |

### CopyableOptions

| 参数     | 类型                     | 默认值                          | 说明                                     |
| -------- | ------------------------ | ------------------------------- | ---------------------------------------- |
| `text`   | `string`                 | 字符串/数字 children 转为字符串 | 富文本必须显式提供；空文本不渲染复制按钮 |
| `onCopy` | `(text: string) => void` | —                               | Clipboard 写入成功后调用，不是点击事件   |

`copyable=true` 使用默认复制配置。Clipboard 需要浏览器允许的安全上下文与权限；失败会提供重试反馈。来源变更会使旧异步结果失效，连续成功仍会播报。宿主 onCopy 异常独立报告，不会把成功写入误报为复制失败。

## 事件与 Ref

| 导出        | Ref                    | 事件类型                                                             |
| ----------- | ---------------------- | -------------------------------------------------------------------- |
| `Text`      | `HTMLSpanElement`      | 对应 `HTMLAttributes<HTMLSpanElement>`，如 onClick/onFocus           |
| `Title`     | `HTMLHeadingElement`   | 对应 `HTMLAttributes<HTMLHeadingElement>`                            |
| `Paragraph` | `HTMLParagraphElement` | 对应 `HTMLAttributes<HTMLParagraphElement>`                          |
| `Link`      | `HTMLAnchorElement`    | 对应 `AnchorHTMLAttributes<HTMLAnchorElement>`，禁用时不调用 onClick |

ref 是实际原生节点，可读取 `getBoundingClientRect()`、调用 `scrollIntoView()`。Link 在有 href 且未禁用时可 `focus()`/`blur()`；其他文字默认不可聚焦。没有 AntD 的 editable、复制状态 ref 方法、自动 tooltip、展开回调或 `{ suffix, symbol, expandable }` 等截断配置。

| Ref 成员                        | 用法                                                | 边界                                                       |
| ------------------------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| `getBoundingClientRect()`       | 读取对应文字根节点的位置与尺寸                      | 包含复制操作所在根区域，不提供截断行数测量                 |
| `scrollIntoView(options?)`      | `ref.current?.scrollIntoView({ block: 'nearest' })` | 原生节点滚动；SSR 阶段无布局                               |
| `Link.focus(options?) / blur()` | `linkRef.current?.focus()`                          | 实际 HTMLAnchorElement；有 href 且未禁用时才有正常链接焦点 |
| `Link.click()`                  | `linkRef.current?.click()`                          | 原生 anchor 激活，遵循 href/禁用状态，不是路由器专用方法   |

例如 Link 使用 `useRef<HTMLAnchorElement>(null)`，Paragraph 使用 `useRef<HTMLParagraphElement>(null)`；不要把各组件 ref 统一断言为 AntD Typography 实例。

## 主题、边界与验证

标题、正文、状态前景和复制焦点使用命名 token，每个示例可独立切换主题。CSS ellipsis 不会自动添加“更多”操作；关键内容应由宿主提供展开或详情路径。Text 的禁用是语义/视觉标记，不会自动阻止宿主原生 onClick；它不是操作按钮。

设计依据为 `UI/P0 基础组件-General/` 的已确认排版规格，使用系统字体，不加载 CDN。Clipboard 成败取决于实际浏览器权限。静态类型与 lint 不替代截断、复制反馈、明暗、窄屏与键盘焦点的浏览器验收，这些检查仍待完成。
