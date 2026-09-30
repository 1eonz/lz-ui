import { Select as AntSelect } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { SelectProps, SelectRef } from './types';

/**
 * 使用 token 尺寸的 AntD 选择器。AntD 保留键盘导航、搜索和虚拟选项，
 * 调用者负责远程加载、取消和重试。基础控件因此可直接使用本地选项，
 * 不绑定请求协议；代价是组合层需要自行接入异步数据。
 */
export const Select = forwardRef<SelectRef, SelectProps>(function Select(
  { className, ...props },
  ref,
) {
  return (
    <AntSelect
      {...props}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
});

export type { SelectProps, SelectRef } from './types';
