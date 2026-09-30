import '../../src/style.css';
import { Divider, LxConfigProvider, Space, Text } from '../../src';

export default function DividerDemo() {
  return (
    <LxConfigProvider>
      <div style={{ maxInlineSize: 520 }}>
        <Divider orientation="left">客户资料</Divider>
        <Text>名称与联系方式</Text>
        <Divider variant="dashed" />
        <Space align="center">
          <Text>概览</Text>
          <Divider type="vertical" />
          <Text>跟进记录</Text>
        </Space>
      </div>
    </LxConfigProvider>
  );
}
