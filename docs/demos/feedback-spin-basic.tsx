import { useState } from 'react';
import { Button, Spin } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './feedback-scenarios.module.css';

export default function SpinBasicDemo() {
  const [spinning, setSpinning] = useState(false);
  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Spin size="small" delay={0} />
        <Spin delay={0} />
        <Spin size="large" delay={0} />
      </div>
      <Button onClick={() => setSpinning((value) => !value)}>{spinning ? '停止加载' : '开始加载'}</Button>
      <div className={styles.row}>
        <span>立即：<Spin spinning={spinning} delay={0} /></span>
        <span>默认 300ms：<Spin spinning={spinning} /></span>
        <span>600ms：<Spin spinning={spinning} delay={600} /></span>
      </div>
    </DataDisplayDemoFrame>
  );
}
