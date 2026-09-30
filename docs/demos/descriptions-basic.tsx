import { Descriptions } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function DescriptionsBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <Descriptions
        title="采购合同"
        bordered
        column={{ xs: 1, sm: 2 }}
        items={[
          { key: 'id', label: '合同编号', children: 'CTR-2024-89941' },
          { key: 'owner', label: '负责人', children: '周晓轩' },
          { key: 'vendor', label: '签约机构', span: 2, children: '深蓝智能工业装备科技有限公司' },
        ]}
      />
    </DataDisplayDemoFrame>
  );
}
