import { Form, Spin } from 'antd';
import type { FormInstance, Rule } from 'antd/es/form';
import type { RuleObject } from 'rc-field-form/lib/interface';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { ComponentProps, MutableRefObject } from 'react';
import { FieldRenderer } from './FieldRenderer';
import { FormItem } from '../form-item';
import type { SelectRef } from '../select';
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
const SELECT_OPTIONS_ERROR_MESSAGE = '选项加载失败。搜索内容已保留，请重试。';
const NO_MATCHING_OPTIONS_MESSAGE = '没有找到匹配选项，请调整关键词后重新搜索。';
type OptionState = {
  items: DynamicFieldOption[];
  loading: boolean;
  query: string;
  error?: boolean;
  loadError?: unknown;
  retrying?: boolean;
  recoveredFromRetry?: boolean;
};

function getOptionsResultAnnouncement(optionState: OptionState): string {
  if (optionState.recoveredFromRetry) {
    if (optionState.items.length > 0) {
      // 重试按钮与 Select 分离；成功后焦点回到已收起的 Select，播报下一步可直接恢复操作。
      return `重试成功，已找到 ${optionState.items.length} 个选项。请重新展开列表选择。`;
    }
    return optionState.query
      ? `重试完成，${NO_MATCHING_OPTIONS_MESSAGE}`
      : '重试完成，暂无可用选项。';
  }
  if (optionState.items.length > 0) return `已找到 ${optionState.items.length} 个选项。`;
  return optionState.query ? NO_MATCHING_OPTIONS_MESSAGE : '暂无可用选项。';
}

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

function hasPath(source: unknown, path: readonly (string | number)[]): boolean {
  let current = source;
  for (const segment of path) {
    if (!current || typeof current !== 'object') return false;
    if (!Object.prototype.hasOwnProperty.call(current, segment)) return false;
    current = (current as Record<string | number, unknown>)[segment];
  }
  return true;
}

function pathsOverlap(
  left: readonly (string | number)[],
  right: readonly (string | number)[],
): boolean {
  const sharedLength = Math.min(left.length, right.length);
  return left.slice(0, sharedLength).every((segment, index) => segment === right[index]);
}

function pathValuesChanged(
  previous: DynamicFormValues,
  current: DynamicFormValues,
  path: readonly (string | number)[],
): boolean {
  const previousHasPath = hasPath(previous, path);
  const currentHasPath = hasPath(current, path);
  const previousValue = readPath(previous, path);
  const currentValue = readPath(current, path);
  const equal = valuesEqual(previousValue, currentValue);
  return previousHasPath !== currentHasPath || !equal;
}

// 空值到空值的属性变化不清理子项；清空已有依赖值仍会使子项失效。
function hasDependencyValue(value: unknown): boolean {
  return (
    value !== undefined &&
    value !== null &&
    value !== '' &&
    !(Array.isArray(value) && !value.length)
  );
}

function cloneValuesSnapshot(values: DynamicFormValues): DynamicFormValues {
  // 表单可保存循环对象；克隆普通容器以保留旧值，同时把日期等实例按引用传递。
  const seen = new WeakMap<object, unknown>();
  const cloneValue = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      const previousClone = seen.get(value);
      if (previousClone) return previousClone;
      const clone: unknown[] = [];
      seen.set(value, clone);
      value.forEach((item) => clone.push(cloneValue(item)));
      return clone;
    }
    if (!value || typeof value !== 'object') return value;
    const previousClone = seen.get(value);
    if (previousClone) return previousClone;
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return value;
    const clone: Record<string, unknown> = prototype === null ? Object.create(null) : {};
    seen.set(value, clone);
    Object.entries(value).forEach(([key, nestedValue]) => {
      clone[key] = cloneValue(nestedValue);
    });
    return clone;
  };
  return cloneValue(values) as DynamicFormValues;
}

function valuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false;

  const isDate = (value: object): value is Date => value instanceof Date;
  if (isDate(left) || isDate(right)) {
    return isDate(left) && isDate(right) && Object.is(left.getTime(), right.getTime());
  }

  const isDayjs = (value: object): value is object & { $isDayjsObject: true; valueOf(): number } =>
    '$isDayjsObject' in value &&
    value.$isDayjsObject === true &&
    'valueOf' in value &&
    typeof value.valueOf === 'function';
  const leftIsDayjs = isDayjs(left);
  const rightIsDayjs = isDayjs(right);
  if (leftIsDayjs || rightIsDayjs) {
    return leftIsDayjs && rightIsDayjs && Object.is(left.valueOf(), right.valueOf());
  }

  const leftIsArray = Array.isArray(left);
  const rightIsArray = Array.isArray(right);
  if (leftIsArray !== rightIsArray) return false;

  const leftPrototype = Object.getPrototypeOf(left);
  const rightPrototype = Object.getPrototypeOf(right);
  const isPlainObject = (prototype: object | null) =>
    prototype === Object.prototype || prototype === null;
  if (leftIsArray) {
    if (leftPrototype !== rightPrototype) return false;
  } else if (
    !isPlainObject(leftPrototype) ||
    !isPlainObject(rightPrototype) ||
    leftPrototype !== rightPrototype
  ) {
    return false;
  }

  // 双向映射既能中断递归，也能保证循环与共享引用在两侧保持相同拓扑。
  const leftToRight = new WeakMap<object, object>();
  const rightToLeft = new WeakMap<object, object>();
  const compare = (currentLeft: unknown, currentRight: unknown): boolean => {
    if (
      !currentLeft ||
      !currentRight ||
      typeof currentLeft !== 'object' ||
      typeof currentRight !== 'object'
    ) {
      return Object.is(currentLeft, currentRight);
    }

    if (isDate(currentLeft) || isDate(currentRight)) {
      return (
        isDate(currentLeft) &&
        isDate(currentRight) &&
        Object.is(currentLeft.getTime(), currentRight.getTime())
      );
    }
    const currentLeftIsDayjs = isDayjs(currentLeft);
    const currentRightIsDayjs = isDayjs(currentRight);
    if (currentLeftIsDayjs || currentRightIsDayjs) {
      return (
        currentLeftIsDayjs &&
        currentRightIsDayjs &&
        Object.is(currentLeft.valueOf(), currentRight.valueOf())
      );
    }

    const mappedRight = leftToRight.get(currentLeft);
    const mappedLeft = rightToLeft.get(currentRight);
    if (mappedRight || mappedLeft) {
      return mappedRight === currentRight && mappedLeft === currentLeft;
    }

    const currentLeftIsArray = Array.isArray(currentLeft);
    if (currentLeftIsArray !== Array.isArray(currentRight)) return false;
    const currentLeftPrototype = Object.getPrototypeOf(currentLeft);
    const currentRightPrototype = Object.getPrototypeOf(currentRight);
    if (currentLeftPrototype !== currentRightPrototype) return false;
    if (
      !currentLeftIsArray &&
      currentLeftPrototype !== Object.prototype &&
      currentLeftPrototype !== null
    ) {
      return false;
    }

    const leftKeys = Object.keys(currentLeft);
    const rightKeys = Object.keys(currentRight);
    if (
      (currentLeftIsArray && currentLeft.length !== (currentRight as unknown[]).length) ||
      leftKeys.length !== rightKeys.length ||
      leftKeys.some((key) => !Object.prototype.hasOwnProperty.call(currentRight, key))
    ) {
      return false;
    }

    leftToRight.set(currentLeft, currentRight);
    rightToLeft.set(currentRight, currentLeft);
    return leftKeys.every((key) =>
      compare(
        (currentLeft as Record<string, unknown>)[key],
        (currentRight as Record<string, unknown>)[key],
      ),
    );
  };

  return compare(left, right);
}

