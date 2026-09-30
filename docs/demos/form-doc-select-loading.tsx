import { useEffect, useId, useRef, useState } from 'react';
import { Button, Select, Space, Switch } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './form-doc.module.css';

const owners = [
  { label: '王经理', value: 'wang' },
  { label: '李经理', value: 'li' },
];

/** 本地数据刷新不接网络；失败保留已选值，重试后加载选项。 */
export default function Demo() {
  const id = useId();
  const [state, setState] = useState<'empty' | 'loading' | 'error' | 'ready'>('empty');
  const [value, setValue] = useState<string>();
  const [options, setOptions] = useState<typeof owners>([]);
  const [failNext, setFailNext] = useState(true);
  const pending = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = null;
      pending.current = false;
    },
    [],
  );
  const load = () => {
    // 同步锁覆盖 React 提交 loading 状态前的重复激活；刷新失败保留已有选项和值。
    if (pending.current) return;
    pending.current = true;
    const shouldFail = failNext;
    setFailNext(false);
    setState('loading');
    timer.current = setTimeout(() => {
      timer.current = null;
      pending.current = false;
      if (shouldFail) {
        setState('error');
      } else {
        setOptions(owners);
        setState('ready');
      }
    }, 600);
  };
  return (
    <DataDisplayDemoFrame>
      <Select
        className={styles.control}
        aria-label="负责人"
        value={value}
        allowClear
        loading={state === 'loading'}
        disabled={state === 'loading'}
        options={options}
        onChange={(next: string | undefined) => setValue(next)}
        notFoundContent={
          state === 'loading'
            ? '正在读取负责人'
            : state === 'error'
              ? '读取失败，请重试'
              : '暂无负责人'
        }
        placeholder="选择负责人"
      />
      <Space wrap align="center">
        <label htmlFor={`${id}-fail`}>下次加载失败</label>
        <Switch
          id={`${id}-fail`}
          checked={failNext}
          disabled={state === 'loading'}
          onChange={setFailNext}
        />
      </Space>
      <Button disabled={state === 'loading'} onClick={load}>
        {state === 'error' ? '重试读取' : '读取负责人'}
      </Button>
      <p role="status">
        {state === 'loading'
          ? '正在读取'
          : state === 'error'
            ? '本地模拟读取失败，已选值保留'
            : state === 'ready'
              ? '负责人已就绪'
              : '尚未读取数据'}
        ；已选负责人：{owners.find((owner) => owner.value === value)?.label ?? '未选择'}
      </p>
    </DataDisplayDemoFrame>
  );
}
