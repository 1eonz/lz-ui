import { useState } from 'react';
import '../../src/style.css';
import { LxConfigProvider, Switch } from '../../src';

export default function SwitchDemo() {
  const [enabled, setEnabled] = useState(false);
  return (
    <LxConfigProvider>
      <div style={{ display: 'grid', justifyItems: 'start', gap: 'var(--lx-space-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--lx-space-sm)' }}>
          <label htmlFor="switch-demo-enabled">启用自动同步</label>
          <Switch id="switch-demo-enabled" checked={enabled} onChange={setEnabled} />
        </div>
        <p role="status">{enabled ? '自动同步已启用' : '自动同步已关闭'}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--lx-space-sm)' }}>
          <label htmlFor="switch-demo-loading">正在保存</label>
          <Switch id="switch-demo-loading" loading defaultChecked />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--lx-space-sm)' }}>
          <label htmlFor="switch-demo-disabled">受限设置</label>
          <Switch id="switch-demo-disabled" disabled />
        </div>
      </div>
    </LxConfigProvider>
  );
}
