import { useId, useMemo, useRef, useState } from 'react';
import { Button, DynamicForm, Input } from 'lx-ui';
import type {
  CustomRenderer,
  DynamicFormRef,
  DynamicFormValues,
  FieldSchema,
  FormRendererRegistry,
} from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import touchStyles from './dynamic-form.module.css';
import {
  dynamicFormTouchTargetClassName,
  scrollDynamicFormFieldIntoView,
} from './dynamic-form-utils';

const touchTargetClassName = `${touchStyles.touchTarget} ${dynamicFormTouchTargetClassName}`;

const schema: readonly FieldSchema[] = [
  {
    key: 'customer-code',
    name: 'code',
    type: 'custom',
    renderer: 'customer-code',
    label: '客户编号',
    required: true,
  },
];

export default function DynamicCustomDemo() {
  const id = useId();
  const formRef = useRef<DynamicFormRef>(null);
  const [saved, setSaved] = useState<DynamicFormValues | null>(null);
  const registry = useMemo<FormRendererRegistry>(() => {
    // 注册表归当前演示所有，避免同页多个 Provider 或业务模块污染全局名称。
    const renderers = new Map<string, CustomRenderer>();
    // 完整转发 Form.Item 注入的受控和 ARIA 属性，再收窄实际 Input 的 value；不展开字段 schema。
    renderers.set('customer-code', ({ controlProps, disabled, readOnly }) => {
      // Form 注入对象可能带宿主 className；保留它并追加本例的公开触控样式。
      const controlClassName =
        'className' in controlProps && typeof controlProps.className === 'string'
          ? controlProps.className
          : undefined;

      return (
        <Input
          {...controlProps}
          className={[controlClassName, touchTargetClassName].filter(Boolean).join(' ')}
          value={typeof controlProps.value === 'string' ? controlProps.value : ''}
          onChange={(event) => controlProps.onChange?.(event)}
          disabled={disabled}
          readOnly={readOnly}
          prefix="KH-"
          placeholder="请输入客户编号"
        />
      );
    });
    return {
      register: (name, renderer) => {
        renderers.set(name, renderer);
      },
      resolve: (name) => renderers.get(name),
    };
  }, []);
  return (
    <DataDisplayDemoFrame>
      <DynamicForm
        name={id}
        ref={formRef}
        schema={schema}
        rendererRegistry={registry}
        onFinish={setSaved}
        onFinishFailed={({ errorFields, outOfDate }) => {
          if (outOfDate || !errorFields[0]) return;
          scrollDynamicFormFieldIntoView(formRef.current?.form, errorFields[0].name);
        }}
      >
        <Button className={touchTargetClassName} type="primary" htmlType="submit">
          保存编号
        </Button>
      </DynamicForm>
      <p role="status">{saved ? `已保存编号：KH-${String(saved.code)}` : '尚未保存'}</p>
    </DataDisplayDemoFrame>
  );
}
