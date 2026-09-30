import { useState } from 'react';
import {
  Avatar,
  Badge,
  Card,
  Descriptions,
  List,
  Pagination,
  Result,
  Statistic,
  Table,
  Tag,
  Tree,
} from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

const demoCustomers = [
  { id: 'c-1', name: 'Alice', level: '重点客户' },
  { id: 'c-2', name: 'Bob', level: '普通客户' },
];

export default function DataDisplayDemo() {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(1);
  return (
    <DataDisplayDemoFrame>
      <Card title="客户概览" extra={<Tag color="green">已启用</Tag>}>
        <div className={styles.row}>
          <Statistic title="本月订单" value={1280} />
          <Badge count={12} overflowCount={99}>
            <Avatar alt="客户" size="large">
              客
            </Avatar>
          </Badge>
        </div>
        <Descriptions
          column={2}
          items={[
            { key: 'owner', label: '负责人', children: '李明' },
            { key: 'level', label: '等级', children: '重点客户' },
          ]}
        />
      </Card>
      <List
        header="最近活动"
        dataSource={['创建客户档案', '完成首次订单']}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      />
      <Pagination
        current={current}
        total={demoCustomers.length}
        pageSize={pageSize}
        showSizeChanger
        pageSizeOptions={[1, 2]}
        onChange={(page, size) => {
          setPageSize(size);
          setCurrent(size !== pageSize ? 1 : page);
        }}
      />
      <Table
        rowKey="id"
        dataSource={demoCustomers.slice((current - 1) * pageSize, current * pageSize)}
        columns={[
          { title: '客户', dataIndex: 'name', key: 'name' },
          { title: '等级', dataIndex: 'level', key: 'level' },
        ]}
        pagination={false}
      />
      <Tree
        aria-label="客户目录"
        defaultExpandAll
        treeData={[
          { key: 'all', title: '全部客户', children: [{ key: 'vip', title: '重点客户' }] },
        ]}
      />
      <Result status="success" title="保存成功" extra={<Tag color="blue">继续操作</Tag>} />
    </DataDisplayDemoFrame>
  );
}
