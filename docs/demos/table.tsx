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
  return {
    'aria-label': `选择采购单 ${order.id}`,
    className: styles.orderSelectionCheckbox,
  };
}

function getTitleCheckbox(checkboxNode: ReactNode): ReactNode {
  if (!isValidElement(checkboxNode)) return checkboxNode;

  // AntD 5.24 的公开标题回调提供原始复选框；克隆只补名称和目标样式，保留内建选择行为。
  const checkboxProps = checkboxNode.props as AriaAttributes & { className?: string };
  return cloneElement(checkboxNode as ReactElement<AriaAttributes & { className?: string }>, {
    'aria-label': '选择当前页全部采购单',
    className: [checkboxProps.className, styles.orderSelectionCheckbox].filter(Boolean).join(' '),
  });
}

function renderExpandIcon({ expanded, expandable, onExpand, record }: ExpandIconProps) {
  const action = expanded ? '收起' : '展开';

  return (
    <Button
      type="link"
      size="small"
      className={styles.expandButton}
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
  const purchaseInfoHeadingId = `${detailHeadingId}-purchase-info`;
  const fulfillmentHeadingId = `${detailHeadingId}-fulfillment`;
  const settlementHeadingId = `${detailHeadingId}-settlement`;
  const scrollHintId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const detailHeadingRef = useRef<HTMLHeadingElement>(null);
  const detailRegionRef = useRef<HTMLElement>(null);
  const tableViewportRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLParagraphElement>(null);
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
  const [compactPagination, setCompactPagination] = useState(false);

  // 窄屏容器查询写入标记；未加载 CSS 时标记为空，保留宽屏分页默认值。
  useEffect(() => {
    if (state !== 'ready') return;
    const viewport = tableViewportRef.current;
    const hint = scrollHintRef.current;
    if (!viewport || !hint) return;

    const updatePaginationMode = () => {
      setCompactPagination(
        window.getComputedStyle(hint).getPropertyValue('--lx-table-compact-pagination').trim() ===
          '1',
      );
    };
    updatePaginationMode();

    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updatePaginationMode);
    observer?.observe(viewport);
    window.addEventListener('resize', updatePaginationMode);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updatePaginationMode);
    };
  }, [state]);

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
      showSorterTooltip: false,
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
        <Tag color={approved ? 'success' : 'warning'}>{approved ? '已审批' : '待审批'}</Tag>
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
          className={styles.detailButton}
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
    extra,
  ) => {
    closeDetailForListChange();
    // AntD 在紧凑分页模式下仍可能回传内部默认页大小；只有真实分页动作才能更新页大小。
    const isPaginationAction = extra.action === 'paginate';
    const nextPageSize = isPaginationAction ? (pagination.pageSize ?? pageSize) : pageSize;
    setCurrent(
      isPaginationAction && nextPageSize === pageSize ? (pagination.current ?? current) : 1,
    );
    setPageSize(nextPageSize);
    setSortOrder(Array.isArray(sorter) ? (sorter[0]?.order ?? null) : (sorter.order ?? null));
  };
  const filteredOrders =
    state === 'empty'
      ? []
      : orders.filter(
          (order) => statusFilter === 'all' || order.approved === (statusFilter === 'approved'),
        );
  // AntD 分页将焦点放在列表项上，难以维持原生按钮语义；demo 始终使用自有语义分页器。
  // 先对完整筛选结果排序再切片，避免只排序当前页；跨页选择继续由稳定 rowKey 保留。
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const activePage = Math.min(current, pageCount);
  const sortedOrders = sortOrder
    ? [...filteredOrders].sort((left, right) =>
        sortOrder === 'ascend' ? left.amount - right.amount : right.amount - left.amount,
      )
    : filteredOrders;
  const visibleOrders = sortedOrders.slice((activePage - 1) * pageSize, activePage * pageSize);
  const changePage = (nextPage: number) => {
    closeDetailForListChange();
    setCurrent(Math.min(pageCount, Math.max(1, nextPage)));
  };
  const changePageSize = (nextPageSize: number) => {
    closeDetailForListChange();
    setPageSize(nextPageSize);
    setCurrent(1);
  };
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
                { label: '舒适 · 48px 基础', value: 'comfortable' },
                { label: '紧凑 · 36px 基础', value: 'compact' },
              ]}
              onChange={(event) => setTheme({ density: event.target.value as LxDensity })}
            />
            <p className={styles.touchDensityHint}>粗指针下，紧凑基础行高会服从 44px 操作目标。</p>
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
              { label: '已审批', value: 'approved' },
              { label: '待审批', value: 'pending' },
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
                  {order.id} · {order.vendor} · {order.approved ? '已审批' : '待审批'}
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
        <div ref={tableViewportRef} className={styles.tableViewport}>
          <p ref={scrollHintRef} id={scrollHintId} className={styles.scrollHint}>
            可左右滑动查看完整表格；按 Tab
            聚焦表格区域后，左右方向键横向滚动，不会在单元格间移动焦点。
          </p>
          <TableDemoScrollRegion
            label="采购订单表格"
            descriptionId={compactPagination ? scrollHintId : undefined}
          >
            {/* 固定布局会按列定义分配宽度；自动布局会在窄容器中压缩列宽并折断长表头。 */}
            <Table<PurchaseOrder>
              rowKey="id"
              columns={columns}
              dataSource={visibleOrders}
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
              pagination={false}
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
          {state === 'ready' && (
            <nav className={styles.tablePagination} aria-label="采购订单分页">
              <span className={styles.pageStatus} aria-live="polite" aria-atomic="true">
                第 {activePage} 页，共 {pageCount} 页
              </span>
              <span className={styles.compactPageSummary} aria-hidden="true">
                第 {activePage} / {pageCount} 页 · 共 {filteredOrders.length} 条
              </span>
              <Select
                className={styles.pageJump}
                aria-label="跳至页码"
                value={activePage}
                options={Array.from({ length: pageCount }, (_, index) => ({
                  label: `第 ${index + 1} 页`,
                  value: index + 1,
                }))}
                onChange={(value: number) => changePage(value)}
              />
              <span className={styles.paginationTotal}>共 {filteredOrders.length} 条</span>
              <label className={styles.pageSizeControl}>
                每页
                <Select
                  aria-label="每页条数"
                  value={pageSize}
                  options={[5, 10, 20].map((size) => ({ label: `${size} 条/页`, value: size }))}
                  onChange={(value: number) => changePageSize(value)}
                />
              </label>
              <Button
                className={`${styles.paginationButton} ${styles.previousPaginationButton}`}
                aria-label="上一页"
                disabled={activePage <= 1}
                onClick={() => changePage(activePage - 1)}
              >
                上一页
              </Button>
              <div className={styles.pageNumbers} role="group" aria-label="页码">
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                  <Button
                    key={page}
                    size="small"
                    className={styles.pageNumberButton}
                    aria-label={`第 ${page} 页`}
                    aria-current={activePage === page ? 'page' : undefined}
                    type={activePage === page ? 'primary' : 'default'}
                    onClick={() => changePage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                className={`${styles.paginationButton} ${styles.nextPaginationButton}`}
                aria-label="下一页"
                disabled={activePage >= pageCount}
                onClick={() => changePage(activePage + 1)}
              >
                下一页
              </Button>
            </nav>
          )}
        </div>
      )}
      {detail && (
        <section ref={detailRegionRef} className={styles.note} aria-labelledby={detailHeadingId}>
          <h4
            id={detailHeadingId}
            ref={detailHeadingRef}
            tabIndex={-1}
            className={styles.tableTitle}
          >
            采购订单 {detail.id} <span className={styles.detailTitleSuffix}>详情</span>
          </h4>
          <div className={styles.orderDetailGroups}>
            <div
              className={styles.orderDetailGroup}
              role="group"
              aria-labelledby={purchaseInfoHeadingId}
            >
              <h5 id={purchaseInfoHeadingId} className={styles.orderDetailGroupTitle}>
                采购信息
              </h5>
              <dl className={styles.orderDetailList}>
                <div className={styles.orderDetailField}>
                  <dt className={styles.orderDetailTerm}>订单编号</dt>
                  <dd className={styles.orderDetailValue}>{detail.id}</dd>
                </div>
                <div className={styles.orderDetailField}>
                  <dt className={styles.orderDetailTerm}>供应商</dt>
                  <dd className={styles.orderDetailValue}>{detail.vendor}</dd>
                </div>
              </dl>
            </div>
            <div
              className={styles.orderDetailGroup}
              role="group"
              aria-labelledby={fulfillmentHeadingId}
            >
              <h5 id={fulfillmentHeadingId} className={styles.orderDetailGroupTitle}>
                履约进度
              </h5>
              <dl className={styles.orderDetailList}>
                <div className={styles.orderDetailField}>
                  <dt className={styles.orderDetailTerm}>订单履约</dt>
                  <dd className={styles.orderFulfillmentValue}>
                    <Progress
                      aria-label="订单履约进度"
                      percent={detail.fulfillmentPercent}
                      size="small"
                    />
                  </dd>
                </div>
              </dl>
            </div>
            <div
              className={styles.orderDetailGroup}
              role="group"
              aria-labelledby={settlementHeadingId}
            >
              <h5 id={settlementHeadingId} className={styles.orderDetailGroupTitle}>
                审批与结算
              </h5>
              <dl className={styles.orderDetailList}>
                <div className={styles.orderDetailField}>
                  <dt className={styles.orderDetailTerm}>采购金额</dt>
                  <dd className={`${styles.orderDetailValue} ${styles.orderDetailAmount}`}>
                    ¥ {amountFormatter.format(detail.amount)}
                  </dd>
                </div>
                <div className={styles.orderDetailField}>
                  <dt className={styles.orderDetailTerm}>审批状态</dt>
                  <dd className={styles.orderDetailValue}>
                    <Tag color={detail.approved ? 'success' : 'warning'}>
                      {detail.approved ? '已审批' : '待审批'}
                    </Tag>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <Button
            className={styles.detailCloseButton}
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
            : `当前显示 ${visibleOrders.length} 条采购订单，每页 ${pageSize} 条，已选择 ${selected.length} 条`}
      </p>
    </>
  );
}