// 只复制路径上的容器，避免改写 AntD 传入的快照及其共享的嵌套对象。
function setPathSnapshotValue(
  source: DynamicFormValues,
  path: readonly (string | number)[],
  value: unknown,
): DynamicFormValues {
  const result = { ...source };
  let sourceParent: unknown = source;
  let targetParent: Record<string | number, unknown> = result;
  path.forEach((segment, index) => {
    if (index === path.length - 1) {
      targetParent[segment] = value;
      return;
    }
    const sourceChild =
      sourceParent && typeof sourceParent === 'object'
        ? (sourceParent as Record<string | number, unknown>)[segment]
        : undefined;
    const nextChild = Array.isArray(sourceChild)
      ? [...sourceChild]
      : sourceChild && typeof sourceChild === 'object'
        ? { ...sourceChild }
        : typeof path[index + 1] === 'number'
          ? []
          : {};
    targetParent[segment] = nextChild;
    sourceParent = sourceChild;
    targetParent = nextChild as Record<string | number, unknown>;
  });
  return result;
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
  const selectRetrying = field.type === 'select' && optionState?.retrying;
  const selectOptionLoading = field.type === 'select' && Boolean(optionState?.loading);
  const selectOptionErrorContent =
    selectError && field.type === 'select' && field.loadOptions && optionState
      ? (field.loadOptionsError?.(optionState.loadError, optionState.query) ??
        SELECT_OPTIONS_ERROR_MESSAGE)
      : SELECT_OPTIONS_ERROR_MESSAGE;
  const selectResultAnnouncement =
    field.type === 'select' &&
    field.loadOptions &&
    optionState &&
    !optionState.loading &&
    !optionState.error
      ? getOptionsResultAnnouncement(optionState)
      : undefined;
  const selectOptionErrorId = useId();
  const selectRetryButtonLabelId = useId();
  const selectFieldLabelId = useId();
  const selectLabel =
    field.type === 'select' &&
    field.loadOptions &&
    field.label !== undefined &&
    field.label !== null ? (
      <span id={selectFieldLabelId}>{field.label}</span>
    ) : (
      field.label
    );
  const selectInputProps = field.type === 'select' ? field.inputProps : undefined;
  const { onDropdownVisibleChange: legacyOnDropdownVisibleChange, ...currentSelectInputProps } =
    selectInputProps ?? {};
  const [searchValue, setSearchValue] = useState('');
  const selectRef = useRef<SelectRef>(null);
  const retryButtonRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreSelectFocus = useRef(false);
  const closingSelect = useRef(false);
  useEffect(() => {
    if (!selectRetrying) return undefined;
    const handleFocusIn = (event: FocusEvent) => {
      if (event.target !== retryButtonRef.current && event.target !== document.body) {
        shouldRestoreSelectFocus.current = false;
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !retryButtonRef.current?.contains(event.target)) {
        shouldRestoreSelectFocus.current = false;
      }
    };
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [selectRetrying]);
  useEffect(() => {
    // 重试按钮成功后会消失；仅在焦点因卸载落回 body 时恢复，尊重用户等待期间的移焦。
    if (
      !selectRetrying &&
      !selectError &&
      shouldRestoreSelectFocus.current &&
      document.activeElement === document.body
    ) {
      selectRef.current?.focus();
    }
    if (!selectRetrying && (selectError || shouldRestoreSelectFocus.current)) {
      shouldRestoreSelectFocus.current = false;
    }
  }, [selectError, selectRetrying]);
  const inputField =
    field.type === 'select' && field.loadOptions
      ? {
          ...field,
          options: optionState?.items ?? field.options,
          inputProps: {
            ...currentSelectInputProps,
            showSearch: true,
            searchValue,
            // loadOptions 已按查询返回候选；再按 option.value 本地过滤会隐藏
            // 以 label 命中的结果，例如用“杭州”搜索值为“supplier-1”的供应商。
            filterOption: currentSelectInputProps.filterOption ?? false,
            loading: optionState?.loading,
            'aria-busy': optionState?.loading || undefined,
            notFoundContent: selectRetrying ? (
              '正在重新加载选项…'
            ) : selectError ? (
              <span aria-hidden="true">{selectOptionErrorContent}</span>
            ) : optionState?.loading ? (
              '正在加载选项…'
            ) : optionState ? (
              optionState.items.length > 0 ? undefined : optionState.query ? (
                NO_MATCHING_OPTIONS_MESSAGE
              ) : (
                '暂无可用选项'
              )
            ) : (
              '输入关键词搜索'
            ),
            onSearch: (query: string) => {
              // AntD 单选下拉关闭时会清理内部搜索词；它不是用户的新查询，
              // 不能覆盖失败查询或取消可访问的重试入口。
              const ignoreClosingClear = !query && closingSelect.current;
              closingSelect.current = false;
              if (!ignoreClosingClear) {
                setSearchValue(query);
                onSearch(field, query);
              }
              // 保留 AntD 的公开回调；内部远程加载和宿主观察同时接收用户查询。
              currentSelectInputProps.onSearch?.(query);
            },
            onOpenChange: (open: boolean) => {
              closingSelect.current = !open;
              if (open) {
                closingSelect.current = false;
              }
              if (open && !searchValue && optionState?.query && !optionState.loading) {
                onSearch(field, '');
              }
              if (currentSelectInputProps.onOpenChange) {
                currentSelectInputProps.onOpenChange(open);
              } else {
                legacyOnDropdownVisibleChange?.(open);
              }
            },
          },
        }
      : field;
  const rendererProps: ComponentProps<typeof FieldRenderer> = {
    field: inputField,
    context: { field, values, disabled, readOnly, form, controlProps: {} },
    registry: rendererRegistry,
    onUnknownRenderer,
    selectRef: field.type === 'select' ? selectRef : undefined,
    retryButtonRef: field.type === 'select' ? retryButtonRef : undefined,
    optionError: Boolean(selectError),
    optionRetrying: Boolean(selectRetrying),
    optionErrorId: selectError ? selectOptionErrorId : undefined,
    retryButtonLabelId: selectError ? selectRetryButtonLabelId : undefined,
    retryButtonFieldLabelId:
      selectError && field.type === 'select' && field.loadOptions && selectLabel
        ? selectFieldLabelId
        : undefined,
    onSelectValueChange: () => setSearchValue(''),
    onRetry:
      field.type === 'select' && field.loadOptions
        ? () => {
            // 鼠标点击的焦点表现因浏览器而异；按钮卸载后只有焦点落到 body 时才恢复。
            shouldRestoreSelectFocus.current = true;
            onRetry(field, optionState?.query ?? '');
          }
        : undefined,
  };
  return (
    <FormItem
      className={[styles.fieldItem, compact ? styles.compactItem : undefined]
        .filter(Boolean)
        .join(' ')}
      name={pathOf(field.name)}
      label={selectLabel}
      help={field.help}
      extra={
        <>
          {field.extra}
          {selectError && (
            <span id={selectOptionErrorId} className={styles.optionError} role="alert">
              {selectOptionErrorContent}
            </span>
          )}
          {selectOptionLoading && (
            <span className={styles.screenReaderOnly} role="status">
              {selectRetrying ? '正在重新加载选项。' : '正在加载选项。'}
            </span>
          )}
          {selectResultAnnouncement && (
            <span
              className={
                optionState?.recoveredFromRetry && optionState.items.length > 0
                  ? styles.optionStatus
                  : styles.screenReaderOnly
              }
              role="status"
            >
              {selectResultAnnouncement}
            </span>
          )}
        </>
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
      <FieldRenderer {...rendererProps} />
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
    onFinishError,
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
  const optionQueries = useRef<Record<string, string>>({});
  const optionDependencySignatures = useRef<Record<string, string>>({});
  // 两份基线分别服务选项刷新和用户清理；程序化变化刷新候选，但不冒充用户输入。
  const lastWatchedValues = useRef<DynamicFormValues>();
  const lastInteractionValues = useRef<DynamicFormValues>();
  // 首次比较从宿主输入建立基线，避免表单库为循环值生成不完整的观察副本。
  if (!lastInteractionValues.current) {
    lastInteractionValues.current = cloneValuesSnapshot(value ?? defaultValue);
  }
  const knownAsyncFields = useRef(
    new Map<string, Extract<FieldSchema, { type: 'select'; loadOptions: NonNullable<unknown> }>>(),
  );
  const visibleAsyncFields = useRef(new Set<string>());
  const retryingOptionKeys = useRef(new Set<string>());
  const searchTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const validationControllers = useRef<Record<string, AbortController>>({});
  // Form.useWatch 是 AntD 公开订阅接口，可观察 setFieldsValue 和 resetFields；
  // preserve 确保隐藏但仍保留的依赖值也参与异步选项的上下文比较。
  const watchedValues = Form.useWatch([], { form, preserve: true }) as
    DynamicFormValues | undefined;

  useEffect(() => {
    if (value !== undefined) {
      form.setFieldsValue(value as never);
      lastInteractionValues.current = cloneValuesSnapshot(value);
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
        lastInteractionValues.current = cloneValuesSnapshot(
          form.getFieldsValue(true) as DynamicFormValues,
        );
        // AntD 程序化重置不会触发 onValuesChange；从存储刷新可见性快照，
        // 保证条件字段与重置后的值一致。
        setCurrentValues(form.getFieldsValue(true));
      },
    }),
    [form],
  );

  const loadOptions = useCallback(
    async (field: Extract<FieldSchema, { type: 'select' }>, query: string, retrying = false) => {
      if (!field.loadOptions) return;
      optionQueries.current[field.key] = query;
      if (retrying) {
        if (retryingOptionKeys.current.has(field.key)) return;
        retryingOptionKeys.current.add(field.key);
      }
      const controller = new AbortController();
      optionControllers.current[field.key] = controller;
      const requestId = requestIds.current[field.key];
      setOptions((previous) => ({
        ...previous,
        [field.key]: {
          items: [],
          loading: true,
          query,
          ...(retrying
            ? {
                error: true,
                loadError: previous[field.key]?.loadError,
                retrying: true,
              }
            : {}),
        },
      }));
      try {
        // 在防抖后的实际请求时读取存储，使依赖筛选使用最新表单值，
        // 避免读取旧渲染闭包中的过期快照。
        const items = await field.loadOptions(query, form.getFieldsValue(true), controller.signal);
        if (!controller.signal.aborted && requestIds.current[field.key] === requestId) {
          setOptions((previous) => ({
            ...previous,
            [field.key]: { items, loading: false, query, recoveredFromRetry: retrying },
          }));
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted && requestIds.current[field.key] === requestId) {
          setOptions((previous) => ({
            ...previous,
            [field.key]: { items: [], loading: false, query, error: true, loadError: error },
          }));
        }
      } finally {
        // 新查询会使旧重试失效；旧请求结束时不得清除新请求的同步锁。
        if (retrying && requestIds.current[field.key] === requestId) {
          retryingOptionKeys.current.delete(field.key);
        }
      }
    },
    [form],
  );

  const retryOptions = useCallback(
    (field: Extract<FieldSchema, { type: 'select' }>, query: string) => {
      void loadOptions(field, query, true);
    },
    [loadOptions],
  );

  const scheduleOptions = useCallback(
    (field: Extract<FieldSchema, { type: 'select' }>, query: string) => {
      // 立即取消并推进请求代次，旧响应无法在防抖窗口填入下拉选项。
      // 每字段独立计时器合并快速输入，避免耦合不同选择字段。
      optionControllers.current[field.key]?.abort();
      clearTimeout(searchTimers.current[field.key]);
      requestIds.current[field.key] = (requestIds.current[field.key] ?? 0) + 1;
      optionQueries.current[field.key] = query;
      optionDependencySignatures.current[field.key] =
        field.dependencies === undefined
          ? 'all'
          : JSON.stringify(field.dependencies.map((dependency) => pathOf(dependency)));
      retryingOptionKeys.current.delete(field.key);
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

  const invalidateOptionWork = useCallback((key: string) => {
    optionControllers.current[key]?.abort();
    clearTimeout(searchTimers.current[key]);
    delete searchTimers.current[key];
    requestIds.current[key] = (requestIds.current[key] ?? 0) + 1;
    retryingOptionKeys.current.delete(key);
  }, []);

  useEffect(() => {
    if (!watchedValues) return;
    const previousValues = lastWatchedValues.current;
    lastWatchedValues.current = cloneValuesSnapshot(watchedValues);
    if (!previousValues) return;

    const snapshotChanged = !valuesEqual(previousValues, watchedValues);
    if (snapshotChanged) {
      // watcher 值可能截断循环边；用表单当前完整存储更新程序化变更基线。
      lastInteractionValues.current = cloneValuesSnapshot(
        form.getFieldsValue(true) as DynamicFormValues,
      );
    }

    let fullSnapshotChanged: boolean | undefined = snapshotChanged;
    const hasFullSnapshotChanged = (): boolean => {
      // 多个未声明依赖的 Select 共用同一次完整快照比较，避免重复序列化大表单。
      fullSnapshotChanged ??= !valuesEqual(previousValues, watchedValues);
      return fullSnapshotChanged;
    };

    schema.forEach((field) => {
      if (field.type !== 'select' || !field.loadOptions) return;
      const query = optionQueries.current[field.key];
      if (query === undefined) return;
      const dependencySignature =
        field.dependencies === undefined
          ? 'all'
          : JSON.stringify(field.dependencies.map((dependency) => pathOf(dependency)));
      const dependenciesChanged =
        optionDependencySignatures.current[field.key] !== dependencySignature;
      const contextChanged =
        field.dependencies === undefined
          ? hasFullSnapshotChanged()
          : field.dependencies.some((dependency) => {
              const path = pathOf(dependency);
              return (
                hasPath(previousValues, path) !== hasPath(watchedValues, path) ||
                !valuesEqual(readPath(previousValues, path), readPath(watchedValues, path))
              );
            });
      if (dependenciesChanged || contextChanged) scheduleOptions(field, query);
    });
  }, [form, schema, scheduleOptions, watchedValues]);

  const values = value ?? currentValues;
  useEffect(() => {
    const schemaFields = new Map(
      schema
        .filter(
          (
            field,
          ): field is Extract<FieldSchema, { type: 'select'; loadOptions: NonNullable<unknown> }> =>
            field.type === 'select' && Boolean(field.loadOptions),
        )
        .map((field) => [field.key, field]),
    );
    const nextVisible = new Set(
      [...schemaFields.values()]
        .filter((field) => isVisible(field, values))
        .map((field) => field.key),
    );
    const removedKeys: string[] = [];
    const replacedKeys = new Set<string>();

    knownAsyncFields.current.forEach((previousField, key) => {
      const currentField = schemaFields.get(key);
      if (!currentField) {
        invalidateOptionWork(key);
        delete optionQueries.current[key];
        delete optionDependencySignatures.current[key];
        removedKeys.push(key);
        return;
      }
      if (currentField.loadOptions !== previousField.loadOptions) {
        invalidateOptionWork(key);
        replacedKeys.add(key);
      }
    });

    visibleAsyncFields.current.forEach((key) => {
      if (!nextVisible.has(key) && !removedKeys.includes(key)) invalidateOptionWork(key);
    });

    nextVisible.forEach((key) => {
      const wasVisible = visibleAsyncFields.current.has(key);
      const wasReplaced = replacedKeys.has(key);
      const query = optionQueries.current[key];
      const field = schemaFields.get(key);
      if (field && query !== undefined && (!wasVisible || wasReplaced)) {
        scheduleOptions(field, query);
      }
    });

    if (removedKeys.length > 0) {
      setOptions((previous) => {
        const next = { ...previous };
        let changed = false;
        removedKeys.forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(next, key)) {
            delete next[key];
            changed = true;
          }
        });
        return changed ? next : previous;
      });
    }

    knownAsyncFields.current = schemaFields;
    visibleAsyncFields.current = nextVisible;
  }, [invalidateOptionWork, scheduleOptions, schema, values]);
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
        const previousValues =
          lastInteractionValues.current ??
          cloneValuesSnapshot(form.getFieldsValue(true) as DynamicFormValues);
        let interactionValues = cloneValuesSnapshot(form.getFieldsValue(true) as DynamicFormValues);
        let changedPaths = schema
          .filter((field) => hasPath(changed, pathOf(field.name)))
          .map((field) => pathOf(field.name));
        const clearPaths: (string | number)[][] = [];

        // 逐轮传播本次交互引起的清理，让多级级联同步失效；每个字段最多清理一次。
        let addedClear = true;
        while (addedClear) {
          addedClear = false;
          schema.forEach((field) => {
            if (
              field.type !== 'select' ||
              !field.loadOptions ||
              !field.clearOnDependencyChange ||
              !field.dependencies?.length
            ) {
              return;
            }
            const dependencyChanged = field.dependencies.some((dependency) => {
              const dependencyPath = pathOf(dependency);
              const touchedByInteraction =
                hasPath(changed, dependencyPath) ||
                changedPaths.some((changedPath) => pathsOverlap(dependencyPath, changedPath));
              if (
                !touchedByInteraction ||
                !pathValuesChanged(previousValues, interactionValues, dependencyPath)
              ) {
                return false;
              }
              return (
                hasDependencyValue(readPath(previousValues, dependencyPath)) ||
                hasDependencyValue(readPath(interactionValues, dependencyPath))
              );
            });
            if (!dependencyChanged) return;

            const fieldPath = pathOf(field.name);
            const alreadyCleared = clearPaths.some(
              (clearPath) =>
                clearPath.length === fieldPath.length &&
                clearPath.every((segment, index) => segment === fieldPath[index]),
            );
            if (alreadyCleared || hasPath(changed, fieldPath)) return;

            // 宿主可在父字段事件前用公开 Form API 原子写入新子值；保留它的同时，
            // 把该路径传播给更深一级依赖，避免旧孙级值留在表单中。
            if (
              pathValuesChanged(previousValues, interactionValues, fieldPath) &&
              (hasDependencyValue(readPath(previousValues, fieldPath)) ||
                hasDependencyValue(readPath(interactionValues, fieldPath)))
            ) {
              const alreadyReported = changedPaths.some(
                (changedPath) =>
                  changedPath.length === fieldPath.length &&
                  changedPath.every((segment, index) => segment === fieldPath[index]),
              );
              if (!alreadyReported) {
                changedPaths = [...changedPaths, fieldPath];
                addedClear = true;
              }
              return;
            }

            form.setFieldValue(fieldPath, undefined);
            interactionValues = setPathSnapshotValue(interactionValues, fieldPath, undefined);
            clearPaths.push(fieldPath);
            changedPaths = [...changedPaths, fieldPath];
            addedClear = true;
          });
        }

        let changedValues = changed as DynamicFormValues;
        let allValues = all as DynamicFormValues;
        clearPaths.forEach((path) => {
          changedValues = setPathSnapshotValue(changedValues, path, undefined);
          allValues = setPathSnapshotValue(allValues, path, undefined);
        });
        // 用户交互需在同一调用栈立即失效旧请求，避免请求恰好先于 useWatch effect 回写。
        // 基线包含 preserve 字段；公开快照保留已注册字段，并补上本次清理路径。
        // 同步更新完整快照后，公开 watcher 不会对同一变更再发起重复请求。
        lastWatchedValues.current = cloneValuesSnapshot(
          form.getFieldsValue(true) as DynamicFormValues,
        );
        lastInteractionValues.current = cloneValuesSnapshot(
          form.getFieldsValue(true) as DynamicFormValues,
        );
        setCurrentValues(allValues);
        const anyValueChanged = Object.keys(changed).length > 0;
        schema.forEach((field) => {
          if (field.type !== 'select' || !field.loadOptions) return;
          const query = optionQueries.current[field.key];
          // 未交互过的 Select 保持惰性加载；一旦发起查询，表单上下文变化就按
          // 原关键词重新加载，避免把旧快照下的异步结果留作当前候选。
          if (query === undefined) return;
          const dependencies = field.dependencies;
          const shouldReload =
            dependencies === undefined
              ? anyValueChanged
              : dependencies.some((dependency) =>
                  changedPaths.some((changedPath) => pathsOverlap(pathOf(dependency), changedPath)),
                );
          if (shouldReload) scheduleOptions(field, query);
        });
        onChange?.(changedValues, allValues);
      }}
      onFinish={(submitted) => {
        const values = submitted as DynamicFormValues;
        const activeFields = schema.filter((field) => isVisible(field, values));
        const submittedValues = omitHidden ? visibleValues(values, activeFields) : values;
        const reportError = (error: unknown): void => {
          if (!onFinishError) {
            console.error('DynamicForm 提交处理失败', error);
            return;
          }
          // 错误提示也属于宿主代码：同步抛错和异步拒绝都必须有最终兜底，
          // 不能再次调用错误回调造成递归，也不能让拒绝泄漏至全局。
          try {
            const result = onFinishError(error, submittedValues);
            void Promise.resolve(result).catch((callbackError: unknown) => {
              console.error('DynamicForm 提交失败回调执行异常', callbackError);
            });
          } catch (callbackError) {
            console.error('DynamicForm 提交失败回调执行异常', callbackError);
          }
        };
        // 保留 AntD 校验成功回调中的同步调用时序，不能先放入微任务：宿主
        // 需要在当前调用栈建立 ref 提交锁，防止 React loading 更新前重复请求。
        // 组件只兜底回调异常；loading、提交锁、过期请求和卸载后的状态保护
        // 均由宿主拥有，不自动等待、取消请求或重置字段，失败时保留原值。
        try {
          const result = onFinish?.(submittedValues);
          void Promise.resolve(result).catch(reportError);
        } catch (error) {
          reportError(error);
        }
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
            onRetry={retryOptions}
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
