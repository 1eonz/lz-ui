import { InputNumber } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function Demo() {
  return (
    <DataDisplayDemoFrame>
      {(['small', 'middle', 'large'] as const).map((size) => (
        <label key={size}>
          {size}数量{' '}
          <InputNumber aria-label={`${size}数量`} size={size} min={0} max={100} defaultValue={10} />
        </label>
      ))}
      <label>
        锁定数量 <InputNumber aria-label="锁定数量" disabled value={5} />
      </label>
    </DataDisplayDemoFrame>
  );
}
