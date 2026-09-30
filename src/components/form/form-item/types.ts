import type { FormItemProps as AntFormItemProps } from 'antd';

/**
 * AntD Form.Item 契约；直接子节点必须将注入的 value、onChange 和 id
 * 转发至实际控件，校验和标签关联才能正确工作。
 */
export type FormItemProps = AntFormItemProps;
