import { forwardRef, useId } from 'react';
import styles from './index.module.css';
import type { DividerProps } from './types';

/** Empty horizontal dividers use native hr; labelled dividers expose separator semantics. */
export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
  {
    children,
    type = 'horizontal',
    variant = 'solid',
    orientation = 'center',
    plain = false,
    className,
    ...props
  },
  ref,
) {
  const generatedLabelId = `lx-divider-${useId().replace(/:/g, '')}`;
  const hasExplicitName =
    props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined;
  const classes = [
    styles.root,
    type === 'vertical' ? styles.vertical : styles.horizontal,
    styles[variant],
    children == null && styles.noLabel,
    styles[orientation],
    plain && styles.plain,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  if (type === 'vertical') {
    return (
      <span {...props} ref={ref} role="separator" aria-orientation="vertical" className={classes} />
    );
  }
  if (children == null)
    return <hr {...props} ref={ref as React.Ref<HTMLHRElement>} className={classes} />;
  return (
    <div
      {...props}
      ref={ref as React.Ref<HTMLDivElement>}
      role="separator"
      aria-orientation="horizontal"
      aria-labelledby={!hasExplicitName ? generatedLabelId : undefined}
      className={classes}
    >
      <span id={!hasExplicitName ? generatedLabelId : undefined} className={styles.label}>
        {children}
      </span>
    </div>
  );
});

export type { DividerProps } from './types';
