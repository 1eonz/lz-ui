import { Spin as AntSpin } from 'antd';
import type { SpinProps as AntSpinProps } from 'antd';
import type { SpinProps } from './types';
import styles from './index.module.css';

/** Consume AntD's cloned indicator props without leaking percent to native DOM. */
function DefaultIndicator({
  className,
  size,
}: {
  className?: string;
  size: NonNullable<SpinProps['size']>;
}) {
  return (
    <span
      aria-hidden="true"
      className={[styles.arc, styles[size], className].filter(Boolean).join(' ')}
    />
  );
}

/**
 * Loading indicator for an inline or content region.
 *
 * Children remain mounted in region mode. Its native nested root reflects the
 * requested `spinning` immediately; the default 300ms delay only affects paint.
 * Without children, AntD owns its indicator root's delayed aria-busy semantics:
 * it is a visual indicator rather than a business content region.
 * The region is deliberately not `role=status`; hosts can add a short,
 * separate live status when a screen-reader announcement is appropriate.
 * No request, retry, inert, fullscreen or pseudo-progress behavior is added.
 */
export function Spin(input: SpinProps) {
  // Runtime stripping protects JavaScript/spread callers too. The internal
  // public AntD shape is used only to remove unsupported keys before forwarding.
  const {
    fullscreen: _fullscreen,
    percent: _percent,
    className,
    wrapperClassName,
    spinning = true,
    delay = 300,
    size = 'default',
    indicator,
    children,
    ...props
  } = input as AntSpinProps;
  const nested = children !== undefined;
  return (
    <AntSpin
      {...props}
      {...(nested && { 'aria-busy': spinning })}
      spinning={spinning}
      delay={delay}
      size={size}
      indicator={indicator ?? <DefaultIndicator size={size} />}
      className={[styles.root, className].filter(Boolean).join(' ')}
      wrapperClassName={[styles.region, wrapperClassName].filter(Boolean).join(' ')}
    >
      {children}
    </AntSpin>
  );
}

export type { SpinProps } from './types';
