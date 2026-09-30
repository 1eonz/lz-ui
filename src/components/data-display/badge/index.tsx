import { Badge as AntBadge } from 'antd';
import { forwardRef } from 'react';
import type { BadgeProps } from './types';
import styles from './index.module.css';
/** Notification count/status marker with stable token-backed presentation. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(props, ref) {
  return (
    <AntBadge
      {...props}
      ref={ref}
      className={[styles.root, props.className].filter(Boolean).join(' ')}
    />
  );
});
export type { BadgeProps } from './types';
