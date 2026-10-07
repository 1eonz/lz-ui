import { useId } from 'react';
import { Table } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import { TableDemoScrollRegion } from './table-demo-scroll-region';
import styles from './data-display-demo.module.css';

export default function TableBasicDemo() {
  const scrollHintId = useId();

  return (
    <DataDisplayDemoFrame>
      <div className={styles.tableViewport}>
        <p id={scrollHintId} className={`${styles.scrollHint} ${styles.basicScrollHint}`}>
          表格超出可视区域时，可横向滚动查看；也可按 Tab 聚焦表格区后，用左右方向键滚动。
        </p>
        <TableDemoScrollRegion label="基础采购订单表格" descriptionId={scrollHintId}>
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
      </div>
    </DataDisplayDemoFrame>
  );
}
