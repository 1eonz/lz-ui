import { useState } from 'react';
import { Button, RadioGroup, Result } from 'lx-ui';
import type { ResultProps } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

type DemoStatus = 'success' | 'error' | 'info' | 'warning' | '403' | '404' | '500';
const messages: Record<DemoStatus, { title: string; detail: string }> = {
  success: { title: '采购付款凭证提交成功', detail: '采购单 TRX-202410-0982 已提交至审核队列。' },
  error: { title: '付款凭证提交失败', detail: '本地失败状态演示：恢复后可以重新提交凭证。' },
  info: { title: '凭证等待财务审核', detail: '审核完成前可以查看当前提交记录。' },
  warning: { title: '凭证附件尚不完整', detail: '补齐合同附件后可以继续提交。' },
  '403': { title: '暂无访问权限', detail: '此记录需要财务审核角色。' },
  '404': { title: '采购记录不存在', detail: '当前记录可能已经归档。' },
  '500': { title: '采购服务暂时不可用', detail: '本地服务错误演示，可以重试恢复。' },
};
export default function ResultDemo() {
  const [status, setStatus] = useState<DemoStatus>('success');
  const [detail, setDetail] = useState(false);
  const [list, setList] = useState(false);
  const restricted = status === '403' || status === '404';
  return (
    <DataDisplayDemoFrame>
      <RadioGroup
        aria-label="结果状态"
        value={status}
        options={[
          { label: '成功', value: 'success' },
          { label: '失败', value: 'error' },
          { label: '信息', value: 'info' },
          { label: '警告', value: 'warning' },
          { label: '403', value: '403' },
          { label: '404', value: '404' },
          { label: '500', value: '500' },
        ]}
        onChange={(event) => {
          setStatus(event.target.value as DemoStatus);
          setDetail(false);
          setList(false);
        }}
      />
      <Result
        status={status as ResultProps['status']}
        title={messages[status].title}
        subTitle={messages[status].detail}
        extra={
          <div className={styles.row}>
            <Button
              type="primary"
              onClick={() => {
                if (restricted) {
                  setList(true);
                  setDetail(false);
                  return;
                }
                if (status === 'error' || status === '500') setStatus('success');
                setDetail(true);
              }}
            >
              {restricted
                ? '返回采购列表'
                : status === 'error' || status === '500'
                  ? '重试提交'
                  : '查看采购记录'}
            </Button>
            <Button onClick={() => setDetail((value) => !value)}>
              {restricted
                ? detail
                  ? '收起说明'
                  : '查看处理说明'
                : detail
                  ? '收起记录'
                  : '展开记录'}
            </Button>
          </div>
        }
      />
      {detail && (
        <div className={styles.note}>
          {status === '403'
            ? '当前账号不具备财务审核权限。请联系权限管理员申请角色；本示例不会授予权限或展示受保护记录。'
            : status === '404'
              ? '当前编号不存在，请返回列表并核对编号。此示例不会将不存在的记录转换为已保存凭证。'
              : '采购记录 TRX-202410-0982 · 金额 ¥ 1,280,000.00 · 凭证已保存'}
        </div>
      )}
      {list && (
        <div className={styles.note}>采购列表 · 当前没有可访问的采购记录，请核对编号及权限。</div>
      )}
      <p role="status" className={styles.muted}>
        {messages[status].title}
        {detail ? (restricted ? '，处理说明已展开' : '，采购记录已展开') : ''}
        {list ? '，已返回采购列表' : ''}
      </p>
    </DataDisplayDemoFrame>
  );
}
