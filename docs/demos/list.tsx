import { useState } from 'react';
import { Avatar, Button, Empty, List, Result, Tag } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

const initialTasks = [
  {
    id: 'PO-0982',
    title: '大宗智能制造设备全资采购入账',
    description: '交易流水号 TRX-202410-0982，深蓝自动化设备合同已完成审批。',
    amount: '¥ 1,280,000.00',
  },
  {
    id: 'PO-0983',
    title: '三期光刻机采购配置款汇支支付',
    description: '外汇相关单据已上传，财务部门需要再次确认收款方账户。',
    amount: '¥ 420,500.00',
  },
  {
    id: 'PO-0984',
    title: '华南供应商跨区域配送与售后服务标准协议复核',
    description: '包含物流调度、安装验收、异常响应及售后费用核对；请在审核后完成记录。',
    amount: '¥ 850,000.00',
  },
];
export default function ListDemo() {
  const [state, setState] = useState<'ready' | 'loading' | 'error'>('ready');
  const [tasks, setTasks] = useState(initialTasks);
  const [completed, setCompleted] = useState<string[]>([]);
  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Button onClick={() => setState('loading')}>显示加载</Button>
        <Button onClick={() => setState('ready')}>显示内容</Button>
        <Button onClick={() => setState('error')}>模拟失败</Button>
        <Button
          onClick={() => {
            setTasks([]);
            setState('ready');
          }}
        >
          清空事务
        </Button>
        <Button
          onClick={() => {
            setTasks(initialTasks);
            setCompleted([]);
            setState('ready');
          }}
        >
          恢复事务
        </Button>
      </div>
      <div className={styles.reserved}>
        {state === 'error' ? (
          <Result
            status="error"
            title="事务暂时无法读取"
            subTitle="本地错误演示；点击重试恢复已有事务。"
            extra={<Button onClick={() => setState('ready')}>重试</Button>}
          />
        ) : (
          <List
            loading={state === 'loading'}
            header="企业事务流"
            dataSource={tasks}
            locale={{
              emptyText: (
                <Empty
                  variant="small"
                  description="暂无事务"
                  action={<Button onClick={() => setTasks(initialTasks)}>恢复事务</Button>}
                />
              ),
            }}
            renderItem={(task) => (
              <List.Item
                key={task.id}
                actions={[
                  <Button
                    key="complete"
                    size="small"
                    disabled={completed.includes(task.id)}
                    onClick={() => setCompleted((ids) => [...ids, task.id])}
                  >
                    {completed.includes(task.id) ? '已完成' : '完成'}
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar className={styles.avatar} aria-label="采购事务">
                      采
                    </Avatar>
                  }
                  title={
                    <>
                      {task.title}{' '}
                      {completed.includes(task.id) && <Tag color="success">已完成</Tag>}
                    </>
                  }
                  description={
                    <>
                      {task.description} · {task.amount}
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
      <p className={styles.muted} role="status">
        {state === 'loading'
          ? '事务加载中'
          : state === 'error'
            ? '事务读取失败'
            : `共 ${tasks.length} 条，已完成 ${completed.length} 条`}
      </p>
    </DataDisplayDemoFrame>
  );
}
