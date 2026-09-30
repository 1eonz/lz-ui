import { Switch as AntSwitch } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { SwitchProps, SwitchRef } from './types';

/**
 * 使用 AntD 按钮语义和加载状态的即时开关控件。
 * 包装层为 FormItem 保留 checked/onChange/id；异步持久化由调用者
 * 负责，请求失败时也由调用者协调可见状态与实际结果。
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
