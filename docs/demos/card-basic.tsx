import { Card } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function CardBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <Card title="采购协议" extra={<span>已归档</span>}>
        <p>合同编号：CTR-2024-89941</p>
        <p>签约机构：深蓝智能工业装备科技有限公司</p>
      </Card>
    </DataDisplayDemoFrame>
  );
}
