import { Progress } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './feedback-scenarios.module.css';

export default function ProgressShapesDemo() {
  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Progress type="circle" percent={62.5} aria-label="附件导入" />
        <Progress type="dashboard" percent={80} success={{ percent: 30 }} aria-label="客户校验" />
        <Progress type="circle" percent={100} size={80} aria-label="附件处理完成" />
      </div>
      <Progress steps={8} percent={62.5} aria-label="分批导入" />
    </DataDisplayDemoFrame>
  );
}
