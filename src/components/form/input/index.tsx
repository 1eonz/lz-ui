import { CloseCircleFilled } from '@ant-design/icons';
import { Input as AntInput } from 'antd';
import { forwardRef, type ReactNode } from 'react';
import styles from './index.module.css';
import type { InputProps, InputRef, TextAreaProps, TextAreaRef } from './types';

/**
 * 通过 AntD 公开的 clearIcon 插槽标记清除图标，避免选择 rc-input 的内部 DOM。
 * 包裹宿主自定义图标后仍保留其名称和视觉内容；默认图标使用 AntD 公共图标包。
 */
function withClearTouchTarget(allowClear: InputProps['allowClear']): InputProps['allowClear'] {
  if (!allowClear) {
    return allowClear;
  }

  const clearIcon: ReactNode =
    typeof allowClear === 'object' && allowClear.clearIcon ? (
      allowClear.clearIcon
    ) : (
      <CloseCircleFilled aria-hidden="true" />
    );

  return {
    ...(typeof allowClear === 'object' ? allowClear : {}),
    clearIcon: <span className={styles.clearMarker}>{clearIcon}</span>,
  };
}

/**
 * 单行文本输入，转发 AntD 公开 value/onChange/id 契约。
 * 放入 FormItem 或提供关联的外部 label；placeholder 不能替代可访问名称。
 * 尺寸由公开主题 token 与 AntD 的显式/继承 size 共同决定，
 * 避免 CSS 最小高度抹平宿主 ConfigProvider 的 small/large；不重复绘制焦点外框。
 */
export const Input = forwardRef<InputRef, InputProps>(function Input({ className, ...props }, ref) {
  return (
    <AntInput
      {...props}
      allowClear={withClearTouchTarget(props.allowClear)}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
});

/**
 * 多行文本输入，与 Input 共用 token 和 FormItem 受控协议，
 * 避免 DynamicForm 维护另一套样式入口。自动高度应设置最大行数，
 * 防止长备注把后续操作推离视口；ref 保留 AntD 公开聚焦方法。
 */
export const TextArea = forwardRef<TextAreaRef, TextAreaProps>(function TextArea(
  { className, ...props },
  ref,
) {
  return (
    <AntInput.TextArea
      {...props}
      allowClear={withClearTouchTarget(props.allowClear)}
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
});

export type { InputProps, InputRef, TextAreaProps, TextAreaRef } from './types';
