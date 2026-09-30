import type { RadioGroupProps as AntRadioGroupProps, RadioProps as AntRadioProps } from 'antd';
import type { RadioRef as AntRadioRef } from 'antd/es/radio/interface';

/** Props for one radio option; AntD owns the public event contract. */
export type RadioProps = AntRadioProps;
/** Props for a mutually exclusive radio set, including options/value/onChange. */
export type RadioGroupProps = AntRadioGroupProps;
/** Public focus handle for a single radio. */
export type RadioRef = AntRadioRef;
