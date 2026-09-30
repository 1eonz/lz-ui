import { useEffect, useRef, useState } from 'react';
import { Switch } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

/** 本地模拟保存：第一次失败保持原值，第二次成功；卸载取消计时器。 */
export default function Demo() {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('尚未启用自动提醒');
  const attempt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <DataDisplayDemoFrame>
      <label>
        自动提醒{' '}
        <Switch
          checked={checked}
          loading={loading}
          aria-label="自动提醒"
          onChange={(next) => {
            const current = ++attempt.current;
            setLoading(true);
            timer.current = setTimeout(() => {
              setLoading(false);
              if (current === 1) setResult('保存失败，原值已保留，可再次切换重试');
              else {
                setChecked(next);
                setResult(next ? '自动提醒已启用' : '自动提醒已关闭');
              }
            }, 600);
          }}
        />
      </label>
      <p role="status">{loading ? '正在保存设置' : result}</p>
    </DataDisplayDemoFrame>
  );
}
