import { useRef, useState } from 'react';
import type { ButtonRef } from 'lx-ui';
import { Button, Card, Statistic } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './card.module.css';

export default function CardDemo() {
  const loadingRef = useRef<ButtonRef>(null);
  const [tab, setTab] = useState('purchases');
  const [loading, setLoading] = useState(false);
  return (
    <DataDisplayDemoFrame>
      <Card
        className={styles.card}
        data-testid="card-demo"
        title={
          <div className={styles.heading}>
            <span className={styles.title}>运营指标概览</span>
            <Button
              className={styles.loadingButton}
              ref={loadingRef}
              onClick={() => setLoading(true)}
            >
              显示加载
            </Button>
          </div>
        }
        loading={loading}
        tabProps={{ tabBarGutter: 8 }}
        tabList={[
          {
            key: 'purchases',
            tab: (
              <>
                <span className={styles.fullTab}>采购运营</span>
                <span className={styles.compactTab}>采购</span>
              </>
            ),
          },
          {
            key: 'supply',
            tab: (
              <>
                <span className={styles.fullTab}>供应链风险</span>
                <span className={styles.compactTab}>供应链</span>
              </>
            ),
          },
          {
            key: 'audit',
            tab: (
              <>
                <span className={styles.fullTab}>外部审计</span>
                <span className={styles.compactTab}>审计</span>
              </>
            ),
          },
        ]}
        activeTabKey={tab}
        onTabChange={setTab}
      >
        {tab === 'purchases' && <Statistic title="本月采购订单" value={1829} suffix="单" />}
        {tab === 'supply' && <Statistic title="高风险供应商" value={12} suffix="家" />}
        {tab === 'audit' && <p>本季度外部审计已完成，待整改事项 3 项。</p>}
      </Card>
      <Button
        disabled={!loading}
        onClick={() => {
          loadingRef.current?.focus();
          setLoading(false);
        }}
      >
        完成加载
      </Button>
      <p role="status">{loading ? '运营指标加载中' : '运营指标已加载'}</p>
    </DataDisplayDemoFrame>
  );
}
