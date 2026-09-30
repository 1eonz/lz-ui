import { DatePicker as AntDatePicker } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { DatePickerProps, DatePickerRef, DateRangePickerProps } from './types';

/**
 * AntD 单日期选择器；此边界保留 Dayjs 值，调用者可在校验后按其 API
 * 格式化日期，避免时区语义不明确。
 */
export const DatePicker = forwardRef<DatePickerRef, DatePickerProps>(function DatePicker(
  { className, ...props },
  ref,
) {
  return (
    <AntDatePicker
      {...props}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
});

/** 范围日期版本，保持相同 token 尺寸和 AntD 键盘行为。 */
export const DateRangePicker = forwardRef<DatePickerRef, DateRangePickerProps>(
  function DateRangePicker({ className, ...props }, ref) {
    return (
      <AntDatePicker.RangePicker
        {...props}
        ref={ref}
        className={[styles.root, className].filter(Boolean).join(' ')}
      />
    );
  },
);

export type { DatePickerProps, DatePickerRef, DateRangePickerProps } from './types';
