import { Skeleton as AntSkeleton } from 'antd';
import { forwardRef, useSyncExternalStore } from 'react';
import styles from './index.module.css';
import type { SkeletonProps } from './types';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

/** 订阅浏览器动效偏好，并兼容尚未实现标准事件接口的旧浏览器。 */
function subscribeToReducedMotion(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {};
  }

  const media = window.matchMedia(reducedMotionQuery);
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', onStoreChange);
    return () => media.removeEventListener('change', onStoreChange);
  }

  media.addListener?.(onStoreChange);
  return () => media.removeListener?.(onStoreChange);
}

function getReducedMotionSnapshot(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(reducedMotionQuery).matches
    : false;
}

function getServerReducedMotionSnapshot(): boolean {
  return false;
}

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
  // 客户端首个可用快照直接读取系统偏好，避免 effect 执行前先显示扫光；服务端始终返回稳定值以保持 hydration 一致。
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );

  return (
    <div
      ref={ref}
      className={[styles.root, rootClassName, className].filter(Boolean).join(' ')}
      aria-busy={loading || undefined}
      aria-label={loading ? ariaLabel : undefined}
      aria-describedby={loading ? ariaDescribedBy : undefined}
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
