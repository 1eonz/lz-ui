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
  // schema 可能来自 JSON；omitHidden 构造提交数据时，字段路径不得穿透
  // 对象原型写入，避免不可信路径污染原型。
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
        // 同字段的不同规则不得相互取消；索引标识当前 schema 版本中的
        // 规则，同一规则的新运行仍会取消旧请求，避免过期结果报告错误。
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
 * 父层值变化仍会计算可见性和动态标志，但稳定 schema 不会扰动无关
 * 字段子树。自定义字段接收完整值快照，因为其渲染器可能依赖任意字段。
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
 * 在 AntD 表单存储上组合 lx-ui 基础字段的 schema 驱动表单。
 * 组件负责字段可见性、校验和选项请求生命周期；宿主仍负责持久化、
 * 权限和提交请求。隐藏值默认保留在存储中，服务器不应收到这些值时
 * 使用 omitHidden。职责分离使 schema 可复用，不绑定 ERP/CRM 传输契约。
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
        // AntD 程序化重置不会触发 onValuesChange；从存储刷新可见性快照，
        // 保证条件字段与重置后的值一致。
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
        // 在防抖后的实际请求时读取存储，使依赖筛选使用最新表单值，
        // 避免读取旧渲染闭包中的过期快照。
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
      // 立即取消并推进请求代次，旧响应无法在防抖窗口填入下拉选项。
      // 每字段独立计时器合并快速输入，避免耦合不同选择字段。
      optionControllers.current[field.key]?.abort();
      clearTimeout(searchTimers.current[field.key]);
      requestIds.current[field.key] = (requestIds.current[field.key] ?? 0) + 1;
      // 包括防抖期间都立即清空选项，防止旧查询结果看起来仍是当前查询
      // 可以选择的有效值。
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
  // AntD 通过上下文把 Form.disabled 传给内置控件，自定义渲染器却只能
  // 收到下方显式 RendererContext；这里合并表单级标志，保证各渲染器
  // 遵循一致禁用契约，同时保留字段专属判断函数。
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
