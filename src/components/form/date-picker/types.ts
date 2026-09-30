import type { DatePickerProps as AntDatePickerProps } from 'antd';
import type { RangePickerProps as AntRangePickerProps } from 'antd/es/date-picker';
import type { PickerRef } from 'rc-picker';

/** AntD single-date props; values remain Dayjs objects, as in AntD 5. */
export type DatePickerProps = AntDatePickerProps;
/** AntD range props, including controlled start/end values. */
export type DateRangePickerProps = AntRangePickerProps;
/** Public picker focus/blur handle shared by single and range pickers. */
export type DatePickerRef = PickerRef;
