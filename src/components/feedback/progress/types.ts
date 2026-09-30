import type { ProgressProps as AntProgressProps } from 'antd';
import type { Progress as AntProgress } from 'antd';
import type { ComponentRef } from 'react';

/**
 * Public AntD >=5.24 progress props for line, circle, dashboard and steps.
 * Total percent and success segments are clamped to [0,100]; NaN/Infinity become
 * zero. Format receives these normalized values and its returned content is
 * preserved. A success segment never replaces the total aria-valuenow.
 */
export type ProgressProps = AntProgressProps;

/** AntD's native div ref; available after mount and null after unmount. */
export type ProgressRef = ComponentRef<typeof AntProgress>;
