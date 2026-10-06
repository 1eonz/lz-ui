import { useId, useRef, useState } from 'react';
import type { KeyboardEvent, UIEvent } from 'react';
import { Table } from 'lx-ui';
import type { LxTableColumns, LxTableRef } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './table-demo.module.css';

interface PurchaseOrder {
  id: string;
  vendor: string;
  buyer: string;
  orderedAt: string;
  amount: number;
  status: string;
}

const orders: PurchaseOrder[] = Array.from({ length: 1000 }, (_, index) => ({
  id: `PO-2026-${String(index + 1).padStart(4, '0')}`,
  vendor: [
    '上海深蓝光电高新材料有限公司',
    '深圳创智精密装备有限公司',
    '苏州恒远自动化设备有限公司',
  ][index % 3],
  buyer: ['周敏', '陈立', '林悦', '王晓'][index % 4],
  orderedAt: `2026-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 28) + 1).padStart(2, '0')}`,
  amount: 186000 + index * 12850,
  status: index % 3 === 0 ? '待审批' : '已审批',
}));

const columns: LxTableColumns<PurchaseOrder> = [
  { title: '订单编号', dataIndex: 'id', key: 'id', width: 160 },
  { title: '供应商', dataIndex: 'vendor', key: 'vendor', width: 280 },
  { title: '采购员', dataIndex: 'buyer', key: 'buyer', width: 120 },
  { title: '下单日期', dataIndex: 'orderedAt', key: 'orderedAt', width: 150 },
  {
    title: '采购金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 150,
    align: 'right',
    render: (amount: number) => `¥ ${amount.toLocaleString('zh-CN')}`,
  },
  { title: '审批状态', dataIndex: 'status', key: 'status', width: 120 },
];

export default function TableVirtualDemo() {
  const headingId = useId();
  const keyboardHintId = useId();
  const tableRef = useRef<LxTableRef>(null);
  const currentIndexRef = useRef(0);
  const manualScrollRef = useRef(false);
  const manualScrollTimeoutRef = useRef<number>();
  const [scrollAnnouncement, setScrollAnnouncement] = useState('');

  function markManualScroll() {
    manualScrollRef.current = true;
    window.clearTimeout(manualScrollTimeoutRef.current);
    manualScrollTimeoutRef.current = window.setTimeout(() => {
      manualScrollRef.current = false;
    }, 120);
  }

  function handleTableScroll(event: UIEvent<HTMLDivElement>) {
    if (!manualScrollRef.current) return;

    const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
    if (scrollHeight <= 0 || clientHeight <= 0) return;

    const maxScrollTop = scrollHeight - clientHeight;
    const scrollProgress = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
    // 把实际滚动范围两端映射到首末订单，避免滚到底部后键盘索引回退。
    currentIndexRef.current = Math.min(
      Math.round(scrollProgress * (orders.length - 1)),
      orders.length - 1,
    );
  }

  function handleKeyboardScroll(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    manualScrollRef.current = false;
    window.clearTimeout(manualScrollTimeoutRef.current);

    let nextIndex: number;

    switch (event.key) {
      case 'ArrowDown':
        nextIndex = Math.min(currentIndexRef.current + 1, orders.length - 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(currentIndexRef.current - 1, 0);
        break;
      case 'PageDown':
        nextIndex = Math.min(currentIndexRef.current + 10, orders.length - 1);
        break;
      case 'PageUp':
        nextIndex = Math.max(currentIndexRef.current - 10, 0);
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = orders.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    // 使用 Table 的公开 ref 定位虚拟行，不查询 AntD 内部滚动节点。
    currentIndexRef.current = nextIndex;
    tableRef.current?.scrollTo({ index: nextIndex });
    setScrollAnnouncement(`已定位到第 ${nextIndex + 1} 条订单：${orders[nextIndex].id}`);
  }

  return (
    <DataDisplayDemoFrame>
      <section className={styles.demo} role="region" aria-labelledby={headingId}>
        <div className={styles.heading}>
          <h3 id={headingId} className={styles.title}>
            采购订单大数据示例
          </h3>
          <p className={styles.description}>
            1000 条稳定订单使用固定行内容、唯一 rowKey、明确 scroll.y 与显式虚拟化。
          </p>
        </div>
        <p id={keyboardHintId} className={styles.scrollHint} role="note">
          聚焦表格区域后，方向键逐条浏览；PageUp 和 PageDown 每次移动 10 条，Home 和 End 定位首尾。
        </p>
        <div
          className={styles.virtualScrollRegion}
          role="region"
          aria-label="虚拟采购订单键盘滚动区域"
          aria-describedby={keyboardHintId}
          tabIndex={0}
          onKeyDown={handleKeyboardScroll}
          onWheelCapture={markManualScroll}
          onPointerDownCapture={markManualScroll}
          onPointerMoveCapture={(event) => {
            if (event.buttons !== 0) markManualScroll();
          }}
        >
          <Table<PurchaseOrder>
            ref={tableRef}
            rowKey="id"
            columns={columns}
            dataSource={orders}
            pagination={false}
            tableLayout="fixed"
            scroll={{ x: 980, y: 360 }}
            virtual
            onScroll={handleTableScroll}
          />
        </div>
        {scrollAnnouncement && (
          <p className={styles.status} role="status">
            {scrollAnnouncement}
          </p>
        )}
      </section>
    </DataDisplayDemoFrame>
  );
}
