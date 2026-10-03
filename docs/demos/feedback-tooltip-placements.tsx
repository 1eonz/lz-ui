import { Button, Tooltip } from 'lx-ui';
import type { TooltipPlacement } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './feedback-tooltip-demo.module.css';

const placementGroups: Array<{ label: string; placements: TooltipPlacement[] }> = [
  { label: '上方', placements: ['topLeft', 'top', 'topRight'] },
  { label: '右侧', placements: ['rightTop', 'right', 'rightBottom'] },
  { label: '下方', placements: ['bottomLeft', 'bottom', 'bottomRight'] },
  { label: '左侧', placements: ['leftTop', 'left', 'leftBottom'] },
];

export default function TooltipPlacementsDemo() {
  return (
    <DataDisplayDemoFrame>
      <div className={styles.placementGroups}>
        {placementGroups.map(({ label, placements }) => (
          <div
            className={styles.placementGroup}
            role="group"
            aria-label={`${label}提示位置`}
            key={label}
          >
            <h3 className={styles.placementHeading}>{label}</h3>
            <div className={styles.placements}>
              {placements.map((placement) => (
                <Tooltip key={placement} title={`提示位于 ${placement}`} placement={placement}>
                  <Button className={styles.placementButton}>{placement}</Button>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.edgeExample}>
        <h3 className={styles.placementHeading}>视口边缘与窄屏</h3>
        <div className={styles.edgeStage}>
          <Tooltip
            title="请求位置为 left；靠近左边缘时会自动调整"
            placement="left"
            autoAdjustOverflow
          >
            <Button>左侧触点</Button>
          </Tooltip>
          <Tooltip
            title="请求位置为 right；靠近右边缘时会自动调整"
            placement="right"
            autoAdjustOverflow
          >
            <Button>右侧触点</Button>
          </Tooltip>
        </div>
        <p className={styles.note}>
          将页面缩至 320–390px，再悬停或聚焦两端按钮，检查提示在视口内的翻转与文字换行。
        </p>
      </div>
    </DataDisplayDemoFrame>
  );
}
