import type { SpinProps as AntSpinProps } from 'antd';

/**
 * lx-ui 支持的 AntD 5 Spin 公开属性。
 *
 * fullscreen 和 percent 明确排除：本组件仅负责行内/区域加载，不实现
 * 全屏遮罩和伪进度。请求、重试、禁用和焦点策略由宿主业务页面拥有。
 *
 * delay 默认300ms，传0立即显示。默认单弧尺寸为16/24/36px；显式 indicator
 * 替换图形并负责自身几何，size 仍传至原生容器。局部公开 indicator 始终
 * 优先于 ConfigProvider spin.indicator 和既有 AntD 全局默认；要采用宿主
 * 图形需显式传入，组件从不调用 setDefaultIndicator。nested 持续挂载且根
 * 立即 busy；standalone busy 遵循原生延迟视觉状态。reduced motion 停止
 * 局部根的动画/过渡，包括自定义图形和 children，宿主运动内容应置于区域外。
 */
export type SpinProps = Omit<AntSpinProps, 'fullscreen' | 'percent'>;
