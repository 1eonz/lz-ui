import { Upload as AntUpload } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { LxUploadProps, LxUploadRef } from './types';

/** File picker that keeps selection local by default; network transport is host-owned. */
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
