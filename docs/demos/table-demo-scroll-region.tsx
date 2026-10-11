import type { ReactNode } from 'react';
import styles from './data-display-demo.module.css';
import { handleHorizontalScrollKeyDown } from './data-display-horizontal-scroll';

/**
 * 两个表格示例共用的命名滚动区；只属于文档，不改变基础 Table 的布局契约。
 * 子表格需保留自身最小列宽且不启用固定列，让这里承担唯一的横向滚动。
 * 左右箭头只在区域自身聚焦时尝试横向滚动；仅滚动位置改变时取消默认行为，边界和子控件仍保留原有行为。
 */
export function TableDemoScrollRegion({
  children,
  label,
  descriptionId,
}: {
  children: ReactNode;
  label: string;
  descriptionId?: string;
}) {
  return (
    <div
      className={styles.scroll}
      role="region"
      aria-label={label}
      aria-describedby={descriptionId}
      tabIndex={0}
      onKeyDown={handleHorizontalScrollKeyDown}
    >
      {children}
    </div>
  );
}
