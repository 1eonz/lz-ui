import { useRef, useState } from 'react';
import { BellOutlined } from '@ant-design/icons';
import type { ButtonRef } from 'lx-ui';
import { Avatar, Badge, Button } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

export default function BadgeDemo() {
  const restoreRef = useRef<ButtonRef>(null);
  const [count, setCount] = useState(12);
  const [notificationSummaryOpen, setNotificationSummaryOpen] = useState(false);
  return (
    <DataDisplayDemoFrame demoId="badge-interactive">
      <div className={styles.row}>
        <Badge count={count} overflowCount={99} showZero>
          <Button
            aria-label="打开通知摘要"
            aria-controls="badge-notification-summary"
            aria-expanded={notificationSummaryOpen}
            icon={<BellOutlined aria-hidden="true" />}
            onClick={() => setNotificationSummaryOpen((open) => !open)}
            shape="circle"
          />
        </Badge>
        <Badge count={8}>
          <Avatar className={styles.avatar}>LX</Avatar>
        </Badge>
        <Button
          disabled={count === 0}
          onClick={() => {
            if (count === 1) restoreRef.current?.focus();
            setCount((value) => Math.max(0, value - 1));
          }}
        >
          读一条
        </Button>
        <Button onClick={() => setCount((value) => value + 100)}>新增 100 条</Button>
        <Button onClick={() => setCount(0)}>全部已读</Button>
        <Button ref={restoreRef} onClick={() => setCount(12)}>
          恢复消息
        </Button>
      </div>
      <p
        id="badge-notification-summary"
        role="status"
        hidden={!notificationSummaryOpen}
        className={styles.muted}
      >
        通知摘要已展开，当前有 {count} 条未读消息。
      </p>
      <div className={styles.row}>
        <Badge
          status="processing"
          text="同步中"
          classNames={{ indicator: 'badge-interactive-processing-indicator' }}
        />
        <Badge status="success" text="已同步" />
        <Badge status="warning" text="等待确认" />
        <Badge status="error" text="同步失败" />
      </div>
      <p role="status" className={styles.muted}>
        未读消息：{count}
      </p>
    </DataDisplayDemoFrame>
  );
}
