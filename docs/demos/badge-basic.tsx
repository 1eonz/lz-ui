import { BellOutlined } from '@ant-design/icons';
import { Avatar, Badge } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

export default function BadgeBasicDemo() {
  return (
    <DataDisplayDemoFrame demoId="badge-basic">
      <div className={styles.row}>
        <Badge count={120} overflowCount={99}>
          <span className={styles.notificationIcon} role="img" aria-label="通知">
            <BellOutlined aria-hidden="true" />
          </span>
        </Badge>
        <Badge count={8}>
          <Avatar className={styles.avatar}>LX</Avatar>
        </Badge>
      </div>
      <div className={styles.row}>
        <Badge count={120} overflowCount={99} />
        <Badge count={1200} overflowCount={999} />
      </div>
      <div className={styles.row}>
        <Badge status="processing" text="同步中" />
        <Badge status="success" text="已同步" />
        <Badge status="warning" text="等待确认" />
        <Badge status="error" text="同步失败" />
      </div>
      <div className={styles.row}>
        <Badge
          status="processing"
          color="blue"
          text="预设蓝色"
          classNames={{ indicator: 'badge-preset-indicator' }}
        />
        <Badge
          status="processing"
          text="主题色"
          classNames={{ indicator: 'badge-themed-indicator' }}
          styles={{ indicator: { color: 'var(--lx-color-primary)' } }}
        />
      </div>
      <div className={styles.row}>
        <Badge
          status="processing"
          text="渐变背景覆盖"
          classNames={{ indicator: 'badge-gradient-background-indicator' }}
          styles={{
            indicator: {
              backgroundImage: 'linear-gradient(90deg, var(--lx-color-primary), transparent)',
            },
          }}
        />
        <Badge
          status="processing"
          text="无背景填充"
          classNames={{ indicator: 'badge-no-background-indicator' }}
          styles={{ indicator: { backgroundImage: 'none' } }}
        />
      </div>
      <div className={styles.row}>
        <Badge.Ribbon
          className="lx-demo-badge-ribbon"
          rootClassName={`lx-demo-badge-ribbon-wrapper ${styles.badgeRibbonWrapper}`}
          text="SLA VIP 认证"
          placement="end"
        >
          <div className={styles.badgeRibbonCard} data-testid="badge-ribbon-card">
            <strong>重点客户服务</strong>
            <span className={styles.muted}>响应目标：24 小时内</span>
          </div>
        </Badge.Ribbon>
        <Badge.Ribbon
          className="lx-demo-badge-ribbon-start"
          rootClassName={`lx-demo-badge-ribbon-start-wrapper ${styles.badgeRibbonWrapper}`}
          text="起始位置"
          placement="start"
        >
          <div className={styles.badgeRibbonCard} data-testid="badge-ribbon-start-card">
            <strong>区域内起始侧标记</strong>
            <span className={styles.muted}>RTL 下镜像到右侧</span>
          </div>
        </Badge.Ribbon>
      </div>
    </DataDisplayDemoFrame>
  );
}
