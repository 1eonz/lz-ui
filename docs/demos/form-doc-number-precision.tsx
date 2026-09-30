import { useId, useState } from 'react';
import { InputNumber } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function Demo() {
  const id = useId();
  const [amount, setAmount] = useState<string | number | null>('0.00000000000001');
  return (
    <DataDisplayDemoFrame>
      <label>
        精确结算单位{' '}
        <InputNumber
          aria-label="精确结算单位"
          stringMode
          value={amount}
          step="0.00000000000001"
          min="0"
          onChange={setAmount}
        />
      </label>
      <p role="status">
        当前值：{amount ?? '未填写'}；类型：{amount === null ? 'null' : typeof amount}
      </p>
      <label htmlFor={`${id}-quantity`}>待校验数量</label>
      <InputNumber
        id={`${id}-quantity`}
        status="error"
        aria-invalid="true"
        aria-describedby={`${id}-quantity-error`}
        defaultValue={-1}
      />
      <p id={`${id}-quantity-error`}>
        请填写非负数量；status 仅标记状态，校验规则由 FormItem 或宿主执行。
      </p>
    </DataDisplayDemoFrame>
  );
}
