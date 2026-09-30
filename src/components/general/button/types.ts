import type { ButtonProps as AntButtonProps } from 'antd';

/**
 * AntD's public button contract remains available so host applications can use
 * native button, link, icon, danger, loading and grouping behavior unchanged.
 */
export type ButtonProps = AntButtonProps;

/** A button ref can target an anchor when `href` is provided. */
export type ButtonRef = HTMLButtonElement | HTMLAnchorElement;
