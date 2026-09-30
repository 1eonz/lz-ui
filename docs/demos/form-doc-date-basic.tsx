import dayjs from 'dayjs';
import { useId } from 'react';
import { DatePicker, Space } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

const sizeLabels = { small: '小尺寸', middle: '默认尺寸', large: '大尺寸' };

export default function Demo() {
  const id = useId();
  return (
    <DataDisplayDemoFrame>
      {(['small', 'middle', 'large'] as const).map((size) => (
        <Space key={size} direction="vertical" align="flex-start">
          <label htmlFor={`${id}-${size}`}>{sizeLabels[size]}交付日期</label>
          <DatePicker id={`${id}-${size}`} size={size} defaultValue={dayjs('2026-10-01')} />
        </Space>
      ))}
      <DatePicker aria-label="锁定日期" disabled value={dayjs('2026-10-01')} />
      <DatePicker aria-label="账期月份" picker="month" />
    </DataDisplayDemoFrame>
  );
}
