import { Tag as AntTag } from 'antd';
import { forwardRef } from 'react';
import type { CheckableTagProps, TagProps } from './types';
import styles from './index.module.css';
/** 紧凑分类标签；关闭行为由 AntD 和宿主控制，相邻间距由外部容器提供。 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { closeIcon, closable, ...props },
  ref,
) {
  const closeLabel =
    typeof closable === 'object' && closable !== null
      ? (closable['aria-label'] ?? '关闭标签')
      : '关闭标签';
  // AntD 的 locale 读取 hook 与 ConfigContext 不属于公开契约，不能依赖其内部实现。
  // lx-ui 默认提供中文关闭名称；其他语言由宿主通过 closable['aria-label'] 显式设置。
  // 单实例显式启用关闭时注入原生按钮，并让 AntD 继续管理关闭回调和状态，避免复制其关闭状态机。
  // 实例 aria-label 优先；默认按钮会优先于 ConfigProvider 的全局 closeIcon；
  // 需要自定义图标时由当前实例显式传入 closeIcon 或 closable.closeIcon。默认按钮自行应用 closable.disabled；
  // 自定义节点的键盘、名称和禁用语义由宿主负责。
  const accessibleCloseIcon = (
    <button
      type="button"
      aria-label={closeLabel}
      className={styles.close}
      disabled={typeof closable === 'object' && closable.disabled}
    >
      <span className={styles.cross} aria-hidden="true" />
    </button>
  );
  return (
    <AntTag
      {...props}
      closable={closable}
      closeIcon={closeIcon !== undefined ? closeIcon : closable ? accessibleCloseIcon : undefined}
      ref={ref}
      className={[styles.root, props.className].filter(Boolean).join(' ')}
    />
  );
});

/**
 * 可通过键盘操作的筛选标签，按下状态完全受控。
 * 原生按钮负责 Enter、Space 和禁用语义，避免另建键盘事件管线。
 * 宿主 onClick 可通过 preventDefault 取消切换请求；默认 type=button，
 * 防止在表单里意外提交。需要提交行为时由宿主显式覆盖 type。
 */
export const CheckableTag = forwardRef<HTMLButtonElement, CheckableTagProps>(function CheckableTag(
  { checked, onChange, onClick, className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={[styles.checkable, checked && styles.checked, className].filter(Boolean).join(' ')}
      aria-pressed={checked}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onChange?.(!checked);
      }}
    />
  );
});
export type { CheckableTagProps, TagProps } from './types';
