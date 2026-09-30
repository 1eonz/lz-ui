import { useState } from 'react';
import { Button, Descriptions, Tag } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function DescriptionsDemo() {
  const [long, setLong] = useState(false);
  return (
    <DataDisplayDemoFrame>
      <Button onClick={() => setLong((value) => !value)}>
        {long ? '恢复摘要' : '显示完整合同说明'}
      </Button>
      <Descriptions
        title="战略合作框架协议"
        bordered
        column={{ xs: 1, sm: 2, md: 2 }}
        items={[
          { key: 'id', label: '协议系统 UID', children: 'CTR-2024-GLOBAL-89941' },
          { key: 'supplier', label: '签约主体机构', children: '深蓝智能工业装备科技有限公司' },
          {
            key: 'terms',
            label: '标准条款与 SLA',
            children: <Tag color="purple">Tier-1 战略合作方</Tag>,
          },
          { key: 'amount', label: '协议总额', children: '¥ 5,000,000.00（已签署）' },
          { key: 'owner', label: '审查负责人', children: '周晓轩 · 高级法务顾问' },
          {
            key: 'note',
            label: '协议说明',
            span: 2,
            children: long
              ? '本协议涵盖华东、华南与华北区域的智能制造设备采购、安装调试及售后维护；供应商须在接到服务请求后四小时内响应，并提交包含责任人、预计完成日期及验收依据的整改记录。合同附件与主协议具有同等效力。'
              : '设备采购及维护框架协议。',
          },
        ]}
      />
    </DataDisplayDemoFrame>
  );
}
