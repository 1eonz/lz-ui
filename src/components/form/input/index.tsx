import { Input as AntInput } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { InputProps, InputRef, TextAreaProps, TextAreaRef } from './types';

/**
 * Single-line input that forwards AntD's public value/onChange/id contract.
 * Put it inside FormItem or supply an associated external label; a placeholder
 * is never used as the accessible name.
 */
export const Input = forwardRef<InputRef, InputProps>(function Input({ className, ...props }, ref) {
  return (
    <AntInput {...props} ref={ref} className={[styles.root, className].filter(Boolean).join(' ')} />
  );
});

/**
 * Multiline companion to Input. It shares tokens and the FormItem control
 * contract, so DynamicForm does not need a separate AntD styling path.
 */
export const TextArea = forwardRef<TextAreaRef, TextAreaProps>(function TextArea(
  { className, ...props },
  ref,
) {
  return (
    <AntInput.TextArea
      {...props}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
});

export type { InputProps, InputRef, TextAreaProps, TextAreaRef } from './types';
