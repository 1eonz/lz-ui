import type {
  CheckboxProps,
  DatePickerProps,
  InputNumberProps,
  InputProps,
  RadioProps,
  SelectProps,
  SwitchProps,
  UploadProps,
} from 'antd';
import type { TextAreaProps } from 'antd/es/input/TextArea';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { FormInstance, FormProps, Rule } from 'antd/es/form';
import type { ReactNode } from 'react';

/** 字段可以保存标量、Dayjs 值、文件列表或嵌套对象。 */
export type DynamicFormValue = unknown;
/** 表单存储在顶层字段名下保留嵌套值。 */
export type DynamicFormValues = Record<string, DynamicFormValue>;
/** 兼容 AntD 的值路径；key 独立承担稳定渲染身份。 */
export type DynamicNamePath = string | number | readonly (string | number)[];
/** P0 字段种类；新增种类必须具备基础控件、状态测试和设计记录。 */
export type DynamicFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'dateRange'
  | 'switch'
  | 'upload'
  | 'custom';
export interface DynamicFieldOption {
  /** 可见名称，与提交给宿主应用的实际值相互独立。 */
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
}
/** 提供给异步规则的最新表单快照和取消信号。 */
export interface ValidationContext {
  values: DynamicFormValues;
  signal: AbortSignal;
}
/** 校验不通过时返回消息；异常失败通过 Promise 拒绝表达。 */
export type AsyncValidator = (
  value: DynamicFormValue,
  context: ValidationContext,
) => void | string | Promise<void | string>;
export interface DynamicRule {
  required?: boolean;
  message?: string;
  /** 同一规则的新运行会中止先前运行的信号。 */
  validator?: AsyncValidator;
  /** AntD 5 对象规则，用于内置正则、长度和类型校验。 */
  antd?: Rule;
}
/** 暴露给宿主自定义字段渲染器的数据。 */
export interface RendererContext {
  field: FieldSchema;
  values: DynamicFormValues;
  disabled: boolean;
  readOnly: boolean;
  form: FormInstance<DynamicFormValues>;
  /**
   * Form.Item 向直接子节点注入受控属性；自定义渲染器必须将这些属性
   * 转发至实际输入控件，否则用户修改无法进入校验和提交数据。
   */
  controlProps: {
    value?: unknown;
    checked?: boolean;
    onChange?: (...args: unknown[]) => void;
    id?: string;
  };
}
/** 渲染自定义字段；必须向实际输入元素转发 controlProps。 */
export type CustomRenderer = (context: RendererContext) => ReactNode;
/** 局部注册表隔离独立部署表单，避免受全局命名影响。 */
export interface FormRendererRegistry {
  register: (name: string, renderer: CustomRenderer) => void;
  resolve: (name: string) => CustomRenderer | undefined;
}
export interface BaseFieldSchema {
  /** 稳定 React 身份；不得从可变数组索引派生。 */
  key: string;
  /** 表单值路径；修改路径会将值移到另一存储位置。 */
  name: DynamicNamePath;
  /** 可访问的数据录入应提供真实可见标签。 */
  label?: ReactNode;
  help?: ReactNode;
  extra?: ReactNode;
  hidden?: boolean;
  /** 同步纯函数；根据当前表单值判断可见性。 */
  visible?: boolean | ((values: DynamicFormValues) => boolean);
  required?: boolean;
  rules?: DynamicRule[];
  dependencies?: DynamicNamePath[];
  /** 禁用阻止编辑，但不会从提交数据中删除该值。 */
  disabled?: boolean | ((values: DynamicFormValues) => boolean);
  /** 缺少原生只读语义的控件使用禁用状态保障安全。 */
  readOnly?: boolean | ((values: DynamicFormValues) => boolean);
  /** 此字段隐藏时覆盖表单级值保留策略。 */
  preserve?: boolean;
}
type SelectField = BaseFieldSchema & {
  type: 'select';
  options?: DynamicFieldOption[];
  /** 宿主拥有的加载器；即使无法取消，也会忽略过期响应。 */
  loadOptions?: (
    query: string,
    context: DynamicFormValues,
    signal: AbortSignal,
  ) => Promise<DynamicFieldOption[]>;
  inputProps?: SelectProps;
};
/** 可辨识联合 schema；每种字段拥有相应兼容的输入属性。 */
export type FieldSchema =
  | (BaseFieldSchema & { type: 'text'; placeholder?: string; inputProps?: InputProps })
  | (BaseFieldSchema & { type: 'textarea'; placeholder?: string; inputProps?: TextAreaProps })
  | (BaseFieldSchema & { type: 'number'; inputProps?: InputNumberProps })
  | SelectField
  | (BaseFieldSchema & { type: 'checkbox'; inputProps?: CheckboxProps })
  | (BaseFieldSchema & { type: 'radio'; options: DynamicFieldOption[]; inputProps?: RadioProps })
  | (BaseFieldSchema & { type: 'date'; inputProps?: DatePickerProps })
  | (BaseFieldSchema & { type: 'dateRange'; inputProps?: RangePickerProps })
  | (BaseFieldSchema & { type: 'switch'; inputProps?: SwitchProps })
  | (BaseFieldSchema & { type: 'upload'; uploadLabel?: ReactNode; inputProps?: UploadProps })
  | (BaseFieldSchema & { type: 'custom'; renderer?: string; render?: CustomRenderer });
/**
 * DynamicForm 负责字段布局、校验和值收集；请求、权限和持久化由宿主
 * 负责。AntD FormProps 原样透传，只有在这里定义语义的值回调除外。
 */
export interface DynamicFormProps extends Omit<
  FormProps<DynamicFormValues>,
  'onFinish' | 'onValuesChange' | 'onChange' | 'initialValues' | 'defaultValue' | 'children'
> {
  /** 在生成字段之后渲染的操作或补充内容。 */
  children?: ReactNode;
  /** 稳定字段定义；从业务元数据生成时应缓存引用。 */
  schema: readonly FieldSchema[];
  /** 受控快照；从 onChange 更新该值才能显示后续编辑。 */
  value?: DynamicFormValues;
  /** 非受控表单的一次性初始值。 */
  defaultValue?: DynamicFormValues;
  /** 用户编辑时触发，提供变更值补丁和完整存储快照。 */
  onChange?: (changed: DynamicFormValues, all: DynamicFormValues) => void;
  /** 校验成功后触发；不负责业务请求加载状态。 */
  onFinish?: (values: DynamicFormValues) => void | Promise<void>;
  /** 显示表单内加载状态，不卸载字段或移动焦点；宿主负责请求完成和提交锁定。 */
  loading?: boolean;
  empty?: ReactNode;
  /** 表单内可见失败内容；宿主请求可重试时，应提供恢复操作。 */
  error?: ReactNode;
  layout?: 'horizontal' | 'vertical' | 'inline';
  compact?: boolean;
  /** 隐藏字段默认保留其值。 */
  preserve?: boolean;
  /** 仅从提交输出中移除隐藏字段，不删除表单存储中的值。 */
  omitHidden?: boolean;
  /** 同页存在多个应用时，优先使用局部注册。 */
  rendererRegistry?: FormRendererRegistry;
  /** 无法解析自定义渲染器 key 时显示的回退内容。 */
  onUnknownRenderer?: (field: FieldSchema) => ReactNode;
}
/** 用于提交/重置和 AntD 5 表单集成的命令式接口。 */
export interface DynamicFormRef {
  form: FormInstance<DynamicFormValues>;
  submit: () => void;
  reset: () => void;
}
