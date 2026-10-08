import { useEffect, useRef, useState } from 'react';
import { Button, Input, Spin } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './feedback-scenarios.module.css';

type State = 'idle' | 'loading' | 'error' | 'success';

const regionRecords: Record<string, string> = {
  华东: '上海星辰贸易',
  华南: '深圳海风科技',
};

/**
 * 地区值来自用户输入，只允许匹配字典自有键，避免原型属性被当作客户记录。
 * 即使记录字典的实现变化，也应保留这层自有键校验。
 */
function getRegionRecord(region: string): string | undefined {
  if (!Object.prototype.hasOwnProperty.call(regionRecords, region)) return undefined;
  return regionRecords[region];
}

/**
 * 首次请求模拟失败，重试使用提交时的地区快照并成功；卸载时清理计时器。
 * 地区筛选位于 Spin 遮罩外，加载时仍可编辑，当前响应只更新已提交地区的数据。
 */
export default function SpinRegionDemo() {
  const [state, setState] = useState<State>('idle');
  const [filter, setFilter] = useState('华东');
  const [submittedRegion, setSubmittedRegion] = useState('华东');
  const [loadedRegion, setLoadedRegion] = useState('华东');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>('09:30');
  const attempt = useRef(0);
  const activeAttempt = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const loadingTip = <span aria-hidden="true">正在同步“{submittedRegion}”的本地示例…</span>;

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
    const requestRegion = filter.trim();
    activeAttempt.current = currentAttempt;
    setSubmittedRegion(requestRegion);
    setState('loading');
    timer.current = setTimeout(() => {
      if (activeAttempt.current !== currentAttempt) return;
      activeAttempt.current = null;
      timer.current = undefined;
      if (currentAttempt === 1) {
        setState('error');
        return;
      }
      setLoadedRegion(requestRegion);
      setLastSyncedAt(getRegionRecord(requestRegion) !== undefined ? '刚刚' : null);
      setState('success');
    }, 900);
  }

  const record = getRegionRecord(loadedRegion);
  const statusText =
    state === 'loading'
      ? `正在同步“${submittedRegion}”的本地示例。`
      : state === 'error'
        ? `同步“${submittedRegion}”失败：模拟服务暂不可用。当前示例内容和更新时间已保留，请重试。`
        : state === 'success'
          ? record !== undefined
            ? `“${loadedRegion}”的本地示例记录已更新，最近同步时间：${lastSyncedAt}。`
            : `“${loadedRegion}”没有配置本地演示样例。`
          : `当前显示“${loadedRegion}”的本地示例记录，最近同步时间：${lastSyncedAt}。`;

  return (
    <DataDisplayDemoFrame>
      <div data-testid="spin-loading-surface">
        <div className={styles.region}>
          <div className={styles.regionFilter}>
            <label htmlFor="spin-region-filter">同步地区</label>
            <Input
              id="spin-region-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
            <p className={styles.regionHint}>仅支持华东、华南本地示例</p>
          </div>
          <Spin spinning={state === 'loading'} tip={loadingTip}>
            <div
              className={styles.regionData}
              role="region"
              aria-label="客户数据"
              aria-busy={state === 'loading'}
            >
              {record !== undefined ? (
                <>
                  <p>{loadedRegion} · 本地示例记录</p>
                  <strong>{record}</strong>
                  <p>最近同步：{lastSyncedAt}</p>
                </>
              ) : (
                <p>“{loadedRegion}”没有配置本地演示样例。</p>
              )}
            </div>
          </Spin>
          {state === 'error' && (
            <p
              className={styles.regionMessage}
              data-testid="spin-request-message"
              aria-hidden="true"
            >
              同步“{submittedRegion}”失败：模拟服务暂不可用。当前示例内容和更新时间已保留，请重试。
            </p>
          )}
        </div>
      </div>
      <p className={styles.regionStatus} role="status">
        {statusText}
      </p>
      <Button
        className={styles.regionSyncButton}
        type="primary"
        aria-disabled={state === 'loading'}
        onClick={load}
      >
        {state === 'error' ? '重试同步' : '同步客户'}
      </Button>
    </DataDisplayDemoFrame>
  );
}
