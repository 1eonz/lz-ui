---
title: Space 间距
group: General
demo:
  defaultShowCode: false
---

# Space 间距

用于相邻按钮、状态与筛选条件的有序排列。根节点使用原生 flex gap，不为每个子节点追加外边距。业务网格、复杂页面布局及子节点尺寸仍由宿主管理；Space 不是 AntD Space 的完整替代 API。

## 使用方法

```tsx pure
import { Button, LxConfigProvider, Space } from 'lx-ui';
import 'lx-ui/style.css';

export default function CustomerActions() {
  return (
    <LxConfigProvider>
      <Space size="middle" wrap align="center">
        <Button type="primary">保存资料</Button>
        <Button>取消</Button>
      </Space>
    </LxConfigProvider>
  );
}
```

`small/middle/large` 分别使用 8/16/24px token，数值按 px。`size={[horizontal, vertical]}` 设置 column-gap/row-gap，即使 direction 改为 vertical，元组顺序也不反转。子节点既有 margin 不会被 Space 清除。

## 命名间距与垂直排列

三档间距用于紧邻、常规和独立操作；垂直 block 组合保留整行状态布局。

<code src="../../../../docs/demos/general-space-basic.tsx"></code>

## 方向、对齐与换行

调整 gap、容器宽度、排列方向、交叉轴对齐和 wrap。宽度限制只作用于示例预览，窄屏下不超过父容器。关闭 wrap 时示例保持子项单行和原始宽度，由可聚焦的预览区域承接横向滚动，不将内容压成逐字窄列或让整页溢出；业务可按场景选择换行或局部滚动。

<code src="../../../../docs/demos/general-space-options.tsx"></code>

## 增删条件与 split

添加、移除、恢复和清空筛选条件。水平与垂直间距独立设置，视觉 Divider 与后一个条件保持一组，减少换行后的孤立分隔符。

<code src="../../../../docs/demos/general-space-filters.tsx"></code>

## API

从根入口命名导入 `Space`、`SpaceProps`、`SpaceSize`。SpaceProps 继承 `HTMLAttributes<HTMLDivElement>`，原生 role、aria 属性、事件和 style 作用于根 div。

<p id="space-docs-table-hint" className="lx-docs-table-hint">
  窄屏下可左右滑动参数表；键盘用户聚焦表格区域后按左右方向键浏览。
</p>

<div className="lx-docs-table" role="region" tabIndex="0" aria-label="Space 参数表" aria-describedby="space-docs-table-hint">

| 参数        | 类型                                           | 默认值                   | 说明                                                |
| ----------- | ---------------------------------------------- | ------------------------ | --------------------------------------------------- |
| `children`  | `ReactNode`                                    | —                        | 排列内容；空、undefined、布尔条件节点不占间距       |
| `size`      | `SpaceSize \| readonly [SpaceSize, SpaceSize]` | `'small'`                | 单值或 `[水平, 垂直]`，不提供对象配置               |
| `direction` | `'horizontal' \| 'vertical'`                   | `'horizontal'`           | flex 主轴方向                                       |
| `align`     | `CSSProperties['alignItems']`                  | 未设置，CSS 默认 stretch | center、flex-start、baseline 等公开 CSS 值          |
| `wrap`      | `boolean`                                      | `false`                  | 允许换行；不自动缩小子节点                          |
| `split`     | `ReactNode`                                    | —                        | 纯视觉分隔符，外层 aria-hidden，不放交互内容        |
| `block`     | `boolean`                                      | `false`                  | 根节点改为 flex 并占满可用宽度                      |
| `className` | `string`                                       | —                        | 根 div 类名                                         |
| `style`     | `CSSProperties`                                | —                        | 最后合并，可覆盖 gap、alignItems、flexWrap 等计算值 |

</div>

`SpaceSize = 'small' | 'middle' | 'large' | number`。数值应为有限非负值，负值按 0 处理。named token 随主题覆盖，但当前 density 不会自动改变 8/16/24 这三档固定间距。

## 事件、Ref 与语义

没有 onChange 或布局专用事件；原生 `onClick` 为 `MouseEventHandler<HTMLDivElement>`，`onFocus/onBlur` 为 `FocusEventHandler<HTMLDivElement>`，子元素事件可能冒泡至根节点。ref 为 `HTMLDivElement`，可读取 `getBoundingClientRect()`、调用 `scrollIntoView()`；默认不可聚焦，没有 measure/reflow 等封装方法。

<div className="lx-docs-table" role="region" tabIndex="0" aria-label="Space Ref 成员表" aria-describedby="space-docs-table-hint">

| Ref 成员                   | 用法                                                | 边界                                     |
| -------------------------- | --------------------------------------------------- | ---------------------------------------- |
| `getBoundingClientRect()`  | 读取排列容器的位置与宽高                            | 只测量根 div，不返回每项坐标或计算 gap   |
| `scrollIntoView(options?)` | `ref.current?.scrollIntoView({ block: 'nearest' })` | 原生滚动，不代替布局计算                 |
| `focus(options?) / blur()` | 原生 div 方法                                       | 默认不可聚焦；业务焦点通常应落在内部控件 |

</div>

使用 `useRef<HTMLDivElement>(null)`，在挂载后的事件或 effect 中测量。子节点列表和 Space 外部宽度由宿主控制，不通过 ref 调整组件内部状态。

Space 只负责排列，不赋予子项列表、工具栏或分组语义。需要时由宿主提供恰当 role/aria-label 或外层语义结构；不要把普通 div 当作表单字段。split 的 aria-hidden 会连同其内部内容隐藏，因此不能承载按钮、链接或重要业务文本。

## 主题、边界与验证

示例支持独立主题切换，间距来自 lx token，尺寸不因 hover 或动态标签变化而切换档位。wrap+split 会增加不可拆分 inline-flex 小组，整组可能一起换行；过长子节点仍需宿主允许换行、限制宽度或提供局部滚动。lx 不导出 `Space.Compact`、`SpaceCompact` 或 item 样式插槽。

设计依据为 `UI/P0 基础组件-General/` 的三档间距、基线对齐与分隔场景。示例只使用本地条件状态。静态类型与 lint 不能证明真实换行、焦点顺序和窄屏布局通过，仍待浏览器验收。
