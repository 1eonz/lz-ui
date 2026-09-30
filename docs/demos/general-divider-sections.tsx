import { useState } from 'react';
import DownOutlined from '@ant-design/icons/DownOutlined';
import UpOutlined from '@ant-design/icons/UpOutlined';
import { Button, Divider, Paragraph, Space, Text } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './general-demo.module.css';

export default function GeneralDividerSectionsDemo() {
  const [showDelivery, setShowDelivery] = useState(true);
  const [archived, setArchived] = useState(false);
  return (
    <DataDisplayDemoFrame>
      <div className={styles.content}>
        <Space wrap align="center" role="group" aria-label="采购订单操作">
          <Button
            icon={showDelivery ? <UpOutlined /> : <DownOutlined />}
            onClick={() => setShowDelivery(!showDelivery)}
            aria-expanded={showDelivery}
          >
            {showDelivery ? '收起交付信息' : '展开交付信息'}
          </Button>
          <Divider type="vertical" />
          <Button danger={!archived} onClick={() => setArchived(!archived)}>
            {archived ? '恢复订单' : '归档订单'}
          </Button>
        </Space>
        <Divider orientation="left">采购订单 PO-20261001</Divider>
        <Paragraph>采购内容：年度服务授权；负责人：陈晨。</Paragraph>
        {showDelivery && (
          <>
            <Divider orientation="left" variant="dashed">
              交付信息
            </Divider>
            <Paragraph>交付日期：2026-10-15；验收联系人：李明。</Paragraph>
          </>
        )}
        <p className={styles.status} role="status">
          <Text type={archived ? 'secondary' : 'success'}>
            {archived ? '订单已归档' : '订单处理中'}
          </Text>
        </p>
      </div>
    </DataDisplayDemoFrame>
  );
}
