import { cloneElement, isValidElement, useRef, useState } from 'react';
import type { AriaAttributes, Key, ReactElement, ReactNode } from 'react';
import type { CheckboxProps } from 'antd';
import { Button, Empty, Result, Table, Tag } from 'lx-ui';
import type { ButtonRef, LxTableColumns, LxTableProps } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

interface PurchaseOrder {
  id: string;
  vendor: string;
  amount: number;
  approved: boolean;
}
/** AntD CheckboxProps 不含通用 ARIA 属性；Table 会将名称透传到实际复选框。 */
type AccessibleCheckboxProps = CheckboxProps & AriaAttributes;

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

const orders: PurchaseOrder[] = Array.from({ length: 24 }, (_, index) => ({
  id: `PO-2024-${String(1881 + index)}`,
  vendor: [
    '上海深蓝光电高新材料有限公司',
    '深圳创智精密半导体装备股份有限公司',
    '北京容芯万联软件系统集团',
  ][index % 3],
  amount: 1428900 + index * 123450,
  approved: index % 3 !== 1,
}));

export default function TableDemo() {
  const readyRef = useRef<ButtonRef>(null);
  const detailRefs = useRef(new Map<string, ButtonRef>());
  const [state, setState] = useState<'ready' | 'loading' | 'error' | 'empty'>('ready');
  const [selected, setSelected] = useState<Key[]>([]);
  const [expanded, setExpanded] = useState<Key[]>([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);
  const [detail, setDetail] = useState<PurchaseOrder | null>(null);
  const columns: LxTableColumns<PurchaseOrder> = [
    { title: '订单编号', dataIndex: 'id', key: 'id', width: 160, fixed: 'left' },
    { title: '供应商主体', dataIndex: 'vendor', key: 'vendor', width: 260 },
    {
      title: '结算金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 180,
      sorter: (a, b) => a.amount - b.amount,
      sortOrder,
      render: (amount: number) =>
        `¥ ${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`,
    },
    {
      title: '结算状态',
      dataIndex: 'approved',
      key: 'status',
      width: 120,
      render: (approved: boolean) => (
        <Tag color={approved ? 'success' : 'warning'}>{approved ? '已审' : '待审'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, order) => (
        <Button
          ref={(node) => {
            if (node) detailRefs.current.set(order.id, node);
            else detailRefs.current.delete(order.id);
          }}
          type="link"
          size="small"
          aria-label={`查看 ${order.id} 详情`}
          onClick={() => setDetail(order)}
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
    setCurrent(pagination.pageSize !== pageSize ? 1 : (pagination.current ?? 1));
    setPageSize(pagination.pageSize ?? 5);
    setSortOrder(Array.isArray(sorter) ? (sorter[0]?.order ?? null) : (sorter.order ?? null));
  };
  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Button onClick={() => setState('loading')}>显示加载</Button>
        <Button ref={readyRef} onClick={() => setState('ready')}>
          显示订单
        </Button>
        <Button onClick={() => setState('error')}>模拟失败</Button>
        <Button
          onClick={() => {
            setState('empty');
            setCurrent(1);
            setSelected([]);
            setDetail(null);
          }}
        >
          清空订单
        </Button>
        <Button
          disabled={selected.length === 0}
          onClick={() => {
            readyRef.current?.focus();
            setSelected([]);
          }}
        >
          取消选择
        </Button>
      </div>
      {state === 'error' ? (
        <Result
          status="error"
          title="采购订单加载失败"
          subTitle="本地失败状态演示，重试后恢复采购订单。"
          extra={
            <Button
              onClick={() => {
                readyRef.current?.focus();
                setState('ready');
              }}
            >
              重试
            </Button>
          }
        />
      ) : (
        <div className={styles.scroll}>
          <Table<PurchaseOrder>
            rowKey="id"
            columns={columns}
            dataSource={state === 'empty' ? [] : orders}
            loading={state === 'loading'}
            scroll={{ x: 920 }}
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
              expandedRowRender: (order) => (
                <div className={styles.note}>
                  订单 {order.id} · 首期款项 30%：¥ {(order.amount * 0.3).toLocaleString('zh-CN')} ·
                  中期款项 50% · 尾款 20%
                </div>
              ),
            }}
            pagination={{
              current,
              pageSize,
              total: state === 'empty' ? 0 : orders.length,
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
                        readyRef.current?.focus();
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
        </div>
      )}
      {detail && (
        <div className={styles.note}>
          <strong>{detail.id}</strong>
          <p>
            {detail.vendor} · ¥ {detail.amount.toLocaleString('zh-CN')}
          </p>
          <Button
            onClick={() => {
              // 翻页可能已卸载原行；不存在时回到稳定的工具栏按钮。
              (detailRefs.current.get(detail.id) ?? readyRef.current)?.focus();
              setDetail(null);
            }}
          >
            收起详情
          </Button>
        </div>
      )}
      <p role="status" className={styles.muted}>
        {state === 'error'
          ? '订单读取失败'
          : state === 'loading'
            ? '订单加载中'
            : `第 ${current} 页，每页 ${pageSize} 条，已选择 ${selected.length} 条`}
      </p>
    </DataDisplayDemoFrame>
  );
}
