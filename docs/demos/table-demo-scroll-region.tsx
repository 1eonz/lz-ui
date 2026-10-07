import type { KeyboardEvent, ReactNode } from 'react';
import styles from './data-display-demo.module.css';

/**
 * 两个表格示例共用的命名滚动区；只属于文档，不改变基础 Table 的布局契约。
 * 子表格需保留自身最小列宽且不启用固定列，让这里承担唯一的横向滚动。
 * 左右箭头只在区域自身聚焦时生效，不截获单元格控件的键盘操作。
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
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // 修饰键组合保留浏览器导航和宿主快捷键，不拦截 Alt+方向键等系统行为。
    if (
      event.target !== event.currentTarget ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.currentTarget.scrollLeft += event.key === 'ArrowRight' ? 80 : -80;
      event.preventDefault();
    }
  }

  return (
    <div
      className={styles.scroll}
      role="region"
      aria-label={label}
      aria-describedby={descriptionId}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
