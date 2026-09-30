import { Switch as AntSwitch } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { SwitchProps, SwitchRef } from './types';

/**
 * Immediate on/off control using AntD's button semantics and loading state.
 * The wrapper preserves checked/onChange/id for FormItem; callers own async
 * persistence and must reconcile a failed request with the visible state.
 */
export const Switch = forwardRef<SwitchRef, SwitchProps>(function Switch(
  { className, ...props },
  ref,
) {
  return (
    <AntSwitch
      {...props}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
});

export type { SwitchProps, SwitchRef } from './types';
