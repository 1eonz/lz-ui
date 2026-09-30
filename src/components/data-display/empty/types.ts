import type { EmptyProps as AntEmptyProps } from 'antd';
import type { ReactNode } from 'react';

/**
 * Empty state props. Ant Design's public image and description slots are preserved;
 * `action` provides an explicit footer slot for the common recovery/create action.
 */
export interface EmptyProps extends AntEmptyProps {
  /** Primary recovery or create action rendered below the description. */
  action?: ReactNode;
  /** Compact presentation for embedded table/list regions. */
  variant?: 'default' | 'small';
}
