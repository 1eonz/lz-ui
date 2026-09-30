import { useId, useState } from 'react';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { DatePicker, DateRangePicker } from 'lx-ui';
import type { DateRangePickerProps } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './form-doc.module.css';

export default function Demo() {
  const id = useId();
  const [date, setDate] = useState<Dayjs | null>(dayjs('2026-10-01'));
  const [range, setRange] = useState<DateRangePickerProps['value']>(null);
  return (
    <DataDisplayDemoFrame>
      <DatePicker
        aria-label="交付日期"
        value={date}
        onChange={setDate}
        disabledDate={(current) => current.isBefore(dayjs('2026-10-01'), 'day')}
      />
      <fieldset className={styles.range}>
        <legend>报表日期范围</legend>
        <div className={styles.rangeLabels}>
          <label htmlFor={`${id}-start`}>开始日期</label>
          <label htmlFor={`${id}-end`}>结束日期</label>
        </div>
        <DateRangePicker
          className={styles.rangeControl}
          id={{ start: `${id}-start`, end: `${id}-end` }}
          value={range}
          onChange={(next) => setRange(next)}
          placeholder={['开始日期', '结束日期']}
          allowEmpty={[false, true]}
          presets={[{ label: '十月上旬', value: [dayjs('2026-10-01'), dayjs('2026-10-10')] }]}
        />
      </fieldset>
      <p role="status">
        交付：{date?.format('YYYY-MM-DD') ?? '未选择'}；范围：
        {range?.map((value) => value?.format('YYYY-MM-DD') ?? '开放结束').join(' 至 ') ?? '未选择'}
      </p>
    </DataDisplayDemoFrame>
  );
}
