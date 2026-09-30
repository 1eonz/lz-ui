import type { Alert, AlertProps as AntAlertProps } from 'antd';
import type { ComponentRef, ForwardRefExoticComponent, RefAttributes } from 'react';

/** AntD 5 公开提示属性；关闭生命周期与 action 的业务语义由宿主拥有。 */
export type AlertProps = AntAlertProps;

/** AntD 5 Alert 的公开 ref，提供包含原生元素的对象。 */
export type AlertRef = ComponentRef<typeof Alert>;

/** 供宿主标注带转发 ref 的 Alert 组件类型。 */
export type AlertComponent = ForwardRefExoticComponent<AlertProps & RefAttributes<AlertRef>>;
