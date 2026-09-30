import { useRef, useState } from 'react';
import type { ButtonRef } from 'lx-ui';
import { Avatar, Badge, Button } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

export default function BadgeDemo() {
  const restoreRef = useRef<ButtonRef>(null);
  const [count, setCount] = useState(12);
  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Badge count={count} overflowCount={99} showZero>
          <Avatar className={styles.avatar} aria-label="应用消息">
            LX
          </Avatar>
        </Badge>
        <Badge dot={count > 0}>
          <Avatar shape="square" aria-label="待办事项">
            待
          </Avatar>
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
      <div className={styles.row}>
        <Badge status="processing" text="同步中" />
        <Badge status="success" text="已成功" />
        <Badge status="warning" text="需确认" />
        <Badge status="error" text="同步失败" />
        <Badge status="default" text="未开始" />
      </div>
      <p role="status" className={styles.muted}>
        未读消息：{count}
      </p>
    </DataDisplayDemoFrame>
  );
}
