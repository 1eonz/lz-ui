import { useState } from 'react';
import type { Key } from 'react';
import { Button, Tree } from 'lx-ui';
import type { TreeDataNode } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

const treeData: TreeDataNode[] = [
  {
    key: 'hq',
    title: '集团控股总部',
    children: [
      {
        key: 'cloud',
        title: '智能云与产业数字化事业群',
        children: [
          { key: 'rd', title: '基础架构与内核研发中心' },
          { key: 'security', title: '数据安全与信息审计实验室（集团核心生产环境权限）' },
        ],
      },
      { key: 'services', title: '全球财务共享中心', disabled: true },
    ],
  },
];
export default function TreeDemo() {
  const [expanded, setExpanded] = useState<Key[]>(['hq', 'cloud']);
  const [selected, setSelected] = useState<Key[]>(['security']);
  const [checked, setChecked] = useState<Key[]>(['rd']);
  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Button onClick={() => setExpanded(['hq', 'cloud'])}>全部展开</Button>
        <Button onClick={() => setExpanded([])}>全部收起</Button>
        <Button
          onClick={() => {
            setSelected([]);
            setChecked([]);
          }}
        >
          清空选择
        </Button>
      </div>
      <Tree
        aria-label="组织与权限"
        checkable
        blockNode
        treeData={treeData}
        expandedKeys={expanded}
        selectedKeys={selected}
        checkedKeys={checked}
        onExpand={(keys) => setExpanded(keys)}
        onSelect={(keys) => setSelected(keys)}
        onCheck={(keys) => setChecked(Array.isArray(keys) ? keys : keys.checked)}
      />
      <p className={styles.muted} role="status">
        选中节点：{selected.join('、') || '无'}；已勾选：{checked.join('、') || '无'}
      </p>
    </DataDisplayDemoFrame>
  );
}
