import { Result as AntResult } from 'antd';
import { forwardRef } from 'react';
import type { ResultProps } from './types';
import styles from './index.module.css';
/** 用于已完成、失败或信息类流程的语义结果面板。 */
export const Result = forwardRef<HTMLDivElement, ResultProps>(function Result(props, ref) {
  const { className, ...resultProps } = props;
  const status = String(resultProps.status ?? '');
  const ExceptionIllustration =
    status === '403'
      ? AntResult.PRESENTED_IMAGE_403
      : status === '404'
        ? AntResult.PRESENTED_IMAGE_404
        : status === '500'
          ? AntResult.PRESENTED_IMAGE_500
          : undefined;
  const resultContent = ExceptionIllustration
    ? {
        ...resultProps,
        status: 'info' as const,
        icon:
          resultProps.icon === undefined ? (
            <div className={styles.exceptionIllustration} data-lx-result-illustration={status}>
              <ExceptionIllustration />
            </div>
          ) : (
            resultProps.icon
          ),
      }
    : resultProps;
  return (
    <div ref={ref} className={[styles.root, className].filter(Boolean).join(' ')}>
      <AntResult
        {...resultContent}
        className={[styles.resultRoot, className].filter(Boolean).join(' ')}
      />
    </div>
  );
});
export type { ResultProps } from './types';
