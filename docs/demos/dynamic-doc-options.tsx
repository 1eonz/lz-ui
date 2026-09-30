import { useId, useMemo, useRef, useState } from 'react';
import { Button, DynamicForm } from 'lx-ui';
import type { DynamicFormValues, FieldSchema } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

const suppliers = [
  { label: '杭州云栖科技', value: 'supplier-1' },
  { label: '上海远航科技', value: 'supplier-2' },
];

export default function DynamicOptionsDemo() {
  const id = useId();
  const failOnce = useRef(true);
  const [saved, setSaved] = useState<DynamicFormValues | null>(null);
  const schema = useMemo<readonly FieldSchema[]>(
    () => [
      {
        key: 'supplier',
        name: 'supplier',
        type: 'select',
        label: '供应商',
        required: true,
        extra: '首次检索模拟失败；字段旁的重试会重新执行相同查询。',
        inputProps: { placeholder: '输入杭州或上海检索供应商' },
        loadOptions: async (query, _values, signal) => {
          // 演示仅查询本地列表，无计时器或网络请求。真实适配器需将 signal 传给 fetch。
          if (signal.aborted) throw new DOMException('请求已取消', 'AbortError');
          if (failOnce.current) {
            failOnce.current = false;
            throw new Error('本地演示首次检索失败');
          }
          return suppliers.filter((supplier) => supplier.label.includes(query));
        },
      },
    ],
    [],
  );
  return (
    <DataDisplayDemoFrame>
      <DynamicForm name={id} schema={schema} onFinish={setSaved}>
        <Button htmlType="submit" type="primary">
          确认供应商
        </Button>
      </DynamicForm>
      <p role="status">{saved ? `已选择供应商：${String(saved.supplier)}` : '尚未确认供应商'}</p>
    </DataDisplayDemoFrame>
  );
}
