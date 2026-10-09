import { useState } from 'react';
import StarOutlined from '@ant-design/icons/StarOutlined';
import StarFilled from '@ant-design/icons/StarFilled';
import ZoomInOutlined from '@ant-design/icons/ZoomInOutlined';
import ZoomOutOutlined from '@ant-design/icons/ZoomOutOutlined';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import { Button, Icon, Space, Text } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './general-demo.module.css';

export default function GeneralIconActionsDemo() {
  const [saved, setSaved] = useState(false);
  const [zoom, setZoom] = useState(100);
  return (
    <DataDisplayDemoFrame demoId="icon-actions">
      <Space wrap align="center" role="group" aria-label="合同查看操作">
        <Button
          icon={<Icon component={saved ? StarFilled : StarOutlined} />}
          aria-label={saved ? '取消收藏合同' : '收藏合同'}
          title={saved ? '取消收藏合同' : '收藏合同'}
          aria-pressed={saved}
          onClick={() => setSaved(!saved)}
        />
        <Button
          icon={<Icon component={ZoomOutOutlined} />}
          aria-label="缩小合同"
          title="缩小合同"
          disabled={zoom <= 50}
          onClick={() => setZoom((value) => value - 25)}
        />
        <Text>{zoom}%</Text>
        <Button
          icon={<Icon component={ZoomInOutlined} />}
          aria-label="放大合同"
          title="放大合同"
          disabled={zoom >= 200}
          onClick={() => setZoom((value) => value + 25)}
        />
        <Button
          icon={<Icon component={ReloadOutlined} />}
          aria-label="恢复原始缩放"
          title="恢复原始缩放"
          onClick={() => setZoom(100)}
        />
      </Space>
      <p className={styles.status} role="status">
        合同 KH-1024：{saved ? '已收藏' : '未收藏'}，显示比例 {zoom}%
      </p>
    </DataDisplayDemoFrame>
  );
}
