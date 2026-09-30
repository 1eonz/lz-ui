import type { SpinProps as AntSpinProps } from 'antd';

/**
 * Public AntD 5 Spin props supported by lx-ui.
 *
 * `fullscreen` and `percent` are intentionally excluded from the public
 * contract: lx-ui Spin is an inline/region loading primitive and does not
 * implement full-screen overlays or pseudo-progress semantics. Request,
 * retry, disabled and focus policies remain owned by the host application.
 *
 * Delay defaults to 300ms; pass zero for immediate paint. Default size maps to
 * the authored 16/24/36px single arc. Explicit indicator replaces that arc and
 * owns its geometry; size continues to reach AntD's native container. Because
 * a public indicator is always supplied locally, ConfigProvider spin.indicator
 * and AntD's preexisting global default do not override lx-ui's default. Pass
 * that indicator explicitly to opt in; lx-ui never calls setDefaultIndicator.
 * Nested children stay mounted and their native root is busy immediately;
 * standalone busy follows AntD's delayed visual state. Reduced motion stops
 * animations/transitions inside the local root, including custom indicators
 * and nested content; host animations should live outside this loading region.
 */
export type SpinProps = Omit<AntSpinProps, 'fullscreen' | 'percent'>;
