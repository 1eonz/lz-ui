import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from 'react';
import type { AriaAttributes, Key, ReactElement, ReactNode } from 'react';
import type { CheckboxProps } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Empty, Progress, RadioGroup, Result, Select, Table, Tag, useLxTheme } from 'lx-ui';
import type { ButtonRef, LxDensity, LxTableColumns, LxTableProps } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import { TableDemoScrollRegion } from './table-demo-scroll-region';
import styles from './data-display-demo.module.css';

interface PurchaseOrder {
  id: string;
  vendor: string;
  amount: number;
  fulfillmentPercent: number;
  approved: boolean;
}
type OrderStatusFilter = 'all' | 'approved' | 'pending';
/** AntD CheckboxProps 不含通用 ARIA 属性；Table 会将名称透传到实际复选框。 */
type AccessibleCheckboxProps = CheckboxProps & AriaAttributes;
type ExpandIconProps = Parameters<
  NonNullable<NonNullable<LxTableProps<PurchaseOrder>['expandable']>['expandIcon']>
>[0];
// 业务列合计 768px；订单编号单元格保持完整单行文本，舒适密度选择/展开列为 40/48px，紧凑密度为 32/48px，共用滚动宽度按较宽情况设为 856px。
const tableScrollWidth = 856;
const amountFormatter = new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function getOrderCheckboxProps(order: PurchaseOrder): AccessibleCheckboxProps {
  return { 'aria-label': `选择采购单 ${order.id}` };
}

function getTitleCheckbox(checkboxNode: ReactNode): ReactNode {
  if (!isValidElement(checkboxNode)) return checkboxNode;

  // AntD 5.24 的公开标题回调提供原始复选框；克隆只补名称，保留内建选择状态和操作。
  return cloneElement(checkboxNode as ReactElement<AriaAttributes>, {
    'aria-label': '选择当前页全部采购单',
  });
}

function renderExpandIcon({ expanded, expandable, onExpand, record }: ExpandIconProps) {
  const action = expanded ? '收起' : '展开';

  return (
    <Button
      type="link"
      size="small"
      icon={expanded ? <DownOutlined /> : <RightOutlined />}
      title={`${action}采购订单 ${record.id}`}
      disabled={!expandable}
      aria-label={`${action}采购订单 ${record.id}`}
      aria-expanded={expanded}
      onClick={(event) => {
        event.stopPropagation();
        onExpand(record, event);
      }}
    />
  );
}

const fulfillmentPercents = [82, 64, 45, 93, 28, 76, 58, 100] as const;
const orders: PurchaseOrder[] = Array.from({ length: 24 }, (_, index) => ({
  id: `PO-2024-${String(1881 + index)}`,
  vendor: [
    '上海深蓝光电高新材料有限公司',
    '深圳创智精密半导体装备股份有限公司',
    '北京容芯万联软件系统集团',
  ][index % 3],
  amount: 1428900 + index * 123450,
  fulfillmentPercent: fulfillmentPercents[index % fulfillmentPercents.length],
  approved: index % 3 !== 1,
}));

export default function TableDemo() {
  return (
    <DataDisplayDemoFrame showDensitySwitch={false}>
      <TableDemoContent />
    </DataDisplayDemoFrame>
  );
}

