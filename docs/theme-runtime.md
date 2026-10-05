# Theme runtime

`LxConfigProvider` scopes lx-ui CSS variables and Ant Design 5 tokens to a subtree. Import `lx-ui/style.css` once at the application root. Components use semantic `--lx-*` variables, so changing a preset does not remount the page.

```tsx pure
import { LxConfigProvider, useLxTheme } from 'lx-ui/theme';

function ThemeSwitch() {
  const { theme, resolvedMode, setTheme } = useLxTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme({ mode: resolvedMode === 'dark' ? 'light' : 'dark' })}
    >
      {theme.mode}
    </button>
  );
}

export function App() {
  return (
    <LxConfigProvider theme={{ colorPreset: 'blue', mode: 'system', persist: true }}>
      <ThemeSwitch />
    </LxConfigProvider>
  );
}
```

`theme` is an initial value. `setTheme` accepts a partial selection or updater. `palettePreset` selects one of seven oriental pairs and takes visual priority over `colorPreset`; set it to `null` to return to the brand color. Stable brand keys are `blue`, `orange`, `green`, `purple`, `cyan`, `rose`. Palette keys are `celadon-laurel`, `twilight-peach`, `garnet-almond`, `pine-amber`, `misty-oatmeal`, `bean-sand-ink`, `cheese-distant-cyan`. Appearance is `business`, `soft`, or `glass`; density is `comfortable` or `compact`.

Persistence is opt-in (`persist: true`) and defaults to key `lx-ui-theme`. Malformed or unavailable storage is ignored. SSR and the first hydration render use the supplied initial theme; saved settings and system dark preference apply after mount. A server that knows the user's preference can pass it as `theme` to avoid the repaint. Ant Design motion and lx-ui motion are disabled when reduced motion is requested.

The provider sets `data-lx-mode`, `data-lx-appearance`, `data-lx-density`, and `data-lx-color` on its scope. Ant Design's public `ConfigProvider` receives a typed `ThemeConfig['components']` map and the same resolved semantic colors, sizing, and radius. Its public `algorithm` callback runs the official light/dark algorithm, then restores the resolved semantic values: the dark algorithm otherwise transforms the primary seed again and would cause the CSS and AntD colors to differ. Other derived AntD values retain the official algorithm. The palette seed is adjusted only when needed to maintain 4.5:1 contrast; the original palette values remain documented design inputs, not guaranteed final interactive fills.

The provider's `style` prop can override a `--lx-*` variable for one subtree. TypeScript accepts custom properties using the `--lx-${string}` index, while ordinary CSS properties remain checked. These overrides affect lx-ui CSS consumers only; Ant Design tokens continue to use the resolved theme. Keep brand-level changes in the theme presets so both systems agree.

Status messaging can use the paired semantic variables `--lx-color-success` / `--lx-color-success-bg`, `--lx-color-warning` / `--lx-color-warning-bg`, `--lx-color-error` / `--lx-color-error-bg`, and `--lx-color-info` / `--lx-color-info-bg`. The foreground is resolved against its matching tinted background for every brand or oriental palette in both light and dark mode, with a WCAG AA normal-text target of at least 4.5:1. Keep the pairs together when overriding tokens; changing only a background or foreground can invalidate that contrast contract.

## 初始值与作用域

| 参数                  | 默认值        | 行为                                                          |
| --------------------- | ------------- | ------------------------------------------------------------- |
| `theme.mode`          | `light`       | `system` 在挂载后监听操作系统                                 |
| `theme.appearance`    | `business`    | `soft`、`glass` 改变面板材质，输入和状态提示保持实色          |
| `theme.density`       | `comfortable` | `compact` 调整默认控件、Table 与 Pagination；显式 size 仍优先 |
| `theme.colorPreset`   | `blue`        | 没有 palette 时使用六种品牌预设之一                           |
| `theme.palettePreset` | 未设置        | 七组配色之一；`setTheme({ palettePreset: null })` 清除        |
| `theme.persist`       | `false`       | 开启时在挂载后恢复并保存有效选择                              |
| `theme.storageKey`    | `lx-ui-theme` | 可为独立应用或嵌套主题指定不同 key                            |
| `className`、`style`  | 未设置        | 作用于主题 scope 的 div；style 不修改 AntD token              |

`useLxTheme()` 返回 `theme`、`resolvedMode`、`setTheme`，没有 Provider 时抛出使用错误。嵌套 Provider 有独立选择，不会更改父级状态。初始 `theme` 属性发生变化不会同步替换运行时状态，应使用对应 scope 的 `setTheme`。

## 默认规格与公开映射

