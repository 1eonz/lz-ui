import { useEffect, useId, useRef, useState } from 'react';
import '../../src/style.css';
import { Button, DynamicForm } from '../../src/index';
import type {
  DynamicFieldOption,
  DynamicFormRef,
  DynamicFormValues,
  FieldSchema,
} from '../../src/index';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './dynamic-form.module.css';

type CascadeLocation = {
  region?: string;
  city?: string;
  district?: string;
};

type CascadeValues = DynamicFormValues & {
  location?: CascadeLocation;
};

const initialValues: CascadeValues = { location: { region: 'east' } };
const regions: DynamicFieldOption[] = [
  { label: '华东', value: 'east' },
  { label: '华南', value: 'south' },
];
const cities: Record<string, DynamicFieldOption[]> = {
  east: [
    { label: '杭州市', value: 'hangzhou' },
    { label: '上海市', value: 'shanghai' },
  ],
  south: [
    { label: '深圳市', value: 'shenzhen' },
    { label: '广州市', value: 'guangzhou' },
  ],
};
const districts: Record<string, DynamicFieldOption[]> = {
  hangzhou: [
    { label: '西湖区', value: 'xihu' },
    { label: '余杭区', value: 'yuhang' },
  ],
  shanghai: [
    { label: '浦东新区', value: 'pudong' },
    { label: '徐汇区', value: 'xuhui' },
  ],
  shenzhen: [
    { label: '南山区', value: 'nanshan' },
    { label: '福田区', value: 'futian' },
  ],
  guangzhou: [
    { label: '天河区', value: 'tianhe' },
    { label: '越秀区', value: 'yuexiu' },
  ],
};

function waitForOptions(signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => finish(true), 180);
    const finish = (completed: boolean) => {
      window.clearTimeout(timer);
      signal.removeEventListener('abort', handleAbort);
      resolve(completed);
    };
    const handleAbort = () => finish(false);
    signal.addEventListener('abort', handleAbort, { once: true });
    if (signal.aborted) handleAbort();
  });
}

function matchOptions(options: DynamicFieldOption[], query: string): DynamicFieldOption[] {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return options;
  return options.filter((option) => String(option.label).includes(normalizedQuery));
}

const schema: FieldSchema[] = [
  {
    key: 'country',
    name: ['location', 'region'],
    type: 'select',
    label: '区域',
    required: true,
    options: regions,
    inputProps: { allowClear: true },
  },
  {
    key: 'city',
    name: ['location', 'city'],
    type: 'select',
    label: '城市',
    dependencies: [['location', 'region']],
    clearOnDependencyChange: true,
    inputProps: { placeholder: '输入“市”加载城市' },
    loadOptions: async (query, values, signal) => {
      if (!(await waitForOptions(signal))) return [];
      const region = (values as CascadeValues).location?.region;
      return matchOptions(cities[region ?? ''] ?? [], query);
    },
  },
  {
    key: 'district',
    name: ['location', 'district'],
    type: 'select',
    label: '区县',
    dependencies: [['location', 'city']],
    clearOnDependencyChange: true,
    disabled: (values) => !(values as CascadeValues).location?.city,
    help: '先选择城市，再搜索对应区县。',
    inputProps: { placeholder: '输入“区”加载区县' },
    loadOptions: async (query, values, signal) => {
      if (!(await waitForOptions(signal))) return [];
      const city = (values as CascadeValues).location?.city;
      return matchOptions(districts[city ?? ''] ?? [], query);
    },
  },
];

export default function DynamicFormCascadeDemo() {
  const valuesCaptionId = useId();
  const formRef = useRef<DynamicFormRef>(null);
  const [values, setValues] = useState<DynamicFormValues>(initialValues);
  const valuesRef = useRef<DynamicFormValues>(initialValues);
  const [submitted, setSubmitted] = useState<DynamicFormValues>();
  const [announcement, setAnnouncement] = useState('');
  const announcementTimer = useRef<number>();

  function announce(message: string): void {
    window.clearTimeout(announcementTimer.current);
    // 相同文案再次发生时先清空 live region，让辅助技术观察到新的文本变化。
    setAnnouncement('');
    announcementTimer.current = window.setTimeout(() => {
      announcementTimer.current = undefined;
      setAnnouncement(message);
    }, 50);
  }

  useEffect(() => () => window.clearTimeout(announcementTimer.current), []);

  function announceChanges(changed: DynamicFormValues, previous: DynamicFormValues): void {
    const location = changed.location as CascadeLocation | undefined;
    if (!location) return;
    const previousLocation = previous.location as CascadeLocation | undefined;
    const hasSelectedValue = (value: unknown) =>
      value !== undefined && value !== null && value !== '';
    const wasCleared = (field: 'city' | 'district') =>
      Object.prototype.hasOwnProperty.call(location, field) &&
      location[field] === undefined &&
      hasSelectedValue(previousLocation?.[field]);
    if (Object.prototype.hasOwnProperty.call(location, 'region')) {
      const clearedFields = [
        wasCleared('city') ? '城市' : undefined,
        wasCleared('district') ? '区县' : undefined,
      ].filter(Boolean);
      announce(
        clearedFields.length > 0
          ? `区域已更改，已清除${clearedFields.join('和')}。`
          : '区域已更改。',
      );
    } else if (Object.prototype.hasOwnProperty.call(location, 'city')) {
      announce(wasCleared('district') ? '城市已更改，已清除区县。' : '城市已更改。');
    }
  }

  return (
    <DataDisplayDemoFrame>
      <div className={styles.demo}>
        <DynamicForm
          ref={formRef}
          schema={schema}
          defaultValue={initialValues}
          onChange={(changed, all) => {
            announceChanges(changed, valuesRef.current);
            valuesRef.current = all;
            setValues(all);
            setSubmitted(undefined);
          }}
          onFinish={(nextValues) => {
            setSubmitted(nextValues);
            announce('表单已提交。');
          }}
        >
          <div className={styles.demoActions}>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
            <Button
              htmlType="button"
              onClick={() => {
                formRef.current?.reset();
                valuesRef.current = initialValues;
                setValues(initialValues);
                setSubmitted(undefined);
                announce('表单已重置，区域恢复为华东。');
              }}
            >
              重置
            </Button>
          </div>
        </DynamicForm>
        <figure className={styles.cascadeValues} aria-labelledby={valuesCaptionId}>
          <figcaption id={valuesCaptionId}>当前表单值</figcaption>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </figure>
        <p className={styles.cascadeAnnouncement} role="status" aria-live="polite">
          {announcement}
        </p>
        {submitted && (
          <p className={styles.cascadeSubmitted} role="status">
            已提交：{JSON.stringify(submitted)}
          </p>
        )}
      </div>
    </DataDisplayDemoFrame>
  );
}
