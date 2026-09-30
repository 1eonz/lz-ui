import { Upload as AntUpload } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { LxUploadProps, LxUploadRef } from './types';

/** 默认仅保留本地文件选择；网络传输由宿主负责。 */
export const Upload = forwardRef<LxUploadRef, LxUploadProps>(function Upload(
  { className, beforeUpload, ...props },
  ref,
) {
  const localOnly = !props.action && !props.customRequest;
  return (
    <AntUpload
      {...props}
      ref={ref}
      beforeUpload={beforeUpload ?? (localOnly ? () => false : undefined)}
      className={[styles.root, className].filter(Boolean).join(' ')}
    />
  );
});

export type { LxUploadProps as UploadProps, LxUploadRef as UploadRef } from './types';
