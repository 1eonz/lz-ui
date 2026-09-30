import { Paragraph, Text, Title, Typography } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './general-demo.module.css';

export default function GeneralTypographyBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <div className={styles.content}>
        <Title level={1}>客户管理</Title>
        <Title level={2}>华东区域</Title>
        <Title level={3}>重点客户</Title>
        <Title level={4}>杭州云栖科技</Title>
        <Title level={5}>近期跟进</Title>
        <Paragraph>
          客户已完成合同确认，当前进入交付准备阶段。负责人将于周五确认实施排期。
        </Paragraph>
        <Text type="secondary" className={styles.caption}>
          更新于 2026-10-01 09:30
        </Text>
        <Paragraph>
          <Typography.Text strong>下一步：</Typography.Text>核对联系人和交付地址。
        </Paragraph>
      </div>
    </DataDisplayDemoFrame>
  );
}
