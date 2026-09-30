import { Alert as AntAlert } from 'antd';
import { forwardRef } from 'react';
import type { AlertProps, AlertRef } from './types';
import styles from './index.module.css';

/**
 * Inline feedback message backed by Ant Design 5 Alert.
 *
 * All lifecycle, focus restoration and announcement policy stays with the host.
 * The ref follows AntD's public AlertRef contract and no wrapper or tab stop is
 * added, so the component can be placed in existing flex/grid layouts safely.
 * `onClose` reports user intent; `afterClose` reports AntD's native animation
 * completion and is not guaranteed when motion is disabled. Required host
 * cleanup/focus recovery should use onClose or the host's controlled lifecycle.
 */
export const Alert = forwardRef<AlertRef, AlertProps>(function Alert(
  { className, type, banner, ...props },
  ref,
) {
  const status = type ?? (banner ? 'warning' : 'info');
  return (
    <AntAlert
      {...props}
      type={type}
      banner={banner}
      ref={ref}
      className={[styles.root, styles[status], className].filter(Boolean).join(' ')}
    />
  );
});

export type { AlertProps, AlertRef } from './types';
