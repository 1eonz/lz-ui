import { InputNumber as AntInputNumber } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { InputNumberProps, InputNumberRef } from './types';

/**
 * Numeric input with AntD parsing and keyboard stepping. Pass `stringMode`
 * when decimal precision exceeds JavaScript's safe numeric range.
 */
export const InputNumber = forwardRef<InputNumberRef, InputNumberProps>(function InputNumber(
  { className, ...props },
  ref,
) {
  return (
    <AntInputNumber
      {...props}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
});

export type { InputNumberProps, InputNumberRef } from './types';
