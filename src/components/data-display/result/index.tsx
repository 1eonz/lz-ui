import { Result as AntResult } from 'antd';
import { forwardRef } from 'react';
import type { ResultProps } from './types';
import styles from './index.module.css';
/** 用于已完成、失败或信息类流程的语义结果面板。 */
export const Result = forwardRef<HTMLDivElement, ResultProps>(function Result(props, ref) {
  const { className, ...resultProps } = props;
  return (
    <div ref={ref} className={[styles.root, className].filter(Boolean).join(' ')}>
      <AntResult {...resultProps} className={className} />
    </div>
  );
});
export type { ResultProps } from './types';
