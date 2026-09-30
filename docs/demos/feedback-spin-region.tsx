import { useEffect, useRef, useState } from 'react';
import { Button, Input, Spin } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './feedback-scenarios.module.css';

type State = 'idle' | 'loading' | 'error' | 'success';

/** 首次请求失败，重试成功；卸载取消计时器，内容持续挂载，
 * 因此加载和失败恢复期间保留地区筛选输入。 */
export default function SpinRegionDemo() {
  const [state, setState] = useState<State>('idle');
  const [filter, setFilter] = useState('华东');
  const attempt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  function load() {
    clearTimeout(timer.current);
    const currentAttempt = ++attempt.current;
    setState('loading');
    timer.current = setTimeout(() => setState(currentAttempt === 1 ? 'error' : 'success'), 900);
  }
  return (
    <DataDisplayDemoFrame>
      <Spin spinning={state === 'loading'} tip="正在同步客户…">
        <div className={styles.region}>
          <label htmlFor="spin-region-filter">地区</label>
          <Input
            id="spin-region-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
          <p>上海星辰贸易 · 最近同步：09:30</p>
        </div>
      </Spin>
      <p role="status">
        {state === 'idle'
          ? '客户已就绪'
          : state === 'loading'
            ? '同步中'
            : state === 'error'
              ? '连接超时，客户数据与筛选已保留，请重试。'
              : '28 位客户同步完成'}
      </p>
      <Button type="primary" disabled={state === 'loading'} onClick={load}>
        {state === 'error' ? '重试同步' : '开始同步'}
      </Button>
    </DataDisplayDemoFrame>
  );
}
