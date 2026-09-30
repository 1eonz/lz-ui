import type { AriaAttributes, ComponentType, CSSProperties, HTMLAttributes } from 'react';

/** 最小图标来源协议兼容 SVG 与 AntD 基于 span 的图标组件。 */
export type IconComponent = ComponentType<{
  className?: string;
  style?: CSSProperties;
  'aria-hidden'?: AriaAttributes['aria-hidden'];
}>;

/** 图标来源由宿主注入，导入 Icon 不会引入完整图标集合。 */
export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  component: IconComponent;
  label?: string;
  spin?: boolean;
  rotate?: number;
  size?: number | string;
  color?: CSSProperties['color'];
}
