import { Card as AntCard } from 'antd';
import { forwardRef } from 'react';
import type { CardProps } from './types';
import styles from './index.module.css';
/**
 * 带标题和操作区的内容容器，沿用 AntD 的加载、标签页和语义样式槽。
 * AntD >=5.24 已公开实际 div 的 ref，因此无需额外布局包装层。
 * 局部类名只作用于当前卡片，避免祖先选择器覆盖嵌套卡片。
 * 宿主的 style 和语义槽覆盖具有优先权；切换 appearance 只改变
 * 面板材质，不重新挂载内容，保留表单草稿和内部组件状态。
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(props, ref) {
  const { className, ...cardProps } = props;
  return (
    <AntCard
      {...cardProps}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
});
export type { CardProps } from './types';
