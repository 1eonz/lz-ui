import { useState } from 'react';
import { Button, Tooltip } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './feedback-tooltip-demo.module.css';

export default function TooltipControlledDemo() {
  const [open, setOpen] = useState(false);

  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Button onClick={() => setOpen((value) => !value)}>
          {open ? '关闭固定提示' : '打开固定提示'}
        </Button>
        <div className={styles.portalScope}>
          <Tooltip
            open={open}
            onOpenChange={setOpen}
            title="主题变量由局部容器继承"
            placement="right"
            color="var(--lx-color-bg-elevated)"
            classNames={{ body: styles.tokenBody }}
            styles={{
              body: {
                color: 'var(--lx-color-text)',
                borderColor: 'var(--lx-color-border)',
              },
            }}
            getPopupContainer={(triggerNode) => triggerNode.parentElement ?? document.body}
          >
            <Button>查看主题提示</Button>
          </Tooltip>
        </div>
      </div>
      <p className={styles.note} role="status">
        {open ? '提示已打开，可由按钮或触发器关闭。' : '当前为关闭状态。'}
      </p>
    </DataDisplayDemoFrame>
  );
}
