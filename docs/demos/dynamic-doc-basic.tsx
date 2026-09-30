import { useId, useRef, useState } from 'react';
import { Button, DynamicForm } from 'lx-ui';
import type { DynamicFormRef, DynamicFormValues, FieldSchema } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './input.module.css';

const schema: readonly FieldSchema[] = [
  { key: 'name', name: 'name', type: 'text', label: '客户名称', required: true },
  { key: 'enabled', name: 'enabled', type: 'switch', label: '启用客户' },
];

export default function DynamicBasicDemo() {
  const id = useId();
  const ref = useRef<DynamicFormRef>(null);
  const [saved, setSaved] = useState<DynamicFormValues | null>(null);
  return (
    <DataDisplayDemoFrame>
      <DynamicForm
        name={id}
        ref={ref}
        schema={schema}
        defaultValue={{ enabled: true }}
        onFinish={setSaved}
      >
        <div className={styles.actions}>
          <Button htmlType="submit" type="primary">
            保存客户
          </Button>
          <Button
            onClick={() => {
              ref.current?.reset();
              setSaved(null);
            }}
          >
            重置
          </Button>
        </div>
      </DynamicForm>
      <p role="status">
        {saved
          ? `已保存：${String(saved.name)}，${saved.enabled ? '已启用' : '未启用'}`
          : '尚未保存'}
      </p>
    </DataDisplayDemoFrame>
  );
}