下表数值单位为 px，动效另行标明。采用值依据 [设计对应关系](./design-correspondence.md)。`src/styles/tokens.css` 的根回退与默认 light/blue/business/comfortable resolver 对齐，基础 CSS 组件在挂载前也能获得完整命名 token。AntD 配置由 Provider 提供，未使用 Provider 时仍采用宿主 AntD 配置。

| 组件                 | 默认规格                                                                                  | AntD 公开映射或 lx CSS 协议                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typography Title 1–5 | 字号 38/30/24/20/16，行高 46/38/32/28/24，字重 800/700/600/600/600                        | `--lx-font-size-heading-N`、`--lx-line-height-heading-N`、`--lx-font-weight-heading-N`；公开 Typography 字号/行高 alias 同源，逐级字重由 lx Title CSS 消费 |
| 正文与辅助文字       | 14/22、12/20                                                                              | `--lx-font-size-body` / `--lx-line-height-body`、caption 对；`fontSize`、`lineHeight`、`fontSizeSM`、`lineHeightSM`                                        |
| Button               | default 40/32 随 density；small 24、large 48                                              | `controlHeight`、`controlHeightSM`、`controlHeightLG`；不再使用统一最小高度                                                                                |
| Table                | 非虚拟且有效尺寸为默认/large 时，单行 body 为 48/36、表头 36；文字 12/18、横向 padding 16 | resolver：`cellPaddingBlock` 15/9、`cellPaddingBlockMD` 12/7、`cellPaddingBlockSM` 9/5；实际 default/large body 与 header 内距由 lx CSS 覆盖，详见下文     |
| Pagination           | default 40/32，small 24；default 字号 16/14、gap 8/6，圆角 8                              | `itemSize`、`itemSizeSM`、`fontSize`、`marginXS`、`borderRadius`；不新增 native size                                                                       |
| Avatar               | large/default/small 48/36/24，group overlap -8、space 4，square 圆角 8                    | `containerSizeLG` / `containerSize` / `containerSizeSM`、`groupOverlapping`、`groupSpace`、radius alias；数值/响应式 size 由宿主指定                       |
| Card                 | default padding 16，small 12，标题 16/14                                                  | `bodyPadding` / `bodyPaddingSM`、`headerPadding` / `headerPaddingSM`、`headerFontSize` / `headerFontSizeSM`；面板材质见下表                                |
| Tag                  | 高度 26，文字 12/16，圆角 6，横向 padding 10                                              | `fontSizeSM`、`lineHeightSM`、`borderRadiusSM`；`--lx-tag-height` 表示含边框的普通 Tag 高度，`--lx-tag-padding-inline` 由包装层消费                        |
| CheckableTag         | 高度 26（含 1px 边框），圆角 9999                                                         | `--lx-tag-checkable-height`、`--lx-tag-checkable-radius`；原生 button 的受控选中语义                                                                       |
| Tree                 | 缩进 24，hover/selected 语义色，180ms                                                     | `indentSize`、`nodeHoverBg/Color`、`nodeSelectedBg/Color`、directory 对、`motionDurationMid/Slow`                                                          |
| Descriptions         | label/content padding 8/12                                                                | `--lx-descriptions-padding-block/inline` 用于公开 semantic styles；`itemPaddingBottom/End` 映射 8/12，不将其冒充 label/content 专用 token                  |
| Statistic            | 标题 12，内容 28/36、字重 700                                                             | `titleFontSize`、`contentFontSize`；`--lx-statistic-value-font-size/line-height/weight` 由 valueStyle 消费                                                 |
| Result               | 标题 16，副标题 12，图标 32，extra 顶间距 12                                              | `titleFontSize`、`subtitleFontSize`、`iconFontSize`、`extraMargin`                                                                                         |
| Spin                 | small/default/large 16/24/36，800ms linear                                                | `dotSizeSM` / `dotSize` / `dotSizeLG` 与 `--lx-spin-size-*` 同源；`--lx-motion-spin-duration` 用于单弧；delay 300ms 由 Spin 组件提供，可显式覆盖           |
| Alert                | 默认 padding 8×12，description padding 16，退出 160ms                                     | `defaultPadding`、`withDescriptionPadding`、`borderRadiusLG`、`motionDurationSlow`；banner 的原生无圆角语义保留                                            |
| Progress             | 主色进度、语义剩余色、line 圆角 999                                                       | `defaultColor`、`remainingColor`、`circleTextColor`、`lineBorderRadius`                                                                                    |
| Skeleton             | 控件圆角 4/6/8，段落行高 12，上间距 16                                                    | `blockRadius`、`paragraphLiHeight`、`paragraphMarginTop`、`gradientFromColor` / `gradientToColor`                                                          |
| Icon / Divider       | 旋转 800ms；标题到边缘 24                                                                 | `--lx-motion-spin-duration`、`--lx-divider-title-offset`；Divider 的 native orientationMargin 是比例，不能用 24 冒充                                       |

