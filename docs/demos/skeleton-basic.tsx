import { Skeleton } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

export default function SkeletonBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <div className={styles.reserved}>
        <Skeleton loading active avatar paragraph={{ rows: 3 }} aria-label="采购明细加载中" />
      </div>
    </DataDisplayDemoFrame>
  );
}
