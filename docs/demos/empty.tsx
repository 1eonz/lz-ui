import { useRef, useState } from 'react';
import type { InputRef } from 'lx-ui';
import { Button, Empty, Input, List } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

export default function EmptyDemo() {
  const inputRef = useRef<InputRef>(null);
  const [orders, setOrders] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const filtered = orders.filter((order) => order.includes(query));
  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Input
          ref={inputRef}
          aria-label="采购单筛选"
          placeholder="采购单编号"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button
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
          description="暂无关联采购单"
          action={
            <Button
              type="primary"
              onClick={() => {
                inputRef.current?.focus();
                setOrders(['PO-2024-1881']);
              }}
            >
              新建采购单
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
                description="没有匹配的采购单"
                action={
                  <Button
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
