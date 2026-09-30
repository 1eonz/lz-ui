import { useId, useState } from 'react';
import { InputNumber, Select, Space, Switch, Text } from 'lx-ui';
import type { SpaceProps } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './general-demo.module.css';

export default function GeneralSpaceOptionsDemo() {
  const id = useId();
  const [gap, setGap] = useState(16);
  const [width, setWidth] = useState(360);
  const [direction, setDirection] = useState<SpaceProps['direction']>('horizontal');
  const [align, setAlign] = useState<SpaceProps['align']>('center');
  const [wrap, setWrap] = useState(true);
  return (
    <DataDisplayDemoFrame>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor={`${id}-gap`}>间距</label>
          <InputNumber
            className={styles.numericControl}
            id={`${id}-gap`}
            min={0}
            max={40}
            value={gap}
            onChange={(value) => setGap(typeof value === 'number' ? value : 0)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-width`}>容器宽度</label>
          <InputNumber
            className={styles.numericControl}
            id={`${id}-width`}
            min={180}
            max={560}
            step={20}
            value={width}
            onChange={(value) => setWidth(typeof value === 'number' ? value : 360)}
          />
        </div>
        <label className={styles.field}>
          排列方向
          <Select
            aria-label="排列方向"
            value={direction}
            options={[
              { label: '水平', value: 'horizontal' },
              { label: '垂直', value: 'vertical' },
            ]}
            onChange={setDirection}
          />
        </label>
        <label className={styles.field}>
          交叉轴对齐
          <Select
            aria-label="交叉轴对齐"
            value={align}
            options={[
              { label: '居中', value: 'center' },
              { label: '起点', value: 'flex-start' },
              { label: '基线', value: 'baseline' },
              { label: '拉伸', value: 'stretch' },
            ]}
            onChange={setAlign}
          />
        </label>
      </div>
      <Space align="center">
        <label htmlFor={`${id}-wrap`}>允许换行</label>
        <Switch id={`${id}-wrap`} checked={wrap} onChange={setWrap} />
      </Space>
      <div className={styles.preview} style={{ width }}>
        <Space size={gap} direction={direction} align={align} wrap={wrap} block>
          <Text strong>¥ 8,920.00</Text>
          <Text type="secondary">本月采购</Text>
          <Text code>PO-20261001</Text>
          <Text type="success">+14.2%</Text>
        </Space>
      </div>
    </DataDisplayDemoFrame>
  );
}
