import { Descriptions as AntDescriptions } from 'antd';
import { forwardRef } from 'react';
import type { DescriptionsProps } from './types';
import styles from './index.module.css';
/**
 * 只读记录摘要；通过 AntD 公开 label/content 样式槽实现标签和值的层次。
 * 宿主槽样式最后合并，可调整 padding/背景；不强制 column 或 layout，
 * 多列、竖排和响应式行为仍由宿主明确选择。ref 指向 lx-ui 摘要容器。
 */
export const Descriptions = forwardRef<HTMLDivElement, DescriptionsProps>(
  function Descriptions(props, ref) {
    const { className, styles: semanticStyles, ...descriptionProps } = props;
    return (
      <div ref={ref} className={[styles.root, className].filter(Boolean).join(' ')}>
        <AntDescriptions
          {...descriptionProps}
          className={className}
          styles={{
            ...semanticStyles,
            label: {
              padding: 'var(--lx-space-sm) var(--lx-space-md)',
              background: 'var(--lx-color-ambient)',
              fontWeight: 600,
              ...semanticStyles?.label,
            },
            content: {
              padding: 'var(--lx-space-sm) var(--lx-space-md)',
              overflowWrap: 'anywhere',
              ...semanticStyles?.content,
            },
          }}
        />
      </div>
    );
  },
);
export type { DescriptionsProps } from './types';
