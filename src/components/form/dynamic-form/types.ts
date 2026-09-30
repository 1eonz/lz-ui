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

/** A field may hold a scalar, Dayjs value, file list or nested object. */
export type DynamicFormValue = unknown;
/** The form store keeps nested values under their top-level field names. */
export type DynamicFormValues = Record<string, DynamicFormValue>;
/** AntD-compatible value path; `key` remains a separate stable render identity. */
export type DynamicNamePath = string | number | readonly (string | number)[];
/** P0 field kinds. New kinds must have a primitive, state tests and a design record. */
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
  /** Visible name, distinct from the value submitted to the host application. */
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
}
/** Latest form snapshot and cancellation signal supplied to asynchronous rules. */
export interface ValidationContext {
  values: DynamicFormValues;
  signal: AbortSignal;
}
/** Return a message for validation failure; reject for exceptional failures. */
export type AsyncValidator = (
  value: DynamicFormValue,
  context: ValidationContext,
) => void | string | Promise<void | string>;
export interface DynamicRule {
  required?: boolean;
  message?: string;
  /** A newer run of the same rule aborts the prior signal. */
  validator?: AsyncValidator;
  /** AntD 5 object rule for built-in pattern, length and type validation. */
  antd?: Rule;
}
/** Data exposed to a host-supplied custom field renderer. */
export interface RendererContext {
  field: FieldSchema;
  values: DynamicFormValues;
  disabled: boolean;
  readOnly: boolean;
  form: FormInstance<DynamicFormValues>;
  /**
   * Form.Item injects controlled props into its direct child. Custom renderers must forward
   * these props to their actual input, otherwise changes never reach validation or submit.
   */
  controlProps: {
    value?: unknown;
    checked?: boolean;
    onChange?: (...args: unknown[]) => void;
    id?: string;
  };
}
/** Render a custom field; forward `controlProps` to the actual input element. */
export type CustomRenderer = (context: RendererContext) => ReactNode;
/** A local registry isolates independently deployed forms from global names. */
export interface FormRendererRegistry {
  register: (name: string, renderer: CustomRenderer) => void;
  resolve: (name: string) => CustomRenderer | undefined;
}
export interface BaseFieldSchema {
  /** Stable React identity; never derive it from a mutable array index. */
  key: string;
  /** Form value path; changing it moves the value to a different store location. */
  name: DynamicNamePath;
  /** A real visible label is expected for accessible data entry. */
  label?: ReactNode;
  help?: ReactNode;
  extra?: ReactNode;
  hidden?: boolean;
  /** Synchronous and pure; use current form values to decide visibility. */
  visible?: boolean | ((values: DynamicFormValues) => boolean);
  required?: boolean;
  rules?: DynamicRule[];
  dependencies?: DynamicNamePath[];
  /** Disabled prevents editing; it does not remove the value from submission. */
  disabled?: boolean | ((values: DynamicFormValues) => boolean);
  /** Controls without native read-only semantics are disabled for safety. */
  readOnly?: boolean | ((values: DynamicFormValues) => boolean);
  /** Overrides form-level retention when this field becomes hidden. */
  preserve?: boolean;
}
type SelectField = BaseFieldSchema & {
  type: 'select';
  options?: DynamicFieldOption[];
  /** Host-owned loader; stale responses are ignored even if it cannot abort. */
  loadOptions?: (
    query: string,
    context: DynamicFormValues,
    signal: AbortSignal,
  ) => Promise<DynamicFieldOption[]>;
  inputProps?: SelectProps;
};
/** Discriminated schema; every kind has its own compatible input props. */
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
 * DynamicForm owns field layout, validation and value collection. Requests,
 * permissions and persistence remain with the host. AntD FormProps pass through
 * except the value callbacks whose semantics are defined here.
 */
export interface DynamicFormProps extends Omit<
  FormProps<DynamicFormValues>,
  'onFinish' | 'onValuesChange' | 'onChange' | 'initialValues' | 'defaultValue' | 'children'
> {
  /** Actions or supplementary content rendered after generated fields. */
  children?: ReactNode;
  /** Stable field definitions; memoize when generated from business metadata. */
  schema: readonly FieldSchema[];
  /** Controlled snapshot; update it from `onChange` to show further edits. */
  value?: DynamicFormValues;
  /** One-time initial values for an uncontrolled form. */
  defaultValue?: DynamicFormValues;
  /** Fires on user edits with a changed-value patch and complete store snapshot. */
  onChange?: (changed: DynamicFormValues, all: DynamicFormValues) => void;
  /** Fires after successful validation; it does not own request loading. */
  onFinish?: (values: DynamicFormValues) => void | Promise<void>;
  /** Shows an in-form progress status without unmounting fields or moving focus. The host owns request completion and submit locking. */
  loading?: boolean;
  empty?: ReactNode;
  /** Visible in-form failure content. Supply a recovery action when the host request can be retried. */
  error?: ReactNode;
  layout?: 'horizontal' | 'vertical' | 'inline';
  compact?: boolean;
  /** Hidden fields retain their values by default. */
  preserve?: boolean;
  /** Removes hidden fields only from submitted output, not the form store. */
  omitHidden?: boolean;
  /** Prefer local registration when multiple applications share one page. */
  rendererRegistry?: FormRendererRegistry;
  /** Visible fallback when a custom renderer key cannot be resolved. */
  onUnknownRenderer?: (field: FieldSchema) => ReactNode;
}
/** Imperative bridge for submit/reset and AntD 5 form integrations. */
export interface DynamicFormRef {
  form: FormInstance<DynamicFormValues>;
  submit: () => void;
  reset: () => void;
}