Tag 默认关闭按钮的桌面最小尺寸为 24px（`--lx-space-xl`）；粗指针设备使用 `--lx-control-target-touch-min`，默认 44px。标签示例退出时长由 `--lx-motion-tag-exit-duration` 控制，默认 120ms，`prefers-reduced-motion: reduce` 时为 0ms。

AntD Table 没有 `rowHeight` 或 `headerHeight` 公开 token。`cellPaddingBlock` 是 AntD token resolver 的 15/9px 值（comfortable/compact），不等于 lx `Table` 的最终 default/large 内距。尺寸通过公开 `ConfigProvider.useConfig()` 按 `size ?? componentSize` 解析；非虚拟且解析为默认或 `large` 时，lx CSS 将 body cell 每侧内距设为 `max(0px, (rowHeight - max(lineHeight, controlHeightSM, tagHeight) - 1px) / 2)`；默认值代入后，48px/36px 行的最终内距分别为 10.5px/4.5px。header cell 每侧内距由 `max(0px, (headerHeight - max(lineHeight, controlHeightSM) - 1px) / 2)` 得出，默认 36px 表头为 5.5px。这里的 1px 用于抵消单元格边框；多行、展开内容、较高控件或宿主 render 可使行自然增高。过小的高度覆盖将内距限制为 0，内容仍自然撑高。解析为 middle/small（包括宿主继承尺寸）与 virtual 时不应用这组 lx CSS，保留 AntD 原生尺寸及对应 resolver token。`--lx-table-row-height` 和 `--lx-table-header-height` 是 lx 包装层 CSS 协议，公开 map 只配置真实存在的 cell token。`--lx-tag-height` 是普通 Tag 的可选最小高度 token，默认 26px，可通过 Provider `style` 或局部 CSS scope 覆盖。Descriptions 的 label/content padding 同样需要公开 semantic styles 消费，不能依赖不存在的 `--ant-*` 变量。

## 面板材质与回退

| appearance | 圆角 | 实色基础表面                 | 阴影             | 渐进增强                                                      |
| ---------- | ---- | ---------------------------- | ---------------- | ------------------------------------------------------------- |
| `business` | 4    | 普通 surface                 | `none`           | 无                                                            |
| `soft`     | 8    | 由配色辅色轻度着色的 ambient | 明暗模式的轻阴影 | 无                                                            |
| `glass`    | 12   | 普通 surface                 | 明暗模式的轻阴影 | 同时支持 backdrop-filter 与 color-mix 时 85% 表面 + 16px blur |

面板根消费 `--lx-panel-radius`、`--lx-panel-surface`、`--lx-panel-shadow`、`--lx-panel-backdrop-filter`。resolver 只内联 `--lx-panel-surface-base`、圆角、阴影、blur 尺寸与透明比例；动态的 surface/filter 留给 CSS，确保 `@supports` 和 reduced-motion 可以切换回退。旧的 `--lx-radius-panel`、`--lx-shadow-panel`、`--lx-glass-surface`、`--lx-glass-backdrop-filter` 继续可用。

不支持滤镜或颜色混合、以及系统请求 reduced-motion 时，glass 使用实色基础表面且 filter 为 `none`。Card 的公开 `colorBgContainer` 也使用同一实色基础表面；透明效果由局部 CSS 渐进应用，不会把输入、Table 或 Alert 的背景变成透明。reduced-motion 下 CSS 时长为 0，AntD `motion` 为 false，全局时长和 Tree/Alert 专用时长也归零。

## 验证与迁移

自动测试覆盖 13 种配色 × 2 种模式 × 3 种外观的可确定实色表面，检查正文、辅助文字、链接/品牌文本、状态色以及按钮文字的 4.5:1 对比度，并检查焦点色 3:1。透明 glass 叠在未知宿主图片上不在此对比度保证中，宿主需要针对实际背景检查或选择实色外观。

SSR 测试覆盖无 window 的渲染与嵌套 dark/glass/compact 选择；原生 AntD `useToken()` 测试覆盖 13 种配色与两种模式的全套语义映射，包括主色 hover/active/background、状态前景/背景以及 onPrimary。静态测试还验证默认 CSS 回退、公开组件 map 和系统 reduced-motion。浏览器工具当前受安全策略限制，截图、实际尺寸、窄屏、焦点及玻璃渲染仍需真实浏览器验收，不能由静态或 jsdom 结果替代。

相较早期实现，Table default 基准从 44/34 改为 48/36，Title 从 28/22/18/16/14 改为专用规格，面板圆角从旧的统一值改为 4/8/12。宿主升级时应检查依赖旧高度或标题尺寸的固定布局，并优先调整组件层级与内容布局。
