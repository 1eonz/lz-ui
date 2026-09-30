import type { RadioGroupProps as AntRadioGroupProps, RadioProps as AntRadioProps } from 'antd';
import type { RadioRef as AntRadioRef } from 'antd/es/radio/interface';

/** 单个单选项属性；公开事件契约由 AntD 提供。 */
export type RadioProps = AntRadioProps;
/** 互斥单选组属性，包含 options/value/onChange。 */
export type RadioGroupProps = AntRadioGroupProps;
/** 单个单选项的公开聚焦实例。 */
export type RadioRef = AntRadioRef;
