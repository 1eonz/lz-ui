import { forwardRef } from 'react';
import styles from './index.module.css';
import type { IconProps } from './types';

/** 展示型图标；按钮或链接的交互语义由其父元素持有。 */
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
  // 空串和纯空白都不能遮住后续名称；宿主 aria-label 是最后一个公开回退来源。
  const accessibleName = [label, title, props['aria-label']].find((value) => value?.trim())?.trim();
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
