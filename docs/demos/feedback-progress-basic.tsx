import { Progress } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function ProgressBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <Progress percent={30} aria-label="客户导入" />
      <Progress percent={62.5} status="active" aria-label="附件上传" />
      <Progress percent={70} status="exception" aria-label="校验失败" />
      <Progress percent={100} status="success" aria-label="导入完成" />
      <Progress percent={45} size="small" aria-label="紧凑导入进度" />
    </DataDisplayDemoFrame>
  );
}
