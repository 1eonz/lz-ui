import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

/** 命名间距 token 或显式非负像素值。 */
export type SpaceSize = 'small' | 'middle' | 'large' | number;
/** flex gap 基础布局；子节点外边距和业务布局由调用者负责。 */
export interface SpaceProps extends HTMLAttributes<HTMLDivElement> {
  /** 单一间距或[水平,垂直]间距；默认 small。 */
  size?: SpaceSize | readonly [SpaceSize, SpaceSize];
  /** 垂直排列子节点，同时保留配置间距。 */
  direction?: 'horizontal' | 'vertical';
  /** flex 交叉轴对齐方式。 */
  align?: CSSProperties['alignItems'];
  /** 允许换行；split 分隔符与后一个子节点保持一组。 */
  wrap?: boolean;
  /** 子节点间插入的视觉分隔符，使用 aria-hidden。 */
  split?: ReactNode;
  /** 使根节点占满容器宽度。 */
  block?: boolean;
}
