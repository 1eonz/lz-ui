import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from 'react';
import type { AriaAttributes, ReactElement, ReactNode } from 'react';
import type { CheckboxProps } from 'antd';
import { Button, Table, Tag } from 'lx-ui';
import type { LxTableColumns } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './table-demo.module.css';

interface PurchaseOrder {
  id: string;
  vendor: string;
  department: string;
  buyer: string;
  orderedAt: string;
  amount: number;
  status: string;
}

type AccessibleCheckboxProps = CheckboxProps & AriaAttributes;

const scrollWidth = 1232;
const selectionColumnWidth = 44;
const orderIdColumnWidth = 150;
const buyerColumnWidth = 120;
const actionColumnWidth = 108;
const fixedColumnsSafetyBuffer = 26;
const fixedColumnsMinWidth =
  selectionColumnWidth +
  orderIdColumnWidth +
  buyerColumnWidth +
  actionColumnWidth +
  fixedColumnsSafetyBuffer;
const orders: PurchaseOrder[] = [
  {
    id: 'PO-2026-1041',
    vendor: '上海深蓝光电高新材料有限公司',
    department: '精密制造中心',
    buyer: '周敏',
    orderedAt: '2026-09-18',
    amount: 1428900,
    status: '待审批',
  },
  {
    id: 'PO-2026-1042',
    vendor: '深圳创智精密半导体装备股份有限公司',
    department: '半导体事业部',
    buyer: '陈立',
    orderedAt: '2026-09-19',
    amount: 3892150,
    status: '已审批',
  },
  {
    id: 'PO-2026-1043',
    vendor: '北京容芯万联软件系统集团',
    department: '数字平台部',
    buyer: '林悦',
    orderedAt: '2026-09-20',
    amount: 640000,
    status: '待审批',
  },
  {
    id: 'PO-2026-1044',
    vendor: '苏州恒远自动化设备有限公司',
    department: '精密制造中心',
    buyer: '王晓',
    orderedAt: '2026-09-21',
    amount: 5120000,
    status: '已审批',
  },
  {
    id: 'PO-2026-1045',
    vendor: '杭州云舟工业软件有限公司',
    department: '数字平台部',
    buyer: '赵宁',
    orderedAt: '2026-09-22',
    amount: 218600,
    status: '待审批',
  },
];

function getCheckboxProps(order: PurchaseOrder): AccessibleCheckboxProps {
  return { 'aria-label': `选择订单 ${order.id}`, className: styles.selectionTarget };
}

function getTitleCheckbox(checkboxNode: ReactNode): ReactNode {
  if (!isValidElement(checkboxNode)) return checkboxNode;

  const checkbox = checkboxNode as ReactElement<AccessibleCheckboxProps>;

  // 只补充 AntD 公开标题回调提供的复选框名称，保留当前页全选行为。
  return cloneElement(checkbox, {
    'aria-label': '选择当前页全部订单',
    className: [checkbox.props.className, styles.selectionTarget].filter(Boolean).join(' '),
  });
}

export default function TableFixedColumnsDemo() {
  const headingId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const [hasRoomForFixedColumns, setHasRoomForFixedColumns] = useState(false);
  const [activeFeedback, setActiveFeedback] = useState<
    { type: 'buyer'; order: PurchaseOrder } | { type: 'order'; order: PurchaseOrder } | null
  >(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // 固定列所需列宽合计 422px；粗指针下还需 18px 才能完整露出 44px 控件及 3px 焦点轮廓（含 1px offset），再留 8px 几何余量。
    // 因此启用阈值为 448px。若列宽、触控目标、焦点样式或 AntD 固定列行为变化，应重新测量并更新边界测试。
    // 使用 section 而非 window 宽度，是为适应文档侧栏造成的内容区差异；代价是较窄容器关闭固定列。
    const observer = new ResizeObserver(([entry]) => {
      setHasRoomForFixedColumns(entry.contentRect.width >= fixedColumnsMinWidth);
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const columns: LxTableColumns<PurchaseOrder> = [
    {
      title: '订单编号',
      dataIndex: 'id',
      key: 'id',
      width: orderIdColumnWidth,
      fixed: hasRoomForFixedColumns ? 'left' : undefined,
    },
    {
      title: '供应商',
      dataIndex: 'vendor',
      key: 'vendor',
      width: 230,
    },
    {
      title: '所属部门',
      dataIndex: 'department',
      key: 'department',
      width: 180,
    },
    {
      title: '采购员',
      dataIndex: 'buyer',
      key: 'buyer',
      width: buyerColumnWidth,
      render: (buyer: string, order) => (
        <Button
          type="link"
          size="small"
          className={styles.buyerAction}
          aria-label={`查看采购员 ${buyer}`}
          onClick={() => setActiveFeedback({ type: 'buyer', order })}
        >
          {buyer}
        </Button>
      ),
    },
    {
      title: '下单日期',
      dataIndex: 'orderedAt',
      key: 'orderedAt',
      width: 140,
    },
    {
      title: '采购金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      align: 'right',
      render: (amount: number) => `¥ ${amount.toLocaleString('zh-CN')}`,
    },
    {
      title: '审批状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: PurchaseOrder['status']) => (
        <Tag color={status === '已审批' ? 'success' : 'warning'}>
          {status === '已审批' ? '已审' : '待审'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: actionColumnWidth,
      fixed: hasRoomForFixedColumns ? 'right' : undefined,
      render: (_value, order) => (
        <Button
          type="link"
          size="small"
          className={styles.orderAction}
          aria-label={`查看订单 ${order.id} 详情`}
          onClick={() => setActiveFeedback({ type: 'order', order })}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <DataDisplayDemoFrame>
      <section ref={sectionRef} className={styles.demo} role="region" aria-labelledby={headingId}>
        <div className={styles.heading}>
          <h3 id={headingId} className={styles.title}>
            固定列采购订单示例
          </h3>
          <p className={styles.description}>
            容器宽度至少 448px
            时选择列与订单编号固定在左侧、操作列固定在右侧，并为中间滚动区与焦点轮廓保留余量；较窄容器关闭固定列，由
            Table 自身横向滚动。
          </p>
        </div>
        <p className={styles.scrollHint} role="note">
          左右滚动可查看更多订单列；按 Tab 可将未显示的操作滚入视口。
        </p>
        <Table<PurchaseOrder>
          rowKey="id"
          columns={columns}
          dataSource={orders}
          pagination={false}
          tableLayout="fixed"
          scroll={{ x: scrollWidth }}
          rowSelection={{
            fixed: hasRoomForFixedColumns,
            columnWidth: selectionColumnWidth,
            columnTitle: getTitleCheckbox,
            getCheckboxProps,
          }}
        />
        {activeFeedback && (
          <p className={styles.status} role="status">
            {activeFeedback.type === 'buyer'
              ? `采购员：${activeFeedback.order.buyer} · 所属部门：${activeFeedback.order.department}`
              : `订单详情：${activeFeedback.order.id} · ${activeFeedback.order.buyer} · ${activeFeedback.order.vendor}`}
          </p>
        )}
      </section>
    </DataDisplayDemoFrame>
  );
}
