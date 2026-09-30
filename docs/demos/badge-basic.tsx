import { Badge } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

export default function BadgeBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Badge count={12} />
        <Badge count={120} overflowCount={99} />
        <Badge status="success" text="已同步" />
        <Badge status="error" text="同步失败" />
      </div>
    </DataDisplayDemoFrame>
  );
}
