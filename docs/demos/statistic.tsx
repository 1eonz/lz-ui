import { useState } from 'react';
import { ArrowUpOutlined } from '@ant-design/icons';
import { Button, Skeleton, Statistic } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

const metricsByPeriod = {
  month: {
    revenue: 1280450,
    revenueTitle: '本月采购净清算总额',
    orderCount: 1829,
    orderTitle: '本月采购订单',
    growth: '14.8%',
    comparison: '较上月',
    trendLabel: '近五个月净清算金额走势示意',
    sparkline: 'M0 24 Q 15 28, 25 18 T 50 12 T 75 19 T 100 4',
  },
  quarter: {
    revenue: 3812900,
    revenueTitle: '本季度采购净清算总额',
    orderCount: 5291,
    orderTitle: '本季度采购订单',
    growth: '9.2%',
    comparison: '较上季度',
    trendLabel: '近五个季度净清算金额走势示意',
    sparkline: 'M0 25 Q 16 20, 25 23 T 50 11 T 76 15 T 100 5',
  },
} as const;

export default function StatisticDemo() {
  const [period, setPeriod] = useState<'month' | 'quarter'>('month');
  const [loading, setLoading] = useState(false);
  const metrics = metricsByPeriod[period];

  return (
    <DataDisplayDemoFrame demoId="statistic-demo">
      <div className={styles.row}>
        <Button onClick={() => setPeriod((value) => (value === 'month' ? 'quarter' : 'month'))}>
          {period === 'month' ? '查看本季度' : '查看本月'}
        </Button>
        <Button onClick={() => setLoading((value) => !value)}>
          {loading ? '显示指标' : '显示加载状态'}
        </Button>
      </div>
      <div
        className={styles.grid}
        role="group"
        aria-label="经营指标"
        aria-busy={loading}
        data-testid="statistic-demo-metrics"
      >
        <div
          className={`${styles.metric} ${styles.statisticMetric}`}
          data-testid="statistic-demo-primary"
        >
          <Skeleton loading={loading} role="presentation" paragraph={{ rows: 1 }}>
            <Statistic
              title={metrics.revenueTitle}
              prefix="¥"
              value={metrics.revenue}
              precision={2}
              valueStyle={{
                fontSize: 'var(--lx-statistic-demo-value-font-size, 2rem)',
                lineHeight: 'var(--lx-statistic-demo-value-line-height, 36px)',
                whiteSpace: 'nowrap',
              }}
            />
            <div className={styles.metricTrend} data-testid="statistic-demo-trend">
              <p className={styles.trendText} data-testid="statistic-demo-trend-text">
                <ArrowUpOutlined className={styles.trendMarker} aria-hidden="true" />
                <span>
                  {metrics.comparison} +{metrics.growth}
                </span>
              </p>
              <svg
                className={styles.sparkline}
                data-testid="statistic-demo-sparkline"
                viewBox="0 0 100 30"
                fill="none"
                role="img"
                aria-label={metrics.trendLabel}
                focusable="false"
              >
                <path
                  d={metrics.sparkline}
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </Skeleton>
        </div>
        <div
          className={`${styles.metric} ${styles.statisticSecondary}`}
          data-testid="statistic-demo-secondary"
        >
          <Skeleton loading={loading} role="presentation" paragraph={{ rows: 1 }}>
            <Statistic
              title={metrics.orderTitle}
              value={metrics.orderCount}
              suffix="单"
              valueStyle={{
                fontSize: 'var(--lx-statistic-demo-secondary-value-font-size, 1.5rem)',
                lineHeight: 'var(--lx-statistic-demo-secondary-value-line-height, 28px)',
                whiteSpace: 'nowrap',
              }}
            />
            <p className={styles.muted}>已审核入账</p>
          </Skeleton>
        </div>
      </div>
      <p className={styles.muted} data-testid="statistic-demo-disclaimer">
        净清算额按已入账采购金额扣除退款及暂扣款计算；数值和趋势均为演示数据。
      </p>
      <p role="status" className={styles.muted} data-testid="statistic-demo-status">
        {loading ? '指标加载中' : period === 'month' ? '本月指标' : '本季度指标'}
      </p>
    </DataDisplayDemoFrame>
  );
}
