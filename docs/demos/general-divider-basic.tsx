import { Divider, Paragraph, Space, Text } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './general-demo.module.css';

export default function GeneralDividerBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <div className={styles.content}>
        <Paragraph>杭州云栖科技已完成客户信息核对。</Paragraph>
        <Divider />
        <Paragraph>下一次跟进安排在周五上午。</Paragraph>
        <Divider orientation="left">客户资料</Divider>
        <Text>负责人：陈晨</Text>
        <Divider>合同状态</Divider>
        <Text>年度服务合同待签署</Text>
        <Divider orientation="right" plain>
          更新记录
        </Divider>
        <Space align="center">
          <Text>2026-10-01</Text>
          <Divider type="vertical" />
          <Text>陈晨更新</Text>
        </Space>
      </div>
    </DataDisplayDemoFrame>
  );
}
