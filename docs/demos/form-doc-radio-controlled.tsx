import { useState } from 'react';
import { RadioGroup } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function Demo() {
  const [value, setValue] = useState('week');
  return (
    <DataDisplayDemoFrame>
      {(['small', 'middle', 'large'] as const).map((size) => (
        <RadioGroup
          key={size}
          aria-label={`${size}报表周期`}
          size={size}
          optionType="button"
          value={value}
          options={[
            { label: '周报', value: 'week' },
            { label: '月报', value: 'month' },
          ]}
          onChange={(event) => setValue(event.target.value as string)}
        />
      ))}
      <p role="status">当前周期：{value === 'week' ? '每周' : '每月'}</p>
    </DataDisplayDemoFrame>
  );
}
