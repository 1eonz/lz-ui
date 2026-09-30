import { Switch } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function Demo() {
  return (
    <DataDisplayDemoFrame>
      <label>
        邮件通知 <Switch defaultChecked aria-label="邮件通知" />
      </label>
      <label>
        紧凑开关 <Switch size="small" aria-label="紧凑开关" />
      </label>
      <label>
        固定策略 <Switch disabled defaultChecked aria-label="固定策略" />
      </label>
      <label>
        保存中 <Switch loading checked aria-label="保存中" />
      </label>
    </DataDisplayDemoFrame>
  );
}
