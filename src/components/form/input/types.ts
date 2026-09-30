import type { InputProps as AntInputProps, InputRef as AntInputRef } from 'antd';
import type {
  TextAreaProps as AntTextAreaProps,
  TextAreaRef as AntTextAreaRef,
} from 'antd/es/input/TextArea';

/** AntD text input props, including controlled and uncontrolled values. */
export type InputProps = AntInputProps;
/** Public AntD input handle; exposes focus and the underlying native input. */
export type InputRef = AntInputRef;
/** Multiline input props; automatic sizing should be bounded on long business notes. */
export type TextAreaProps = AntTextAreaProps;
/** Public multiline focus handle from Ant Design 5. */
export type TextAreaRef = AntTextAreaRef;
