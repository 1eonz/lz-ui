import { useId, useState } from 'react';
import PlusOutlined from '@ant-design/icons/PlusOutlined';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { Button, Space, Text } from 'lx-ui';
import { ConfigProvider } from 'lx-ui/antd';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './general-demo.module.css';

export default function GeneralButtonVariantsDemo() {
  const id = useId();
  const [archived, setArchived] = useState(false);
  const [action, setAction] = useState('当前客户处于正常状态');
  // 主色背景上固定使用已验证的 on-primary，避免 AntD 默认 hover 前景与背景接近。
  // 此覆盖仅用于本例启用的 ghost 操作；禁用操作应保留原生禁用样式，不复用它。
  const ghostStyle = {
    color: 'var(--lx-color-on-primary)',
    borderColor: 'var(--lx-color-on-primary)',
  };
  return (
    <DataDisplayDemoFrame demoId="button-variants">
      <div className={styles.group}>
        <p className={styles.label}>操作尺寸</p>
        <Space wrap align="center">
          <Button onClick={() => setAction('已使用默认尺寸')}>默认尺寸</Button>
          <Button size="small" onClick={() => setAction('已添加备注')}>
            添加备注
          </Button>
          <Button size="middle" onClick={() => setAction('已保存客户资料')}>
            保存资料
          </Button>
          <Button
            size="large"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAction('已创建合同草稿')}
          >
            创建合同
          </Button>
        </Space>
      </div>
      <div className={styles.group} data-testid="button-host-size-scope">
        <p className={styles.label}>宿主 componentSize 不改变 lx 默认档位</p>
        <Space wrap align="center">
          <ConfigProvider componentSize="small">
            <Button data-testid="button-default-under-host-small">宿主 small 下的默认尺寸</Button>
          </ConfigProvider>
          <ConfigProvider componentSize="large">
            <Button data-testid="button-default-under-host-large">宿主 large 下的默认尺寸</Button>
          </ConfigProvider>
        </Space>
      </div>
      <div className={styles.group}>
        <p className={styles.label}>形状、图标与禁用</p>
        <Space wrap align="center">
          <Button
            shape="circle"
            icon={<SearchOutlined />}
            aria-label="搜索客户"
            title="搜索客户"
            onClick={() => setAction('已打开客户搜索')}
          />
          <Button shape="round" icon={<PlusOutlined />} onClick={() => setAction('已添加联系人')}>
            添加联系人
          </Button>
          <Button disabled>权限不足</Button>
          <Button
            danger
            onClick={() => {
              setArchived(!archived);
              setAction(archived ? '客户已恢复' : '客户已归档');
            }}
          >
            {archived ? '恢复客户' : '归档客户'}
          </Button>
        </Space>
      </div>
      <div className={styles.contrastBand}>
        <Button ghost style={ghostStyle} onClick={() => setAction('已保存发布草稿')}>
          保存草稿
        </Button>
        <Button ghost style={ghostStyle} href={`#${id}-details`}>
          查看发布记录
        </Button>
      </div>
      <Button block type="primary" onClick={() => setAction('已提交客户资料审核')}>
        提交审核
      </Button>
      <p className={styles.status} role="status">
        {action}
      </p>
      <Text id={`${id}-details`}>发布记录：暂无待发布合同</Text>
    </DataDisplayDemoFrame>
  );
}
