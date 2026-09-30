import type { HTMLAttributes, ReactNode } from 'react';

/** Semantic rule between sections. Labelled horizontal rules expose an accessible name. */
export interface DividerProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  /** Horizontal rule by default; vertical uses a span separator. */
  type?: 'horizontal' | 'vertical';
  /** Border style; token colors remain theme-owned. */
  variant?: 'solid' | 'dashed' | 'dotted';
  /** Position of visible horizontal label. */
  orientation?: 'left' | 'center' | 'right';
  /** Reduces label emphasis while preserving the separator role. */
  plain?: boolean;
}
