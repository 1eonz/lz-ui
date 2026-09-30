import { Empty as AntEmpty } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { EmptyProps } from './types';

/**
 * Neutral, recoverable empty state for data regions. The host owns the action and
 * data lifecycle; this component only provides consistent layout and token styling.
 */
export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty(
  { action, children, className, rootClassName, variant = 'default', ...props },
  ref,
) {
  // AntD Empty has no ref contract. The wrapper provides a stable public root
  // without coupling consumers to AntD's internal markup.
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
