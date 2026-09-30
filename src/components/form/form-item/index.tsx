import { Form } from 'antd';
import styles from './index.module.css';
import type { FormItemProps } from './types';

/**
 * Label, description and validation boundary for one AntD form control.
 * AntD owns field registration and error announcement. Keep the input as the
 * direct child so controlled props and the generated id reach it unchanged.
 * Nested wrappers need to forward those props themselves; this component does
 * not inspect or repair a custom child's implementation.
 */
export function FormItem({ className, ...props }: FormItemProps) {
  return <Form.Item {...props} className={[styles.root, className].filter(Boolean).join(' ')} />;
}

export type { FormItemProps } from './types';
