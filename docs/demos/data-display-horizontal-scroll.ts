import type { KeyboardEvent } from 'react';

/**
 * 为文档示例的具名横向滚动区域提供一致的方向键行为。
 *
 * 只处理滚动区域自身获得焦点的情况，区域里的按钮、输入框和 Tree
 * 仍由各自组件处理方向键。滚动位置确实改变时才阻止浏览器默认行为，
 * 这样到达左右边界后仍保留宿主页面的自然键盘导航。
 */
export function handleHorizontalScrollKeyDown(event: KeyboardEvent<HTMLElement>): void {
  if (
    event.target !== event.currentTarget ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  ) {
    return;
  }

  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
    return;
  }

  const previousScrollLeft = event.currentTarget.scrollLeft;
  event.currentTarget.scrollLeft += event.key === 'ArrowRight' ? 80 : -80;
  if (event.currentTarget.scrollLeft !== previousScrollLeft) {
    event.preventDefault();
  }
}
