import { useRef, useState } from 'react';
import type { ButtonRef } from 'lx-ui';
import { Button, CheckableTag, Tag } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

const labels = ['ERP 模块', '服务 SLA', 'VIP 供应商'];
const filters = ['全部业务', '固定资产', '研发开发', '物流分类'];

export default function TagDemo() {
  const restoreRef = useRef<ButtonRef>(null);
  const [visible, setVisible] = useState(labels);
  const [filter, setFilter] = useState(filters[0]);
  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Tag>常规标签</Tag>
        <Tag color="blue">信息同步</Tag>
        <Tag color="success">审核通过</Tag>
        <Tag color="warning">审批待定</Tag>
        <Tag color="error">操作失败</Tag>
      </div>
      <div className={styles.row}>
        {visible.map((label) => (
          <Tag
            key={label}
            closable
            onClose={() => {
              // 关闭按钮随标签卸载，先将焦点移到始终存在的恢复操作。
              restoreRef.current?.focus();
              setVisible((items) => items.filter((item) => item !== label));
            }}
          >
            {label}
          </Tag>
        ))}
        <Button ref={restoreRef} onClick={() => setVisible(labels)}>
          恢复标签
        </Button>
      </div>
      <div className={styles.row} role="group" aria-label="业务分类">
        {filters.map((label) => (
          <CheckableTag key={label} checked={filter === label} onChange={() => setFilter(label)}>
            {label}
          </CheckableTag>
        ))}
      </div>
      <p className={styles.muted} role="status">
        当前分类：{filter}；可见标签：{visible.length} 个
      </p>
    </DataDisplayDemoFrame>
  );
}
