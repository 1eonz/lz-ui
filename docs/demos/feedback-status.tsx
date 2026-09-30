import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Input, Progress, Spin } from 'lx-ui';
import type { ButtonRef } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './feedback-status.module.css';

type RequestState = 'idle' | 'loading' | 'error' | 'success';

/**
 * 宿主拥有的确定请求流程：首次失败，重试成功。重新开始或卸载取消计时器，
 * 现有内容与筛选持续挂载；请求传输和恢复策略不进入基础组件。
 */
function FeedbackStatusSurface() {
  const [open, setOpen] = useState(true);
  const [alertKey, setAlertKey] = useState(0);
  const [viewed, setViewed] = useState(false);
  const [state, setState] = useState<RequestState>('idle');
  const [percent, setPercent] = useState(62.5);
  const [filter, setFilter] = useState('华东');
  const restoreRef = useRef<ButtonRef>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const attempt = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  function load() {
    clearTimeout(timer.current);
    const currentAttempt = ++attempt.current;
    setState('loading');
    // 900ms 保证默认300ms延迟后仍有可见加载区间。
    timer.current = setTimeout(() => {
      setState(currentAttempt === 1 ? 'error' : 'success');
    }, 900);
  }

  return (
    <>
      <section className={styles.section} aria-label="客户同步通知">
        <Button
          ref={restoreRef}
          onClick={() => {
            // 动效关闭可能不触发原生 afterClose；重新挂载保证能恢复显示。
            setAlertKey((value) => value + 1);
            setOpen(true);
            setViewed(false);
          }}
        >
          显示通知
        </Button>
        {open && (
          <Alert
            key={alertKey}
            type="info"
            showIcon
            role="status"
            message="客户同步已准备"
            description="本批次包含 28 位客户，可以开始同步。"
            closable
            onClose={() => {
              // 必要焦点恢复不能依赖 transitionend 动画事件。
              setViewed(false);
              restoreRef.current?.focus();
            }}
            afterClose={() => {
              setOpen(false);
            }}
            action={
              <Button size="small" onClick={() => setViewed((value) => !value)}>
                查看
              </Button>
            }
          />
        )}
        {viewed && <p>同步范围：华东地区，28 位客户；现有备注将保留。</p>}
      </section>
      <section className={styles.section} aria-labelledby="feedback-loading-title">
        <h3 id="feedback-loading-title">客户列表</h3>
        <Spin spinning={state === 'loading'} tip="正在读取客户数据…">
          <div className={styles.content}>
            <label htmlFor="feedback-filter">地区筛选</label>
            <Input
              id="feedback-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
            <p>上海星辰贸易 · 王经理 · 最近同步：09:30</p>
          </div>
        </Spin>
        <p role="status">
          {state === 'idle'
            ? '客户数据已就绪'
            : state === 'loading'
              ? '正在同步客户数据'
              : state === 'error'
                ? '同步失败，现有数据已保留'
                : '同步完成，客户数据已更新'}
        </p>
        {state === 'error' && (
          <Alert
            type="error"
            showIcon
            role="note"
            message="连接超时，请重试"
            description="地区筛选和现有客户内容已保留。"
          />
        )}
        {state === 'success' && (
          <Alert type="success" showIcon role="note" message="28 位客户已同步" />
        )}
        <Button type="primary" disabled={state === 'loading'} onClick={load}>
          {state === 'error' ? '重试同步' : state === 'loading' ? '同步中' : '开始同步'}
        </Button>
      </section>
      <section className={styles.section} aria-labelledby="feedback-progress-title">
        <h3 id="feedback-progress-title">客户导入</h3>
        <Progress
          percent={percent}
          status={percent === 100 ? 'success' : 'active'}
          aria-label="导入进度"
        />
        <div className={styles.actions}>
          <Button
            disabled={percent === 0}
            onClick={() => setPercent((value) => Math.max(0, value - 12.5))}
          >
            减少
          </Button>
          <Button
            disabled={percent === 100}
            onClick={() => setPercent((value) => Math.min(100, value + 12.5))}
          >
            增加
          </Button>
        </div>
        <div className={styles.progressVariants}>
          <Progress type="circle" percent={62.5} aria-label="附件导入进度" />
          <Progress type="dashboard" percent={80} success={{ percent: 30 }} aria-label="校验进度" />
          <Progress steps={8} percent={62.5} aria-label="分批导入进度" />
        </div>
      </section>
    </>
  );
}

export default function FeedbackStatusDemo() {
  return (
    <DataDisplayDemoFrame>
      <FeedbackStatusSurface />
    </DataDisplayDemoFrame>
  );
}
