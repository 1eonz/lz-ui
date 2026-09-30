import { InputNumber as AntInputNumber } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { InputNumberProps, InputNumberRef } from './types';

/**
 * 提供 AntD 数值解析和键盘步进的数值输入控件；小数精度超过
 * JavaScript 安全数值范围时，应传入 stringMode。
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
