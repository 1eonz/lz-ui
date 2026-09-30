import { Checkbox as AntCheckbox } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { CheckboxProps, CheckboxRef } from './types';

/**
 * Boolean choice with AntD's native input, indeterminate state, and keyboard
 * behavior. The wrapper passes FormItem's checked/onChange/id contract directly
 * to AntD; supply visible children or an associated external label.
 */
export const Checkbox = forwardRef<CheckboxRef, CheckboxProps>(function Checkbox(
  { className, ...props },
  ref,
) {
  return (
    <AntCheckbox
      {...props}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
});

export type { CheckboxProps, CheckboxRef } from './types';
