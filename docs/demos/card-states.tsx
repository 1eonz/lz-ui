import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Empty, RadioGroup } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './card.module.css';

type SupplierContentState = 'empty' | 'error' | 'ready';

export default function CardStatesDemo() {
  const [contentState, setContentState] = useState<SupplierContentState>('empty');
  const recoveryTitleRef = useRef<HTMLHeadingElement>(null);
  const focusTitleAfterRecoveryRef = useRef(false);

  useEffect(() => {
    if (contentState !== 'ready' || !focusTitleAfterRecoveryRef.current) return;

    focusTitleAfterRecoveryRef.current = false;
    recoveryTitleRef.current?.focus();
  }, [contentState]);

  const restoreSupplierContent = () => {
    focusTitleAfterRecoveryRef.current = true;
    setContentState('ready');
  };

  return (
    <DataDisplayDemoFrame demoId="card-states-demo">
      <fieldset className={styles.stateGroup}>
        <legend className={styles.stateGroupLegend}>供应商资料状态</legend>
        <RadioGroup
          optionType="button"
          value={contentState}
          options={[
            { label: '暂无数据', value: 'empty' },
            { label: '加载失败', value: 'error' },
            { label: '已恢复', value: 'ready' },
          ]}
          onChange={(event) => setContentState(event.target.value as SupplierContentState)}
        />
      </fieldset>
      <Card
        className={styles.card}
        title={<h3 className={styles.title}>供应商资料</h3>}
        data-testid="card-state-card"
      >
        {contentState === 'empty' ? (
          <Empty
            description="暂无供应商资料"
            action={<Button onClick={restoreSupplierContent}>添加供应商</Button>}
          />
        ) : contentState === 'error' ? (
          <div className={styles.errorState}>
            <Alert
              className={styles.errorAlert}
              type="error"
              showIcon
              message="供应商资料加载失败"
              description="检查连接后重试。"
            />
            <Button onClick={restoreSupplierContent}>重试</Button>
          </div>
        ) : (
          <h4 className={styles.stateContent} ref={recoveryTitleRef} tabIndex={-1}>
            供应商档案：华东精密制造有限公司
          </h4>
        )}
      </Card>
      <p role="status">
        {contentState === 'empty'
          ? '当前状态：暂无数据'
          : contentState === 'error'
            ? '当前状态：加载失败，可重试'
            : '当前状态：供应商资料已恢复'}
      </p>
    </DataDisplayDemoFrame>
  );
}
