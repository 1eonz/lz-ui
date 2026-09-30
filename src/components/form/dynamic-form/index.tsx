import { Form, Spin } from 'antd';
import type { FormInstance, Rule } from 'antd/es/form';
import type { RuleObject } from 'rc-field-form/lib/interface';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { MutableRefObject } from 'react';
import { FieldRenderer } from './FieldRenderer';
import { FormItem } from '../form-item';
import { defaultRendererRegistry, registerRenderer, resolveRenderer } from './registry';
import styles from './index.module.css';
import type {
  DynamicFieldOption,
  DynamicFormProps,
  DynamicFormRef,
  DynamicFormValues,
  DynamicNamePath,
  DynamicRule,
  FieldSchema,
} from './types';

const EMPTY_VALUES: DynamicFormValues = {};
const OPTION_SEARCH_DEBOUNCE_MS = 200;
type OptionState = {
  items: DynamicFieldOption[];
  loading: boolean;
  query: string;
  error?: boolean;
};

function pathOf(name: DynamicNamePath): (string | number)[] {
  const path = typeof name === 'string' || typeof name === 'number' ? [name] : [...name];
  if (
    path.length === 0 ||
    path.some(
      (segment) => segment === '__proto__' || segment === 'constructor' || segment === 'prototype',
    )
  ) {
    throw new Error('DynamicForm field name contains an invalid path segment');
  }
  return path;
}

function readPath(source: unknown, path: readonly (string | number)[]): unknown {
  let current = source;
  for (const segment of path) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string | number, unknown>)[segment];
  }
  return current;
}

function writePath(
  target: DynamicFormValues,
  path: readonly (string | number)[],
  value: unknown,
): void {
  if (path.length === 0) return;
  // Schema can be loaded from JSON. Never let a field path write through the
  // object prototype when omitHidden constructs its submit payload.
  if (
    path.some(
      (segment) => segment === '__proto__' || segment === 'constructor' || segment === 'prototype',
    )
  )
    return;
  let current: Record<string | number, unknown> = target;
  path.forEach((segment, index) => {
    if (index === path.length - 1) {
      current[segment] = value;
      return;
    }
    const next = path[index + 1];
    if (!current[segment] || typeof current[segment] !== 'object') {
      current[segment] = typeof next === 'number' ? [] : {};
    }
    current = current[segment] as Record<string | number, unknown>;
  });
}

function isVisible(field: FieldSchema, values: DynamicFormValues): boolean {
  if (field.hidden) return false;
  return typeof field.visible === 'function' ? field.visible(values) : (field.visible ?? true);
}

function rulesFor(
  field: FieldSchema,
  form: FormInstance<DynamicFormValues>,
  controllers: MutableRefObject<Record<string, AbortController>>,
): Rule[] | undefined {
  const rules: RuleObject[] = (field.rules ?? []).map((rule: DynamicRule, ruleIndex) => {
    const result: RuleObject = { ...rule.antd } as RuleObject;
    if (rule.required !== undefined) result.required = rule.required;
    if (rule.message !== undefined) result.message = rule.message;
    if (rule.validator) {
      result.validator = async (_rule: RuleObject, value: unknown) => {
        // Different rules on one field must not cancel each other. The index
        // identifies a rule within this schema version; newer runs of that
        // rule still cancel stale requests before they can report an error.
        const validationKey = `${field.key}:${ruleIndex}`;
        controllers.current[validationKey]?.abort();
        const controller = new AbortController();
        controllers.current[validationKey] = controller;
        try {
          const message = await rule.validator?.(value, {
            values: form.getFieldsValue(true),
            signal: controller.signal,
          });
          if (!controller.signal.aborted && typeof message === 'string') {
            throw new Error(message);
          }
        } catch (error) {
          if (!controller.signal.aborted) throw error;
        }
      };
    }
    return result;
  });
  if (field.required && !rules.some((rule) => rule.required)) {
    rules.unshift({ required: true, message: `${String(field.label ?? field.name)}为必填项` });
  }
  return rules.length ? (rules as Rule[]) : undefined;
}

function visibleValues(
  values: DynamicFormValues,
  fields: readonly FieldSchema[],
): DynamicFormValues {
  const result: DynamicFormValues = {};
  fields.forEach((field) => {
    writePath(result, pathOf(field.name), readPath(values, pathOf(field.name)));
  });
  return result;
}

interface SchemaFieldProps {
  field: FieldSchema;
  values: DynamicFormValues;
  disabled: boolean;
  readOnly: boolean;
  form: FormInstance<DynamicFormValues>;
  compact: boolean;
  preserve: boolean;
  optionState?: OptionState;
  validationControllers: MutableRefObject<Record<string, AbortController>>;
  rendererRegistry: NonNullable<DynamicFormProps['rendererRegistry']>;
  onUnknownRenderer?: DynamicFormProps['onUnknownRenderer'];
  onSearch: (field: Extract<FieldSchema, { type: 'select' }>, query: string) => void;
  onRetry: (field: Extract<FieldSchema, { type: 'select' }>, query: string) => void;
}

