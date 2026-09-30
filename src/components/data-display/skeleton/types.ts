import type { SkeletonProps as AntSkeletonProps } from 'antd';
import type { HTMLAttributes } from 'react';

/** AntD 5 骨架契约，补充可访问区域元数据。 */
export type SkeletonProps = Omit<AntSkeletonProps, 'aria-busy' | 'aria-label'> &
  Pick<HTMLAttributes<HTMLDivElement>, 'aria-busy' | 'aria-label' | 'aria-describedby' | 'role'>;
