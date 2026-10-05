import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Children, createRef, isValidElement } from 'react';
import type { ReactNode } from 'react';
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';
import { DynamicForm } from '../index';
import { FieldRenderer } from '../FieldRenderer';
import type {
  DynamicFormRef,
  DynamicFormValues,
  DynamicFieldOption,
  FieldSchema,
  FormRendererRegistry,
} from '../index';

// 异步 Select 的弹层和假定时器在全量并发测试中会受 worker 调度影响，单独放宽交互用例上限。
const ASYNC_SELECT_TIMEOUT = 15_000;

function getAsyncSelectChangeHandler(
  formOnChange: (...args: unknown[]) => void,
  inputOnChange: (...args: unknown[]) => void,
  onSelectValueChange: () => void,
): ((value: unknown, option: unknown) => void) | undefined {
  const field: FieldSchema = {
    key: 'city',
    name: 'city',
    type: 'select',
    label: '城市',
    loadOptions: async () => [],
    inputProps: { onChange: inputOnChange },
  };
  const rendered = FieldRenderer({
    field,
    context: {
      field,
      values: {},
      disabled: false,
      readOnly: false,
      form: {} as never,
      controlProps: {},
    },
    onChange: formOnChange,
    onSelectValueChange,
  });
  if (!isValidElement<{ children?: ReactNode }>(rendered)) {
    throw new Error('异步 Select 未生成控件容器');
  }
  const controlRow = Children.toArray(rendered.props.children)[0];
  if (!isValidElement<{ children?: ReactNode }>(controlRow)) {
    throw new Error('异步 Select 未生成输入容器');
  }
  const select = Children.toArray(controlRow.props.children)[0];
  if (!isValidElement<{ onChange?: (value: unknown, option: unknown) => void }>(select)) {
    throw new Error('异步 Select 未生成控件');
  }
  return select.props.onChange;
}

function createCyclicValue(): Record<string, unknown> {
  const value: Record<string, unknown> = {
    code: 'east',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    selectedAt: dayjs(0),
  };
  value.self = value;
  return value;
}

function createCascadeSchema(
  options: {
    clearOnDependencyChange?: boolean;
    hiddenCity?: boolean;
    thirdLevel?: boolean;
  } = {},
): FieldSchema[] {
  const schema: FieldSchema[] = [
    {
      key: 'region',
      name: ['filters', 'region'],
      type: 'custom',
      label: '地区',
      render: ({ controlProps, form }) => (
        <div>
          <button type="button" onClick={() => controlProps.onChange?.('south')}>
            更换地区
          </button>
          <button type="button" onClick={() => controlProps.onChange?.('east')}>
            设置相同地区
          </button>
          <button
            type="button"
            onClick={() => {
              form.setFieldValue(['filters', 'city'], 'shanghai');
              controlProps.onChange?.('south');
            }}
          >
            同时指定城市
          </button>
        </div>
      ),
    },
    {
      key: 'city',
      name: ['filters', 'city'],
      type: 'select',
      label: '城市',
      hidden: options.hiddenCity,
      dependencies: [['filters', 'region']],
      ...(options.clearOnDependencyChange === undefined
        ? {}
        : { clearOnDependencyChange: options.clearOnDependencyChange }),
      loadOptions: async () => [],
    },
  ];
  if (options.thirdLevel) {
    schema.push({
      key: 'district',
      name: ['filters', 'district'],
      type: 'select',
      label: '区县',
      dependencies: [['filters', 'city']],
      ...(options.clearOnDependencyChange === undefined
        ? {}
        : { clearOnDependencyChange: options.clearOnDependencyChange }),
      loadOptions: async () => [],
    });
  }
  return schema;
}

