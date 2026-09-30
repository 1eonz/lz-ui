import { Empty as AntEmpty } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { EmptyProps } from './types';

/**
 * 数据区域的中性、可恢复空状态。宿主负责操作和数据生命周期，
 * 组件只提供一致布局和 token 样式。
 */
export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty(
  { action, children, className, rootClassName, variant = 'default', ...props },
  ref,
) {
  // AntD Empty 没有 ref 契约；包装层提供稳定公开根节点，避免宿主
  // 依赖 AntD 内部结构。
  const semanticStyles = {
    description: { color: 'var(--lx-color-text-secondary)' },
    footer: { marginBlockStart: 'var(--lx-space-md)' },
    ...props.styles,
  };
  return (
    <div
      ref={ref}
      className={[
        styles.root,
        variant === 'small' ? styles.small : undefined,
        rootClassName,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-lx-empty-variant={variant}
    >
      <AntEmpty {...props} styles={semanticStyles}>
        {action ?? children}
      </AntEmpty>
    </div>
  );
});

export type { EmptyProps } from './types';
