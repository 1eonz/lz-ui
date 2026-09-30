import '../../src/style.css';
import { Button, Divider, LxConfigProvider, Space } from '../../src';

export default function SpaceDemo() {
  return (
    <LxConfigProvider>
      <Space size={['middle', 'small']} wrap align="center" split={<Divider type="vertical" />}>
        <Button>保存</Button>
        <Button>取消</Button>
        <Button>更多操作</Button>
      </Space>
    </LxConfigProvider>
  );
}
