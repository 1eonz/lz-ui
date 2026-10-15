import { Button, Tooltip } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './feedback-tooltip-demo.module.css';

export default function TooltipBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <div className={`${styles.row} ${styles.syncExamples}`}>
        <Tooltip title="最近一次同步于 14:32 完成" placement="top">
          <Button
            className={`${styles.compactTrigger} ${styles.tooltipTrigger}`}
            data-testid="tooltip-demo-trigger"
          >
            客户同步状态
          </Button>
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
          <Button
            className={`${styles.compactTrigger} ${styles.tooltipTrigger}`}
            data-testid="tooltip-demo-trigger"
          >
            同步计划
          </Button>
        </Tooltip>
      </div>
      <div className={styles.row} role="group" aria-label="禁用操作原因">
        <Button disabled>提交订单</Button>
        <Tooltip title="请先补充联系人邮箱并保存，之后才能提交订单。">
          <Button className={styles.tooltipTrigger} data-testid="tooltip-demo-trigger" type="link">
            为什么暂不可提交？
          </Button>
        </Tooltip>
      </div>
      <p className={styles.note}>
        默认由鼠标悬停或键盘焦点触发；内容限于简短说明，禁用操作的原因放在可聚焦的帮助按钮上。
      </p>
    </DataDisplayDemoFrame>
  );
}
