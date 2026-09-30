import { useState } from 'react';
import { Button, Space } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './general-demo.module.css';

export default function GeneralButtonBasicDemo() {
  const [action, setAction] = useState('尚未执行操作');
  return (
    <DataDisplayDemoFrame>
      <Space wrap align="center">
        <Button type="primary" onClick={() => setAction('已创建客户草稿')}>
          新建客户
        </Button>
        <Button onClick={() => setAction('已保存当前筛选条件')}>保存筛选</Button>
        <Button type="dashed" onClick={() => setAction('已追加一条筛选条件')}>
          添加条件
        </Button>
        <Button type="text" onClick={() => setAction('已清空筛选条件')}>
          重置
        </Button>
        <Button type="link" onClick={() => setAction('已展开操作记录')}>
          操作记录
        </Button>
      </Space>
      <p className={styles.status} role="status">
        {action}
      </p>
    </DataDisplayDemoFrame>
  );
}
