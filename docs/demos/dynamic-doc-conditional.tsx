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
    key: 'tier',
    name: 'tier',
    type: 'select',
    label: '客户等级',
    inputProps: { className: touchTargetClassName },
    options: [
      { label: '普通客户', value: 'regular' },
      { label: '重点客户', value: 'priority' },
    ],
    extra: '重点客户需要指定负责人；切回普通客户后保留草稿，但不提交负责人。',
  },
  {
    key: 'owner',
    name: 'owner',
    type: 'text',
    label: '专属负责人',
    required: true,
    visible: (values) => values.tier === 'priority',
    inputProps: { className: touchTargetClassName },
  },
];

export default function DynamicConditionalDemo() {
  const id = useId();
  const [submitted, setSubmitted] = useState<DynamicFormValues | null>(null);
  return (
    <DataDisplayDemoFrame>
      <DynamicForm
        name={id}
        schema={schema}
        defaultValue={{ tier: 'regular' }}
        omitHidden
        onFinish={setSubmitted}
      >
        <Button className={touchTargetClassName} type="primary" htmlType="submit">
          确认客户等级
        </Button>
      </DynamicForm>
      <pre className={styles.output} aria-label="最近提交的可见字段">
        {submitted ? JSON.stringify(submitted, null, 2) : '尚未提交'}
      </pre>
    </DataDisplayDemoFrame>
  );
}
