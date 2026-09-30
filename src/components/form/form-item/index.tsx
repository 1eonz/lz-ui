import { Form } from 'antd';
import styles from './index.module.css';
import type { FormItemProps } from './types';

/**
 * 单个 AntD 表单控件的标签、说明和校验边界。
 * AntD 负责字段注册和错误播报；输入控件应作为直接子节点，保证受控
 * 属性和生成的 id 原样到达控件。嵌套包装需自行转发这些属性；本组件
 * 不检查或修补自定义子组件实现。
 */
export function FormItem({ className, ...props }: FormItemProps) {
  return <Form.Item {...props} className={[styles.root, className].filter(Boolean).join(' ')} />;
}

export type { FormItemProps } from './types';