/**
 * Parent value changes still evaluate visibility and dynamic flags, but a
 * stable schema leaves unrelated field subtrees untouched. Custom fields get
 * the full value snapshot because their renderer may depend on any field.
 */
const SchemaField = memo(function SchemaField({
  field,
  values,
  disabled,
  readOnly,
  form,
  compact,
  preserve,
  optionState,
  validationControllers,
  rendererRegistry,
  onUnknownRenderer,
  onSearch,
  onRetry,
}: SchemaFieldProps) {
  const selectError = field.type === 'select' && optionState?.error;
  const inputField =
    field.type === 'select' && field.loadOptions
      ? {
          ...field,
          options: optionState?.items ?? field.options,
          inputProps: {
            ...field.inputProps,
            showSearch: true,
            loading: optionState?.loading,
            notFoundContent: selectError ? '选项加载失败，请重试' : undefined,
            onSearch: (query: string) => onSearch(field, query),
          },
        }
      : field;
  return (
    <FormItem
      className={[styles.fieldItem, compact ? styles.compactItem : undefined]
        .filter(Boolean)
        .join(' ')}
      name={pathOf(field.name)}
      label={field.label}
      help={field.help}
      extra={
        selectError ? (
          <span className={styles.optionError} role="alert">
            {field.extra} 选项加载失败，请重试。
            <button
              className={styles.retry}
              type="button"
              onClick={() => onRetry(field, optionState?.query ?? '')}
            >
              重试
            </button>
          </span>
        ) : (
          field.extra
        )
      }
      dependencies={field.dependencies}
      preserve={field.preserve ?? preserve}
      rules={rulesFor(field, form, validationControllers)}
      valuePropName={
        field.type === 'checkbox' || field.type === 'switch'
          ? 'checked'
          : field.type === 'upload'
            ? 'fileList'
            : undefined
      }
      getValueFromEvent={
        field.type === 'upload' ? (event: { fileList: unknown }) => event.fileList : undefined
      }
    >
      <FieldRenderer
        field={inputField}
        context={{ field, values, disabled, readOnly, form, controlProps: {} }}
        registry={rendererRegistry}
        onUnknownRenderer={onUnknownRenderer}
      />
    </FormItem>
  );
});

/**
 * Schema-driven form that composes lx-ui field primitives over AntD's form
 * store. It owns field visibility, validation and option request lifecycle;
 * the host still owns persistence, permissions and submission requests.
 * Hidden values remain in the store by default, so use `omitHidden` when the
 * server must not receive them. This separation keeps the schema reusable
 * without binding the library to an ERP or CRM transport contract.
 */
