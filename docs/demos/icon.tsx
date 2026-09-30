import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import '../../src/style.css';
import { Icon, LxConfigProvider, Space } from '../../src';

export default function IconDemo() {
  return (
    <LxConfigProvider>
      <Space size="large" align="center">
        <Icon component={SearchOutlined} label="搜索" size={20} />
        <Icon component={LoadingOutlined} label="加载中" spin size={20} />
        <Icon component={SearchOutlined} size={24} color="var(--lx-color-primary-text)" />
      </Space>
    </LxConfigProvider>
  );
}
