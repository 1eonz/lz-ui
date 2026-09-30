import { useState } from 'react';
import { Select } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './form-doc.module.css';

const departments = [
  { label: '财务部', value: 'finance' },
  { label: '销售部', value: 'sales' },
  { label: '客服部', value: 'service' },
];

export default function Demo() {
  const [values, setValues] = useState<string[]>(['finance']);
  return (
    <DataDisplayDemoFrame>
      <Select
        className={styles.control}
        aria-label="业务部门"
        mode="multiple"
        showSearch
        allowClear
        optionFilterProp="label"
        value={values}
        options={departments}
        onChange={(next: string[]) => setValues(next)}
      />
      <p role="status">
        已选部门：
        {values
          .map(
            (value) =>
              departments.find((department) => department.value === value)?.label ?? '未知部门',
          )
          .join('、') || '无'}
      </p>
    </DataDisplayDemoFrame>
  );
}
