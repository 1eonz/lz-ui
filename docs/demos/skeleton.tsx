import { useRef, useState } from 'react';
import type { ButtonRef } from 'lx-ui';
import { Avatar, Button, Result, Skeleton } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

export default function SkeletonDemo() {
  const readyRef = useRef<ButtonRef>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Button onClick={() => setState('loading')}>显示加载</Button>
        <Button ref={readyRef} onClick={() => setState('ready')}>
          完成加载
        </Button>
        <Button onClick={() => setState('error')}>模拟失败</Button>
      </div>
      <div className={styles.reserved}>
        {state === 'error' ? (
          <Result
            status="error"
            title="采购单明细加载失败"
            extra={
              <Button
                onClick={() => {
                  readyRef.current?.focus();
                  setState('ready');
                }}
              >
                重试
              </Button>
            }
          />
        ) : (
          <Skeleton
            loading={state === 'loading'}
            active
            avatar
            paragraph={{ rows: 3 }}
            aria-label="采购单明细加载中"
          >
            <div className={styles.row}>
              <Avatar className={styles.avatar} aria-label="采购负责人">
                周
              </Avatar>
              <strong>PO-2024-1881 · 智能制造设备采购</strong>
            </div>
            <p>供应商：上海深蓝光电高新材料有限公司</p>
            <p>采购总额：¥ 1,428,900.00</p>
            <p>当前状态：已完成合同审核，等待首期付款。</p>
          </Skeleton>
        )}
      </div>
      <p role="status" className={styles.muted}>
        {state === 'loading'
          ? '采购单明细加载中'
          : state === 'error'
            ? '采购单明细加载失败'
            : '采购单明细已加载'}
      </p>
    </DataDisplayDemoFrame>
  );
}
