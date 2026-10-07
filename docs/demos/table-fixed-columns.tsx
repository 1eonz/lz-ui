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
    vendor: '深圳创智精密半导体装备股份有限公司华南区域战略供应商',
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
  const orderDetailsRegionId = useId();
  const orderDetailsHeadingId = useId();
  const orderInformationGroupId = useId();
  const purchasingGroupId = useId();
  const approvalGroupId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const orderDetailsHeadingRef = useRef<HTMLHeadingElement>(null);
  const orderDetailsTriggerRef = useRef<HTMLElement | null>(null);
  const [hasRoomForFixedColumns, setHasRoomForFixedColumns] = useState(false);
  const [activeBuyerFeedback, setActiveBuyerFeedback] = useState<PurchaseOrder | null>(null);
  const [activeOrderDetails, setActiveOrderDetails] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    if (activeOrderDetails) orderDetailsHeadingRef.current?.focus();
  }, [activeOrderDetails]);

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
          onClick={() => {
            setActiveOrderDetails(null);
            setActiveBuyerFeedback(order);
          }}
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
        <Tag color={status === '已审批' ? 'success' : 'warning'}>{status}</Tag>
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
          aria-expanded={activeOrderDetails?.id === order.id}
          aria-controls={orderDetailsRegionId}
          onClick={(event) => {
            orderDetailsTriggerRef.current = event.currentTarget;
            setActiveBuyerFeedback(null);
            setActiveOrderDetails(order);
          }}
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
        {activeBuyerFeedback && (
          <p className={styles.status} role="status">
            采购员：{activeBuyerFeedback.buyer} · 所属部门：{activeBuyerFeedback.department}
          </p>
        )}
        <section
          id={orderDetailsRegionId}
          className={styles.orderDetailsRegion}
          role="region"
          aria-labelledby={orderDetailsHeadingId}
          hidden={!activeOrderDetails}
        >
          <div className={styles.orderDetailsHeader}>
            <h4
              ref={orderDetailsHeadingRef}
              id={orderDetailsHeadingId}
              className={styles.orderDetailsTitle}
              tabIndex={-1}
            >
              订单详情 <span className={styles.orderDetailsId}>{activeOrderDetails?.id}</span>
            </h4>
            {activeOrderDetails && (
              <Button
                type="link"
                size="small"
                className={styles.orderDetailsCloseAction}
                aria-label="关闭订单详情"
                onClick={() => {
                  setActiveOrderDetails(null);
                  orderDetailsTriggerRef.current?.focus();
                }}
              >
                关闭详情
              </Button>
            )}
          </div>
          {activeOrderDetails && (
            <div className={styles.orderDetailsGroups}>
              <div
                className={styles.orderDetailsGroup}
                role="group"
                aria-labelledby={approvalGroupId}
              >
                <h5 id={approvalGroupId} className={styles.orderDetailsGroupTitle}>
                  审批与金额
                </h5>
                <dl className={styles.orderDetailsList}>
                  <div className={styles.orderDetailsField}>
                    <dt className={styles.orderDetailsTerm}>采购金额</dt>
                    <dd className={`${styles.orderDetailsValue} ${styles.orderDetailsAmount}`}>
                      ¥ {activeOrderDetails.amount.toLocaleString('zh-CN')}
                    </dd>
                  </div>
                  <div className={styles.orderDetailsField}>
                    <dt className={styles.orderDetailsTerm}>审批状态</dt>
                    <dd className={styles.orderDetailsValue}>
                      <Tag color={activeOrderDetails.status === '已审批' ? 'success' : 'warning'}>
                        {activeOrderDetails.status}
                      </Tag>
                    </dd>
                  </div>
                </dl>
              </div>
              <div
                className={styles.orderDetailsGroup}
                role="group"
                aria-labelledby={orderInformationGroupId}
              >
                <h5 id={orderInformationGroupId} className={styles.orderDetailsGroupTitle}>
                  订单信息
                </h5>
                <dl className={styles.orderDetailsList}>
                  <div className={styles.orderDetailsField}>
                    <dt className={styles.orderDetailsTerm}>订单编号</dt>
                    <dd className={styles.orderDetailsValue}>{activeOrderDetails.id}</dd>
                  </div>
                  <div className={styles.orderDetailsField}>
                    <dt className={styles.orderDetailsTerm}>供应商</dt>
                    <dd className={styles.orderDetailsValue}>{activeOrderDetails.vendor}</dd>
                  </div>
                  <div className={styles.orderDetailsField}>
                    <dt className={styles.orderDetailsTerm}>下单日期</dt>
                    <dd className={styles.orderDetailsValue}>
                      <time dateTime={activeOrderDetails.orderedAt}>
                        {activeOrderDetails.orderedAt}
                      </time>
                    </dd>
                  </div>
                </dl>
              </div>
              <div
                className={styles.orderDetailsGroup}
                role="group"
                aria-labelledby={purchasingGroupId}
              >
                <h5 id={purchasingGroupId} className={styles.orderDetailsGroupTitle}>
                  采购归属
                </h5>
                <dl className={styles.orderDetailsList}>
                  <div className={styles.orderDetailsField}>
                    <dt className={styles.orderDetailsTerm}>所属部门</dt>
                    <dd className={styles.orderDetailsValue}>{activeOrderDetails.department}</dd>
                  </div>
                  <div className={styles.orderDetailsField}>
                    <dt className={styles.orderDetailsTerm}>采购员</dt>
                    <dd className={styles.orderDetailsValue}>{activeOrderDetails.buyer}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </section>
      </section>
    </DataDisplayDemoFrame>
  );
}
