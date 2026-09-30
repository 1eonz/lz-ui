import { Children, forwardRef, Fragment, isValidElement } from 'react';
import styles from './index.module.css';
import type { SpaceProps, SpaceSize } from './types';

const sizeTokens: Record<Exclude<SpaceSize, number>, string> = {
  small: 'var(--lx-space-sm)',
  middle: 'var(--lx-space-lg)',
  large: 'var(--lx-space-xl)',
};
const resolveSize = (size: SpaceSize) =>
  typeof size === 'number' ? `${Math.max(0, size)}px` : sizeTokens[size];

/** Native flex gap avoids per-child margins and remains stable when children change. */
export const Space = forwardRef<HTMLDivElement, SpaceProps>(function Space(
  {
    children,
    size = 'small',
    direction = 'horizontal',
    align,
    wrap = false,
    split,
    block = false,
    className,
    style,
    ...props
  },
  ref,
) {
  const [horizontal, vertical] = Array.isArray(size) ? size : [size, size];
  const items = Children.toArray(children).filter(
    (child) =>
      child !== null &&
      child !== undefined &&
      (isValidElement(child) || typeof child !== 'boolean'),
  );
  return (
    <div
      {...props}
      ref={ref}
      className={[
        styles.root,
        direction === 'vertical' && styles.vertical,
        block && styles.block,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        columnGap: resolveSize(horizontal as SpaceSize),
        rowGap: resolveSize(vertical as SpaceSize),
        alignItems: align,
        flexWrap: wrap ? 'wrap' : undefined,
        ...style,
      }}
    >
      {items.map((child, index) => {
        const renderedChild = (
          <Fragment key={isValidElement(child) ? (child.key ?? index) : index}>{child}</Fragment>
        );
        if (index === 0 || split === undefined) return renderedChild;
        // With wrapping, keep each separator attached to the item it divides
        // so a line break cannot leave a dangling separator at the row end.
        return wrap ? (
          <span
            className={styles.splitGroup}
            key={`split-${isValidElement(child) ? (child.key ?? index) : index}`}
            style={
              direction === 'vertical'
                ? {
                    flexDirection: 'column',
                    rowGap: resolveSize(vertical as SpaceSize),
                  }
                : { columnGap: resolveSize(horizontal as SpaceSize) }
            }
          >
            <span className={styles.split} aria-hidden="true">
              {split}
            </span>
            {renderedChild}
          </span>
        ) : (
          <Fragment key={`split-${isValidElement(child) ? (child.key ?? index) : index}`}>
            <span className={styles.split} aria-hidden="true">
              {split}
            </span>
            {renderedChild}
          </Fragment>
        );
      })}
    </div>
  );
});

export type { SpaceProps, SpaceSize } from './types';
