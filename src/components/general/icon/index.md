---
title: Icon 图标
group: General
demo:
  defaultShowCode: false
---

# Icon 图标

用于识别操作、文件与业务状态。图标由宿主按需导入并通过 `component` 注入，lx-ui 不包含完整图标集合。装饰图标保持隐藏语义；独立传达含义时提供 `label`。交互放在 Button 或链接中，由父控件负责名称、键盘与焦点。

## 使用方法

```tsx pure
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { Icon, LxConfigProvider } from 'lx-ui';
import 'lx-ui/style.css';

export default function SearchIcon() {
  return (
    <LxConfigProvider>
      <Icon component={SearchOutlined} label="搜索客户" size={20} />
    </LxConfigProvider>
  );
}
```

图标来源是宿主依赖，上例需要先运行 `npm install @ant-design/icons`，再按需导入单项组件；lx-ui 不代替宿主安装或导出图标包。不要为了一个图标导入整个注册表。AntD 的单图标入口兼容当前 `IconComponent`。自有组件需转发 `className`、`style` 与 `aria-hidden`，尺寸和旋转才能作用于其根节点。

## 装饰与语义

有可见文字的图标只作装饰，状态同时用文本表达；独立合同图标通过 label 提供图片名称。

<code src="../../../../docs/demos/general-icon-basic.tsx"></code>

## 大小、旋转与持续同步

尺寸、角度与旋转开关实时控制。外层始终保留 1em 占位；rotate 作用于注入组件的根节点，它可能是 SVG，也可能是 span。spin 使用 800ms linear，系统 reduced-motion 下停止旋转。

<code src="../../../../docs/demos/general-icon-variants.tsx"></code>

## 放在真实操作中

收藏是受控切换，缩放有上下限与恢复操作。交互名称和悬停提示位于 Button，内部 Icon 不重复播报名称。

<code src="../../../../docs/demos/general-icon-actions.tsx"></code>

## API

从根入口命名导入 `Icon`、`IconProps`、`IconComponent`。`IconProps` 继承 `Omit<HTMLAttributes<HTMLSpanElement>, 'color'>`，没有自动加载、点击状态或图标名称检索。

<p id="icon-docs-table-hint" className="lx-docs-table-hint">
  窄屏下可左右滑动参数表；键盘用户聚焦表格区域后按左右方向键浏览。
</p>

<div className="lx-docs-table" role="region" tabIndex="0" aria-label="Icon 参数表" aria-describedby="icon-docs-table-hint">

| 参数                     | 类型                              | 默认值         | 说明                                                              |
| ------------------------ | --------------------------------- | -------------- | ----------------------------------------------------------------- |
| `component`              | `IconComponent`                   | 必填           | 接受 className/style/aria-hidden 的 React 组件                    |
| `label`                  | `string`                          | —              | 独立图片的可访问名称，优先于 title                                |
| `title`                  | `string`                          | —              | 原生悬停提示；没有 label 时也用作可访问名称                       |
| `size`                   | `number \| string`                | 继承 font-size | number 按 px；string 可使用 em/rem 等 CSS 长度                    |
| `color`                  | `CSSProperties['color']`          | `'inherit'`    | currentColor 颜色；优先于 style.color                             |
| `spin`                   | `boolean`                         | `false`        | 外层持续旋转，尊重 reduced-motion                                 |
| `rotate`                 | `number`                          | —              | 内层角度，单位 deg，不改变占位尺寸                                |
| `className`              | `string`                          | —              | 外层 span 类名                                                    |
| `style`                  | `CSSProperties`                   | —              | 外层样式；size/color 参数优先于相应 style 值                      |
| `id / data-* / 原生属性` | `HTMLAttributes<HTMLSpanElement>` | —              | 转发至外层；role、aria-label、aria-hidden 由 label/title 语义决定 |

</div>

`IconComponent` 的最小属性为 `{ className?: string; style?: CSSProperties; 'aria-hidden'?: AriaAttributes['aria-hidden'] }`。没有 label/title 时外层 `aria-hidden=true`；有有效名称时外层 `role="img"`。内部图标始终隐藏，避免重复播报。

## 事件与 Ref

原生 span 事件如 `onClick`、`onMouseEnter`、`onFocus` 会透传，类型分别为 `MouseEventHandler<HTMLSpanElement>`、`FocusEventHandler<HTMLSpanElement>` 等，但 span 不自动成为可聚焦控件，也不提供 Enter/Space 激活。操作应使用 Button，不应仅依赖 Icon.onClick。

ref 为 `HTMLSpanElement`，可读 `getBoundingClientRect()` 或访问原生节点；没有播放/暂停等专用方法，旋转由 spin 控制。默认不可聚焦，原生 `focus()` 需要宿主提供恰当 tabIndex；业务操作仍优先用按钮。

<div className="lx-docs-table" role="region" tabIndex="0" aria-label="Icon Ref 成员表" aria-describedby="icon-docs-table-hint">

| Ref 成员                   | 用法                                                | 边界                                             |
| -------------------------- | --------------------------------------------------- | ------------------------------------------------ |
| `getBoundingClientRect()`  | 读取外层 span 的 `width/height`                     | 测量占位，不能当作源图标 SVG 的边界              |
| `scrollIntoView(options?)` | `ref.current?.scrollIntoView({ block: 'nearest' })` | 原生滚动行为；必要时尊重宿主 reduced-motion 策略 |
| `focus(options?) / blur()` | 原生焦点方法                                        | span 默认不可聚焦；不会把图标变成键盘操作控件    |

</div>

使用 `useRef<HTMLSpanElement>(null)`；需要图标源内部节点或动画控制时，应在宿主图标组件中定义自己的公开协议。

## 主题、边界与验证

示例复用独立主题框架，支持明暗、密度、外观、品牌与东方配色。图标默认继承前景，状态色使用语义变量。第三方图标如果忽略样式或使用固定 fill，将无法正确继承颜色和旋转；宿主应先验证其组件协议。

设计依据为 `UI/P0 基础组件-General/` 的图标场景，使用已有图标包的单项入口，不引入 CDN 字体。静态类型与 lint 不替代真实图标渲染、焦点、窄屏、对比度和 reduced-motion 验收；这些浏览器检查仍待完成。
