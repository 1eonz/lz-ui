import { DatePicker as AntDatePicker } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { DatePickerProps, DatePickerRef, DateRangePickerProps } from './types';

/**
 * Single-date AntD picker. Keep Dayjs values at this boundary; callers can
 * format dates for their API after validation to avoid timezone ambiguity.
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

/** Range counterpart with the same token sizing and AntD keyboard behavior. */
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
