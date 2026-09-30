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

/** Keep SSR renders warning-free while retaining layout timing in the browser. */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Ant Design 5 pagination adapter for list and table navigation.
 *
 * The adapter deliberately forwards every public AntD prop. It does not infer
 * `total`, clamp an out-of-range page, issue requests, or synchronize URLs;
 * those policies belong to the host application. `ref` resolves to AntD's
 * rendered `<ul>` root, while `className` remains on that same root. AntD 5
 * does not expose an official Pagination ref API, so this adapter resolves the
 * public `<ul>` through a generated marker class after commit. Multiple
 * independent React roots must use distinct `identifierPrefix` values so
 * React's generated marker ids cannot collide.
 */
export const Pagination = forwardRef<PaginationRef, PaginationProps>(function Pagination(
  { className, onChange, ...props },
  ref,
) {
  // Encode each UTF-16 unit so identifierPrefix may include spaces/punctuation
  // without creating extra class tokens or requiring CSS selector escaping.
  const id = useId();
  const markerClass = `lx-pagination-${Array.from(id, (part) =>
    part.codePointAt(0)?.toString(16),
  ).join('-')}`;
  const [, refreshAttachment] = useReducer((revision: number) => revision + 1, 0);
  const handleChange = useCallback<NonNullable<PaginationProps['onChange']>>(
    (page, pageSize) => {
      // In uncontrolled mode, AntD's internal page-size change can remove its
      // own root without rendering this adapter. A lightweight host commit
      // synchronizes the ref; AntD retains ownership of current/pageSize.
      // Dispatch first so a throwing host handler cannot skip synchronization.
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
    // AntD can remove/recreate its root when hideOnSinglePage changes. Inspect
    // after each host commit, but notify refs only when their identity or node
    // changes; notifying an unchanged callback on every render can cause loops.
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
