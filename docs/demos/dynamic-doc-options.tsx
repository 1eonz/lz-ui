import { useId, useMemo, useRef, useState } from 'react';
import { Button, DynamicForm } from 'lx-ui';
import type { DynamicFormValues, FieldSchema } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

const suppliers = [
  { label: '杭州云栖科技', value: 'supplier-1' },
  { label: '上海远航科技', value: 'supplier-2' },
];

function waitForOptions(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('请求已取消', 'AbortError'));
      return;
    }

    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, 750);
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('请求已取消', 'AbortError'));
    };
    signal.addEventListener('abort', abort, { once: true });
  });
}

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
        inputProps: { placeholder: '输入杭州或上海检索供应商' },
        loadOptionsError: (_error, query) =>
          query ? `暂时无法搜索“${query}”的供应商，请重试。` : '暂时无法加载供应商，请重试。',
        loadOptions: async (query, _values, signal) => {
          // 使用可取消的本地延迟呈现 loading 状态，不依赖网络或不稳定的外部服务。
          await waitForOptions(signal);
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
      <p role="status">
        {saved
          ? `已选择供应商：${suppliers.find((supplier) => supplier.value === saved.supplier)?.label ?? '未知供应商'}`
          : '尚未确认供应商'}
      </p>
    </DataDisplayDemoFrame>
  );
}
