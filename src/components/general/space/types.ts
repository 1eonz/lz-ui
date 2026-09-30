import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

/** Named spacing token or an explicit non-negative pixel value. */
export type SpaceSize = 'small' | 'middle' | 'large' | number;
/** Flex gap layout primitive; child margins and business layout remain caller-owned. */
export interface SpaceProps extends HTMLAttributes<HTMLDivElement> {
  /** One gap or [horizontal, vertical] gaps. Defaults to small. */
  size?: SpaceSize | readonly [SpaceSize, SpaceSize];
  /** Stacks children vertically while retaining the configured gap. */
  direction?: 'horizontal' | 'vertical';
  /** Cross-axis flex alignment. */
  align?: CSSProperties['alignItems'];
  /** Enables wrapping; split separators stay with the following child. */
  wrap?: boolean;
  /** Visual, aria-hidden separator inserted between children. */
  split?: ReactNode;
  /** Makes the root fill its container width. */
  block?: boolean;
}
