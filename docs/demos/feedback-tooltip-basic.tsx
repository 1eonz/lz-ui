import { useCallback, useEffect, useState } from 'react';
import type { TooltipRef } from 'lx-ui';
import { Button, Tooltip } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './feedback-tooltip-demo.module.css';

export default function TooltipBasicDemo() {
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);
  const [describedBy, setDescribedBy] = useState('未建立');

  useEffect(() => {
    if (!triggerElement) {
      setDescribedBy('未建立');
      return;
    }

    const readDescription = () =>
      setDescribedBy(triggerElement.getAttribute('aria-describedby') || '未建立');
    const observer = new MutationObserver(readDescription);
    observer.observe(triggerElement, { attributes: true, attributeFilter: ['aria-describedby'] });
    readDescription();
    return () => observer.disconnect();
  }, [triggerElement]);

  const tooltipRef = useCallback((instance: TooltipRef | null) => {
    setTriggerElement(instance?.nativeElement ?? null);
  }, []);

  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Tooltip
          ref={tooltipRef}
          id="sync-status-tooltip"
          aria-describedby="sync-form-description"
          title="最近一次同步于 14:32 完成"
          placement="top"
        >
          <Button aria-describedby="sync-field-description">客户同步状态</Button>
        </Tooltip>
        <Tooltip
          title={
            <span>
              客户资料已同步
              <br />
              下次同步：今天 22:00
            </span>
          }
          placement="topRight"
          arrow={{ pointAtCenter: true }}
        >
          <Button>同步计划</Button>
        </Tooltip>
      </div>
      <div className={styles.describedExample}>
        <p className={styles.note}>按钮关联字段与表单说明；打开提示后还会加入 Tooltip ID。</p>
        <details>
          <summary className={styles.note}>
            查看当前 aria-describedby 完整值（不会自动播报）
          </summary>
          <p className={styles.note}>
            触发元素当前的 <code>aria-describedby</code> 为 {describedBy}
          </p>
        </details>
        <p className={styles.note} id="sync-field-description">
          字段说明：同步结果只包含当前筛选范围内的客户。
        </p>
        <p className={styles.note} id="sync-form-description">
          表单说明：失败时保留草稿并允许重新同步。
        </p>
      </div>
      <div className={styles.row} role="group" aria-label="禁用操作原因">
        <Button disabled>提交订单</Button>
        <Tooltip title="请先补充联系人邮箱并保存，之后才能提交订单。">
          <Button type="link">为什么暂不可提交？</Button>
        </Tooltip>
      </div>
      <p className={styles.note}>
        默认由鼠标悬停或键盘焦点触发；已有说明与打开后的提示描述会合并。
      </p>
    </DataDisplayDemoFrame>
  );
}
