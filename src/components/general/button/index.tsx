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
  { className, htmlType = 'button', autoInsertSpace = false, size, style, ...props },
  ref,
) {
  const resolvedSize = size ?? 'middle';
  const resolvedHeight =
    size === undefined
      ? 'var(--lx-control-height, 40px)'
      : size === 'middle'
        ? 'var(--lx-button-middle-height, 32px)'
        : undefined;
  // 显式 height 完全控制默认补值；自定义 minHeight 只覆盖对应字段。
  const defaultHeightStyles =
    resolvedHeight && style?.height === undefined
      ? {
          height: resolvedHeight,
          ...(style?.minHeight === undefined ? { minHeight: resolvedHeight } : {}),
        }
      : undefined;
  return (
    <AntButton
      {...props}
      size={resolvedSize}
      htmlType={htmlType}
      autoInsertSpace={autoInsertSpace}
      ref={ref}
      style={{
        ...style,
        ...defaultHeightStyles,
      }}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
});

export type { ButtonProps, ButtonRef } from './types';
