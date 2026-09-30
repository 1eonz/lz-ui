import { useState } from 'react';
import { Button, Skeleton, Statistic } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

export default function StatisticDemo() {
  const [period, setPeriod] = useState<'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(false);
  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Button onClick={() => setPeriod((value) => (value === 'month' ? 'quarter' : 'month'))}>
          {period === 'month' ? '查看本季度' : '查看本月'}
        </Button>
        <Button onClick={() => setLoading((value) => !value)}>
          {loading ? '显示指标' : '显示加载状态'}
        </Button>
      </div>
      <div className={styles.grid} aria-busy={loading}>
        <div className={styles.metric}>
          <Skeleton loading={loading} paragraph={{ rows: 1 }}>
            <Statistic
              title={period === 'month' ? '本月累计净营收' : '本季度累计净营收'}
              prefix="¥"
              value={period === 'month' ? 1280450 : 3812900}
              precision={2}
            />
            <p className={styles.success}>同比增长 14.8%</p>
          </Skeleton>
        </div>
        <div className={styles.metric}>
          <Skeleton loading={loading} paragraph={{ rows: 1 }}>
            <Statistic title="本期采购订单" value={period === 'month' ? 1829 : 5291} suffix="单" />
            <p className={styles.muted}>已审核入账</p>
          </Skeleton>
        </div>
      </div>
      <p role="status" className={styles.muted}>
        {loading ? '指标加载中' : period === 'month' ? '本月指标' : '本季度指标'}
      </p>
    </DataDisplayDemoFrame>
  );
}
