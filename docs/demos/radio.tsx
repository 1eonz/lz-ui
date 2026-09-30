import '../../src/style.css';
import { LxConfigProvider, Radio } from 'lx-ui';
import { useState } from 'react';

export default function RadioDemo() {
  const [value, setValue] = useState('standard');
  return (
    <LxConfigProvider>
      <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
        <legend>客户等级</legend>
        <Radio.Group
          aria-label="客户等级"
          options={[
            { label: '标准', value: 'standard' },
            { label: '重点', value: 'priority' },
            { label: '受限（不可选）', value: 'restricted', disabled: true },
          ]}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <p role="status">当前等级：{value === 'priority' ? '重点' : '标准'}</p>
      </fieldset>
    </LxConfigProvider>
  );
}