function TableDemoContent() {
  const { theme, setTheme } = useLxTheme();
  const densityLabelId = useId();
  const detailHeadingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const detailHeadingRef = useRef<HTMLHeadingElement>(null);
  const detailRegionRef = useRef<HTMLElement>(null);
  const removedFocusRef = useRef<Element | null>(null);
  const detailRefs = useRef(new Map<string, ButtonRef>());
  const [state, setState] = useState<'ready' | 'loading' | 'error' | 'empty'>('ready');
  const [selected, setSelected] = useState<Key[]>([]);
  const [expanded, setExpanded] = useState<Key[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);
  const [detail, setDetail] = useState<PurchaseOrder | null>(null);

  // 详情是非模态区域；打开时提供阅读起点，关闭后的恢复只处理已卸载的焦点，避免抢走筛选或分页操作焦点。
  useEffect(() => {
    if (detail) {
      detailHeadingRef.current?.focus();
    } else {
      const removedFocus = removedFocusRef.current;
      if (removedFocus && !removedFocus.isConnected && document.activeElement === document.body) {
        headingRef.current?.focus();
      }
      removedFocusRef.current = null;
    }
  }, [detail]);

  function openDetail(order: PurchaseOrder) {
    // 同一记录再次查看不会改变对象身份；直接定位现有标题，首次挂载则由 effect 定位。
    if (detail === order) detailHeadingRef.current?.focus();
    else setDetail(order);
  }

  function closeDetailForListChange() {
    const activeElement = document.activeElement;
    removedFocusRef.current = detailRegionRef.current?.contains(activeElement)
      ? activeElement
      : null;
    setDetail(null);
  }

  function changeState(nextState: typeof state) {
    closeDetailForListChange();
    setState(nextState);
  }
  const columns: LxTableColumns<PurchaseOrder> = [
    {
      title: '订单编号',
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (id: string) => (
        // 短横线可能成为浏览器的断行点；保留整段编号便于扫描，并用 title 提供完整文本。
        <span className={styles.orderIdCell} title={id}>
          {id}
        </span>
      ),
    },
    {
      title: '供应商主体',
      dataIndex: 'vendor',
      key: 'vendor',
      width: 154,
      render: (vendor: string) => (
        <span className={styles.vendorCell} title={vendor}>
          {vendor}
        </span>
      ),
    },
    {
      title: '结算金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 142,
      align: 'right',
      className: styles.amountCell,
      sorter: (a, b) => a.amount - b.amount,
      sortOrder,
      onHeaderCell: () => ({ className: styles.sortableHeader }),
      render: (amount: number) => `¥ ${amountFormatter.format(amount)}`,
    },
    {
      title: '履约达成进度',
      dataIndex: 'fulfillmentPercent',
      key: 'fulfillment',
      width: 144,
      render: (percent: number, order: PurchaseOrder) => (
        <Progress size="small" percent={percent} aria-label={`采购单 ${order.id} 履约达成进度`} />
      ),
    },
    {
      title: '审批状态',
      dataIndex: 'approved',
      key: 'status',
      width: 100,
      render: (approved: boolean) => (
        <Tag color={approved ? 'success' : 'warning'}>{approved ? '已审' : '待审'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 88,
      render: (_, order) => (
        <Button
          ref={(node) => {
            if (node) detailRefs.current.set(order.id, node);
            else detailRefs.current.delete(order.id);
          }}
          type="link"
          size="small"
          aria-label={`查看 ${order.id} 详情`}
          onClick={() => openDetail(order)}
        >
          详情
        </Button>
      ),
    },
  ];
  const onChange: NonNullable<LxTableProps<PurchaseOrder>['onChange']> = (
    pagination,
    _filters,
    sorter,
  ) => {
    closeDetailForListChange();
    setCurrent(pagination.pageSize !== pageSize ? 1 : (pagination.current ?? 1));
    setPageSize(pagination.pageSize ?? 5);
    setSortOrder(Array.isArray(sorter) ? (sorter[0]?.order ?? null) : (sorter.order ?? null));
  };
  const filteredOrders =
    state === 'empty'
      ? []
      : orders.filter(
          (order) => statusFilter === 'all' || order.approved === (statusFilter === 'approved'),
        );
  const selectedOrders = orders.filter((order) => selected.includes(order.id));
  return (
    <>
      <div className={styles.tableHeading}>
        <h3 ref={headingRef} tabIndex={-1} className={styles.tableTitle}>
          采购订单
        </h3>
        <div className={styles.tableHeadingControls}>
          <div className={styles.tableDensity}>
            <span id={densityLabelId}>表格密度</span>
            <RadioGroup
              aria-labelledby={densityLabelId}
              optionType="button"
              value={theme.density}
              options={[
                { label: '舒适 · 48px', value: 'comfortable' },
                { label: '紧凑 · 36px', value: 'compact' },
              ]}
              onChange={(event) => setTheme({ density: event.target.value as LxDensity })}
            />
          </div>
          <details className={styles.exampleStates}>
            <summary>示例状态</summary>
            <div className={styles.exampleStateControls} role="group" aria-label="订单状态演示">
              <Button onClick={() => changeState('loading')}>显示加载</Button>
              <Button type="primary" onClick={() => changeState('ready')}>
                显示订单
              </Button>
              <Button onClick={() => changeState('error')}>模拟失败</Button>
              <Button
                onClick={() => {
                  changeState('empty');
                  setCurrent(1);
                  setSelected([]);
                }}
              >
                显示空状态
              </Button>
            </div>
          </details>
        </div>
      </div>
      <div className={styles.tableToolbar} role="group" aria-label="表格工具栏">
        <label className={styles.tableFilter}>
          审批状态
          <Select
            aria-label="审批状态快速筛选"
            value={statusFilter}
            options={[
              { label: '全部状态', value: 'all' },
              { label: '已审', value: 'approved' },
              { label: '待审', value: 'pending' },
            ]}
            onChange={(value: OrderStatusFilter) => {
              closeDetailForListChange();
              setStatusFilter(value);
              setCurrent(1);
            }}
          />
        </label>
        <Button
          disabled={selected.length === 0}
          onClick={() => {
            headingRef.current?.focus();
            setSelected([]);
          }}
        >
          取消选择
        </Button>
      </div>
      <details className={styles.selectedOrders}>
        <summary>已选订单（{selected.length}）</summary>
        {selectedOrders.length ? (
          <ul aria-label="已选采购订单" className={styles.selectedOrderList}>
            {selectedOrders.map((order) => (
              <li key={order.id}>
                <span>
                  {order.id} · {order.vendor} · {order.approved ? '已审' : '待审'}
                </span>
                <span className={styles.amountCell}>¥ {amountFormatter.format(order.amount)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.muted}>暂无已选订单</p>
        )}
      </details>
      {state === 'error' ? (
        <Result
          status="error"
          title="采购订单加载失败"
          subTitle="本地失败状态演示，重试后恢复采购订单。"
          extra={
            <Button
              onClick={() => {
                headingRef.current?.focus();
                setState('ready');
              }}
            >
              重试
            </Button>
          }
        />
      ) : (
        <TableDemoScrollRegion label="采购订单表格">
          {/* 固定布局会按列定义分配宽度；自动布局会在窄容器中压缩列宽并折断长表头。 */}
          <Table<PurchaseOrder>
            rowKey="id"
            columns={columns}
            dataSource={filteredOrders}
            loading={state === 'loading'}
            tableLayout="fixed"
            scroll={{ x: tableScrollWidth }}
            style={{ minInlineSize: tableScrollWidth }}
            rowSelection={{
              selectedRowKeys: selected,
              preserveSelectedRowKeys: true,
              getCheckboxProps: getOrderCheckboxProps,
              columnTitle: getTitleCheckbox,
              onChange: setSelected,
            }}
            expandable={{
              expandedRowKeys: expanded,
              onExpandedRowsChange: (keys) => setExpanded([...keys]),
              expandIcon: renderExpandIcon,
              expandedRowRender: (order) => (
                <div className={styles.note}>
                  订单 {order.id} · 首期款项 30%：¥ {amountFormatter.format(order.amount * 0.3)} ·
                  中期款项 50% · 尾款 20%
                </div>
              ),
            }}
            pagination={{
              current,
              pageSize,
              total: filteredOrders.length,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20],
              showTotal: (total) => `共 ${total} 条`,
            }}
            locale={{
              emptyText: (
                <Empty
                  variant="small"
                  description="暂无采购订单"
                  action={
                    <Button
                      onClick={() => {
                        headingRef.current?.focus();
                        setState('ready');
                      }}
                    >
                      恢复订单
                    </Button>
                  }
                />
              ),
            }}
            onChange={onChange}
          />
        </TableDemoScrollRegion>
      )}
      {detail && (
        <section ref={detailRegionRef} className={styles.note} aria-labelledby={detailHeadingId}>
          <h4
            id={detailHeadingId}
            ref={detailHeadingRef}
            tabIndex={-1}
            className={styles.tableTitle}
          >
            采购订单 {detail.id} 详情
          </h4>
          <p>
            {detail.vendor} ·{' '}
            <span className={styles.amountCell}>¥ {amountFormatter.format(detail.amount)}</span>
          </p>
          <Button
            onClick={() => {
              // 翻页可能已卸载原行；不存在时回到始终可见的表格标题。
              (detailRefs.current.get(detail.id) ?? headingRef.current)?.focus();
              setDetail(null);
            }}
          >
            收起详情
          </Button>
        </section>
      )}
      <p role="status" className={styles.muted}>
        {state === 'error'
          ? '订单读取失败'
          : state === 'loading'
            ? '订单加载中'
            : `第 ${current} 页，每页 ${pageSize} 条，已选择 ${selected.length} 条`}
      </p>
    </>
  );
}
