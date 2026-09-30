import type { Alert, AlertProps as AntAlertProps } from 'antd';
import type { ComponentRef, ForwardRefExoticComponent, RefAttributes } from 'react';

/** Public AntD 5 alert props, including host-owned close and action semantics. */
export type AlertProps = AntAlertProps;

/** The ref exposed by AntD 5 Alert (an object with the native element). */
export type AlertRef = ComponentRef<typeof Alert>;

/** Type helper for consumers that need to annotate a forwarded Alert ref. */
export type AlertComponent = ForwardRefExoticComponent<AlertProps & RefAttributes<AlertRef>>;
