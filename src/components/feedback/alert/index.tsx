import { Alert as AntAlert } from 'antd';
import { forwardRef } from 'react';
import type { AlertProps, AlertRef } from './types';
import styles from './index.module.css';

/**
 * 基于 Ant Design 5 Alert 的页面内反馈消息。
 *
 * 生命周期、焦点恢复和播报策略由宿主管理。ref 遵循公开 AlertRef 契约，
 * 不添加布局包装或 Tab 停靠点，可用于已有 flex/grid 布局。
 * onClose 报告用户关闭意图；afterClose 报告原生动画完成，禁用动效时
 * 不保证触发。必要清理和焦点恢复应使用 onClose 或宿主受控生命周期。
 */
export const Alert = forwardRef<AlertRef, AlertProps>(function Alert(
  { className, type, banner, ...props },
  ref,
) {
  const status = type ?? (banner ? 'warning' : 'info');
  return (
    <AntAlert
      {...props}
      type={type}
      banner={banner}
      ref={ref}
      className={[styles.root, styles[status], className].filter(Boolean).join(' ')}
    />
  );
});

export type { AlertProps, AlertRef } from './types';
