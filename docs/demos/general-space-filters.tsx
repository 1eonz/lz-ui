import { useState } from 'react';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import { Button, Divider, Space, Text } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './general-demo.module.css';

const initial = ['客户等级：A', '状态：待审核', '负责人：陈晨'];

export default function GeneralSpaceFiltersDemo() {
  const [filters, setFilters] = useState(initial);
  return (
    <DataDisplayDemoFrame>
      <Space wrap>
        <Button
          onClick={() => setFilters((current) => [...current, '创建时间：本月'])}
          disabled={filters.includes('创建时间：本月')}
        >
          追加时间条件
        </Button>
        <Button onClick={() => setFilters(initial)}>恢复默认</Button>
        <Button type="text" disabled={!filters.length} onClick={() => setFilters([])}>
          清空
        </Button>
      </Space>
      <div className={styles.preview} style={{ maxWidth: 360 }}>
        <Space size={['middle', 'small']} wrap align="center" split={<Divider type="vertical" />}>
          {filters.map((filter) => (
            <Button
              key={filter}
              size="small"
              icon={<CloseOutlined />}
              iconPosition="end"
              aria-label={`移除条件：${filter}`}
              onClick={() => setFilters((current) => current.filter((item) => item !== filter))}
            >
              {filter}
            </Button>
          ))}
        </Space>
        {!filters.length && <Text type="secondary">没有筛选条件</Text>}
      </div>
      <p className={styles.status} role="status">
        已应用 {filters.length} 项筛选条件
      </p>
    </DataDisplayDemoFrame>
  );
}
