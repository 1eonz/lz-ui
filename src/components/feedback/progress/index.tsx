import { Progress as AntProgress } from 'antd';
import { forwardRef } from 'react';
import type { ProgressProps, ProgressRef } from './types';
import styles from './index.module.css';

/** Clamp finite percentages; a non-finite amount cannot describe completed work. */
function normalizePercent(value: number | undefined): number {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value ?? 0)) : 0;
}

/**
 * Determinate progress display backed by AntD >=5.24.
 *
 * `active` is only a visual animation, never an unknown amount of work. The
 * host owns live announcements and requests. Normalized total percent remains
 * the accessible amount even when AntD derives a different success segment;
 * overriding the public ARIA attribute preserves fractions and total meaning.
 * Host format content and AntD's native div ref remain unchanged.
 */
export const Progress = forwardRef<ProgressRef, ProgressProps>(function Progress(
  { className, percent, success, successPercent, ...props },
  ref,
) {
  return (
    <AntProgress
      {...props}
      percent={normalizePercent(percent)}
      success={
        success && {
          ...success,
          ...(success.percent !== undefined && { percent: normalizePercent(success.percent) }),
          ...(success.progress !== undefined && { progress: normalizePercent(success.progress) }),
        }
      }
      {...(successPercent !== undefined && { successPercent: normalizePercent(successPercent) })}
      aria-valuenow={normalizePercent(percent)}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
});

export type { ProgressProps, ProgressRef } from './types';
