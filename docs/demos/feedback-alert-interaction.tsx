import { useRef, useState } from 'react';
import { Alert, Button } from 'lx-ui';
import type { ButtonRef } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './feedback-alert-interaction.module.css';

export default function AlertInteractionDemo() {
  const [key, setKey] = useState(0);
  const [visible, setVisible] = useState(true);
  const [recovered, setRecovered] = useState(false);
  const [detail, setDetail] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const restoreRef = useRef<ButtonRef>(null);

  function resetDemo() {
    // 保留稳定恢复按钮，让关闭动作有可见的焦点落点；轻量链接不会与 Alert 主操作竞争。
    setKey((value) => value + 1);
    setVisible(true);
    setRecovered(false);
    setDetail(false);
    setAnnouncement('演示已重置为同步失败状态，现有客户数据仍保留。');
  }

  function handleAction() {
    if (recovered) {
      setDetail((value) => !value);
    } else {
      setAnnouncement('');
      setRecovered(true);
      setDetail(true);
    }
  }

  function renderAction() {
    return (
      <Button className={styles.action} size="small" onClick={handleAction}>
        {recovered ? (detail ? '收起结果' : '查看结果') : '重试同步'}
      </Button>
    );
  }

  return (
    <DataDisplayDemoFrame>
      <p className={styles.note} role="note">
        本示例只切换本地状态，不会发起同步请求。
      </p>
      <Button
        className={styles.reset}
        ref={restoreRef}
        type="link"
        onClick={resetDemo}
        // 恢复焦点落点跟随密度，粗指针时由局部 token 放大到触控命中尺寸。
        style={{ minHeight: 'var(--lx-alert-reset-min-height, var(--lx-control-height, 40px))' }}
      >
        重置失败演示
      </Button>
      {visible && (
        <div className={styles.alertGroup}>
          <Alert
            key={key}
            className={styles.alert}
            type={recovered ? 'success' : 'error'}
            showIcon
            // 新失败需 assertive 立即播报，恢复成功仅需 polite 状态通知。
            role={recovered ? 'status' : 'alert'}
            message={recovered ? '客户同步已恢复' : '同步失败，数据已保留'}
            closable={{ 'aria-label': '关闭', closeIcon: true }}
            onClose={() => {
              // 必要焦点恢复由关闭意图驱动，不依赖动画生命周期。
              setDetail(false);
              restoreRef.current?.focus();
              if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                // 无动效时不等待原生 afterClose，避免已关闭内容继续留在可访问树中。
                setVisible(false);
              }
            }}
            afterClose={() => setVisible(false)}
            action={renderAction()}
          />
          <div className={styles.narrowAction}>{renderAction()}</div>
        </div>
      )}
      {detail && <p>28 位客户已更新，原有备注和地区筛选已保留。</p>}
      {announcement && <p role="status">{announcement}</p>}
    </DataDisplayDemoFrame>
  );
}
