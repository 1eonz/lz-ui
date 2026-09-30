# Spin

用于未知比例的短任务与区域加载；确定进度使用 Progress。请求、取消、重试和禁用策略由宿主控制。

## 使用方法

```tsx
import { Spin } from 'lx-ui';

<Spin spinning={loading} tip="正在读取客户…">
  <CustomerList />
</Spin>;
```

`loading` 和 `CustomerList` 由业务页面提供；包裹 children 不会自动禁用其中控件。

## 代码演示

### 尺寸与显示延迟

三档尺寸为 16/24/36px。开始加载可对比立即、默认 300ms 和自定义 600ms；停止会取消尚未显示的 indicator。

<code src="../../../../docs/demos/feedback-spin-basic.tsx" title="尺寸与 Delay" defaultShowCode></code>

### 区域加载、失败和重试

首次请求在 900ms 后失败，重试成功。修改地区后加载，筛选和现有内容始终保留；加载时禁止重复请求，卸载清理定时器。

<code src="../../../../docs/demos/feedback-spin-region.tsx" title="区域恢复" defaultShowCode></code>

### 自定义 Indicator

显式 indicator 替换默认单弧。系统 reduced motion 会停止局部图形动画，停止/恢复按钮仍反馈真实 spinning 状态。

<code src="../../../../docs/demos/feedback-spin-indicator.tsx" title="自定义 Indicator" defaultShowCode></code>

## API

`SpinProps = Omit<AntSpinProps, 'fullscreen' | 'percent'>`；TypeScript 和运行时均排除这两项。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| spinning | boolean | true | 宿主提供的加载事实 |
| delay | number | 300 | 延迟视觉显示的毫秒数；0 立即显示 |
| size | 'small' \| 'default' \| 'large' | default | 默认 indicator 为16/24/36px；自定义图形负责自身尺寸 |
| tip | ReactNode | — | 区域加载文字；standalone 不展示 tip |
| indicator | ReactElement&lt;HTMLElement&gt; | lx 单弧 | 显式值优先；不调用全局 setDefaultIndicator |
| children | ReactNode | — | 存在时使用原生 nested 模式并持续挂载 |
| className / rootClassName | string | — | 归原生指示器根节点 |
| wrapperClassName | string | — | 归原生 nested 区域根节点 |
| style | CSSProperties | — | 原生指示器样式 |
| prefixCls | string | AntD 配置 | 自定义前缀；局部动效降级不依赖固定 ant 前缀 |

### 状态与 Ref

无新增 ref 和事件 API。spinning 是受控事实，不存在 defaultSpinning；修改 spinning 不会触发业务事件。业务区域的原生根立即 aria-busy，视觉 delay 不延迟 busy。standalone 的 aria-busy 保留 AntD 延迟显示语义，不代表一个业务数据区域。

## 主题、键盘与性能

每个示例可切明暗、密度、外观；默认颜色和几何来自 lx token。Spin 无键盘交互，不增加 tab stop、不移动焦点。请求按钮/表单是否禁用由宿主明确处理；建议用独立短 status 播报而非整块业务内容。

children 不会卸载，因此能保留输入状态，也仍会承担子树渲染成本。局部 reduced motion 停止所有动画/transition，包括 SVG、伪元素和 nested children；需要运动的宿主内容应放在区域外。浏览器实际视觉和动效验证尚未完成。

## 边界说明

用于区域加载反馈，兼容基线为 AntD `>=5.24 <6`，支持 `spinning`、`delay`、`size`、`tip`、`indicator` 和 `children`。含业务内容时 children 保持挂载，原生 nested 根节点的 `aria-busy` 立即跟随 `spinning`；`delay` 默认 300ms，只延迟视觉显示。没有 children 的 standalone 是视觉指示器，保留 AntD 原生延迟后的 busy 语义；此时不是业务区域，delay 前原生 busy=false。组件不增加外层 block div。lx-ui 首版不支持 `fullscreen` 或 `percent`，TypeScript 拒绝这两个属性，JavaScript 对象透传时也会剥离。

区域模式不会默认使用 `role="status"`，避免把完整业务内容重复播报。需要播报时，请由宿主提供独立的短状态文本。Spin 不会自动禁用表单、设置 `inert`、发起请求、重试、计时或创建全屏遮罩；这些策略应由页面控制。SSR 不依赖浏览器定时器，`prefers-reduced-motion` 下旋转动画由样式停止。

默认通过公开 `indicator` 绘制单弧，small/default/large 为 16/24/36px，使用 `--lx-spin-size-*`，旋转使用 `--lx-motion-spin-duration`（800ms linear）。显式 `indicator` 优先，调用者自行负责图形尺寸，`size` 仍传给 AntD 容器；显式 `delay` 可覆盖 300ms（0 表示立即显示）。局部默认 indicator 会优先于宿主 ConfigProvider 的 spin.indicator 或已设置的 AntD 全局默认；要使用宿主图形，请显式传入该 indicator。组件从不调用 `setDefaultIndicator`，不会修改其它 AntD Spin。

reduced motion 停止局部根下所有动画和过渡，包括 SVG、伪元素、custom indicator 与 nested 内容，兼容自定义 prefixCls。需要持续运动的宿主内容应放在加载区域外。`className`/`rootClassName` 仍归原生指示器，`wrapperClassName` 归 AntD nested 根；无新增 ref API。
