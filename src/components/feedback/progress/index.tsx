import { Progress as AntProgress } from 'antd';
import { forwardRef } from 'react';
import type { ProgressProps, ProgressRef } from './types';
import styles from './index.module.css';

/** 有限比例限制在0–100；非有限数无法表示已完成工作，按0处理。 */
function normalizePercent(value: number | undefined): number {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value ?? 0)) : 0;
}

/**
 * 基于 AntD >=5.24 的确定比例进度展示。
 *
 * active 仅为视觉动效，不代表未知工作量；请求和实时播报由宿主管理。
 * 成功分段是总完成量的子集，不能超过规范后的总值。公开 ARIA 属性
 * 始终使用总值，避免 AntD 的成功分段计算覆盖小数精度和任务总量语义。
 * 宿主 format 返回内容和 AntD 原生 div ref 保持公开契约。
 */
export const Progress = forwardRef<ProgressRef, ProgressProps>(function Progress(
  { className, percent, success, successPercent, ...props },
  ref,
) {
  const total = normalizePercent(percent);
  const normalizeSegment = (value: number | undefined) => Math.min(total, normalizePercent(value));
  return (
    <AntProgress
      {...props}
      percent={total}
      success={
        success && {
          ...success,
          ...(success.percent !== undefined && { percent: normalizeSegment(success.percent) }),
          ...(success.progress !== undefined && { progress: normalizeSegment(success.progress) }),
        }
      }
      {...(successPercent !== undefined && { successPercent: normalizeSegment(successPercent) })}
      aria-valuenow={total}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
});

export type { ProgressProps, ProgressRef } from './types';
