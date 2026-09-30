/**
 * Ant Design 5 的显式兼容出口。
 *
 * lx-ui 的增强组件从主入口导出；这里保留宿主需要的原生 AntD 能力，
 * 让迁移项目可以逐步替换组件，而不会把整个 antd 命名空间隐式带入 lx-ui。
 * 新增转出必须在此列名并记录版本影响，避免通配符造成名称覆盖。
 */
export {
  Button,
  Checkbox,
  ConfigProvider,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Skeleton,
  Switch,
  Upload,
} from 'antd';

export type {
  ButtonProps,
  CheckboxProps,
  DatePickerProps,
  EmptyProps,
  FormInstance,
  FormItemProps,
  FormProps,
  InputNumberProps,
  InputProps,
  RadioGroupProps,
  RadioProps,
  SelectProps,
  SkeletonProps,
  SwitchProps,
  UploadProps,
} from 'antd';
