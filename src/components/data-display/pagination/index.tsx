import { Pagination as AntPagination } from 'antd';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useReducer,
  useRef,
} from 'react';
import type { PaginationProps, PaginationRef } from './types';
import styles from './index.module.css';

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

/** 服务端使用普通 effect，避免 SSR 警告；浏览器在绘制前同步实际根节点。 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * 列表与表格分页的 AntD 适配层，保留公开参数与事件契约。
 * 不推算 total、不修正超界页码、不请求数据或同步 URL，这些策略由宿主负责。
 * AntD 没有公开 Pagination ref，适配层在提交后通过独立标记定位实际 ul，
 * className 也落在该节点。代价是每次适配层提交进行一次类名查找，
 * 不采用观察器或私有 DOM 层级；非受控分页事件触发轻量提交以同步隐藏后的 ref。
 * 多个独立 React 根必须使用不同 identifierPrefix，防止跨根标记碰撞。
 */
export const Pagination = forwardRef<PaginationRef, PaginationProps>(function Pagination(
  { className, onChange, ...props },
  ref,
) {
  // 对 Unicode 码点编码，允许 identifierPrefix 含空格和标点，
  // 不会形成额外 class token，也无需对 CSS 选择器进行转义。
  const id = useId();
  const markerClass = `lx-pagination-${Array.from(id, (part) =>
    part.codePointAt(0)?.toString(16),
  ).join('-')}`;
  const [, refreshAttachment] = useReducer((revision: number) => revision + 1, 0);
  const handleChange = useCallback<NonNullable<PaginationProps['onChange']>>(
    (page, pageSize) => {
      // 非受控页大小变化可能只更新 AntD 内部并移除 ul，不重新渲染适配层。
      // 轻量提交负责同步 ref，页码/页大小仍由 AntD 持有；先 dispatch，
      // 避免宿主回调抛错后遗漏同步，且不增加回调次数或改变参数。
      refreshAttachment();
      onChange?.(page, pageSize);
    },
    [onChange],
  );
  const attachment = useRef<{
    ref: React.ForwardedRef<PaginationRef>;
    node: PaginationRef | null;
  }>({ ref: null, node: null });

  useIsomorphicLayoutEffect(() => {
    // hideOnSinglePage 可移除并重建根节点。每次提交检查，仅在 ref 或节点
    // 改变时通知，避免稳定 callback ref 每次触发引起宿主更新循环。
    const candidate = document.getElementsByClassName(markerClass).item(0);
    const node = candidate instanceof HTMLUListElement ? candidate : null;
    const previous = attachment.current;
    if (previous.ref === ref && previous.node === node) return;
    if (previous.node) assignRef(previous.ref, null);
    attachment.current = { ref, node };
    if (node) assignRef(ref, node);
  });

  useIsomorphicLayoutEffect(
    () => () => {
      const previous = attachment.current;
      attachment.current = { ref: null, node: null };
      if (previous.node) assignRef(previous.ref, null);
    },
    [],
  );

  return (
    <AntPagination
      {...props}
      onChange={handleChange}
      className={[styles.root, markerClass, className].filter(Boolean).join(' ')}
    />
  );
});

export type { PaginationProps, PaginationRef } from './types';
