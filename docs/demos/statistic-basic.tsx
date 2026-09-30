import { Statistic } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

export default function StatisticBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <div className={styles.grid}>
        <Statistic title="本月累计净营收" value={1280450} prefix="¥" precision={2} />
        <Statistic title="本月采购订单" value={1829} suffix="单" />
      </div>
    </DataDisplayDemoFrame>
  );
}
