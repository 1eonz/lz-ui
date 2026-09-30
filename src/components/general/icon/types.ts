import type { AriaAttributes, ComponentType, CSSProperties, HTMLAttributes } from 'react';

/** The minimal source contract accepts SVGs and AntD's span-based icon components. */
export type IconComponent = ComponentType<{
  className?: string;
  style?: CSSProperties;
  'aria-hidden'?: AriaAttributes['aria-hidden'];
}>;

/** The icon source is injected so importing Icon never pulls in a complete icon registry. */
export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
  component: IconComponent;
  label?: string;
  spin?: boolean;
  rotate?: number;
  size?: number | string;
  color?: CSSProperties['color'];
}
