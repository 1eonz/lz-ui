import { useEffect, useRef, useState } from 'react';
import { Button, Input, Spin } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './feedback-scenarios.module.css';

type State = 'idle' | 'loading' | 'error' | 'success';

/**
 * 首次请求失败，重试成功；卸载取消计时器，内容持续挂载。
 * 地区筛选位于 Spin 遮罩外，加载时仍可见可编辑；aria-busy 仅标记正在刷新的数据区，
 * 避免把仍可操作的筛选控件错误地包含在忙碌区域内。
 */
export default function SpinRegionDemo() {
  const [state, setState] = useState<State>('idle');
  const [filter, setFilter] = useState('华东');
  // 可视 tip 与下方短 status 表达同一状态，因此只由 status 负责辅助技术播报。
  const loadingTip = <span aria-hidden="true">正在同步客户…</span>;
  const attempt = useRef(0);
  const activeAttempt = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      timer.current = undefined;
      activeAttempt.current = null;
    },
    [],
  );
  function load() {
    if (activeAttempt.current !== null) return;
    clearTimeout(timer.current);
    const currentAttempt = ++attempt.current;
    activeAttempt.current = currentAttempt;
    setState('loading');
    timer.current = setTimeout(() => {
      if (activeAttempt.current !== currentAttempt) return;
      activeAttempt.current = null;
      timer.current = undefined;
      setState(currentAttempt === 1 ? 'error' : 'success');
    }, 900);
  }
  return (
    <DataDisplayDemoFrame>
      <div data-testid="spin-loading-surface">
        <div className={styles.region}>
          <div className={styles.regionFilter}>
            <label htmlFor="spin-region-filter">地区</label>
            <Input
              id="spin-region-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </div>
          <Spin spinning={state === 'loading'} tip={loadingTip}>
            <div
              className={styles.regionData}
              role="region"
              aria-label="客户数据"
              aria-busy={state === 'loading'}
            >
              <p>上海星辰贸易 · 最近同步：09:30</p>
            </div>
          </Spin>
        </div>
      </div>
      <p role="status">
        {state === 'idle'
          ? '客户已就绪'
          : state === 'loading'
            ? '同步中'
            : state === 'error'
              ? '同步失败，客户数据与筛选已保留，请重试。'
              : '28 位客户同步完成'}
      </p>
      <Button
        className={styles.regionSyncButton}
        type="primary"
        aria-disabled={state === 'loading'}
        onClick={load}
      >
        {state === 'loading' ? '正在同步…' : state === 'error' ? '重试同步' : '开始同步'}
      </Button>
    </DataDisplayDemoFrame>
  );
}
