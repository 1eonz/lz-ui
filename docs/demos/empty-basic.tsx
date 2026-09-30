import { Empty } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

export default function EmptyBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <div className={styles.grid}>
        <Empty description="暂无关联采购单" />
        <Empty variant="small" description="筛选条件没有匹配结果" />
      </div>
    </DataDisplayDemoFrame>
  );
}
