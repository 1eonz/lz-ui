import { forwardRef, useEffect, useRef, useState } from 'react';
import styles from './index.module.css';
import type { CSSProperties, ReactNode } from 'react';
import type {
  CopyableOptions,
  LinkProps,
  ParagraphProps,
  TextProps,
  TitleProps,
  TypographyBaseProps,
} from './types';

type StyledProps = Pick<
  TypographyBaseProps,
  | 'children'
  | 'type'
  | 'strong'
  | 'disabled'
  | 'code'
  | 'mark'
  | 'delete'
  | 'underline'
  | 'ellipsis'
  | 'copyable'
  | 'className'
  | 'style'
>;
type TextStyle = CSSProperties & { '--lx-ellipsis-rows'?: number };

function decorate(children: ReactNode, props: StyledProps): ReactNode {
  let content = children;
  if (props.code) content = <code className={styles.code}>{content}</code>;
  if (props.mark) content = <mark className={styles.mark}>{content}</mark>;
  if (props.delete) content = <del>{content}</del>;
  if (props.underline) content = <u>{content}</u>;
  if (props.strong) content = <strong>{content}</strong>;
  return content;
}

function useTypography(props: StyledProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [copyAnnouncement, setCopyAnnouncement] = useState(0);
  const requestId = useRef(0);
  const rows =
    typeof props.ellipsis === 'object' ? Math.max(1, Math.floor(props.ellipsis.rows)) : undefined;
  const className = [
    styles.root,
    styles[props.type ?? 'default'],
    props.disabled && styles.disabled,
    props.className,
  ]
    .filter(Boolean)
    .join(' ');
  const style: TextStyle = { ...props.style, '--lx-ellipsis-rows': rows };
  const copyOptions: CopyableOptions | undefined = props.copyable
    ? props.copyable === true
      ? {}
      : props.copyable
    : undefined;
  const copyEnabled = Boolean(copyOptions);
  const copyCallback = copyOptions?.onCopy;
  const text =
    copyOptions?.text ??
    (typeof props.children === 'string' || typeof props.children === 'number'
      ? String(props.children)
      : '');
  const copySource = useRef<{
    text: string;
    enabled: boolean;
    onCopy?: CopyableOptions['onCopy'];
  }>({ text, enabled: copyEnabled, onCopy: copyCallback });
  const sourceChanged =
    copySource.current.text !== text ||
    copySource.current.enabled !== copyEnabled ||
    copySource.current.onCopy !== copyCallback;
  if (sourceChanged) {
    // 在渲染阶段同步失效，避免旧异步结果在清理过期反馈的 effect 前返回并覆盖新内容。
    requestId.current += 1;
    copySource.current = { text, enabled: copyEnabled, onCopy: copyCallback };
  }
  // 来源变更同时清空可见反馈并使在途结果失效；Clipboard 写入本身无法取消。
  useEffect(() => {
    setCopyStatus('idle');
    setCopyAnnouncement(0);
  }, [text, copyEnabled, copyCallback]);
  useEffect(
    () => () => {
      requestId.current += 1;
    },
    [],
  );
  // 富文本子节点需要显式 text，DOM textContent 可能包含隐藏或无关界面内容。
  const copyButton =
    copyOptions && text ? (
      <button
        type="button"
        className={styles.copy}
        aria-label={copyStatus === 'copied' ? '已复制' : `复制${text}`}
        title={
          copyStatus === 'error' ? '复制失败，请重试' : copyStatus === 'copied' ? '已复制' : '复制'
        }
        disabled={props.disabled}
        onClick={async () => {
          const currentRequest = ++requestId.current;
          try {
            await navigator.clipboard.writeText(text);
          } catch {
            if (currentRequest === requestId.current) setCopyStatus('error');
            return;
          }
          if (currentRequest !== requestId.current) return;
          setCopyStatus('copied');
          setCopyAnnouncement((count) => count + 1);
          // 宿主回调异常独立报告，不能把已成功的 Clipboard 写入误报为失败或未处理拒绝。
          try {
            copyOptions.onCopy?.(text);
          } catch (error) {
            console.error('Typography copyable onCopy callback failed.', error);
          }
        }}
      >
        {copyStatus === 'copied' ? '已复制' : '复制'}
      </button>
    ) : null;
  const content = (
    <span className={props.ellipsis ? (rows ? styles.multiLine : styles.singleLine) : undefined}>
      {decorate(props.children, props)}
    </span>
  );
  return {
    className,
    style,
    content,
    copyButton,
    copyStatus,
    copyAnnouncement,
  };
}

