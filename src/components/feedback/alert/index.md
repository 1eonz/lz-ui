# Alert

用于页面内提示和可恢复错误。需打断用户的确认流程应使用弹层；临时全局通知不属于 Alert。

## 使用方法

```tsx
import { Alert } from 'lx-ui';

<Alert type="success" showIcon role="status" message="客户已保存" />;
```

## 代码演示

### 四种语义状态

信息、成功、警告和错误由图标与文字共同表达。静态提示使用 note，动态结果可由宿主选择 status。

<code src="../../../../docs/demos/feedback-alert-basic.tsx" title="基础语义状态" defaultShowCode></code>

### 描述与顶部提示

description 补充恢复步骤；banner 未传 type 时默认为 warning。长文案应在窄屏自然换行。

<code src="../../../../docs/demos/feedback-alert-description.tsx" title="描述与 Banner" defaultShowCode></code>

### 关闭、恢复与真实操作

重试会更新结果并展示同步范围；关闭后焦点回到始终可用的恢复按钮，重新显示创建新实例。

<code src="../../../../docs/demos/feedback-alert-interaction.tsx" title="关闭与恢复" defaultShowCode></code>

## API

`AlertProps` 保留 AntD 公共类型，以下为常用项；其余字段遵循 AntD >=5.24 的公开 API。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| message | ReactNode | — | 主提示文本 |
| description | ReactNode | — | 详细说明和恢复步骤 |
| type | 'info' \| 'success' \| 'warning' \| 'error' | info；banner 时 warning | 语义类型 |
| showIcon | boolean | false；banner 时 true | 显示语义图标 |
| banner | boolean | false | 顶部提示样式 |
| closable | boolean \| 公开关闭配置对象 | false | 允许关闭，可配置关闭图标和 aria 属性 |
| action | ReactNode | — | 宿主提供真实操作控件 |
| role | string | alert（AntD 默认） | 静态 note、普通更新 status、紧急新错误 alert，由宿主选择 |
| className / rootClassName | string | — | 归原生 Alert 根节点 |
| style | CSSProperties | — | 根样式覆盖 |
| onClose | MouseEventHandler&lt;HTMLButtonElement&gt; | — | 用户发起关闭时触发，接收点击事件 |
| afterClose | () =&gt; void | — | 原生退出动画结束通知，motion off 时不保证触发 |

### Ref 与事件

```tsx
import { createRef } from 'react';
import { Alert } from 'lx-ui';
import type { AlertRef } from 'lx-ui';

const alertRef = createRef<AlertRef>();
<Alert ref={alertRef} message="校验结果" />;
// 挂载后 alertRef.current?.nativeElement 可读；卸载后 current 为 null。
```

无受控 visible API：使用宿主条件渲染管理显隐。onClose 与 afterClose 是不同阶段，不在程序化替换或卸载时模拟点击事件。不要提前在 onClose 卸载组件而期待 afterClose 继续触发。

## 主题、键盘与性能

每个示例有真实明暗、密度和外观控件。Tab 可到 action/关闭按钮，Enter/Space 执行动作；提示根没有额外 tabIndex。必需的焦点恢复用 onClose 或宿主生命周期处理。reduced motion 下保持语义和文字反馈，停止退出过渡；真实浏览器视觉验证尚未完成。

仅渲染消息，不发起请求、不保留缓存、不创建 portal。长文案应拆成主提示和 description；密集列表中不要为每行同时建立紧急 live region。

## 边界说明

用于页面内的成功、信息、警告和错误提示。组件直接透传 Ant Design 5 的公开属性；`closable`、`action`、`onClose` 和 `afterClose` 的生命周期由宿主决定。

`role`、文案和焦点恢复也是宿主责任：普通更新可使用 `status`，需要立即处理的新错误才使用 `alert`。组件不会默认增加 `tabIndex`，关闭按钮和 action 中的真实控件保持原生键盘行为。ref 为 AntD 公开的 `AlertRef`，没有额外 DOM wrapper。

`onClose` 表示用户发起关闭，`afterClose` 是原生退出动画完成通知；宿主关闭 motion 或浏览器不支持动画事件时，AntD 不保证调用 afterClose，因此必要的焦点恢复不应只依赖它。演示在 onClose 聚焦稳定按钮，正常 afterClose 后卸载；重新显示会以新 key 挂载，兼容 reduced motion 下的恢复。

组件不发起请求、不管理重试、不创建全局消息，也不替宿主恢复关闭后的焦点。兼容基线为 AntD `>=5.24 <6`。语义背景/边框使用 `--lx-color-{info,success,warning,error}(-bg)`，圆角使用 `--lx-radius-panel`，退出使用 `--lx-motion-alert-exit-duration`（160ms ease-out）。banner 未显式提供 type 时保持 warning 默认。宿主 style 可以覆盖根样式。
