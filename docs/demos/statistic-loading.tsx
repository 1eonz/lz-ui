import { useState } from 'react';
import { Button, Statistic } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

export default function StatisticLoadingDemo() {
  const [loading, setLoading] = useState(false);

  return (
    <DataDisplayDemoFrame demoId="statistic-loading-demo">
      <div className={styles.row}>
        <Button onClick={() => setLoading((value) => !value)}>
          {loading ? '显示指标' : '显示加载状态'}
        </Button>
      </div>
      <div role="group" aria-label="Statistic 内置加载示例" aria-busy={loading}>
        <Statistic
          title="本月采购净清算总额"
          value={1280450}
          prefix="¥"
          precision={2}
          loading={loading}
        />
      </div>
      <p role="status" className={styles.muted}>
        {loading ? '指标加载中' : '指标已加载，数据为演示值'}
      </p>
    </DataDisplayDemoFrame>
  );
}
