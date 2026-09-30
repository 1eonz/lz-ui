import type { EmptyProps as AntEmptyProps } from 'antd';
import type { ReactNode } from 'react';

/**
 * 空状态属性，保留 Ant Design 公开 image 和 description 插槽；
 * action 为常见恢复/创建操作提供显式底部插槽。
 */
export interface EmptyProps extends AntEmptyProps {
  /** description 下方渲染的主要恢复或创建操作。 */
  action?: ReactNode;
  /** 嵌入表格/列表区域的紧凑展示。 */
  variant?: 'default' | 'small';
}
