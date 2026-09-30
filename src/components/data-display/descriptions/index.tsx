import { Descriptions as AntDescriptions } from 'antd';
import { forwardRef } from 'react';
import type { DescriptionsProps } from './types';
import styles from './index.module.css';
/** Read-only label/value list for record summaries. */
export const Descriptions = forwardRef<HTMLDivElement, DescriptionsProps>(
  function Descriptions(props, ref) {
    const { className, ...descriptionProps } = props;
    return (
      <div ref={ref} className={[styles.root, className].filter(Boolean).join(' ')}>
        <AntDescriptions {...descriptionProps} className={className} />
      </div>
    );
  },
);
export type { DescriptionsProps } from './types';
