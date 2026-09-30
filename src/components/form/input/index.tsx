import { Input as AntInput } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { InputProps, InputRef, TextAreaProps, TextAreaRef } from './types';

/**
 * 单行文本输入，转发 AntD 公开 value/onChange/id 契约。
 * 放入 FormItem 或提供关联的外部 label；placeholder 不能替代可访问名称。
 * 尺寸由公开主题 token 与 AntD 的显式/继承 size 共同决定，
 * 避免 CSS 最小高度抹平宿主 ConfigProvider 的 small/large；不重复绘制焦点外框。
 */
export const Input = forwardRef<InputRef, InputProps>(function Input({ className, ...props }, ref) {
  return (
    <AntInput {...props} ref={ref} className={[styles.root, className].filter(Boolean).join(' ')} />
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
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
});

export type { InputProps, InputRef, TextAreaProps, TextAreaRef } from './types';
