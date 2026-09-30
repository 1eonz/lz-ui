import { Alert } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function AlertBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <Alert type="info" showIcon role="note" message="客户同步将在今晚 22:00 开始" />
      <Alert type="success" showIcon role="note" message="28 位客户已同步" />
      <Alert type="warning" showIcon role="note" message="3 位客户缺少联系电话" />
      <Alert type="error" showIcon role="note" message="连接失败，请检查网络后重试" />
    </DataDisplayDemoFrame>
  );
}
