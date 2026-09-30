import { List } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';

export default function ListBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <List
        header="采购待办"
        dataSource={[
          {
            id: 'PO-1881',
            title: '审核设备采购合同',
            description: '核对金额、交付日期与验收条款。',
          },
          { id: 'PO-1882', title: '确认供应商付款账户', description: '收款账户须与合同主体一致。' },
        ]}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <List.Item.Meta title={item.title} description={item.description} />
          </List.Item>
        )}
      />
    </DataDisplayDemoFrame>
  );
}
