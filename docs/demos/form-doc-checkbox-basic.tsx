import { Checkbox } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function Demo() {
  return (
    <DataDisplayDemoFrame>
      <Checkbox defaultChecked>包含已归档客户</Checkbox>
      <Checkbox disabled>锁定的权限</Checkbox>
      <Checkbox disabled defaultChecked>
        已启用的固定权限
      </Checkbox>
    </DataDisplayDemoFrame>
  );
}
