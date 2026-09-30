import type { AnchorHTMLAttributes, CSSProperties, HTMLAttributes, ReactNode } from 'react';

/** 语义前景角色；Link 默认使用品牌色，显式角色保留对应状态颜色。 */
export type TypographyType = 'default' | 'secondary' | 'success' | 'warning' | 'danger';
/** Clipboard 自定义配置；富文本子节点需要显式 text，避免 DOM 文字提取歧义。 */
export interface CopyableOptions {
  /** 写入剪贴板的准确纯文本；默认从字符串或数字子节点获取。 */
  text?: string;
  /** Clipboard 写入成功后调用；宿主回调抛出的异常单独报告。 */
  onCopy?: (text: string) => void;
}
/** 语义文字元素共用的视觉与行为选项。 */
export interface TypographyBaseProps {
  children?: ReactNode;
  /** 语义前景颜色；默认使用普通内容颜色。 */
  type?: TypographyType;
  /** 强调文字，但不改变其语义元素。 */
  strong?: boolean;
  /** 标记内容不可用；链接同时移除 href 与键盘焦点。 */
  disabled?: boolean;
  code?: boolean;
  mark?: boolean;
  delete?: boolean;
  underline?: boolean;
  /** 仅截断文字内容，复制操作与状态反馈仍可访问。 */
  ellipsis?: boolean | { rows: number };
  /** 添加独立复制操作；Clipboard API 错误会被播报，便于重试。 */
  copyable?: boolean | CopyableOptions;
  className?: string;
  style?: CSSProperties;
}

/** 行内 span 属性；原生 span 属性转发至根元素。 */
export type TextProps = TypographyBaseProps &
  Omit<HTMLAttributes<HTMLSpanElement>, keyof TypographyBaseProps>;
/** 段落属性；原生 paragraph 属性转发至根元素。 */
export type ParagraphProps = TypographyBaseProps &
  Omit<HTMLAttributes<HTMLParagraphElement>, keyof TypographyBaseProps>;
/** 标题属性；level 默认为 h1，调用方应按文档层级选择。 */
export type TitleProps = TypographyBaseProps &
  Omit<HTMLAttributes<HTMLHeadingElement>, keyof TypographyBaseProps> & {
    level?: 1 | 2 | 3 | 4 | 5;
  };
/** 链接保留 anchor 导航语义，不包含复制操作，以避免交互元素嵌套。 */
export type LinkProps = Omit<TypographyBaseProps, 'copyable'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof TypographyBaseProps>;
