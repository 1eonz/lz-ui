import type { InputProps as AntInputProps, InputRef as AntInputRef } from 'antd';
import type {
  TextAreaProps as AntTextAreaProps,
  TextAreaRef as AntTextAreaRef,
} from 'antd/es/input/TextArea';

/** AntD 文本输入参数，支持受控 value 与非受控 defaultValue。 */
export type InputProps = AntInputProps;
/** AntD 公开输入实例，提供 focus、blur、原生 input 和展示根节点。 */
export type InputRef = AntInputRef;
/** 多行输入参数；长业务备注的 autoSize 应限制最大行数。 */
export type TextAreaProps = AntTextAreaProps;
/** AntD 公开多行输入实例，提供 focus、blur 和原生 textarea 访问。 */
export type TextAreaRef = AntTextAreaRef;
