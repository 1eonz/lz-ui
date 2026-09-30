import { Button as AntButton } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { ButtonProps, ButtonRef } from './types';

/**
 * Token-styled AntD action. Keeps AntD's native keyboard, disabled and loading
 * behavior; callers should supply an accessible name for icon-only actions.
 * AntD inserts a visual gap into two-character Chinese labels by default;
 * disabling that default preserves a stable spoken name. Callers can opt in.
 */
export const Button = forwardRef<ButtonRef, ButtonProps>(function Button(
  { className, htmlType = 'button', autoInsertSpace = false, ...props },
  ref,
) {
  return (
    <AntButton
      {...props}
      htmlType={htmlType}
      autoInsertSpace={autoInsertSpace}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
});

export type { ButtonProps, ButtonRef } from './types';
