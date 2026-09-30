import { useRef, useState } from 'react';
import { Alert, Button } from 'lx-ui';
import type { ButtonRef } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function AlertInteractionDemo() {
  const [key, setKey] = useState(0);
  const [visible, setVisible] = useState(true);
  const [recovered, setRecovered] = useState(false);
  const [detail, setDetail] = useState(false);
  const restoreRef = useRef<ButtonRef>(null);
  return (
    <DataDisplayDemoFrame>
      <Button
        ref={restoreRef}
        onClick={() => {
          // 动效关闭可能不触发 afterClose，新原生实例仍能恢复显示。
          setKey((value) => value + 1);
          setVisible(true);
          setRecovered(false);
          setDetail(false);
        }}
      >
        重新显示同步结果
      </Button>
      {visible && (
        <Alert
          key={key}
          type={recovered ? 'success' : 'error'}
          showIcon
          role="status"
          message={recovered ? '客户同步已恢复' : '客户同步失败，现有数据已保留'}
          closable
          onClose={() => {
            // 必要焦点恢复由关闭意图驱动，不依赖动画生命周期。
            setDetail(false);
            restoreRef.current?.focus();
          }}
          afterClose={() => setVisible(false)}
          action={
            <Button
              size="small"
              onClick={() => {
                setRecovered(true);
                setDetail(true);
              }}
            >
              {recovered ? '查看结果' : '重试同步'}
            </Button>
          }
        />
      )}
      {detail && <p>28 位客户已更新，原有备注和地区筛选已保留。</p>}
    </DataDisplayDemoFrame>
  );
}