describe('DynamicForm', () => {
  it('renders fields and emits controlled changes', () => {
    const onChange = vi.fn();
    render(
      <DynamicForm
        schema={[{ key: 'name', name: 'name', type: 'text', label: '姓名' }]}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Lin' } });
    expect(onChange).toHaveBeenCalledWith({ name: 'Lin' }, { name: 'Lin' });
  });

  it('calls the Form change handler before Select inputProps.onChange with the selected option', () => {
    const calls: string[] = [];
    const formOnChange = vi.fn(() => calls.push('form'));
    const inputOnChange = vi.fn(() => calls.push('input'));
    render(
      <DynamicForm
        schema={[
          {
            key: 'city',
            name: 'city',
            type: 'select',
            label: '城市',
            options: [{ label: '杭州', value: 'hangzhou' }],
            inputProps: { onChange: inputOnChange },
          },
        ]}
        onChange={formOnChange}
      />,
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('杭州'));

    expect(calls).toEqual(['form', 'input']);
    expect(formOnChange).toHaveBeenCalledWith({ city: 'hangzhou' }, { city: 'hangzhou' });
    expect(inputOnChange).toHaveBeenCalledWith(
      'hangzhou',
      expect.objectContaining({ label: '杭州', value: 'hangzhou' }),
    );
  });

  it('异步 Select 按顺序执行 Form、inputProps 和查询清理', () => {
    const calls: string[] = [];
    const onChange = getAsyncSelectChangeHandler(
      vi.fn(() => calls.push('form')),
      vi.fn(() => calls.push('input')),
      vi.fn(() => calls.push('cleanup')),
    );

    expect(onChange).toBeTypeOf('function');
    onChange?.('hangzhou', { label: '杭州', value: 'hangzhou' });

    expect(calls).toEqual(['form', 'input', 'cleanup']);
  });

  it('Form 回调抛错后仍执行 inputProps 和查询清理，并传播首个异常', () => {
    const calls: string[] = [];
    const formError = new Error('Form change failed');
    const onChange = getAsyncSelectChangeHandler(
      vi.fn(() => {
        calls.push('form');
        throw formError;
      }),
      vi.fn(() => {
        calls.push('input');
        throw new Error('input callback also failed');
      }),
      vi.fn(() => calls.push('cleanup')),
    );

    expect(() => onChange?.('hangzhou', { label: '杭州', value: 'hangzhou' })).toThrow(formError);
    expect(calls).toEqual(['form', 'input', 'cleanup']);
  });

  it('inputProps 回调抛错后仍执行异步 Select 查询清理并传播异常', () => {
    const calls: string[] = [];
    const inputError = new Error('Select input change failed');
    const onChange = getAsyncSelectChangeHandler(
      vi.fn(() => calls.push('form')),
      vi.fn(() => {
        calls.push('input');
        throw inputError;
      }),
      vi.fn(() => calls.push('cleanup')),
    );

    expect(() => onChange?.('hangzhou', { label: '杭州', value: 'hangzhou' })).toThrow(inputError);
    expect(calls).toEqual(['form', 'input', 'cleanup']);
  });

  it('keeps async child values by default when a dependency changes', () => {
    const ref = createRef<DynamicFormRef>();
    const onChange = vi.fn();
    render(
      <DynamicForm
        ref={ref}
        schema={createCascadeSchema()}
        defaultValue={{ filters: { region: 'east', city: 'hangzhou' } }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '更换地区' }));

    expect(ref.current?.form.getFieldValue(['filters', 'city'])).toBe('hangzhou');
    expect(onChange).toHaveBeenCalledWith(
      { filters: { region: 'south' } },
      { filters: { region: 'south', city: 'hangzhou' } },
    );
  });

  it('synchronously clears nested async values before onChange and includes them in both snapshots', () => {
    const ref = createRef<DynamicFormRef>();
    let storedCity: unknown;
    const onChange = vi.fn((changed: DynamicFormValues, all: DynamicFormValues) => {
      storedCity = ref.current?.form.getFieldValue(['filters', 'city']);
      expect(changed).toEqual({ filters: { region: 'south', city: undefined } });
      expect(all).toEqual({ filters: { region: 'south', city: undefined } });
      expect(
        Object.prototype.hasOwnProperty.call(
          (all.filters as Record<string, unknown>) ?? {},
          'city',
        ),
      ).toBe(true);
    });
    render(
      <DynamicForm
        ref={ref}
        schema={createCascadeSchema({ clearOnDependencyChange: true })}
        defaultValue={{ filters: { region: 'east', city: 'hangzhou' } }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '更换地区' }));

    expect(storedCity).toBeUndefined();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('首次选择依赖值时清除已有异步子项', () => {
    const ref = createRef<DynamicFormRef>();
    render(
      <DynamicForm
        ref={ref}
        schema={createCascadeSchema({ clearOnDependencyChange: true })}
        defaultValue={{ filters: { city: 'hangzhou' } }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '更换地区' }));

    expect(ref.current?.form.getFieldValue(['filters', 'city'])).toBeUndefined();
  });

  it('does not clear an async child for a same-value dependency event', () => {
    const ref = createRef<DynamicFormRef>();
    render(
      <DynamicForm
        ref={ref}
        schema={createCascadeSchema({ clearOnDependencyChange: true })}
        defaultValue={{ filters: { region: 'east', city: 'hangzhou' } }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '设置相同地区' }));

    expect(ref.current?.form.getFieldValue(['filters', 'city'])).toBe('hangzhou');
  });

  it('自定义控件再次提交结构相等的循环依赖时不清除异步子项', () => {
    const ref = createRef<DynamicFormRef>();
    const initialRegion = createCyclicValue();
    render(
      <DynamicForm
        ref={ref}
        defaultValue={{ region: initialRegion, city: 'hangzhou' }}
        schema={[
          {
            key: 'region',
            name: 'region',
            type: 'custom',
            label: '地区',
            render: ({ controlProps }) => (
              <button type="button" onClick={() => controlProps.onChange?.(createCyclicValue())}>
                再次提交相同地区
              </button>
            ),
          },
          {
            key: 'city',
            name: 'city',
            type: 'select',
            label: '城市',
            dependencies: ['region'],
            clearOnDependencyChange: true,
            loadOptions: async () => [],
          },
        ]}
      />,
    );

    expect(ref.current?.form.getFieldValue('city')).toBe('hangzhou');
    fireEvent.click(screen.getByRole('button', { name: '再次提交相同地区' }));

    expect(ref.current?.form.getFieldValue('city')).toBe('hangzhou');
    fireEvent.click(screen.getByRole('button', { name: '再次提交相同地区' }));

    expect(ref.current?.form.getFieldValue('city')).toBe('hangzhou');
  });

  it('keeps an explicitly supplied async child value from the same interaction', () => {
    const ref = createRef<DynamicFormRef>();
    const onChange = vi.fn();
    render(
      <DynamicForm
        ref={ref}
        schema={createCascadeSchema({ clearOnDependencyChange: true })}
        defaultValue={{ filters: { region: 'east', city: 'hangzhou' } }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '同时指定城市' }));

    expect(ref.current?.form.getFieldValue(['filters', 'city'])).toBe('shanghai');
    expect(onChange.mock.calls[0][1]).toEqual({
      filters: { region: 'south', city: 'shanghai' },
    });
  });

  it('clears a stale grandchild when the parent interaction supplies a new child value', () => {
    const ref = createRef<DynamicFormRef>();
    const onChange = vi.fn();
    render(
      <DynamicForm
        ref={ref}
        schema={createCascadeSchema({ clearOnDependencyChange: true, thirdLevel: true })}
        defaultValue={{
          filters: { region: 'east', city: 'hangzhou', district: 'xihu' },
        }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '同时指定城市' }));

    expect(ref.current?.form.getFieldValue(['filters', 'city'])).toBe('shanghai');
    expect(ref.current?.form.getFieldValue(['filters', 'district'])).toBeUndefined();
    expect(onChange).toHaveBeenCalledWith(
      { filters: { region: 'south', district: undefined } },
      { filters: { region: 'south', city: 'shanghai', district: undefined } },
    );
  });

  it(
    'aborts stale async options when a user dependency change clears the selected child',
    async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        const requests: Array<{
          values: Record<string, unknown>;
          signal: AbortSignal;
          resolve: (options: DynamicFieldOption[]) => void;
        }> = [];
        const loadOptions = vi.fn(
          (_query: string, values: Record<string, unknown>, signal: AbortSignal) =>
            new Promise<DynamicFieldOption[]>((resolve) => {
              requests.push({ values, signal, resolve });
            }),
        );
        const ref = createRef<DynamicFormRef>();
        render(
          <DynamicForm
            ref={ref}
            defaultValue={{ region: 'east', city: 'hangzhou' }}
            schema={[
              {
                key: 'region',
                name: 'region',
                type: 'custom',
                label: '地区',
                render: ({ controlProps }) => (
                  <button type="button" onClick={() => controlProps.onChange?.('south')}>
                    更换地区
                  </button>
                ),
              },
              {
                key: 'city',
                name: 'city',
                type: 'select',
                label: '城市',
                dependencies: ['region'],
                clearOnDependencyChange: true,
                inputProps: { open: true },
                loadOptions,
              },
            ]}
          />,
        );

        const select = screen.getByRole('combobox');
        fireEvent.mouseDown(select);
        fireEvent.change(select, { target: { value: 'city' } });
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests).toHaveLength(1);

        fireEvent.click(screen.getByRole('button', { name: '更换地区' }));
        expect(ref.current?.form.getFieldValue('city')).toBeUndefined();
        expect(requests[0].signal.aborted).toBe(true);
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests).toHaveLength(2);
        expect(requests[1].values.region).toBe('south');
        expect(requests[1].values.city).toBeUndefined();

        await act(async () => {
          requests[1].resolve([{ label: '南区城市', value: 'south-city' }]);
          requests[0].resolve([{ label: '旧地区城市', value: 'stale-city' }]);
        });
        expect(screen.getByText('南区城市')).toBeInTheDocument();
        expect(screen.queryByText('旧地区城市')).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    },
    ASYNC_SELECT_TIMEOUT,
  );

  it('clears a hidden preserved async field and omits it from submit output', async () => {
    const ref = createRef<DynamicFormRef>();
    const onChange = vi.fn();
    const onFinish = vi.fn();
    render(
      <DynamicForm
        ref={ref}
        schema={createCascadeSchema({ clearOnDependencyChange: true, hiddenCity: true })}
        defaultValue={{ filters: { region: 'east', city: 'hangzhou' } }}
        omitHidden
        onChange={onChange}
        onFinish={onFinish}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '更换地区' }));

    expect(ref.current?.form.getFieldValue(['filters', 'city'])).toBeUndefined();
    expect(onChange.mock.calls[0][0]).toEqual({
      filters: { region: 'south', city: undefined },
    });
    expect(onChange.mock.calls[0][1]).toEqual({
      filters: { region: 'south', city: undefined },
    });
    act(() => ref.current?.submit());
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ filters: { region: 'south' } }));
  });

  it('does not clear during controlled updates or programmatic writes', async () => {
    const ref = createRef<DynamicFormRef>();
    const schema = createCascadeSchema({ clearOnDependencyChange: true });
    const initialValue = { filters: { region: 'east', city: 'hangzhou' } };
    const controlledValue = { filters: { region: 'south', city: 'shanghai' } };
    const { rerender } = render(
      <DynamicForm ref={ref} schema={schema} value={initialValue} onChange={() => undefined} />,
    );

    rerender(
      <DynamicForm ref={ref} schema={schema} value={controlledValue} onChange={() => undefined} />,
    );
    await waitFor(() => {
      expect(ref.current?.form.getFieldValue(['filters', 'city'])).toBe('shanghai');
    });

    act(() => {
      ref.current?.form.setFieldsValue({ filters: { region: 'west', city: 'nanjing' } });
    });

    expect(ref.current?.form.getFieldValue(['filters', 'city'])).toBe('nanjing');
  });

  it('restores initial parent and child values on reset without clearing them', () => {
    const ref = createRef<DynamicFormRef>();
    render(
      <DynamicForm
        ref={ref}
        schema={createCascadeSchema({ clearOnDependencyChange: true })}
        defaultValue={{ filters: { region: 'east', city: 'hangzhou' } }}
      />,
    );

    act(() => {
      ref.current?.form.setFieldsValue({ filters: { region: 'south', city: 'shanghai' } });
      ref.current?.reset();
    });

    expect(ref.current?.form.getFieldValue(['filters', 'region'])).toBe('east');
    expect(ref.current?.form.getFieldValue(['filters', 'city'])).toBe('hangzhou');
  });

  it('uses inputProps placeholders unless a top-level placeholder is provided', () => {
    render(
      <DynamicForm
        schema={[
          {
            key: 'name',
            name: 'name',
            type: 'text',
            label: '姓名',
            inputProps: { placeholder: '控件占位提示' },
          },
          {
            key: 'code',
            name: 'code',
            type: 'text',
            label: '代码',
            placeholder: '字段占位提示',
            inputProps: { placeholder: '不会覆盖字段占位提示' },
          },
          {
            key: 'description',
            name: 'description',
            type: 'textarea',
            label: '描述',
            inputProps: { placeholder: '控件占位提示' },
          },
          {
            key: 'note',
            name: 'note',
            type: 'textarea',
            label: '备注',
            placeholder: '字段占位提示',
            inputProps: { placeholder: '不会覆盖字段占位提示' },
          },
        ]}
      />,
    );

    expect(screen.getByRole('textbox', { name: '姓名' })).toHaveAttribute(
      'placeholder',
      '控件占位提示',
    );
    expect(screen.getByRole('textbox', { name: '代码' })).toHaveAttribute(
      'placeholder',
      '字段占位提示',
    );
    expect(screen.getByRole('textbox', { name: '描述' })).toHaveAttribute(
      'placeholder',
      '控件占位提示',
    );
    expect(screen.getByRole('textbox', { name: '备注' })).toHaveAttribute(
      'placeholder',
      '字段占位提示',
    );
  });

  it('keeps host actions after generated fields', () => {
    render(
      <DynamicForm schema={[{ key: 'name', name: 'name', type: 'text', label: '姓名' }]}>
        <button type="submit">保存</button>
      </DynamicForm>,
    );
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
  });

  it('renders conditional fields from current values', () => {
    render(
      <DynamicForm
        schema={[
          { key: 'enabled', name: 'enabled', type: 'switch', label: '启用' },
          {
            key: 'detail',
            name: 'detail',
            type: 'text',
            label: '详情',
            visible: (values) => values.enabled === true,
          },
        ]}
      />,
    );
    expect(screen.queryByRole('textbox', { name: '详情' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('recomputes conditional fields after an imperative reset', () => {
    const ref = createRef<DynamicFormRef>();
    render(
      <DynamicForm
        ref={ref}
        schema={[
          {
            key: 'level',
            name: 'level',
            type: 'select',
            label: '等级',
            options: [
              { label: '普通', value: 'standard' },
              { label: '重点', value: 'priority' },
            ],
          },
          {
            key: 'owner',
            name: 'owner',
            type: 'text',
            label: '专属负责人',
            visible: (values) => values.level === 'priority',
          },
        ]}
        defaultValue={{ level: 'standard' }}
      />,
    );
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('重点'));
    expect(screen.getByRole('textbox', { name: '专属负责人' })).toBeInTheDocument();
    act(() => ref.current?.reset());
    expect(screen.queryByRole('textbox', { name: '专属负责人' })).not.toBeInTheDocument();
    expect(ref.current?.form.getFieldValue('level')).toBe('standard');
  });

  it('exposes loading, error and empty semantics', () => {
    const { rerender } = render(<DynamicForm schema={[]} loading />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    rerender(<DynamicForm schema={[]} error="加载失败" />);
    expect(screen.getByRole('alert')).toHaveTextContent('加载失败');
    rerender(<DynamicForm schema={[]} empty="没有字段" />);
    expect(screen.getByRole('status')).toHaveTextContent('没有字段');
  });

  it('preserves the field node, value and focus through loading and error', () => {
    const schema: FieldSchema[] = [{ key: 'name', name: 'name', type: 'text', label: '姓名' }];
    const { rerender } = render(<DynamicForm schema={schema} />);
    const input = screen.getByRole('textbox', { name: '姓名' });
    fireEvent.change(input, { target: { value: 'Lin' } });
    act(() => input.focus());

    rerender(<DynamicForm schema={schema} loading />);
    expect(screen.getByRole('status')).toHaveTextContent('正在处理');
    expect(screen.getByRole('textbox', { name: '姓名' })).toBe(input);
    expect(input).toHaveValue('Lin');
    expect(input).toHaveFocus();

    rerender(<DynamicForm schema={schema} error="保存失败，请重试" />);
    expect(screen.getByRole('alert')).toHaveTextContent('保存失败，请重试');
    expect(screen.getByRole('textbox', { name: '姓名' })).toBe(input);
    expect(input).toHaveFocus();
  });

  it('keeps nested paths and omits hidden fields on submit', async () => {
    const onFinish = vi.fn();
    const ref = createRef<DynamicFormRef>();
    const schema: FieldSchema[] = [
      { key: 'phone', name: ['customer', 'phone'], type: 'text', label: '电话' },
      { key: 'secret', name: 'secret', type: 'text', label: '内部字段', hidden: true },
    ];
    render(
      <DynamicForm
        ref={ref}
        schema={schema}
        defaultValue={{ customer: { phone: '123' }, secret: 'private' }}
        omitHidden
        onFinish={onFinish}
      />,
    );
    ref.current?.submit();
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ customer: { phone: '123' } }));
  });

  it('calls onFinishError with submitted values when onFinish rejects', async () => {
    const error = new Error('保存失败');
    const onFinish = vi.fn().mockRejectedValue(error);
    const onFinishError = vi.fn();
    const ref = createRef<DynamicFormRef>();
    render(
      <DynamicForm
        ref={ref}
        schema={[{ key: 'name', name: 'name', type: 'text', label: '姓名' }]}
        defaultValue={{ name: 'Lin' }}
        onFinish={onFinish}
        onFinishError={onFinishError}
      />,
    );

    await act(async () => ref.current?.submit());
    await waitFor(() => expect(onFinishError).toHaveBeenCalledWith(error, { name: 'Lin' }));
  });

  it('logs rejected onFinish when no error callback is provided', async () => {
    const error = new Error('网络失败');
    const onFinish = vi.fn().mockRejectedValue(error);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const ref = createRef<DynamicFormRef>();
    render(
      <DynamicForm
        ref={ref}
        schema={[{ key: 'name', name: 'name', type: 'text', label: '姓名' }]}
        onFinish={onFinish}
      />,
    );

    await act(async () => ref.current?.submit());
    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith('DynamicForm 提交处理失败', error),
    );
    consoleError.mockRestore();
  });

  it('captures synchronous onFinish errors', async () => {
    const error = new Error('同步失败');
    const onFinishError = vi.fn();
    const ref = createRef<DynamicFormRef>();
    render(
      <DynamicForm
        ref={ref}
        schema={[{ key: 'name', name: 'name', type: 'text', label: '姓名' }]}
        onFinish={() => {
          throw error;
        }}
        onFinishError={onFinishError}
      />,
    );

    await act(async () => ref.current?.submit());
    await waitFor(() => expect(onFinishError).toHaveBeenCalledWith(error, {}));
  });

  it('does not leak a rejected onFinishError promise', async () => {
    const callbackError = new Error('错误回调失败');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const ref = createRef<DynamicFormRef>();
    render(
      <DynamicForm
        ref={ref}
        schema={[{ key: 'name', name: 'name', type: 'text', label: '姓名' }]}
        onFinish={vi.fn().mockRejectedValue(new Error('保存失败'))}
        onFinishError={vi.fn().mockRejectedValue(callbackError)}
      />,
    );

    await act(async () => ref.current?.submit());
    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith('DynamicForm 提交失败回调执行异常', callbackError),
    );
    consoleError.mockRestore();
  });

  it('forwards controlled props to a local custom renderer', () => {
    const onChange = vi.fn();
    const registry: FormRendererRegistry = {
      register: vi.fn(),
      resolve:
        () =>
        ({ controlProps }) => (
          <input
            aria-label="自定义编码"
            id={controlProps.id}
            value={String(controlProps.value ?? '')}
            onChange={(event) => controlProps.onChange?.(event)}
          />
        ),
    };
    render(
      <DynamicForm
        schema={[{ key: 'code', name: 'code', type: 'custom', renderer: 'code', label: '编码' }]}
        rendererRegistry={registry}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByRole('textbox', { name: '自定义编码' }), {
      target: { value: 'LX-01' },
    });
    expect(onChange).toHaveBeenCalledWith({ code: 'LX-01' }, { code: 'LX-01' });
  });

  it('passes the form-level disabled state to custom renderers', () => {
    const renderer = vi.fn(({ controlProps, disabled }) => (
      <input
        aria-label="自定义编码"
        data-disabled={String(disabled)}
        id={controlProps.id}
        value={String(controlProps.value ?? '')}
        onChange={(event) => controlProps.onChange?.(event)}
      />
    ));
    const registry: FormRendererRegistry = {
      register: vi.fn(),
      resolve: () => renderer,
    };
    const schema: FieldSchema[] = [
      { key: 'code', name: 'code', type: 'custom', renderer: 'code', label: '编码' },
    ];
    const { rerender } = render(
      <DynamicForm schema={schema} rendererRegistry={registry} disabled />,
    );

    expect(screen.getByRole('textbox', { name: '自定义编码' })).toHaveAttribute(
      'data-disabled',
      'true',
    );
    expect(renderer).toHaveBeenLastCalledWith(expect.objectContaining({ disabled: true }));

    rerender(<DynamicForm schema={schema} rendererRegistry={registry} />);
    expect(screen.getByRole('textbox', { name: '自定义编码' })).toHaveAttribute(
      'data-disabled',
      'false',
    );
    expect(renderer).toHaveBeenLastCalledWith(expect.objectContaining({ disabled: false }));
  });

  it('renders a local upload trigger and keeps read-only controls inert', () => {
    render(
      <DynamicForm
        schema={[
          { key: 'attachment', name: 'attachment', type: 'upload', label: '附件' },
          { key: 'amount', name: 'amount', type: 'number', label: '金额', readOnly: true },
        ]}
      />,
    );
    expect(screen.getByRole('button', { name: '选择文件' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: '金额' })).toBeDisabled();
  });

  it('runs independent async rules without aborting each other', async () => {
    const onFinish = vi.fn();
    const ref = createRef<DynamicFormRef>();
    const signals: AbortSignal[] = [];
    const validator = vi.fn(async (_value: unknown, context: { signal: AbortSignal }) => {
      signals.push(context.signal);
    });
    render(
      <DynamicForm
        ref={ref}
        schema={[
          {
            key: 'code',
            name: 'code',
            type: 'text',
            label: '编码',
            rules: [{ validator }, { validator }],
          },
        ]}
        onFinish={onFinish}
      />,
    );
    await act(async () => ref.current?.submit());
    await waitFor(() => expect(onFinish).toHaveBeenCalled());
    expect(signals).toHaveLength(2);
    expect(signals.every((signal) => !signal.aborted)).toBe(true);
  });

  it(
    'uses the latest async select options when requests finish out of order',
    async () => {
      // 显式推进业务200ms防抖，避免全量并发测试的实际时钟负载影响请求启动。
      // 仅接管超时计时器，保留组件库其它调度；finally恢复，避免污染后续测试。
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        const pending: Record<string, (options: DynamicFieldOption[]) => void> = {};
        const loadOptions = vi.fn(
          (query: string) =>
            new Promise<DynamicFieldOption[]>((resolve) => {
              pending[query] = resolve;
            }),
        );
        render(
          <DynamicForm
            schema={[{ key: 'city', name: 'city', type: 'select', label: '城市', loadOptions }]}
          />,
        );
        fireEvent.mouseDown(screen.getByRole('combobox'));
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'sh' } });
        expect(loadOptions).not.toHaveBeenCalled();
        act(() => vi.advanceTimersByTime(199));
        expect(loadOptions).not.toHaveBeenCalled();
        act(() => vi.advanceTimersByTime(1));
        expect(loadOptions).toHaveBeenCalledTimes(1);
        expect(pending.sh).toBeTypeOf('function');
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'sha' } });
        act(() => vi.advanceTimersByTime(200));
        expect(loadOptions).toHaveBeenCalledTimes(2);
        expect(pending.sha).toBeTypeOf('function');
        await act(async () => {
          pending.sha([{ label: '上海', value: 'shanghai' }]);
          pending.sh([{ label: '旧结果', value: 'old' }]);
        });
        expect(screen.getByText('上海')).toBeInTheDocument();
        expect(screen.queryByText('旧结果')).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    },
    ASYNC_SELECT_TIMEOUT,
  );

  it(
    '依赖值切换和清空时保留查询并阻止忽略取消信号的旧结果回写',
    async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        const requests: Array<{
          query: string;
          values: Record<string, unknown>;
          signal: AbortSignal;
          resolve: (options: DynamicFieldOption[]) => void;
        }> = [];
        const loadOptions = vi.fn(
          (query: string, values: Record<string, unknown>, signal: AbortSignal) =>
            new Promise<DynamicFieldOption[]>((resolve) => {
              // 模拟不理会 AbortSignal 的旧适配器；只有 requestId 能阻止它乱序回写。
              requests.push({ query, values, signal, resolve });
            }),
        );
        render(
          <DynamicForm
            defaultValue={{ region: 'A' }}
            schema={[
              {
                key: 'region',
                name: 'region',
                type: 'custom',
                label: '地区',
                render: ({ controlProps }) => (
                  <div>
                    <button type="button" onClick={() => controlProps.onChange?.('B')}>
                      切换到 B
                    </button>
                    <button type="button" onClick={() => controlProps.onChange?.(undefined)}>
                      清空地区
                    </button>
                  </div>
                ),
              },
              {
                key: 'city',
                name: 'city',
                type: 'select',
                label: '城市',
                dependencies: ['region'],
                inputProps: { open: true },
                loadOptions,
              },
            ]}
          />,
        );

        const select = screen.getByRole('combobox');
        fireEvent.mouseDown(select);
        fireEvent.change(select, { target: { value: 'city' } });
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests).toHaveLength(1);
        expect(requests[0].values.region).toBe('A');

        fireEvent.click(screen.getByRole('button', { name: '切换到 B' }));
        expect(requests[0].signal.aborted).toBe(true);
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests).toHaveLength(2);
        expect(requests[1].query).toBe('city');
        expect(requests[1].values.region).toBe('B');

        await act(async () => {
          requests[1].resolve([{ label: 'B 地区城市', value: 'b-city' }]);
          requests[0].resolve([{ label: 'A 地区城市', value: 'a-city' }]);
        });
        expect(screen.getByText('B 地区城市')).toBeInTheDocument();
        expect(screen.queryByText('A 地区城市')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: '清空地区' }));
        expect(requests[1].signal.aborted).toBe(true);
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests).toHaveLength(3);
        expect(requests[2].query).toBe('city');
        expect(requests[2].values.region).toBeUndefined();

        await act(async () => {
          requests[2].resolve([{ label: '未指定地区城市', value: 'unknown-city' }]);
        });
        expect(screen.getByText('未指定地区城市')).toBeInTheDocument();
        expect(screen.queryByText('B 地区城市')).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    },
    ASYNC_SELECT_TIMEOUT,
  );

  it(
    '未声明 dependencies 时随完整表单快照变化重载并忽略旧请求',
    async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        const requests: Array<{
          values: Record<string, unknown>;
          resolve: (options: DynamicFieldOption[]) => void;
        }> = [];
        const loadOptions = vi.fn(
          (_query: string, values: Record<string, unknown>) =>
            new Promise<DynamicFieldOption[]>((resolve) => {
              requests.push({ values, resolve });
            }),
        );
        render(
          <DynamicForm
            defaultValue={{ region: 'A' }}
            schema={[
              {
                key: 'region',
                name: 'region',
                type: 'custom',
                label: '地区',
                render: ({ controlProps }) => (
                  <button type="button" onClick={() => controlProps.onChange?.('B')}>
                    切换到 B
                  </button>
                ),
              },
              {
                key: 'city',
                name: 'city',
                type: 'select',
                label: '城市',
                inputProps: { open: true },
                loadOptions,
              },
            ]}
          />,
        );

        const select = screen.getByRole('combobox');
        fireEvent.mouseDown(select);
        fireEvent.change(select, { target: { value: 'city' } });
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests).toHaveLength(1);
        expect(requests[0].values.region).toBe('A');

        fireEvent.click(screen.getByRole('button', { name: '切换到 B' }));
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests).toHaveLength(2);
        expect(requests[1].values.region).toBe('B');

        await act(async () => {
          requests[1].resolve([{ label: 'B 地区城市', value: 'b-city' }]);
          requests[0].resolve([{ label: 'A 地区城市', value: 'a-city' }]);
        });
        expect(screen.getByText('B 地区城市')).toBeInTheDocument();
        expect(screen.queryByText('A 地区城市')).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    },
    ASYNC_SELECT_TIMEOUT,
  );

  it(
    '公开表单写值、受控回填和实例重置都会使异步选项上下文失效',
    async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        const requests: Array<{
          values: Record<string, unknown>;
          signal: AbortSignal;
          resolve: (options: DynamicFieldOption[]) => void;
        }> = [];
        const loadOptions = vi.fn(
          (_query: string, values: Record<string, unknown>, signal: AbortSignal) =>
            new Promise<DynamicFieldOption[]>((resolve) => {
              requests.push({ values, signal, resolve });
            }),
        );
        const ref = createRef<DynamicFormRef>();
        const schema: FieldSchema[] = [
          { key: 'region', name: 'region', type: 'text', label: '地区' },
          {
            key: 'city',
            name: 'city',
            type: 'select',
            label: '城市',
            dependencies: ['region'],
            inputProps: { open: true },
            loadOptions,
          },
        ];
        const { rerender } = render(
          <DynamicForm ref={ref} defaultValue={{ region: 'A' }} schema={schema} />,
        );
        const select = screen.getByRole('combobox');
        fireEvent.mouseDown(select);
        fireEvent.change(select, { target: { value: 'city' } });
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests).toHaveLength(1);

        act(() => ref.current?.form.setFieldsValue({ region: 'B' }));
        expect(requests[0].signal.aborted).toBe(true);
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests[1].values.region).toBe('B');

        act(() => ref.current?.reset());
        expect(requests[1].signal.aborted).toBe(true);
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests[2].values.region).toBe('A');

        rerender(
          <DynamicForm
            ref={ref}
            value={{ region: 'C' }}
            onChange={() => undefined}
            schema={schema}
          />,
        );
        expect(requests[2].signal.aborted).toBe(true);
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests[3].values.region).toBe('C');

        await act(async () => {
          requests[3].resolve([{ label: '受控地区城市', value: 'controlled-city' }]);
          requests[2].resolve([{ label: '过期重置城市', value: 'stale-city' }]);
        });
        expect(screen.getByText('受控地区城市')).toBeInTheDocument();
        expect(screen.queryByText('过期重置城市')).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    },
    ASYNC_SELECT_TIMEOUT,
  );

  it(
    '显式空 dependencies 不随表单值重载',
    async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        const requests: Array<{
          signal: AbortSignal;
          resolve: (options: DynamicFieldOption[]) => void;
        }> = [];
        const loadOptions = vi.fn(
          (_query: string, _values: Record<string, unknown>, signal: AbortSignal) =>
            new Promise<DynamicFieldOption[]>((resolve) => {
              requests.push({ signal, resolve });
            }),
        );
        render(
          <DynamicForm
            schema={[
              { key: 'region', name: 'region', type: 'text', label: '地区' },
              {
                key: 'city',
                name: 'city',
                type: 'select',
                label: '城市',
                dependencies: [],
                inputProps: { open: true },
                loadOptions,
              },
            ]}
          />,
        );

        const select = screen.getByRole('combobox');
        fireEvent.mouseDown(select);
        fireEvent.change(select, { target: { value: 'city' } });
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests).toHaveLength(1);

        fireEvent.change(screen.getByRole('textbox', { name: '地区' }), {
          target: { value: '东区' },
        });
        expect(requests[0].signal.aborted).toBe(false);
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests).toHaveLength(1);

        await act(async () => {
          requests[0].resolve([{ label: '静态上下文候选', value: 'city-a' }]);
        });
        expect(screen.getByText('静态上下文候选')).toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    },
    ASYNC_SELECT_TIMEOUT,
  );

  it(
    '变化隐藏的 preserve 嵌套依赖时重载，但编辑无关字段不重载且保留 onChange all 语义',
    async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        const requests: Array<{
          values: Record<string, unknown>;
          signal: AbortSignal;
          resolve: (options: DynamicFieldOption[]) => void;
        }> = [];
        const loadOptions = vi.fn(
          (_query: string, values: Record<string, unknown>, signal: AbortSignal) =>
            new Promise<DynamicFieldOption[]>((resolve) => {
              requests.push({ values, signal, resolve });
            }),
        );
        const onChange = vi.fn();
        const ref = createRef<DynamicFormRef>();
        render(
          <DynamicForm
            ref={ref}
            defaultValue={{ filters: { region: 'A' } }}
            onChange={onChange}
            schema={[
              {
                key: 'region',
                name: ['filters', 'region'],
                type: 'text',
                label: '地区筛选',
                hidden: true,
              },
              { key: 'note', name: 'note', type: 'text', label: '备注' },
              {
                key: 'city',
                name: 'city',
                type: 'select',
                label: '城市',
                dependencies: [['filters', 'region']],
                inputProps: { open: true },
                loadOptions,
              },
            ]}
          />,
        );

        const select = screen.getByRole('combobox');
        fireEvent.mouseDown(select);
        fireEvent.change(select, { target: { value: 'city' } });
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests).toHaveLength(1);
        expect((requests[0].values.filters as Record<string, unknown>).region).toBe('A');

        act(() => ref.current?.form.setFieldsValue({ filters: { region: 'B' } }));
        expect(requests[0].signal.aborted).toBe(true);
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests).toHaveLength(2);
        expect((requests[1].values.filters as Record<string, unknown>).region).toBe('B');

        fireEvent.change(screen.getByRole('textbox', { name: '备注' }), {
          target: { value: '独立编辑' },
        });
        expect(onChange).toHaveBeenLastCalledWith({ note: '独立编辑' }, { note: '独立编辑' });
        expect(requests[1].signal.aborted).toBe(false);
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests).toHaveLength(2);
      } finally {
        vi.useRealTimers();
      }
    },
    ASYNC_SELECT_TIMEOUT,
  );

  it(
    '隐藏异步 Select 时取消请求，重新显示时按保留查询刷新候选',
    async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        const requests: Array<{
          query: string;
          signal: AbortSignal;
          resolve: (items: DynamicFieldOption[]) => void;
        }> = [];
        const loadOptions = vi.fn(
          (query: string, _values: Record<string, unknown>, signal: AbortSignal) =>
            new Promise<DynamicFieldOption[]>((resolve) => {
              requests.push({ query, signal, resolve });
            }),
        );
        render(
          <DynamicForm
            defaultValue={{ showCity: true }}
            schema={[
              { key: 'showCity', name: 'showCity', type: 'switch', label: '显示城市' },
              {
                key: 'city',
                name: 'city',
                type: 'select',
                label: '城市',
                visible: (values) => values.showCity === true,
                inputProps: { open: true },
                loadOptions,
              },
            ]}
          />,
        );

        const switchControl = screen.getByRole('switch', { name: '显示城市' });
        const select = screen.getByRole('combobox');
        fireEvent.mouseDown(select);
        fireEvent.change(select, { target: { value: '杭州' } });
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests).toHaveLength(1);

        fireEvent.click(switchControl);
        expect(requests[0].signal.aborted).toBe(true);
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('switch', { name: '显示城市' }));
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(requests).toHaveLength(2);
        expect(requests[1].query).toBe('杭州');

        await act(async () => {
          requests[1].resolve([{ label: '最新候选', value: 'new' }]);
          requests[0].resolve([{ label: '过期候选', value: 'old' }]);
        });
        expect(screen.getByText('最新候选')).toBeInTheDocument();
        expect(screen.queryByText('过期候选')).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    },
    ASYNC_SELECT_TIMEOUT,
  );

  it(
    'schema 移除异步字段时取消请求并清除查询与旧错误状态',
    async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        const loadOptions = vi
          .fn<(query: string) => Promise<DynamicFieldOption[]>>()
          .mockRejectedValueOnce(new Error('offline'))
          .mockResolvedValueOnce([]);
        const schema: FieldSchema[] = [
          {
            key: 'city',
            name: 'city',
            type: 'select',
            label: '城市',
            inputProps: { open: true },
            loadOptions,
          },
        ];
        const { rerender } = render(<DynamicForm schema={schema} />);
        const select = screen.getByRole('combobox');
        fireEvent.mouseDown(select);
        fireEvent.change(select, { target: { value: '旧查询' } });
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(loadOptions).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('alert')).toHaveTextContent('选项加载失败');

        rerender(<DynamicForm schema={[]} />);
        rerender(<DynamicForm schema={schema} />);
        expect(screen.queryByRole('button', { name: /重试选项/ })).not.toBeInTheDocument();
        expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-busy', 'true');
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(loadOptions).toHaveBeenCalledTimes(1);

        fireEvent.change(screen.getByRole('combobox'), { target: { value: '新查询' } });
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(loadOptions).toHaveBeenLastCalledWith(
          '新查询',
          expect.any(Object),
          expect.any(AbortSignal),
        );
      } finally {
        vi.useRealTimers();
      }
    },
    ASYNC_SELECT_TIMEOUT,
  );

  it(
    '同 key 替换 loadOptions 时取消旧请求并使用原查询调用新加载器',
    async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        const oldRequests: Array<{
          signal: AbortSignal;
          resolve: (items: DynamicFieldOption[]) => void;
        }> = [];
        const newRequests: Array<{
          query: string;
          resolve: (items: DynamicFieldOption[]) => void;
        }> = [];
        const oldLoader = vi.fn(
          (_query: string, _values: Record<string, unknown>, signal: AbortSignal) =>
            new Promise<DynamicFieldOption[]>((resolve) => {
              oldRequests.push({ signal, resolve });
            }),
        );
        const newLoader = vi.fn(
          (query: string) =>
            new Promise<DynamicFieldOption[]>((resolve) => {
              newRequests.push({ query, resolve });
            }),
        );
        const createSchema = (loadOptions: typeof oldLoader): FieldSchema[] => [
          {
            key: 'city',
            name: 'city',
            type: 'select',
            label: '城市',
            inputProps: { open: true },
            loadOptions,
          },
        ];
        const { rerender } = render(<DynamicForm schema={createSchema(oldLoader)} />);
        const select = screen.getByRole('combobox');
        fireEvent.mouseDown(select);
        fireEvent.change(select, { target: { value: '杭州' } });
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(oldRequests).toHaveLength(1);

        rerender(<DynamicForm schema={createSchema(newLoader as typeof oldLoader)} />);
        expect(oldRequests[0].signal.aborted).toBe(true);
        await act(async () => vi.advanceTimersByTimeAsync(200));
        expect(newRequests).toHaveLength(1);
        expect(newRequests[0].query).toBe('杭州');

        await act(async () => {
          newRequests[0].resolve([{ label: '新加载器候选', value: 'new' }]);
          oldRequests[0].resolve([{ label: '旧加载器候选', value: 'old' }]);
        });
        expect(screen.getByText('新加载器候选')).toBeInTheDocument();
        expect(screen.queryByText('旧加载器候选')).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    },
    ASYNC_SELECT_TIMEOUT,
  );

  // 并行全量测试下，AntD portal 与异步请求会争用定时资源，因此仅为该恢复路径留出局部预算。
  it('clears stale search choices on failure and retries the failed query', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      let resolveRetry: ((options: DynamicFieldOption[]) => void) | undefined;
      const loadOptions = vi
        .fn<(query: string) => Promise<DynamicFieldOption[]>>()
        .mockResolvedValueOnce([{ label: '旧城市', value: 'old' }])
        .mockRejectedValueOnce(new Error('offline'))
        .mockImplementationOnce(
          () =>
            new Promise<DynamicFieldOption[]>((resolve) => {
              resolveRetry = resolve;
            }),
        );
      const ref = createRef<DynamicFormRef>();
      const finish = vi.fn();
      render(
        <DynamicForm
          ref={ref}
          schema={[
            {
              key: 'city',
              name: 'city',
              type: 'select',
              label: '城市',
              inputProps: { open: true },
              loadOptions,
            },
          ]}
          onFinish={finish}
        />,
      );
      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      fireEvent.change(select, { target: { value: 'old' } });
      expect(screen.queryByRole('button', { name: '重试' })).not.toBeInTheDocument();
      expect(screen.getByText('正在加载选项…')).toBeInTheDocument();
      expect(select).toHaveAttribute('aria-busy', 'true');
      await act(async () => vi.advanceTimersByTimeAsync(200));
      expect(screen.getByText('旧城市')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent('已找到 1 个选项。');

      fireEvent.change(select, { target: { value: 'bei' } });
      expect(screen.queryByText('旧城市')).not.toBeInTheDocument();
      expect(screen.getByText('正在加载选项…')).toBeInTheDocument();
      await act(async () => vi.advanceTimersByTimeAsync(200));
      const retry = screen.getByRole('button', { name: /重试选项\s*城市/ });
      const alert = screen.getByRole('alert');
      expect(screen.queryByText('旧城市')).not.toBeInTheDocument();
      expect(alert).toHaveTextContent('选项加载失败');
      expect(alert).not.toHaveTextContent('offline');
      expect(alert).toBeVisible();
      expect(alert.id).not.toBe('');
      expect(retry).toHaveAttribute('aria-describedby', alert.id);
      const errorCopies = screen.getAllByText('选项加载失败。搜索内容已保留，请重试。');
      expect(errorCopies).toHaveLength(2);
      expect(errorCopies.some((message) => message.closest('[aria-hidden="true"]'))).toBe(true);
      expect(retry).toBeVisible();
      expect(retry.parentElement).toContainElement(select);
      expect(screen.getByRole('combobox')).toBe(select);
      expect(retry.tabIndex).toBe(0);
      act(() => retry.focus());
      expect(retry).toHaveFocus();

      fireEvent.click(retry);
      expect(loadOptions).toHaveBeenCalledTimes(3);
      expect(screen.getByRole('button', { name: /正在重试选项\s*城市/ })).toBe(retry);
      expect(retry).toHaveAttribute('aria-disabled', 'true');
      expect(retry).toHaveAttribute('aria-busy', 'true');
      expect(retry).toHaveAttribute('aria-describedby', alert.id);
      expect(retry).toBeInTheDocument();
      expect(retry).toHaveFocus();
      expect(screen.getByRole('status')).toHaveTextContent('正在重新加载选项。');

      fireEvent.click(retry);
      expect(loadOptions).toHaveBeenCalledTimes(3);
      expect(retry).toHaveFocus();
      expect(resolveRetry).toBeTypeOf('function');
      await act(async () => {
        resolveRetry?.([{ label: '北京', value: 'beijing' }]);
      });

      expect(screen.getByText('北京')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /重试/ })).not.toBeInTheDocument();
      expect(screen.queryByText('正在重新加载选项。')).not.toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(
        '重试成功，已找到 1 个选项。请重新展开列表选择。',
      );
      expect(screen.getByRole('status')).toBeVisible();
      expect(loadOptions).toHaveBeenLastCalledWith(
        'bei',
        expect.any(Object),
        expect.any(AbortSignal),
      );
      fireEvent.click(screen.getByText('北京'));
      vi.useRealTimers();
      await act(async () => ref.current?.submit());
      expect(finish).toHaveBeenCalledWith({ city: 'beijing' });
    } finally {
      vi.useRealTimers();
    }
  }, 15_000);

  it(
    '把异步选项拒绝原因映射为与重试按钮关联的字段错误',
    async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        const failure = new Error('内部服务地址及响应详情');
        const loadOptions = vi
          .fn<() => Promise<DynamicFieldOption[]>>()
          .mockRejectedValueOnce(failure);
        const loadOptionsError = vi.fn((error: unknown, query: string) =>
          error === failure && query === '杭州' ? '杭州供应商暂不可用，请稍后重试。' : undefined,
        );
        render(
          <DynamicForm
            schema={[
              {
                key: 'supplier',
                name: 'supplier',
                type: 'select',
                label: '供应商',
                inputProps: { open: true },
                loadOptions,
                loadOptionsError,
              },
            ]}
          />,
        );

        const select = screen.getByRole('combobox');
        fireEvent.mouseDown(select);
        fireEvent.change(select, { target: { value: '杭州' } });
        await act(async () => vi.advanceTimersByTimeAsync(200));

        const alert = screen.getByRole('alert');
        const retry = screen.getByRole('button', { name: /重试选项\s*供应商/ });
        expect(loadOptionsError).toHaveBeenCalledWith(failure, '杭州');
        expect(alert).toHaveTextContent('杭州供应商暂不可用，请稍后重试。');
        expect(alert).not.toHaveTextContent('内部服务地址及响应详情');
        expect(retry).toHaveAttribute('aria-describedby', alert.id);
      } finally {
        vi.useRealTimers();
      }
    },
    ASYNC_SELECT_TIMEOUT,
  );

  it.each([null, undefined])(
    'loadOptionsError 返回 %s 时回退到通用错误文案',
    async (errorContent) => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        const loadOptions = vi
          .fn<() => Promise<DynamicFieldOption[]>>()
          .mockRejectedValueOnce(new Error('不可显示的原始异常'));
        render(
          <DynamicForm
            schema={[
              {
                key: 'city',
                name: 'city',
                type: 'select',
                label: '城市',
                inputProps: { open: true },
                loadOptions,
                loadOptionsError: () => errorContent,
              },
            ]}
          />,
        );

        const select = screen.getByRole('combobox');
        fireEvent.mouseDown(select);
        fireEvent.change(select, { target: { value: '杭州' } });
        await act(async () => vi.advanceTimersByTimeAsync(200));

        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('选项加载失败。搜索内容已保留，请重试。');
        expect(alert).not.toHaveTextContent('不可显示的原始异常');
      } finally {
        vi.useRealTimers();
      }
    },
    ASYNC_SELECT_TIMEOUT,
  );

  it('区分异步 Select 的首次加载状态与成功空结果', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const loadOptions = vi
        .fn<(query: string) => Promise<DynamicFieldOption[]>>()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      render(
        <DynamicForm
          schema={[
            {
              key: 'supplier',
              name: 'supplier',
              type: 'select',
              label: '供应商',
              inputProps: { open: true },
              loadOptions,
            },
          ]}
        />,
      );

      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      fireEvent.change(select, { target: { value: '不存在的供应商' } });
      expect(screen.getByText('正在加载选项…')).toBeInTheDocument();
      expect(select).toHaveAttribute('aria-busy', 'true');

      await act(async () => vi.advanceTimersByTimeAsync(200));
      expect(loadOptions).toHaveBeenCalledWith(
        '不存在的供应商',
        expect.any(Object),
        expect.any(AbortSignal),
      );
      expect(screen.getByRole('listbox')).toHaveTextContent(
        '没有找到匹配选项，请调整关键词后重新搜索。',
      );
      expect(screen.getByRole('status')).toHaveTextContent(
        '没有找到匹配选项，请调整关键词后重新搜索。',
      );

      fireEvent.change(select, { target: { value: '' } });
      await act(async () => vi.advanceTimersByTimeAsync(200));
      expect(loadOptions).toHaveBeenLastCalledWith('', expect.any(Object), expect.any(AbortSignal));
      expect(screen.getByRole('listbox')).toHaveTextContent('暂无可用选项');
      expect(screen.getByRole('status')).toHaveTextContent('暂无可用选项。');
    } finally {
      vi.useRealTimers();
    }
  });

  it('保留远程 Select 的宿主 onSearch 回调并为 ReactNode 标签生成可访问重试名称', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const onSearch = vi.fn();
      const loadOptions = vi.fn<(query: string) => Promise<DynamicFieldOption[]>>();
      loadOptions.mockRejectedValueOnce(new Error('offline'));
      render(
        <DynamicForm
          schema={[
            {
              key: 'supplier',
              name: 'supplier',
              type: 'select',
              label: (
                <>
                  <span>供应</span>
                  <strong>商</strong>
                </>
              ),
              inputProps: { onSearch, open: true },
              loadOptions,
            },
          ]}
        />,
      );

      const select = screen.getByRole('combobox');
      fireEvent.mouseDown(select);
      fireEvent.change(select, { target: { value: '杭州' } });
      expect(onSearch).toHaveBeenCalledWith('杭州');
      await act(async () => vi.advanceTimersByTimeAsync(200));

      expect(loadOptions).toHaveBeenCalledWith('杭州', expect.any(Object), expect.any(AbortSignal));
      expect(screen.getByRole('button', { name: /重试选项\s*供应\s*商/ })).toBeInTheDocument();
      fireEvent.mouseDown(select);
      fireEvent.change(select, { target: { value: '' } });
      expect(onSearch).toHaveBeenLastCalledWith('');
      expect(select).toHaveValue('');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('保留异步 Select 查询输入及焦点，并在重试成功后恢复到 Select', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      let resolveRetry: ((options: DynamicFieldOption[]) => void) | undefined;
      const loadOptions = vi
        .fn<(query: string) => Promise<DynamicFieldOption[]>>()
        .mockRejectedValueOnce(new Error('offline'))
        .mockImplementationOnce(
          () =>
            new Promise<DynamicFieldOption[]>((resolve) => {
              resolveRetry = resolve;
            }),
        );
      render(
        <DynamicForm
          schema={[
            {
              key: 'city',
              name: 'city',
              type: 'select',
              label: '城市',
              inputProps: { open: true },
              loadOptions,
            },
          ]}
        />,
      );

      const searchInput = screen.getByRole('combobox');
      fireEvent.mouseDown(searchInput);
      act(() => searchInput.focus());
      fireEvent.change(searchInput, { target: { value: 'shanghai' } });
      await act(async () => vi.advanceTimersByTimeAsync(200));

      expect(screen.getByRole('alert')).toHaveTextContent('选项加载失败');
      expect(screen.getByRole('combobox')).toBe(searchInput);
      expect(searchInput).toHaveValue('shanghai');
      expect(searchInput).toHaveFocus();

      const retry = screen.getByRole('button', { name: /重试选项\s*城市/ });
      act(() => retry.focus());
      fireEvent.click(retry);
      fireEvent.click(retry);
      expect(loadOptions).toHaveBeenCalledTimes(2);
      expect(retry).toHaveFocus();
      expect(retry).toHaveAttribute('aria-disabled', 'true');

      await act(async () => {
        resolveRetry?.([{ label: '上海', value: 'shanghai' }]);
      });
      expect(screen.getByText('上海')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /重试/ })).not.toBeInTheDocument();
      expect(searchInput).toHaveFocus();
      expect(searchInput).toHaveValue('shanghai');
    } finally {
      vi.useRealTimers();
    }
  });

  it(
    '重试期间用户主动移焦后，成功时不抢回焦点',
    async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        let resolveRetry: ((options: DynamicFieldOption[]) => void) | undefined;
        const loadOptions = vi
          .fn<(query: string) => Promise<DynamicFieldOption[]>>()
          .mockRejectedValueOnce(new Error('offline'))
          .mockImplementationOnce(
            () =>
              new Promise<DynamicFieldOption[]>((resolve) => {
                resolveRetry = resolve;
              }),
          );
        render(
          <DynamicForm
            schema={[
              {
                key: 'city',
                name: 'city',
                type: 'select',
                label: '城市',
                inputProps: { open: true },
                loadOptions,
              },
            ]}
          >
            <button type="button">其他操作</button>
          </DynamicForm>,
        );

        const searchInput = screen.getByRole('combobox');
        fireEvent.mouseDown(searchInput);
        act(() => searchInput.focus());
        fireEvent.change(searchInput, { target: { value: 'tokyo' } });
        await act(async () => vi.advanceTimersByTimeAsync(200));
        const retry = screen.getByRole('button', { name: /重试选项\s*城市/ });
        act(() => retry.focus());
        fireEvent.click(retry);

        const otherAction = screen.getByRole('button', { name: '其他操作' });
        act(() => otherAction.focus());
        await act(async () => {
          resolveRetry?.([{ label: '东京', value: 'tokyo' }]);
        });

        expect(screen.getByText('东京')).toBeInTheDocument();
        expect(otherAction).toHaveFocus();
      } finally {
        vi.useRealTimers();
      }
    },
    ASYNC_SELECT_TIMEOUT,
  );

  it(
    '关闭失败的异步 Select 后保留搜索词，重试后显示远程候选',
    async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      try {
        const onOpenChange = vi.fn();
        const onDropdownVisibleChange = vi.fn();
        const loadOptions = vi
          .fn<(query: string) => Promise<DynamicFieldOption[]>>()
          .mockRejectedValueOnce(new Error('offline'))
          .mockResolvedValueOnce([{ label: '杭州云栖科技', value: 'supplier-1' }]);
        render(
          <DynamicForm
            schema={[
              {
                key: 'supplier',
                name: 'supplier',
                type: 'select',
                label: '供应商',
                inputProps: { onOpenChange, onDropdownVisibleChange },
                loadOptions,
              },
            ]}
          >
            <button type="button">其他操作</button>
          </DynamicForm>,
        );

        const searchInput = screen.getByRole('combobox');
        fireEvent.mouseDown(searchInput);
        fireEvent.change(searchInput, { target: { value: '杭州' } });
        await act(async () => vi.advanceTimersByTimeAsync(200));
        const retry = screen.getByRole('button', { name: /重试选项\s*供应商/ });
        const error = screen.getByRole('alert');
        expect(searchInput).toHaveValue('杭州');
        expect(error).toHaveTextContent('选项加载失败。搜索内容已保留，请重试。');
        expect(error).toBeVisible();

        fireEvent.mouseDown(screen.getByRole('button', { name: '其他操作' }));
        fireEvent.click(screen.getByRole('button', { name: '其他操作' }));

        expect(onOpenChange).toHaveBeenLastCalledWith(false);
        expect(onDropdownVisibleChange).not.toHaveBeenCalled();
        expect(searchInput).toHaveValue('杭州');
        expect(retry).toBeInTheDocument();
        expect(error).toBeVisible();
        act(() => retry.focus());
        await act(async () => {
          fireEvent.click(retry);
          await Promise.resolve();
        });
        expect(loadOptions).toHaveBeenLastCalledWith(
          '杭州',
          expect.any(Object),
          expect.any(AbortSignal),
        );
        fireEvent.mouseDown(searchInput);
        expect(screen.getByText('杭州云栖科技')).toBeInTheDocument();
        expect(searchInput).toHaveValue('杭州');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    },
    ASYNC_SELECT_TIMEOUT,
  );

  it('在未提供 onOpenChange 时兼容调用旧的下拉显隐回调', () => {
    const onDropdownVisibleChange = vi.fn();
    render(
      <DynamicForm
        schema={[
          {
            key: 'supplier',
            name: 'supplier',
            type: 'select',
            label: '供应商',
            inputProps: { onDropdownVisibleChange },
            loadOptions: async () => [],
          },
        ]}
      >
        <button type="button">其他操作</button>
      </DynamicForm>,
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.mouseDown(screen.getByRole('button', { name: '其他操作' }));

    expect(onDropdownVisibleChange).toHaveBeenLastCalledWith(false);
  });
});
