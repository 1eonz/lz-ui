import { Alert } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function AlertDescriptionDemo() {
  return (
    <DataDisplayDemoFrame>
      <Alert
        type="warning"
        showIcon
        role="note"
        message="本批客户尚未完成校验"
        description="请补齐联系电话后再提交；已填写的客户资料会保留。"
      />
      <Alert banner role="note" message="系统将在 22:00–22:30 维护，请提前保存当前表单。" />
    </DataDisplayDemoFrame>
  );
}
