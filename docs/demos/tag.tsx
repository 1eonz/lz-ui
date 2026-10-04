import { useEffect, useRef, useState } from 'react';
import type { ButtonRef } from 'lx-ui';
import { Button, CheckableTag, Tag } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';
import tagStyles from './tag-demo.module.css';

const labels = ['ERP 模块', '服务 SLA', 'VIP 供应商'];
const filters = ['全部业务', '固定资产', '研发开发', '物流分类'];

/**
 * 读取标签所在主题作用域的退出时长，让状态移除与 CSS 动画同步。
 * 仅接受完整的 ms/s 时长；节点或 token 缺失、格式无效时立即移除，避免标签停留在禁用状态。
 */
function getTagExitDelay(element: HTMLElement | undefined) {
  if (!element) return 0;
  const value = window
    .getComputedStyle(element)
    .getPropertyValue('--lx-motion-tag-exit-duration')
    .trim();
  const match = /^(\d+(?:\.\d+)?|\.\d+)(ms|s)$/.exec(value);
  if (!match) return 0;
  const duration = Number(match[1]);
  if (!Number.isFinite(duration)) return 0;
  return match[2] === 'ms' ? duration : duration * 1000;
}

export default function TagDemo() {
  const restoreRef = useRef<ButtonRef>(null);
  const tagRefs = useRef(new Map<string, HTMLSpanElement>());
  const closingTimersRef = useRef(new Map<string, number>());
  const [visible, setVisible] = useState(labels);
  const [closing, setClosing] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([filters[0]]);
  const [tagStatus, setTagStatus] = useState('');

  useEffect(
    () => () => {
      // 路由卸载时清理仍在运行的淡出计时器，避免对已卸载的示例继续更新状态。
      closingTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      closingTimersRef.current.clear();
    },
    [],
  );

  const restoreLabels = () => {
    closingTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    closingTimersRef.current.clear();
    setClosing([]);
    setVisible(labels);
    setTagStatus('已恢复默认标签。');
  };

  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Tag>常规标签</Tag>
        <Tag color="blue">信息同步</Tag>
        <Tag color="success">审核通过</Tag>
        <Tag color="warning">审批待定</Tag>
        <Tag color="error">操作失败</Tag>
      </div>
      <div className={styles.row}>
        {visible.map((label) => (
          <Tag
            key={label}
            ref={(element) => {
              if (element) tagRefs.current.set(label, element);
              else tagRefs.current.delete(label);
            }}
            className={closing.includes(label) ? tagStyles.closing : undefined}
            closable={{ 'aria-label': `移除${label}`, disabled: closing.includes(label) }}
            onClose={(event) => {
              // 先阻止 AntD 立即隐藏标签，让设计稿中的淡出结束后再更新列表。
              event.preventDefault();
              if (closingTimersRef.current.has(label)) return;
              const tagElement = tagRefs.current.get(label);
              setClosing((items) => (items.includes(label) ? items : [...items, label]));
              const timer = window.setTimeout(() => {
                const activeElement = document.activeElement;
                const shouldRestoreFocus =
                  activeElement === document.body || Boolean(tagElement?.contains(activeElement));
                setVisible((items) => items.filter((item) => item !== label));
                setClosing((items) => items.filter((item) => item !== label));
                closingTimersRef.current.delete(label);
                setTagStatus(`已移除“${label}”，可通过“恢复默认标签”还原。`);
                // 窗口失焦不改变键盘恢复路径；只有焦点仍在页面主体或即将卸载的标签时才移动焦点。
                if (shouldRestoreFocus) restoreRef.current?.focus();
              }, getTagExitDelay(tagElement));
              closingTimersRef.current.set(label, timer);
            }}
          >
            {label}
          </Tag>
        ))}
        <Tag
          closable={{
            disabled: true,
            'aria-label': '移除系统固定标签',
            'aria-describedby': 'tag-fixed-close-disabled-reason',
          }}
        >
          系统固定标签
        </Tag>
        <span id="tag-fixed-close-disabled-reason" className={styles.muted}>
          系统固定标签由系统生成，当前示例不可关闭。
        </span>
        <Button ref={restoreRef} onClick={restoreLabels}>
          恢复默认标签
        </Button>
      </div>
      <div className={styles.row} role="group" aria-label="业务分类">
        {filters.map((label) => (
          <CheckableTag
            key={label}
            checked={selectedFilters.includes(label)}
            onChange={(checked) =>
              setSelectedFilters((current) => {
                if (!checked) return current.filter((item) => item !== label);
                if (label === filters[0]) return [label];
                return [...current.filter((item) => item !== filters[0] && item !== label), label];
              })
            }
          >
            {label}
          </CheckableTag>
        ))}
        <CheckableTag checked={false} disabled aria-describedby="tag-archive-disabled-reason">
          历史归档
        </CheckableTag>
        <span id="tag-archive-disabled-reason" className={styles.muted}>
          历史归档仅供查看，不能作为当前筛选条件。
        </span>
      </div>
      <p className={styles.muted} role="status" aria-label="当前分类结果">
        当前选中分类：{selectedFilters.length > 0 ? selectedFilters.join('、') : '无'}
      </p>
      <p
        className={styles.muted}
        role="status"
        aria-label="标签操作状态"
        aria-live="polite"
        aria-atomic="true"
      >
        {tagStatus}
      </p>
    </DataDisplayDemoFrame>
  );
}
