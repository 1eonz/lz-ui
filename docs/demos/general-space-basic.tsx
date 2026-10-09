import { useState } from 'react';
import { Button, Space, Text } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './general-demo.module.css';

export default function GeneralSpaceBasicDemo() {
  const [action, setAction] = useState('配置尚未修改');
  return (
    <DataDisplayDemoFrame demoId="space-basic">
      {(['small', 'middle', 'large'] as const).map((size) => (
        <div className={styles.group} key={size}>
          <p className={styles.label}>
            {size === 'small' ? '紧邻操作' : size === 'middle' ? '常规操作' : '独立操作'}
          </p>
          <Space size={size} wrap align="center">
            <Button type="primary" onClick={() => setAction('配置已保存')}>
              保存配置
            </Button>
            <Button onClick={() => setAction('已返回客户列表')}>返回上级</Button>
            <Button type="text" onClick={() => setAction('配置已重置')}>
              重置
            </Button>
          </Space>
        </div>
      ))}
      <p className={styles.status} role="status">
        {action}
      </p>
      <Space direction="vertical" size="small" block>
        <div className={styles.record}>
          <Text>节点集群 A</Text>
          <Text type="success">运行中</Text>
        </div>
        <div className={styles.record}>
          <Text>边缘网关 B</Text>
          <Text type="warning">维护中</Text>
        </div>
      </Space>
    </DataDisplayDemoFrame>
  );
}
