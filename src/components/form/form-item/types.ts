import type { FormItemProps as AntFormItemProps } from 'antd';

/**
 * AntD Form.Item contract. Its direct child must forward injected `value`,
 * `onChange` and `id` to the actual control for validation and labels to work.
 */
export type FormItemProps = AntFormItemProps;
