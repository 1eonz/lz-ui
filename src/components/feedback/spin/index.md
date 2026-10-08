# Spin

用于未知比例的短任务与区域加载；确定进度使用 Progress。

## 使用方法

```tsx
import { Spin } from 'lx-ui';

<Spin spinning tip="正在读取客户…">
  <div>现有客户内容保持挂载</div>
</Spin>;
```

实际业务中将 spinning 绑定请求状态；包裹 children 不会自动禁用其中控件。

## 代码演示

### 尺寸与显示延迟

三档尺寸为 16/24/36px。开始加载可对比立即、默认 300ms 和自定义 600ms；停止会取消尚未显示的 indicator。

<code src="../../../../docs/demos/feedback-spin-basic.tsx" defaultShowCode></code>

### 区域加载、失败和重试

演示使用浏览器内本地计时器模拟，不会请求真实服务。

<code src="../../../../docs/demos/feedback-spin-region.tsx" defaultShowCode></code>

首次点击“同步客户”模拟失败，并保留当前记录、时间和输入；点击“重试同步”时按提交时的地区快照更新结果。华东对应上海星辰贸易，华南对应深圳海风科技；已配置地区成功后更新记录并显示“刚刚”，其它输入显示“没有配置本地演示样例”空态且不显示同步时间，这不代表真实客户为零。加载时输入仍可编辑，但不会改变本次请求；内容持续挂载，禁止重复提交，卸载时清理计时器。

Spin 只提供加载指示和区域 `aria-busy` 语义，不发起请求、不管理地区筛选、不生成数据，也不负责失败恢复；这些行为由演示宿主实现。

### 自定义指示器

显式 indicator 替换默认单弧。系统 reduced motion 会停止局部图形动画，停止/恢复按钮仍反馈真实 spinning 状态。

<code src="../../../../docs/demos/feedback-spin-indicator.tsx" defaultShowCode></code>

## API

`SpinProps = Omit<AntSpinProps, 'fullscreen' | 'percent'>`；TypeScript 和运行时均排除这两项。

| 属性                      | 类型                            | 默认值    | 说明                                                |
| ------------------------- | ------------------------------- | --------- | --------------------------------------------------- |
| spinning                  | boolean                         | true      | 宿主提供的加载事实                                  |
| delay                     | number                          | 300       | 延迟视觉显示的毫秒数；0 立即显示                    |
| size                      | 'small' \| 'default' \| 'large' | default   | 默认 indicator 为16/24/36px；自定义图形负责自身尺寸 |
| tip                       | ReactNode                       | —         | 区域加载文字；standalone 不展示 tip                 |
| indicator                 | ReactElement&lt;HTMLElement&gt; | lx 单弧   | 显式值优先；不调用全局 setDefaultIndicator          |
| children                  | ReactNode                       | —         | 存在时使用原生 nested 模式并持续挂载                |
| className / rootClassName | string                          | —         | 归原生指示器根节点                                  |
| wrapperClassName          | string                          | —         | 归原生 nested 区域根节点                            |
| style                     | CSSProperties                   | —         | 原生指示器样式                                      |
| prefixCls                 | string                          | AntD 配置 | 自定义前缀；局部动效降级不依赖固定 ant 前缀         |

### 状态与 Ref

无新增 ref 或事件 API。`spinning` 是受控加载事实，不存在 `defaultSpinning`；修改它不会触发业务事件。

## 主题、键盘与性能

每个示例可切明暗、密度和外观；默认颜色和几何来自 lx token。Spin 无键盘交互，不增加 tab stop，也不移动焦点。

`children` 始终挂载，可保留输入状态，但仍会产生子树渲染成本。系统启用 reduced motion 时，局部样式停止 Spin、SVG、伪元素、自定义指示器与 `children` 的动画和过渡；需要持续运动的宿主内容应放在加载区外。

## AntD 兼容与边界

兼容 AntD `>=5.24 <6`，透传表中列出的公开属性，不增加外层布局 `div`。`delay` 默认 300ms，只延迟视觉指示器；区域模式的原生 nested 根立即按 `spinning` 设置 `aria-busy`，并持续挂载 `children`。无 `children` 的 standalone 仅是视觉指示器，保留 AntD 原生的延迟 `aria-busy` 语义，延迟期间为 `false`，不代表业务区域。区域模式不默认使用 `role="status"`，以免重复播报业务内容；需要播报时，宿主应提供独立短状态文本。

默认指示器是本地单弧，small/default/large 为 16/24/36px，尺寸读取 `--lx-spin-size-*`，旋转读取 `--lx-motion-spin-duration`（800ms linear）。显式 `indicator` 优先且由调用方负责尺寸，`size` 仍传给 AntD 容器；显式 `delay` 覆盖默认值，`0` 表示立即显示。局部默认指示器优先于宿主 ConfigProvider 的 `spin.indicator` 和 AntD 全局默认；要使用宿主图形，须显式传入 `indicator`。组件不调用 `setDefaultIndicator`，不会修改其它 Spin 实例。

Spin 不发起、取消或重试请求，不计时，不自动禁用控件或设置 `inert`；这些策略由宿主负责。SSR 不依赖浏览器定时器；局部 reduced-motion 样式不依赖固定 `prefixCls`。lx-ui 首版不支持 `fullscreen` 或 `percent`：TypeScript 会拒绝，运行时也会剥离。
