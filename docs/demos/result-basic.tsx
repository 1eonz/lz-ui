import { Result } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function ResultBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <Result
        status="success"
        title="采购付款凭证提交成功"
        subTitle="采购单 TRX-202410-0982 已进入审核队列。"
      />
    </DataDisplayDemoFrame>
  );
}
