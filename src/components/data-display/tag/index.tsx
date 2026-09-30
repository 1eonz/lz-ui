import { Tag as AntTag } from 'antd';
import { forwardRef } from 'react';
import type { CheckableTagProps, TagProps } from './types';
import styles from './index.module.css';
/** 紧凑分类标签；关闭行为由 AntD 和宿主控制，相邻间距由外部容器提供。 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { closeIcon, closable, ...props },
  ref,
) {
  // 通过公开 closeIcon 提供原生键盘按钮，AntD 合并自身关闭回调，
  // 无需复制关闭状态机。Tag 未消费 AntD 返回的关闭禁用值，因此默认按钮
  // 显式应用 closable.disabled；自定义节点的键盘、名称和禁用由宿主负责。
  const accessibleCloseIcon = (
    <button
      type="button"
      aria-label="关闭标签"
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
