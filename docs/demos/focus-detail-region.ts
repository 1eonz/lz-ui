type BoundsElement = Pick<Element, 'getBoundingClientRect'>;

/**
 * 将详情标题、首组内容和关闭操作放入当前视口，再聚焦标题。
 *
 * 详情常位于长表格下方；仅调用 heading.focus() 会让浏览器自行决定滚动位置，
 * 可能将关闭操作或首组内容留在视口外。滚动面板本身也会应用避让文档吸顶栏的 scroll-margin。
 */
export function focusDetailRegion(
  panel: HTMLElement | null,
  heading: HTMLElement | null,
  firstGroup: BoundsElement | null,
  closeAction: BoundsElement | null,
): void {
  if (!panel || !heading) return;

  const scrollMargin =
    Number.parseFloat(window.getComputedStyle(panel).scrollMarginBlockStart) || 0;
  const headingBounds = heading.getBoundingClientRect();
  const closeBounds = closeAction?.getBoundingClientRect();
  const firstGroupBounds = firstGroup?.getBoundingClientRect();
  const viewportHeight = document.documentElement.clientHeight;
  const needsScroll =
    headingBounds.top < scrollMargin ||
    (closeBounds !== undefined && closeBounds.bottom > viewportHeight) ||
    (firstGroupBounds !== undefined && firstGroupBounds.bottom > viewportHeight);

  if (needsScroll) panel.scrollIntoView({ block: 'start', behavior: 'instant' });
  heading.focus({ preventScroll: true });
}
