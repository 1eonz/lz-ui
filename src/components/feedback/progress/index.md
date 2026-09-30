# Progress

用于已知总量的任务比例。宿主计算完成比例，组件不生成请求或伪进度；未知比例使用 Spin。

## 使用方法

```tsx
import { Progress } from 'lx-ui';

<Progress percent={62.5} status="active" aria-label="客户导入进度" />;
```

## 代码演示

### 线形与状态

normal、active、exception、success 与 small 尺寸。active 是确定比例的扫光，不是未知进度。

<code src="../../../../docs/demos/feedback-progress-basic.tsx" title="线形状态" defaultShowCode></code>

### 圆形、仪表盘与分步

circle/dashboard 用于紧凑概览，steps 表达已完成批次。成功分段为总进度中的独立数据，不替代总量。

<code src="../../../../docs/demos/feedback-progress-shapes.tsx" title="进度形态" defaultShowCode></code>

### 受控比例、失败恢复与数值规范

增加/减少真实更新比例；模拟失败会保留进度，恢复后继续。下方可切换负值、62.5、越界、NaN 与 Infinity，观察 format 的规范输入；总 80/成功 30 的 aria-valuenow 仍为80。

<code src="../../../../docs/demos/feedback-progress-controlled.tsx" title="受控与边界" defaultShowCode></code>

## API

`ProgressProps` 保留 AntD 公共类型，以下为常用项；其余字段遵循 AntD >=5.24 的公开 API。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| percent | number | 0 | 总比例；有限 clamp 到0–100，非有限归0，小数不舍入 |
| type | 'line' \| 'circle' \| 'dashboard' | line | 展示形态 |
| status | 'normal' \| 'active' \| 'exception' \| 'success' | normal；100时自动success | 状态；active仅视觉动效 |
| format | (percent?: number, successPercent?: number) =&gt; ReactNode | 百分比或原生状态图标 | 接收规范数值，返回内容保留 |
| success | { percent?: number; strokeColor?: string; progress?: number } | — | 成功分段，使用同样数值规范；progress为废弃兼容字段 |
| successPercent | number | — | 废弃，改用success.percent；仍按有限0–100规范 |
| showInfo | boolean | true | 是否显示格式化文本/状态图标，不影响aria值 |
| size | AntD ProgressProps['size'] | default | preset、数值或公开尺寸配置；circle/dashboard用数值或preset |
| steps | number \| { count: number; gap: number } | — | 分步展示，适用形态遵循AntD |
| strokeColor | AntD ProgressProps['strokeColor'] | 主题primary | 单色、分段色或公开渐变配置 |
| trailColor | string | 主题remaining | 未完成轨道颜色 |
| aria-label / aria-labelledby | string | — | 由宿主命名任务 |
| className / rootClassName / style | string / string / CSSProperties | — | 原生根节点样式 |

### Ref 与受控更新

```tsx
import { createRef } from 'react';
import { Progress } from 'lx-ui';
import type { ProgressRef } from 'lx-ui';

const progressRef = createRef<ProgressRef>();
<Progress ref={progressRef} percent={80} aria-label="导入进度" />;
// ProgressRef 为原生HTMLDivElement；挂载后可用，卸载后current为null。
```

没有 onChange/defaultPercent，业务数据更新后重新传 percent 即可。format 是渲染函数，不应发起请求或修改状态；百分比可见内容与任务名称由宿主提供，组件不会添加 aria-live/aria-valuetext。

## 主题、键盘与性能

示例都有明暗、密度和外观控件。Progress 本身无可聚焦交互；操作按钮保持原生键盘行为。高频更新应按实际任务采样，避免每1%播报一次；失败恢复与取消由宿主提供。

reduced motion 在局部停止 line sweep、circle/dashboard SVG、steps 及 format 内动画/过渡/伪元素，保留数字与状态。轨道颜色通过 Provider 公共token；自定义颜色需自行验证对比度。未完成真实浏览器视觉门禁，不把类型/构建通过当成视觉GO。

## 边界说明

确定比例的任务进度，可使用 `line`、`circle` 或 `dashboard` 类型，并透传 `percent`、`status`、`format` 等 Ant Design 5 公开属性。`status="active"` 只表示视觉扫光，不表示未知进度；未知比例应使用 Spin。

组件不默认添加 `aria-live`，避免每个百分比变化都打断阅读。任务名称请由宿主通过 `aria-label`、`aria-labelledby` 或独立状态文本提供。总 `percent`、`success.percent`、已废弃的 `successPercent` 和 `success.progress` 都限制在 0–100；`NaN` 和正负 `Infinity` 归零，有限小数保持原精度。`format` 接收规范后的值，其返回的 React 内容完整保留；可访问值始终是总进度，例如总 80 / 成功 30 的 `aria-valuenow` 为 80。组件不发起请求、重试或生成伪进度。

当宿主启用 `prefers-reduced-motion: reduce` 时，组件会在自身样式作用域内关闭进度变化过渡以及 active 状态的扫光动画。该规则是视觉与可访问性契约，不要求业务代码依赖 AntD 的内部 DOM 结构。

兼容基线为 AntD `>=5.24 <6`。ref 为公开 `ProgressRef`（由 AntD 组件 ref 类型推导的原生 `HTMLDivElement`）；挂载后可用，卸载后归 null。`line`、`circle`、`dashboard`、`steps` 及 `format` 内的局部动画、SVG 过渡和伪元素都遵循 reduced motion；不影响区域外组件。主题颜色由 `LxConfigProvider` 的公开 AntD token 映射负责，不使用无效的 `--ant-*` 变量。
