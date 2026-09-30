import { Skeleton as AntSkeleton } from 'antd';
import { forwardRef, useEffect, useState } from 'react';
import styles from './index.module.css';
import type { SkeletonProps } from './types';

/**
 * 为加载内容保留布局的占位。loading 为 false 时 AntD 渲染 children，
 * 调用者应保持相同的外部尺寸。
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  {
    className,
    rootClassName,
    loading = true,
    role = 'status',
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    children,
    ...props
  },
  ref,
) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);

  return (
    <div
      ref={ref}
      className={[styles.root, rootClassName, className].filter(Boolean).join(' ')}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      role={loading ? role : undefined}
    >
      {loading ? (
        <AntSkeleton {...props} active={props.active && !reducedMotion} loading />
      ) : (
        children
      )}
    </div>
  );
});

export type { SkeletonProps } from './types';
