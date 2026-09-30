import { Checkbox as AntCheckbox } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { CheckboxProps, CheckboxRef } from './types';

/**
 * 使用 AntD 原生输入、半选状态和键盘行为的布尔选择控件。
 * 包装层将 FormItem 的 checked/onChange/id 契约直接传至 AntD；
 * 宿主应提供可见 children 或关联的外部 label。
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
