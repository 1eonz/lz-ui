import { useState } from 'react';
import { Button, Progress, RadioGroup } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './feedback-scenarios.module.css';

const amounts = [-10, 62.5, 120, NaN, Infinity];

export default function ProgressControlledDemo() {
  const [percent, setPercent] = useState(62.5);
  const [failed, setFailed] = useState(false);
  const [boundary, setBoundary] = useState(1);
  return (
    <DataDisplayDemoFrame>
      <Progress percent={percent} status={failed ? 'exception' : percent === 100 ? 'success' : 'active'} aria-label="受控客户导入" />
      <div className={styles.row}>
        <Button disabled={percent === 0} onClick={() => setPercent((value) => Math.max(0, value - 12.5))}>减少</Button>
        <Button disabled={percent === 100 || failed} onClick={() => setPercent((value) => Math.min(100, value + 12.5))}>增加</Button>
        <Button onClick={() => setFailed((value) => !value)}>{failed ? '恢复导入' : '模拟失败'}</Button>
      </div>
      <p role="status">{failed ? '导入失败，已完成比例保留，可恢复。' : percent === 100 ? '客户导入完成' : '客户导入进行中'}</p>
      <RadioGroup aria-label="输入进度值" value={boundary} options={amounts.map((amount, index) => ({ label: String(amount), value: index }))} onChange={(event) => setBoundary(Number(event.target.value))} />
      <Progress percent={amounts[boundary]} success={{ percent: 30 }} format={(total, success) => <span>总计 {total}% · 成功 {success}%</span>} aria-label="规范后的进度" />
      <Progress percent={80} success={{ percent: 30 }} format={(total, success) => `${total}% / 成功 ${success}%`} aria-label="总80成功30" />
    </DataDisplayDemoFrame>
  );
}
