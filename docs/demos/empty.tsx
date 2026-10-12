import { useRef, useState } from 'react';
import type { InputRef } from 'lx-ui';
import { Button, Empty, Input, List } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';
import { EmptyDemoIllustration } from './empty-illustration';

export default function EmptyDemo() {
  const inputRef = useRef<InputRef>(null);
  const [orders, setOrders] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const filtered = orders.filter((order) => order.includes(query));
  return (
    <DataDisplayDemoFrame demoId="empty-demo">
      <div className={styles.row}>
        <Input
          ref={inputRef}
          aria-label="采购单筛选"
          placeholder="采购单编号"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button
          className={styles.emptySkeletonAction}
          disabled={orders.length === 0}
          onClick={() => {
            inputRef.current?.focus();
            setOrders([]);
            setQuery('');
          }}
        >
          清空采购单
        </Button>
      </div>
      {orders.length === 0 ? (
        <Empty
          image={<EmptyDemoIllustration />}
          styles={{ image: { height: '96px', opacity: 1 } }}
          description="暂无关联采购单"
          action={
            <Button
              className={styles.emptySkeletonAction}
              type="primary"
              onClick={() => {
                inputRef.current?.focus();
                setOrders(['PO-2024-1881']);
              }}
            >
              立即新建采购单
            </Button>
          }
        />
      ) : (
        <List
          dataSource={filtered}
          renderItem={(order) => <List.Item key={order}>{order}</List.Item>}
          locale={{
            emptyText: (
              <Empty
                variant="small"
                image={<EmptyDemoIllustration size="small" />}
                styles={{ image: { height: '32px', opacity: 1 } }}
                description="没有匹配的采购单"
                action={
                  <Button
                    className={styles.emptySkeletonAction}
                    onClick={() => {
                      inputRef.current?.focus();
                      setQuery('');
                    }}
                  >
                    清除筛选
                  </Button>
                }
              />
            ),
          }}
        />
      )}
      <p className={styles.muted} role="status">
        共 {orders.length} 张采购单，匹配 {filtered.length} 张
      </p>
    </DataDisplayDemoFrame>
  );
}
