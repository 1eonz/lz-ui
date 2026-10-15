import { useCallback, useEffect, useState } from 'react';
import type { TooltipRef } from 'lx-ui';
import { Button, Tooltip } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './feedback-tooltip-demo.module.css';

function useObservedDescription() {
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  const [describedBy, setDescribedBy] = useState('未建立');

  useEffect(() => {
    if (!triggerElement) {
      setDescribedBy('未建立');
      return;
    }

    const readDescription = () =>
      setDescribedBy(triggerElement.getAttribute('aria-describedby') || '无');
    const observer = new MutationObserver(readDescription);
    observer.observe(triggerElement, { attributes: true, attributeFilter: ['aria-describedby'] });
    readDescription();
    return () => observer.disconnect();
  }, [triggerElement]);

  const tooltipRef = useCallback((instance: TooltipRef | null) => {
    setTriggerElement(instance?.nativeElement ?? null);
  }, []);

  return { describedBy, tooltipRef };
}

export default function TooltipAccessibilityDemo() {
  const statusDescription = useObservedDescription();
  const scheduleDescription = useObservedDescription();

  return (
    <DataDisplayDemoFrame>
      <div className={`${styles.row} ${styles.syncExamples}`}>
        <Tooltip
          ref={statusDescription.tooltipRef}
          id="sync-status-a11y-tooltip"
          aria-describedby="sync-form-description"
          title="最近一次同步于 14:32 完成"
          placement="top"
        >
          <Button
            className={`${styles.compactTrigger} ${styles.tooltipTrigger}`}
            data-testid="tooltip-a11y-trigger"
            aria-describedby="sync-field-description"
          >
            客户同步状态说明
          </Button>
        </Tooltip>
        <Tooltip
          ref={scheduleDescription.tooltipRef}
          id="sync-schedule-a11y-tooltip"
          aria-describedby="sync-window-description"
          title={
            <span>
              客户资料已同步
              <br />
              下次同步：今天 22:00
            </span>
          }
          placement="topRight"
        >
          <Button
            className={`${styles.compactTrigger} ${styles.tooltipTrigger}`}
            data-testid="tooltip-a11y-trigger"
            aria-describedby="sync-time-description"
          >
            查看下次同步说明
          </Button>
        </Tooltip>
      </div>
      <div className={styles.describedExample}>
        <p className={styles.note}>
          Tooltip 打开时会把自身 ID 合并到触发元素已有的说明中；关闭后恢复原有说明。
        </p>
        <p className={styles.note}>
          客户同步状态的 <code>aria-describedby</code>：
          <span data-testid="tooltip-a11y-describedby-status">{statusDescription.describedBy}</span>
        </p>
        <p className={styles.note}>
          下次同步的 <code>aria-describedby</code>：
          <span data-testid="tooltip-a11y-describedby-schedule">
            {scheduleDescription.describedBy}
          </span>
        </p>
        <p className={styles.note} id="sync-field-description">
          字段说明：同步结果只包含当前筛选范围内的客户。
        </p>
        <p className={styles.note} id="sync-form-description">
          表单说明：失败时保留草稿并允许重新同步。
        </p>
        <p className={styles.note} id="sync-time-description">
          时间说明：计划时间按账户所在时区显示。
        </p>
        <p className={styles.note} id="sync-window-description">
          窗口说明：每日同步任务最晚在 22:00 开始。
        </p>
      </div>
    </DataDisplayDemoFrame>
  );
}
