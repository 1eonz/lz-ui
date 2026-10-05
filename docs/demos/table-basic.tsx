import { Table } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import { TableDemoScrollRegion } from './table-demo-scroll-region';

export default function TableBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <TableDemoScrollRegion label="基础采购订单表格">
        <Table
          rowKey="id"
          pagination={false}
          scroll={{ x: 480 }}
          style={{ minInlineSize: 480 }}
          dataSource={[
            { id: 'PO-1881', vendor: '深蓝工业装备有限公司', amount: 1428900 },
            { id: 'PO-1882', vendor: '创智精密装备有限公司', amount: 3892150 },
          ]}
          columns={[
            { title: '采购单', dataIndex: 'id' },
            { title: '供应商', dataIndex: 'vendor' },
            {
              title: '结算金额',
              dataIndex: 'amount',
              render: (amount: number) => `¥ ${amount.toLocaleString('zh-CN')}`,
            },
          ]}
        />
      </TableDemoScrollRegion>
    </DataDisplayDemoFrame>
  );
}
