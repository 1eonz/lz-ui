import { useState } from 'react';
import { Button, List, Pagination } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

const orders = Array.from({ length: 248 }, (_, index) => ({
  id: index + 1,
  name: `采购单 PO-2024-${String(index + 1).padStart(4, '0')}`,
}));
export default function PaginationDemo() {
  const [current, setCurrent] = useState(3);
  const [pageSize, setPageSize] = useState(10);
  const [empty, setEmpty] = useState(false);
  const total = empty ? 0 : orders.length;
  const start = (current - 1) * pageSize;
  return (
    <DataDisplayDemoFrame>
      <Button
        onClick={() => {
          setEmpty((value) => !value);
          setCurrent(1);
        }}
      >
        {empty ? '恢复订单' : '清空订单'}
      </Button>
      <List
        dataSource={empty ? [] : orders.slice(start, start + pageSize)}
        renderItem={(order) => <List.Item key={order.id}>{order.name}</List.Item>}
      />
      <div className={styles.scroll}>
        <Pagination
          current={current}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          showQuickJumper
          pageSizeOptions={[10, 20, 50]}
          showTotal={(count, range) => `共 ${count} 条 · ${range[0]}–${range[1]} 条`}
          onChange={(page, size) => {
            setPageSize(size);
            setCurrent(size !== pageSize ? 1 : page);
          }}
        />
      </div>
      <p className={styles.muted} role="status">
        第 {current} 页，每页 {pageSize} 条
      </p>
    </DataDisplayDemoFrame>
  );
}
