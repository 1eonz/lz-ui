import { Button as AntButton } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { ButtonProps, ButtonRef } from './types';

/**
 * 使用主题 token 的 AntD 操作按钮，保留原生键盘、禁用和 loading 行为。
 * 纯图标操作需要调用方提供可访问名称。AntD 默认在两个中文字之间插入间隔；
 * 此处默认关闭以保持朗读名称稳定，调用方仍可通过 autoInsertSpace 开启。
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