/** 默认使用行内文字；下面的标题和链接仍保留对应原生语义。 */
export const Text = forwardRef<HTMLSpanElement, TextProps>(function Text(props, ref) {
  const {
    children,
    type,
    strong,
    disabled,
    code,
    mark,
    delete: deleted,
    underline,
    ellipsis,
    copyable,
    className,
    style,
    ...rest
  } = props;
  const view = useTypography({
    children,
    type,
    strong,
    disabled,
    code,
    mark,
    delete: deleted,
    underline,
    ellipsis,
    copyable,
    className,
    style,
  });
  return (
    <span
      {...rest}
      ref={ref}
      className={view.className}
      style={view.style}
      aria-disabled={disabled || undefined}
    >
      {view.content}
      {view.copyButton}
      <span className={styles.srOnly} role="status" aria-live="polite">
        {view.copyStatus === 'copied'
          ? `复制成功 ${view.copyAnnouncement}`
          : view.copyStatus === 'error'
            ? '复制失败'
            : ''}
      </span>
    </span>
  );
});

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  function Paragraph(props, ref) {
    const {
      children,
      type,
      strong,
      disabled,
      code,
      mark,
      delete: deleted,
      underline,
      ellipsis,
      copyable,
      className,
      style,
      ...rest
    } = props;
    const view = useTypography({
      children,
      type,
      strong,
      disabled,
      code,
      mark,
      delete: deleted,
      underline,
      ellipsis,
      copyable,
      className,
      style,
    });
    return (
      <p
        {...rest}
        ref={ref}
        className={[styles.paragraph, view.className].join(' ')}
        style={view.style}
        aria-disabled={disabled || undefined}
      >
        {view.content}
        {view.copyButton}
        <span className={styles.srOnly} role="status" aria-live="polite">
          {view.copyStatus === 'copied'
            ? `复制成功 ${view.copyAnnouncement}`
            : view.copyStatus === 'error'
              ? '复制失败'
              : ''}
        </span>
      </p>
    );
  },
);

export const Title = forwardRef<HTMLHeadingElement, TitleProps>(function Title(props, ref) {
  const {
    level = 1,
    children,
    type,
    strong,
    disabled,
    code,
    mark,
    delete: deleted,
    underline,
    ellipsis,
    copyable,
    className,
    style,
    ...rest
  } = props;
  const view = useTypography({
    children,
    type,
    strong,
    disabled,
    code,
    mark,
    delete: deleted,
    underline,
    ellipsis,
    copyable,
    className,
    style,
  });
  const Heading = `h${level}` as const;
  return (
    <Heading
      {...rest}
      ref={ref}
      className={[styles.heading, styles[`heading${level}`], view.className].join(' ')}
      style={view.style}
      aria-disabled={disabled || undefined}
    >
      {view.content}
      {view.copyButton}
      <span className={styles.srOnly} role="status" aria-live="polite">
        {view.copyStatus === 'copied'
          ? `复制成功 ${view.copyAnnouncement}`
          : view.copyStatus === 'error'
            ? '复制失败'
            : ''}
      </span>
    </Heading>
  );
});

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  const {
    children,
    type,
    strong,
    disabled,
    code,
    mark,
    delete: deleted,
    underline,
    ellipsis,
    className,
    style,
    href,
    onClick,
    tabIndex,
    ...rest
  } = props;
  const view = useTypography({
    children,
    type,
    strong,
    disabled,
    code,
    mark,
    delete: deleted,
    underline,
    ellipsis,
    className,
    style,
  });
  return (
    <a
      {...rest}
      ref={ref}
      href={disabled ? undefined : href}
      onClick={disabled ? undefined : onClick}
      tabIndex={disabled ? -1 : tabIndex}
      className={[styles.link, type && type !== 'default' && styles.linkSemantic, view.className]
        .filter(Boolean)
        .join(' ')}
      style={view.style}
      aria-disabled={disabled || undefined}
    >
      {view.content}
    </a>
  );
});

/** 命名空间沿用 AntD 熟悉的访问形式，同时保留可 tree-shake 的命名导出。 */
export const Typography = { Text, Title, Paragraph, Link } as const;
export type {
  CopyableOptions,
  LinkProps,
  ParagraphProps,
  TextProps,
  TitleProps,
  TypographyBaseProps,
  TypographyType,
} from './types';
