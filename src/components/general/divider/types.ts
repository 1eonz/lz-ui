import type { HTMLAttributes, ReactNode } from 'react';

/** 区域之间的语义分隔线；带标题的水平分隔线具有可访问名称。 */
export interface DividerProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /** 默认为水平分隔线；垂直分隔线使用 span separator。 */
  type?: 'horizontal' | 'vertical';
  /** 边框样式；token 颜色仍由主题管理。 */
  variant?: 'solid' | 'dashed' | 'dotted';
  /** 水平分隔线可见标题的位置。 */
  orientation?: 'left' | 'center' | 'right';
  /** 减弱标题强调，但保留 separator 角色。 */
  plain?: boolean;
}
