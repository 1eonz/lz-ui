import { useId, useState } from 'react';
import SyncOutlined from '@ant-design/icons/SyncOutlined';
import ArrowUpOutlined from '@ant-design/icons/ArrowUpOutlined';
import { Icon, InputNumber, Select, Space, Switch } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './general-demo.module.css';

export default function GeneralIconVariantsDemo() {
  const id = useId();
  const [size, setSize] = useState(24);
  const [rotate, setRotate] = useState(90);
  const [spin, setSpin] = useState(true);
  return (
    <DataDisplayDemoFrame demoId="icon-variants">
      <div className={styles.fields}>
        <label className={styles.field}>
          图标尺寸
          <Select
            aria-label="图标尺寸"
            value={size}
            options={[16, 24, 32].map((value) => ({ label: `${value}px`, value }))}
            onChange={setSize}
          />
        </label>
        <div className={styles.field}>
          <label htmlFor={`${id}-rotate`}>方向角度</label>
          <InputNumber
            className={styles.numericControl}
            id={`${id}-rotate`}
            min={0}
            max={360}
            step={45}
            value={rotate}
            onChange={(value) => setRotate(typeof value === 'number' ? value : 0)}
          />
        </div>
        <Space align="center">
          <label htmlFor={`${id}-spin`}>持续同步</label>
          <Switch id={`${id}-spin`} checked={spin} onChange={setSpin} />
        </Space>
      </div>
      <div className={styles.iconPreview}>
        <Icon
          component={SyncOutlined}
          spin={spin}
          size={size}
          label={spin ? '持续同步' : '同步暂停'}
          color="var(--lx-color-primary-text)"
        />
        <Icon component={ArrowUpOutlined} rotate={rotate} size={size} label={`方向 ${rotate} 度`} />
      </div>
    </DataDisplayDemoFrame>
  );
}
