import type { SkeletonProps as AntSkeletonProps } from 'antd';
import type { HTMLAttributes } from 'react';

/** AntD 5 skeleton contract plus accessible region metadata. */
export type SkeletonProps = Omit<AntSkeletonProps, 'aria-busy' | 'aria-label'> &
  Pick<HTMLAttributes<HTMLDivElement>, 'aria-busy' | 'aria-label' | 'aria-describedby' | 'role'>;
