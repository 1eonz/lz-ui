import { Radio, RadioGroup } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function Demo() {
  return (
    <DataDisplayDemoFrame>
      <Radio defaultChecked>单个默认选项</Radio>
      <Radio disabled>不可选项</Radio>
      <RadioGroup
        aria-label="配送方式"
        defaultValue="standard"
        options={[
          { label: '标准配送', value: 'standard' },
          { label: '加急配送', value: 'express' },
          { label: '暂停配送', value: 'paused', disabled: true },
        ]}
      />
    </DataDisplayDemoFrame>
  );
}