export const DynamicForm = forwardRef<DynamicFormRef, DynamicFormProps>(function DynamicForm(
  {
    schema,
    value,
    defaultValue = EMPTY_VALUES,
    onChange,
    onFinish,
    loading = false,
    empty,
    error,
    layout = 'vertical',
    compact = false,
    preserve = true,
    omitHidden = false,
    rendererRegistry = defaultRendererRegistry,
    onUnknownRenderer,
    children,
    className,
    ...formProps
  },
  ref,
) {
  const [form] = Form.useForm<DynamicFormValues>();
  const [currentValues, setCurrentValues] = useState<DynamicFormValues>(value ?? defaultValue);
  const [options, setOptions] = useState<Record<string, OptionState>>({});
  const optionControllers = useRef<Record<string, AbortController>>({});
  const requestIds = useRef<Record<string, number>>({});
  const searchTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const validationControllers = useRef<Record<string, AbortController>>({});

  useEffect(() => {
    if (value !== undefined) {
      form.setFieldsValue(value as never);
      setCurrentValues(value);
    }
  }, [form, value]);
  useEffect(
    () => () => {
      Object.values(optionControllers.current).forEach((controller) => controller.abort());
      Object.values(searchTimers.current).forEach((timer) => clearTimeout(timer));
      Object.values(validationControllers.current).forEach((controller) => controller.abort());
    },
    [],
  );
  useImperativeHandle(
    ref,
    () => ({
      form,
      submit: () => form.submit(),
      reset: () => {
        form.resetFields();
        // AntD does not emit onValuesChange for a programmatic reset. Refresh
        // our visibility snapshot from its store so conditional fields match.
        setCurrentValues(form.getFieldsValue(true));
      },
    }),
    [form],
  );

  const loadOptions = useCallback(
    async (field: Extract<FieldSchema, { type: 'select' }>, query: string) => {
      if (!field.loadOptions) return;
      const controller = new AbortController();
      optionControllers.current[field.key] = controller;
      const requestId = requestIds.current[field.key];
      setOptions((previous) => ({
        ...previous,
        [field.key]: { items: [], loading: true, query },
      }));
      try {
        // Read at request time, after debounce, so dependent filters use the
        // latest form store rather than a closure from an older render.
        const items = await field.loadOptions(query, form.getFieldsValue(true), controller.signal);
        if (!controller.signal.aborted && requestIds.current[field.key] === requestId) {
          setOptions((previous) => ({
            ...previous,
            [field.key]: { items, loading: false, query },
          }));
        }
      } catch {
        if (!controller.signal.aborted && requestIds.current[field.key] === requestId) {
          setOptions((previous) => ({
            ...previous,
            [field.key]: { items: [], loading: false, query, error: true },
          }));
        }
      }
    },
    [form],
  );

  const scheduleOptions = useCallback(
    (field: Extract<FieldSchema, { type: 'select' }>, query: string) => {
      // Abort and advance the generation immediately; an old response cannot
      // populate the dropdown during the debounce window. One timer per field
      // combines rapid keystrokes without coupling independent select fields.
      optionControllers.current[field.key]?.abort();
      clearTimeout(searchTimers.current[field.key]);
      requestIds.current[field.key] = (requestIds.current[field.key] ?? 0) + 1;
      // Clear immediately, including during debounce. A previous query's
      // options must never look like valid choices for the current query.
      setOptions((previous) => ({
        ...previous,
        [field.key]: { items: [], loading: true, query },
      }));
      searchTimers.current[field.key] = setTimeout(
        () => void loadOptions(field, query),
        OPTION_SEARCH_DEBOUNCE_MS,
      );
    },
    [loadOptions],
  );

  const values = value ?? currentValues;
  // AntD propagates Form.disabled to its built-in controls through context,
  // but custom renderers only receive the explicit RendererContext below.
  // Merge the form-level flag here so every renderer observes one consistent
  // disabled contract while preserving field-specific predicates.
  const formDisabled = formProps.disabled === true;

  if (schema.length === 0)
    return (
      <div>
        {loading && (
          <div className={styles.status} role="status">
            <Spin size="small" /> 正在加载表单
          </div>
        )}
        {error && (
          <div className={`${styles.status} ${styles.error}`} role="alert">
            {error}
          </div>
        )}
        {!loading && !error && (
          <div className={styles.status} role="status">
            {empty ?? '暂无可填写字段'}
          </div>
        )}
      </div>
    );

  return (
    <Form<DynamicFormValues>
      {...formProps}
      form={form}
      layout={layout}
      preserve={preserve}
      aria-busy={loading}
      className={[styles.form, className].filter(Boolean).join(' ')}
      initialValues={value ?? defaultValue}
      onValuesChange={(changed, all) => {
        setCurrentValues(all as DynamicFormValues);
        onChange?.(changed as DynamicFormValues, all as DynamicFormValues);
      }}
      onFinish={(submitted) => {
        const values = submitted as DynamicFormValues;
        const activeFields = schema.filter((field) => isVisible(field, values));
        onFinish?.(omitHidden ? visibleValues(values, activeFields) : values);
      }}
    >
      {loading && (
        <div className={styles.inlineStatus} role="status" aria-live="polite">
          <Spin size="small" /> 正在处理，请稍候
        </div>
      )}
      {error && (
        <div className={`${styles.inlineStatus} ${styles.error}`} role="alert">
          {error}
        </div>
      )}
      {schema
        .filter((field) => isVisible(field, values))
        .map((field) => (
          <SchemaField
            key={field.key}
            field={field}
            values={field.type === 'custom' ? values : EMPTY_VALUES}
            disabled={
              formDisabled ||
              (typeof field.disabled === 'function'
                ? field.disabled(values)
                : (field.disabled ?? false))
            }
            readOnly={
              typeof field.readOnly === 'function'
                ? field.readOnly(values)
                : (field.readOnly ?? false)
            }
            form={form}
            compact={compact}
            preserve={preserve}
            optionState={field.type === 'select' ? options[field.key] : undefined}
            validationControllers={validationControllers}
            rendererRegistry={rendererRegistry}
            onUnknownRenderer={onUnknownRenderer}
            onSearch={scheduleOptions}
            onRetry={scheduleOptions}
          />
        ))}
      {children}
    </Form>
  );
});

export { registerRenderer, resolveRenderer };
export type {
  AsyncValidator,
  CustomRenderer,
  DynamicFormProps,
  DynamicFormRef,
  DynamicFormValues,
  DynamicFieldOption,
  DynamicFieldType,
  DynamicNamePath,
  DynamicRule,
  FieldSchema,
  FormRendererRegistry,
} from './types';
