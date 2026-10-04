import { useId, useState } from 'react';
import { Input } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import { InputClearIcon } from './input-clear-icon';
import styles from './input.module.css';

export default function InputBasicDemo() {
  const id = useId();
  const [name, setName] = useState('杭州云栖科技');
  return (
    <DataDisplayDemoFrame>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor={`${id}-name`}>客户名称</label>
          <Input
            id={`${id}-name`}
            value={name}
            allowClear={{ clearIcon: <InputClearIcon label="清除客户名称" /> }}
            onChange={(event) => setName(event.target.value)}
            placeholder="请输入客户名称"
          />
          <p role="status">当前值：{name || '未填写'}</p>
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-owner`}>负责人（非受控）</label>
          <Input id={`${id}-owner`} defaultValue="李明" autoComplete="name" />
        </div>
      </div>
    </DataDisplayDemoFrame>
  );
}
