import { useState } from 'react';
import { Button, Spin } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './feedback-scenarios.module.css';

export default function SpinIndicatorDemo() {
  const [spinning, setSpinning] = useState(true);
  return (
    <DataDisplayDemoFrame>
      <Spin delay={0} spinning={spinning} indicator={<span className={styles.customIndicator} aria-hidden="true" />} />
      <Button onClick={() => setSpinning((value) => !value)}>{spinning ? '停止加载' : '恢复加载'}</Button>
      <p role="status">{spinning ? '正在读取附件' : '附件读取已停止'}</p>
    </DataDisplayDemoFrame>
  );
}
