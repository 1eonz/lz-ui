import { useId, useState } from 'react';
import { Button, DynamicForm } from 'lx-ui';
import type { DynamicFormValues, FieldSchema } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import touchStyles from './dynamic-form.module.css';
import { dynamicFormTouchTargetClassName } from './dynamic-form-utils';
import styles from './dynamic-doc.module.css';

const touchTargetClassName = `${touchStyles.touchTarget} ${dynamicFormTouchTargetClassName}`;

const schema: readonly FieldSchema[] = [
  {
    key: 'customer-name',
    name: ['customer', 'name'],
    type: 'text',
    label: '客户名称',
    inputProps: { className: touchTargetClassName },
  },
  {
    key: 'credit',
    name: 'credit',
    type: 'number',
    label: '授信额度',
    inputProps: { min: 0, className: touchTargetClassName },
  },
];

export default function DynamicControlledDemo() {
  const id = useId();
  const [values, setValues] = useState<DynamicFormValues>({
    customer: { name: '杭州云栖科技' },
    credit: 10000,
  });
  return (
    <DataDisplayDemoFrame>
      <DynamicForm
        name={id}
        schema={schema}
        value={values}
        onChange={(_changed, all) => setValues(all)}
      />
      <Button
        className={touchTargetClassName}
        onClick={() => setValues({ customer: { name: '上海远航科技' }, credit: 20000 })}
      >
        回填另一位客户
      </Button>
      <pre className={styles.output} aria-label="当前受控表单值">
        {JSON.stringify(values, null, 2)}
      </pre>
    </DataDisplayDemoFrame>
  );
}
