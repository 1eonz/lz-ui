import type { DatePickerProps as AntDatePickerProps } from 'antd';
import type { RangePickerProps as AntRangePickerProps } from 'antd/es/date-picker';
import type { PickerRef } from 'rc-picker';

/** AntD 单日期属性；与 AntD 5 一致，值保留为 Dayjs 对象。 */
export type DatePickerProps = AntDatePickerProps;
/** AntD 范围日期属性，包含受控开始/结束值。 */
export type DateRangePickerProps = AntRangePickerProps;
/** 单日期与范围选择器共用的公开 focus/blur 实例。 */
export type DatePickerRef = PickerRef;
