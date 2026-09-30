import { useId, useState } from 'react';
import { Divider, Input, Select, Space, Switch, Text } from 'lx-ui';
import type { DividerProps } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './general-demo.module.css';

export default function GeneralDividerVariantsDemo() {
  const id = useId();
  const [variant, setVariant] = useState<DividerProps['variant']>('dashed');
  const [orientation, setOrientation] = useState<DividerProps['orientation']>('left');
  const [title, setTitle] = useState('安全策略审计');
  const [plain, setPlain] = useState(false);
  return (
    <DataDisplayDemoFrame>
      <div className={styles.fields}>
        <label className={styles.field}>
          线型
          <Select
            aria-label="线型"
            value={variant}
            options={[
              { label: '实线', value: 'solid' },
              { label: '虚线', value: 'dashed' },
              { label: '点线', value: 'dotted' },
            ]}
            onChange={setVariant}
          />
        </label>
        <label className={styles.field}>
          标题位置
          <Select
            aria-label="标题位置"
            value={orientation}
            options={[
              { label: '居左', value: 'left' },
              { label: '居中', value: 'center' },
              { label: '居右', value: 'right' },
            ]}
            onChange={setOrientation}
          />
        </label>
        <div className={styles.field}>
          <label htmlFor={`${id}-title`}>分组标题</label>
          <Input
            id={`${id}-title`}
            value={title}
            allowClear
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
      </div>
      <Space align="center">
        <label htmlFor={`${id}-plain`}>普通标题字重</label>
        <Switch id={`${id}-plain`} checked={plain} onChange={setPlain} />
      </Space>
      <div className={`${styles.preview} ${styles.content}`}>
        <Divider variant={variant} orientation={orientation} plain={plain}>
          {title || undefined}
        </Divider>
        <Space wrap align="center">
          <Text>网络访问</Text>
          <Divider type="vertical" variant={variant} />
          <Text>证书审计</Text>
          <Divider type="vertical" variant={variant} />
          <Text>操作日志</Text>
        </Space>
      </div>
    </DataDisplayDemoFrame>
  );
}
