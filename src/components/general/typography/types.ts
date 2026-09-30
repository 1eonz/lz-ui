import type { AnchorHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from 'react';

/** Semantic foreground role; Link's default uses the brand color while explicit roles keep their status color. */
export type TypographyType = 'default' | 'secondary' | 'success' | 'warning' | 'danger';
/** Clipboard customization. Rich children need explicit text because DOM text extraction is ambiguous. */
export interface CopyableOptions {
  /** Exact plain text written to the clipboard; defaults to string/number children. */
  text?: string;
  /** Called after a successful clipboard write; thrown consumer errors are reported separately. */
  onCopy?: (text: string) => void;
}
/** Shared visual and behavioral options for semantic typography elements. */
export interface TypographyBaseProps {
  children?: ReactNode;
  /** Semantic foreground color; defaults to the normal content color. */
  type?: TypographyType;
  /** Emphasizes text without changing its semantic element. */
  strong?: boolean;
  /** Marks content as unavailable; links also lose href and keyboard focus. */
  disabled?: boolean;
  code?: boolean;
  mark?: boolean;
  delete?: boolean;
  underline?: boolean;
  /** Clips only the text content, leaving copy actions and status feedback available. */
  ellipsis?: boolean | { rows: number };
  /** Adds a separate clipboard action. Clipboard API errors are announced for retry. */
  copyable?: boolean | CopyableOptions;
  className?: string;
  style?: CSSProperties;
}

/** Props for an inline span; native span attributes are forwarded to the root element. */
export type TextProps = TypographyBaseProps &
  Omit<HTMLAttributes<HTMLSpanElement>, keyof TypographyBaseProps>;
/** Props for block prose; native paragraph attributes are forwarded to the root element. */
export type ParagraphProps = TypographyBaseProps &
  Omit<HTMLAttributes<HTMLParagraphElement>, keyof TypographyBaseProps>;
/** Props for a heading. Level defaults to h1; select levels to preserve document hierarchy. */
export type TitleProps = TypographyBaseProps &
  Omit<HTMLAttributes<HTMLHeadingElement>, keyof TypographyBaseProps> & {
    level?: 1 | 2 | 3 | 4 | 5;
  };
/** Links retain anchor navigation semantics and omit copy controls to avoid nested interactive elements. */
export type LinkProps = Omit<TypographyBaseProps, 'copyable'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof TypographyBaseProps>;
