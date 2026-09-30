import type { ReactNode } from 'react';
import { Button } from '../../general/button';
import { Checkbox } from '../checkbox';
import type { CheckboxProps } from '../checkbox';
import { DatePicker, DateRangePicker } from '../date-picker';
import type { DatePickerProps, DateRangePickerProps } from '../date-picker';
import { Input, TextArea } from '../input';
import type { InputProps, TextAreaProps } from '../input';
import { InputNumber } from '../input-number';
import type { InputNumberProps } from '../input-number';
import { Select } from '../select';
import type { SelectProps } from '../select';
import { Switch } from '../switch';
import type { SwitchProps } from '../switch';
import { Radio } from '../radio';
import type { RadioGroupProps } from '../radio';
import { Upload } from '../upload';
import type { UploadProps } from '../upload';
import type { FieldSchema, FormRendererRegistry, RendererContext } from './types';
import { resolveRenderer } from './registry';
export function FieldRenderer({
  field,
  context,
  registry,
  onUnknownRenderer,
  ...controlProps
}: {
  field: FieldSchema;
  context: RendererContext;
  registry?: FormRendererRegistry;
  onUnknownRenderer?: (field: FieldSchema) => ReactNode;
  value?: unknown;
  checked?: boolean;
  onChange?: (...args: unknown[]) => void;
  id?: string;
}) {
  // FormItem 向直接子节点注入 value/onChange/id，需转发至设计好的基础
  // 控件。类型转换集中在适配层：schema 是联合类型，而 AntD 在运行时
  // 注入统一但未细分类型的控件契约。
  if (field.type === 'custom')
    return (
      field.render?.({ ...context, controlProps }) ??
      resolveRenderer(field.renderer, registry)?.({ ...context, controlProps }) ??
      onUnknownRenderer?.(field) ?? (
        <span role="alert">未知字段类型: {field.renderer ?? 'custom'}</span>
      )
    );
  switch (field.type) {
    case 'text':
      return (
        <Input
          {...field.inputProps}
          {...(controlProps as InputProps)}
          readOnly={context.readOnly}
          disabled={context.disabled}
          placeholder={field.placeholder}
        />
      );
    case 'textarea':
      return (
        <TextArea
          {...field.inputProps}
          {...(controlProps as TextAreaProps)}
          readOnly={context.readOnly}
          disabled={context.disabled}
          placeholder={field.placeholder}
        />
      );
    case 'number':
      return (
        <InputNumber
          {...field.inputProps}
          {...(controlProps as InputNumberProps)}
          disabled={context.disabled || context.readOnly}
          style={{ width: '100%' }}
        />
      );
    case 'select':
      return (
        <Select
          {...field.inputProps}
          {...(controlProps as SelectProps)}
          disabled={context.disabled || context.readOnly}
          options={field.options}
          style={{ width: '100%' }}
        />
      );
    case 'checkbox':
      return (
        <Checkbox
          {...field.inputProps}
          {...(controlProps as CheckboxProps)}
          disabled={context.disabled || context.readOnly}
        />
      );
    case 'radio':
      return (
        <Radio.Group
          {...field.inputProps}
          {...(controlProps as RadioGroupProps)}
          disabled={context.disabled || context.readOnly}
          options={field.options}
        />
      );
    case 'date':
      return (
        <DatePicker
          {...field.inputProps}
          {...(controlProps as DatePickerProps)}
          disabled={context.disabled || context.readOnly}
          style={{ width: '100%' }}
        />
      );
    case 'dateRange':
      return (
        <DateRangePicker
          {...field.inputProps}
          {...(controlProps as DateRangePickerProps)}
          disabled={context.disabled || context.readOnly}
          style={{ width: '100%' }}
        />
      );
    case 'switch':
      return (
        <Switch
          {...field.inputProps}
          {...(controlProps as SwitchProps)}
          disabled={context.disabled || context.readOnly}
        />
      );
    case 'upload':
      // Upload 默认只选择本地文件；宿主须显式提供 action/customRequest，
      // 避免仅声明文件列表值的 schema 意外向当前页面发起上传请求。
      return (
        <Upload
          {...field.inputProps}
          {...(controlProps as UploadProps)}
          disabled={context.disabled || context.readOnly}
        >
          <Button disabled={context.disabled || context.readOnly}>
            {field.uploadLabel ?? '选择文件'}
          </Button>
        </Upload>
      );
  }
}
