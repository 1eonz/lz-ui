import { useState } from 'react';
import '../../src/style.css';
import { Checkbox, LxConfigProvider } from '../../src';

export default function CheckboxDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <LxConfigProvider>
      <div style={{ display: 'grid', justifyItems: 'start', gap: 'var(--lx-space-sm)' }}>
        <Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)}>
          接收通知
        </Checkbox>
        <p role="status">{checked ? '已启用通知' : '未启用通知'}</p>
        <Checkbox indeterminate>部分权限已选</Checkbox>
        <Checkbox disabled>不可用选项</Checkbox>
      </div>
    </LxConfigProvider>
  );
}
