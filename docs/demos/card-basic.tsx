import { Card } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './card.module.css';

export default function CardBasicDemo() {
  return (
    <DataDisplayDemoFrame demoId="card-basic-demo">
      <Card
        className={styles.card}
        title="采购协议"
        extra={<span>已归档</span>}
        data-testid="card-basic-card"
      >
        <dl className={styles.basicFields}>
          <div className={styles.basicField} data-testid="card-contract-field">
            <dt>合同编号</dt>
            <dd className={styles.contractNumber}>
              <code>CTR-2024-89941</code>
            </dd>
          </div>
          <div className={styles.basicField} data-testid="card-organization-field">
            <dt>签约机构</dt>
            <dd>深蓝智能工业装备科技有限公司</dd>
          </div>
        </dl>
      </Card>
    </DataDisplayDemoFrame>
  );
}
