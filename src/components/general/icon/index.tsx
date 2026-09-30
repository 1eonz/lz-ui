import { forwardRef } from 'react';
import styles from './index.module.css';
import type { IconProps } from './types';

/** Presentational icon; any button or link semantics belong to its interactive parent. */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(function Icon(
  {
    component: Component,
    label,
    title,
    spin = false,
    rotate,
    size,
    color,
    className,
    style,
    ...props
  },
  ref,
) {
  const accessibleName = label ?? title;
  return (
    <span
      {...props}
      ref={ref}
      role={accessibleName ? 'img' : undefined}
      aria-label={accessibleName}
      aria-hidden={accessibleName ? undefined : true}
      title={title}
      className={[styles.root, spin && styles.spin, className].filter(Boolean).join(' ')}
      style={{ ...style, fontSize: size ?? style?.fontSize, color: color ?? style?.color }}
    >
      <Component
        aria-hidden={true}
        className={styles.svg}
        style={rotate === undefined ? undefined : { transform: `rotate(${rotate}deg)` }}
      />
    </span>
  );
});

export type { IconComponent, IconProps } from './types';
