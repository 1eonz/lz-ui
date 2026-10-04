import type { ForwardedRef, MutableRefObject } from 'react';

type RefCleanup = () => void;
type RefCallbackWithCleanup<T> = (instance: T | null) => void | RefCleanup;

/**
 * 合并 Tooltip 内部 ref 与宿主 ref，并兼容 React 18、19 共用的 null detach 通知。
 * 外层 callback 始终返回 void，避免 React 18 将宿主返回的 cleanup 误判为无效返回值；宿主 cleanup
 * 会暂存到本次挂载的闭包里，并在 detach 时只执行一次。没有 cleanup 时才向宿主转发 null。
 */
export function createMergedRef<T>(
  innerRef: MutableRefObject<T | null>,
  forwardedRef: ForwardedRef<T>,
): (instance: T | null) => void {
  let attachedInstance: T | null = null;
  let hostCleanup: RefCleanup | undefined;

  return (instance) => {
    if (instance === null) {
      const detachedInstance = attachedInstance;
      const cleanup = hostCleanup;
      attachedInstance = null;
      hostCleanup = undefined;

      if (innerRef.current === detachedInstance) innerRef.current = null;
      if (typeof forwardedRef === 'function') {
        if (cleanup) cleanup();
        else forwardedRef(null);
      } else if (forwardedRef?.current === detachedInstance) {
        forwardedRef.current = null;
      }
      return;
    }

    innerRef.current = instance;
    attachedInstance = instance;
    if (typeof forwardedRef === 'function') {
      // React 18 的类型尚未包含 callback ref cleanup；运行时仍需保留 React 19 返回的函数。
      const callbackRef = forwardedRef as unknown as RefCallbackWithCleanup<T>;
      const result = callbackRef(instance);
      hostCleanup = typeof result === 'function' ? result : undefined;
    } else if (forwardedRef) forwardedRef.current = instance;
  };
}
