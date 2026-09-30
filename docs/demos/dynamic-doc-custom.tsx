import { useId, useMemo, useState } from 'react';
import { Button, DynamicForm, Input } from 'lx-ui';
import type { CustomRenderer, DynamicFormValues, FieldSchema, FormRendererRegistry } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

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
  const [saved, setSaved] = useState<DynamicFormValues | null>(null);
  const registry = useMemo<FormRendererRegistry>(() => {
    // 注册表归当前演示所有，避免同页多个 Provider 或业务模块污染全局名称。
    const renderers = new Map<string, CustomRenderer>();
    // 完整转发 Form.Item 注入的受控和 ARIA 属性，再收窄实际 Input 的 value；不展开字段 schema。
    renderers.set('customer-code', ({ controlProps, disabled, readOnly }) => (
      <Input
        {...controlProps}
        value={typeof controlProps.value === 'string' ? controlProps.value : ''}
        onChange={(event) => controlProps.onChange?.(event)}
        disabled={disabled}
        readOnly={readOnly}
        prefix="KH-"
        placeholder="请输入客户编号"
      />
    ));
    return {
      register: (name, renderer) => {
        renderers.set(name, renderer);
      },
      resolve: (name) => renderers.get(name),
    };
  }, []);
  return (
    <DataDisplayDemoFrame>
      <DynamicForm name={id} schema={schema} rendererRegistry={registry} onFinish={setSaved}>
        <Button type="primary" htmlType="submit">
          保存编号
        </Button>
      </DynamicForm>
      <p role="status">{saved ? `已保存编号：KH-${String(saved.code)}` : '尚未保存'}</p>
    </DataDisplayDemoFrame>
  );
}
