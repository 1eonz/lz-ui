import { useState } from 'react';
import type { Key } from 'react';
import { Button, Tree } from 'lx-ui';
import type { TreeDataNode } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import { handleHorizontalScrollKeyDown } from './data-display-horizontal-scroll';
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

const treeTitles: Record<string, string> = {
  hq: '集团控股总部',
  cloud: '智能云与产业数字化事业群',
  rd: '基础架构与内核研发中心',
  security: '数据安全与信息审计实验室（集团核心生产环境权限）',
  services: '全球财务共享中心',
};

function formatTreeKeys(keys: Key[]) {
  return keys.length ? keys.map((key) => treeTitles[String(key)] ?? '未命名节点').join('、') : '无';
}

export default function TreeDemo() {
  const [expanded, setExpanded] = useState<Key[]>(['hq', 'cloud']);
  const [selected, setSelected] = useState<Key[]>(['security']);
  const [checked, setChecked] = useState<Key[]>(['rd']);
  return (
    <DataDisplayDemoFrame demoId="tree-controlled-demo">
      <div className={`${styles.row} ${styles.treeActions}`}>
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
      <div
        className={styles.treeViewport}
        role="region"
        aria-label="组织树内容"
        tabIndex={0}
        onKeyDown={handleHorizontalScrollKeyDown}
      >
        <Tree
          aria-label="组织与权限"
          className={`${styles.treeCanvas} organization-tree-root`}
          checkable
          blockNode
          expandAction="click"
          treeData={treeData}
          expandedKeys={expanded}
          selectedKeys={selected}
          checkedKeys={checked}
          onExpand={(keys) => setExpanded(keys)}
          onSelect={(keys) => setSelected(keys)}
          onCheck={(keys) => setChecked(Array.isArray(keys) ? keys : keys.checked)}
        />
      </div>
      <p className={styles.muted} role="status">
        选中节点：{formatTreeKeys(selected)}；已勾选：{formatTreeKeys(checked)}
      </p>
    </DataDisplayDemoFrame>
  );
}
