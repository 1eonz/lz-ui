import { useId, useState } from 'react';
import { Paragraph, Space, Switch, Text } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './general-demo.module.css';

const note =
  '客户已完成采购审批，合同将在法务复核后签署。实施团队需要提前核对联系人、部署环境、网络访问权限和验收负责人，交付排期以双方确认的工作日为准。';

export default function GeneralTypographyVariantsDemo() {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  return (
    <DataDisplayDemoFrame>
      <Space wrap>
        <Text>普通信息</Text>
        <Text type="secondary">次要说明</Text>
        <Text type="success">审核通过</Text>
        <Text type="warning">等待复核</Text>
        <Text type="danger">同步失败</Text>
        <Text disabled>已停用客户</Text>
      </Space>
      <Space wrap>
        <Text strong>重点客户</Text>
        <Text code>KH-1024</Text>
        <Text mark>本周签约</Text>
        <Text delete>旧负责人：李明</Text>
        <Text underline>新负责人：陈晨</Text>
      </Space>
      <div className={styles.content}>
        <Text ellipsis title={note} className={styles.clipped}>
          {note}
        </Text>
        <Paragraph ellipsis={expanded ? false : { rows: 2 }}>{note}</Paragraph>
        <Space align="center">
          <label htmlFor={`${id}-expand`}>完整跟进记录</label>
          <Switch id={`${id}-expand`} checked={expanded} onChange={setExpanded} />
        </Space>
      </div>
    </DataDisplayDemoFrame>
  );
}
