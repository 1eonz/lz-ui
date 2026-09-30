import { Result as AntResult } from 'antd';
import { forwardRef } from 'react';
import type { ResultProps } from './types';
import styles from './index.module.css';
/** Semantic outcome panel for completed, failed, or informational workflows. */
export const Result = forwardRef<HTMLDivElement, ResultProps>(function Result(props, ref) {
  const { className, ...resultProps } = props;
  return (
    <div ref={ref} className={[styles.root, className].filter(Boolean).join(' ')}>
      <AntResult {...resultProps} className={className} />
    </div>
  );
});
export type { ResultProps } from './types';
