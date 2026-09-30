import { Select as AntSelect } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { SelectProps, SelectRef } from './types';

/**
 * AntD select with token sizing. AntD keeps keyboard navigation, search and
 * virtualized options; callers own remote loading, cancellation and retry.
 * This keeps the primitive usable with local options without binding it to a
 * request protocol, at the cost of wiring async data at the composition layer.
 */
export const Select = forwardRef<SelectRef, SelectProps>(function Select(
  { className, ...props },
  ref,
) {
  return (
    <AntSelect
      {...props}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
});

export type { SelectProps, SelectRef } from './types';
