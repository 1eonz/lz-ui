import { useEffect, useRef, useState } from 'react';
import type { ButtonRef } from 'lx-ui';
import { Button, Card, Statistic } from 'lx-ui';
import { Tabs } from 'lx-ui/antd';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './card.module.css';

// 窄屏改用简短业务标签；辅助技术仍读取完整名称，避免缩写脱离语境。
function renderTabLabel(fullLabel: string, compactLabel: string, ultraCompactLabel: string) {
  return (
    <span className={styles.tabLabel} data-testid="card-tab-label">
      <span className={styles.fullTab}>{fullLabel}</span>
      <span className={styles.compactTab}>
        <span className={styles.compactLabel} aria-hidden="true">
          {compactLabel}
        </span>
        <span
          className={styles.ultraCompactLabel}
          data-testid="card-ultra-compact-tab-label"
          aria-hidden="true"
        >
          {ultraCompactLabel}
        </span>
        <span className={styles.visuallyHidden}>{fullLabel}</span>
      </span>
    </span>
  );
}

function PeriodContext({ compact = false, value }: { compact?: boolean; value: string }) {
  return (
    <div
      className={`${styles.period} ${compact ? styles.compactPeriod : ''}`}
      data-testid={compact ? 'card-period-content' : 'card-period-header'}
    >
      <span className={styles.periodLabel}>数据周期：</span>
      <span className={styles.periodValue}>{value}</span>
    </div>
  );
}

export default function CardDemo() {
  const loadingRef = useRef<ButtonRef>(null);
  const completeLoadingRef = useRef<ButtonRef>(null);
  const [tab, setTab] = useState('settlement');
  const [loading, setLoading] = useState(false);
  const [restoreLoadingFocus, setRestoreLoadingFocus] = useState(false);
  const periodValue = tab === 'carrier-audit' ? '本季度' : '近 30 天';

  useEffect(() => {
    // 原生禁用会移走当前焦点；加载期间聚焦下一步操作，结束后再返回触发入口。
    if (loading) {
      completeLoadingRef.current?.focus();
      return;
    }

    if (!restoreLoadingFocus) return;

    setRestoreLoadingFocus(false);
    loadingRef.current?.focus();
  }, [loading, restoreLoadingFocus]);

  const finishLoading = () => {
    // 等待按钮解除禁用后再恢复焦点，避免浏览器拒绝聚焦 disabled 控件。
    setRestoreLoadingFocus(true);
    setLoading(false);
  };

  return (
    <DataDisplayDemoFrame demoId="card-demo-frame">
      <div className={styles.demoControls} role="group" aria-label="卡片加载演示">
        <Button
          className={styles.loadingButton}
          ref={loadingRef}
          disabled={loading}
          onClick={() => setLoading(true)}
        >
          显示加载
        </Button>
        <Button ref={completeLoadingRef} disabled={!loading} onClick={finishLoading}>
          完成加载
        </Button>
        <p className={styles.demoStatus} role="status">
          {loading ? '运营指标加载中' : '运营指标已加载'}
        </p>
      </div>
      <Card
        className={styles.card}
        data-testid="card-demo"
        role="region"
        aria-label="运营指标概览"
        aria-busy={loading}
        loading={loading}
        styles={{ body: { padding: 0 } }}
      >
        <Tabs
          activeKey={tab}
          className={styles.tabs}
          onChange={setTab}
          tabBarGutter={8}
          tabBarExtraContent={<PeriodContext value={periodValue} />}
          tabBarStyle={{
            background: 'var(--lx-color-bg-base)',
            paddingBlockStart: 'var(--lx-space-md)',
            paddingInline: 'var(--lx-space-lg)',
          }}
          items={[
            {
              key: 'settlement',
              label: renderTabLabel('资金结算概况', '结算概况', '结算'),
              children: (
                <>
                  <PeriodContext compact value={periodValue} />
                  <div className={styles.metricGrid} data-testid="card-metric-grid">
                    <div className={styles.metric}>
                      <Statistic title="采购总计单量" value={1829} suffix="单" />
                      <p className={`${styles.metricContext} ${styles.metricPositive}`}>
                        ↑ 8.2% 同比上期
                      </p>
                    </div>
                    <div className={styles.metric}>
                      <Statistic
                        title="在途物料总额"
                        value={24.8}
                        prefix="¥"
                        suffix="M"
                        valueStyle={{ color: 'var(--lx-color-primary)' }}
                      />
                      <p className={`${styles.metricContext} ${styles.metricDetail}`}>
                        92 个承运单在途
                      </p>
                    </div>
                    <div className={styles.metric}>
                      <Statistic
                        title="加急交割比例"
                        value={12.4}
                        suffix="%"
                        valueStyle={{ color: 'var(--lx-color-warning)' }}
                      />
                      <p className={`${styles.metricContext} ${styles.metricWarning}`}>
                        高于预警阈值 10%
                      </p>
                    </div>
                    <div className={styles.metric}>
                      <Statistic
                        title="入库一次合格率"
                        value={99.82}
                        suffix="%"
                        valueStyle={{ color: 'var(--lx-color-success)' }}
                      />
                      <p className={`${styles.metricContext} ${styles.metricPositive}`}>
                        达标 A 级标杆
                      </p>
                    </div>
                  </div>
                </>
              ),
            },
            {
              key: 'supply-risk',
              label: renderTabLabel('供应链风险告警', '供应风险', '风控'),
              children: (
                <>
                  <PeriodContext compact value={periodValue} />
                  <div className={styles.metricGrid}>
                    <div className={styles.metric}>
                      <Statistic title="高风险供应商" value={12} suffix="家" />
                    </div>
                    <p className={styles.panelNote}>3 家需要优先跟进，9 家处于持续观察。</p>
                  </div>
                </>
              ),
            },
            {
              key: 'carrier-audit',
              label: renderTabLabel('外部承运审计', '承运审计', '审计'),
              children: (
                <>
                  <PeriodContext compact value={periodValue} />
                  <div className={styles.auditPanel}>
                    <p>本季度外部承运审计已完成，待整改事项 3 项。</p>
                    <span className={styles.panelNote}>复核截止日期：2026 年 10 月 31 日</span>
                  </div>
                </>
              ),
            },
          ]}
        />
      </Card>
    </DataDisplayDemoFrame>
  );
}
