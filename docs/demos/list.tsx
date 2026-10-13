import { useEffect, useRef, useState } from 'react';
import DownCircleOutlined from '@ant-design/icons/DownCircleOutlined';
import ExportOutlined from '@ant-design/icons/ExportOutlined';
import SyncOutlined from '@ant-design/icons/SyncOutlined';
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import type { ButtonRef } from 'lx-ui';
import { Button, Empty, Icon, List, Result, Spin, Tag } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

type TransactionKind = 'income' | 'expense' | 'transfer';
type TransactionStatus = '已入账' | '外汇审核' | '内部结转' | '待复核' | '已支付' | '海关待核';

interface LoadMoreFocusTracking {
  userMoved: boolean;
  cancelled: boolean;
  onFocusIn: (event: FocusEvent) => void;
}

interface Transaction {
  id: string;
  kind: TransactionKind;
  title: string;
  status: TransactionStatus;
  description: string;
  amount: string;
  occurredAt: string;
}

const pageSize = 3;
const transactionTimeFormatter = new Intl.DateTimeFormat('en-US', {
  calendar: 'gregory',
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
  minute: '2-digit',
  month: '2-digit',
  numberingSystem: 'latn',
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
});

// 示例值保留 +08:00 偏移量，再固定按业务时区显示；真实项目应由宿主决定并提供业务时区。
function formatTransactionTime(occurredAt: string): string {
  const parts = transactionTimeFormatter.formatToParts(new Date(occurredAt));
  const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? '';

  return `${getPart('year')}-${getPart('month')}-${getPart('day')} ${getPart('hour')}:${getPart('minute')}`;
}

const allTransactions: Transaction[] = [
  {
    id: 'TRX-202601-0982',
    kind: 'income',
    title: '大宗物资战略储备资金清算入账',
    status: '已入账',
    description: '招商银行总行托管专户',
    amount: '+¥1,280,000.00',
    occurredAt: '2026-01-01T00:35:00+08:00',
  },
  {
    id: 'TRX-202601-0983',
    kind: 'expense',
    title: '晶圆光刻胶采购尾款跨境支付',
    status: '外汇审核',
    description: '华东设备采购专户',
    amount: '-¥420,500.00',
    occurredAt: '2026-01-01T00:12:00+08:00',
  },
  {
    id: 'TRX-202512-0984',
    kind: 'transfer',
    title: '季度研发准备金内部划转',
    status: '内部结转',
    description: '总行运营账户转入 AI 实验室核算账户',
    amount: '¥850,000.00',
    occurredAt: '2025-12-31T23:48:00+08:00',
  },
  {
    id: 'TRX-202512-0985',
    kind: 'income',
    title: '华南区域客户回款清算',
    status: '已入账',
    description: '华南区域销售结算账户',
    amount: '+¥328,600.00',
    occurredAt: '2025-12-31T20:16:00+08:00',
  },
  {
    id: 'TRX-202512-0986',
    kind: 'expense',
    title: '冷链履约保证金支付',
    status: '待复核',
    description: '远洋冷链物流服务商',
    amount: '-¥218,000.00',
    occurredAt: '2025-12-31T18:08:00+08:00',
  },
  {
    id: 'TRX-202512-0987',
    kind: 'transfer',
    title: '苏州分部项目资金调拨',
    status: '内部结转',
    description: '运营中心账户转入苏州分部',
    amount: '¥560,000.00',
    occurredAt: '2025-12-31T10:32:00+08:00',
  },
  {
    id: 'TRX-202512-0988',
    kind: 'income',
    title: '供应链服务费季度返还',
    status: '已入账',
    description: '供应链平台结算专户',
    amount: '+¥96,240.00',
    occurredAt: '2025-12-30T17:52:00+08:00',
  },
  {
    id: 'TRX-202512-0989',
    kind: 'expense',
    title: '云平台年度资源服务费',
    status: '已支付',
    description: '企业云服务采购账户',
    amount: '-¥186,000.00',
    occurredAt: '2025-12-30T15:30:00+08:00',
  },
  {
    id: 'TRX-202512-0990',
    kind: 'transfer',
    title: '华北事业部营运资金划转',
    status: '内部结转',
    description: '总部结算账户转入华北事业部',
    amount: '¥420,000.00',
    occurredAt: '2025-12-30T12:14:00+08:00',
  },
  {
    id: 'TRX-202512-0991',
    kind: 'income',
    title: '制造业务线项目回款',
    status: '已入账',
    description: '制造业务线专用结算账户',
    amount: '+¥730,000.00',
    occurredAt: '2025-12-30T09:46:00+08:00',
  },
  {
    id: 'TRX-202512-0992',
    kind: 'expense',
    title: '精密仪器运输保险结算',
    status: '已支付',
    description: '华东物流保障账户',
    amount: '-¥72,800.00',
    occurredAt: '2025-12-29T18:20:00+08:00',
  },
  {
    id: 'TRX-202512-0993',
    kind: 'transfer',
    title: '南京研发中心预算拨付',
    status: '内部结转',
    description: '研发专项账户转入南京中心',
    amount: '¥315,000.00',
    occurredAt: '2025-12-29T16:02:00+08:00',
  },
  {
    id: 'TRX-202512-0994',
    kind: 'income',
    title: '电商渠道月度销售结算',
    status: '已入账',
    description: '线上零售平台结算账户',
    amount: '+¥542,180.00',
    occurredAt: '2025-12-29T13:48:00+08:00',
  },
  {
    id: 'TRX-202512-0995',
    kind: 'expense',
    title: '海外设备进口关税缴纳',
    status: '海关待核',
    description: '进口设备专项资金账户',
    amount: '-¥164,300.00',
    occurredAt: '2025-12-29T11:36:00+08:00',
  },
  {
    id: 'TRX-202512-0996',
    kind: 'transfer',
    title: '杭州办事处备用金补充',
    status: '内部结转',
    description: '华东总部账户转入杭州办事处',
    amount: '¥120,000.00',
    occurredAt: '2025-12-29T09:18:00+08:00',
  },
  {
    id: 'TRX-202512-0997',
    kind: 'income',
    title: '核心客户年度服务回款',
    status: '已入账',
    description: '大客户项目资金监管账户',
    amount: '+¥1,060,000.00',
    occurredAt: '2025-12-28T17:26:00+08:00',
  },
  {
    id: 'TRX-202512-0998',
    kind: 'expense',
    title: '仓储中心改造工程进度款',
    status: '待复核',
    description: '华南仓储建设专项账户',
    amount: '-¥286,400.00',
    occurredAt: '2025-12-28T15:04:00+08:00',
  },
  {
    id: 'TRX-202512-0999',
    kind: 'transfer',
    title: '西南区域季度运营预算划转',
    status: '内部结转',
    description: '集团资金中心转入西南区域账户',
    amount: '¥685,000.00',
    occurredAt: '2025-12-28T12:42:00+08:00',
  },
  {
    id: 'TRX-202512-1000',
    kind: 'income',
    title: '供应商履约保证金退回',
    status: '已入账',
    description: '采购结算监管专户',
    amount: '+¥208,000.00',
    occurredAt: '2025-12-28T10:10:00+08:00',
  },
  {
    id: 'TRX-202512-1001',
    kind: 'expense',
    title: '智能制造产线维护服务结算',
    status: '已支付',
    description: '深蓝自动化设备维护账户',
    amount: '-¥93,600.00',
    occurredAt: '2025-12-27T17:34:00+08:00',
  },
  {
    id: 'TRX-202512-1002',
    kind: 'transfer',
    title: '财务共享中心资金归集',
    status: '内部结转',
    description: '华东与华南区域结算账户归集',
    amount: '¥1,420,000.00',
    occurredAt: '2025-12-27T14:12:00+08:00',
  },
];

const initialTransactions = allTransactions.slice(0, pageSize);
const remainingTransactions = allTransactions.slice(pageSize);

const kindPresentation = {
  income: {
    label: '收入',
    icon: WalletOutlined,
    iconClassName: styles.incomeIcon,
    amountClassName: styles.incomeAmount,
  },
  expense: {
    label: '支出',
    icon: ExportOutlined,
    iconClassName: styles.expenseIcon,
    amountClassName: styles.expenseAmount,
  },
  transfer: {
    label: '转账',
    icon: SyncOutlined,
    iconClassName: styles.transferIcon,
    amountClassName: styles.transferAmount,
  },
} as const;

const statusPresentation: Record<
  TransactionStatus,
  { color: string; backgroundColor: string; borderColor: string }
> = {
  已入账: {
    color: 'var(--lx-color-success)',
    backgroundColor: 'var(--lx-color-success-bg)',
    borderColor: 'transparent',
  },
  外汇审核: {
    color: 'var(--lx-color-error)',
    backgroundColor: 'var(--lx-color-error-bg)',
    borderColor: 'transparent',
  },
  内部结转: {
    color: 'var(--lx-color-primary)',
    backgroundColor: 'var(--lx-color-primary-bg)',
    borderColor: 'transparent',
  },
  待复核: {
    color: 'var(--lx-color-warning)',
    backgroundColor: 'var(--lx-color-warning-bg)',
    borderColor: 'transparent',
  },
  已支付: {
    color: 'var(--lx-color-success)',
    backgroundColor: 'var(--lx-color-success-bg)',
    borderColor: 'transparent',
  },
  海关待核: {
    color: 'var(--lx-color-warning)',
    backgroundColor: 'var(--lx-color-warning-bg)',
    borderColor: 'transparent',
  },
};

export default function ListDemo() {
  const readyButtonRef = useRef<ButtonRef>(null);
  const loadMoreButtonRef = useRef<ButtonRef>(null);
  const completionStatusRef = useRef<HTMLDivElement>(null);
  const stateDisclosureRef = useRef<HTMLDetailsElement>(null);
  const loadMoreTimerRef = useRef<number | null>(null);
  const loadMoreFocusTrackingRef = useRef<LoadMoreFocusTracking | null>(null);
  const [state, setState] = useState<'ready' | 'loading' | 'error'>('ready');
  const [transactions, setTransactions] = useState(initialTransactions);
  const [remaining, setRemaining] = useState(remainingTransactions);
  const [loadingMore, setLoadingMore] = useState(false);
  const isLoading = state === 'loading' || loadingMore;

  useEffect(
    () => () => {
      if (loadMoreTimerRef.current !== null) window.clearTimeout(loadMoreTimerRef.current);
      const tracking = loadMoreFocusTrackingRef.current;
      if (tracking) {
        tracking.cancelled = true;
        document.removeEventListener('focusin', tracking.onFocusIn);
      }
    },
    [],
  );

  const clearLoadMoreTimer = () => {
    if (loadMoreTimerRef.current !== null) {
      window.clearTimeout(loadMoreTimerRef.current);
      loadMoreTimerRef.current = null;
    }
    const tracking = loadMoreFocusTrackingRef.current;
    if (tracking) {
      tracking.cancelled = true;
      document.removeEventListener('focusin', tracking.onFocusIn);
      loadMoreFocusTrackingRef.current = null;
    }
  };

  const focusReadyButton = () => {
    if (stateDisclosureRef.current) stateDisclosureRef.current.open = true;
    readyButtonRef.current?.focus();
  };

  const showContent = () => {
    clearLoadMoreTimer();
    setLoadingMore(false);
    setTransactions((current) => (current.length === 0 ? initialTransactions : current));
    setRemaining((current) => (current.length === 0 ? remainingTransactions : current));
    setState('ready');
  };

  const restoreTransactions = () => {
    clearLoadMoreTimer();
    setLoadingMore(false);
    setTransactions(initialTransactions);
    setRemaining(remainingTransactions);
    setState('ready');
    focusReadyButton();
  };

  const clearTransactions = () => {
    clearLoadMoreTimer();
    setLoadingMore(false);
    setTransactions([]);
    setRemaining([]);
    setState('ready');
  };

  const showLoading = () => {
    clearLoadMoreTimer();
    setLoadingMore(false);
    setState('loading');
  };

  const showError = () => {
    clearLoadMoreTimer();
    setLoadingMore(false);
    setState('error');
  };

  const loadMore = () => {
    if (state !== 'ready' || loadingMore || remaining.length === 0) return;

    const nextBatch = remaining.slice(0, pageSize);
    if (document.activeElement === loadMoreButtonRef.current) {
      const tracking: LoadMoreFocusTracking = {
        userMoved: false,
        cancelled: false,
        onFocusIn: () => undefined,
      };
      tracking.onFocusIn = (event) => {
        if (event.target !== loadMoreButtonRef.current) tracking.userMoved = true;
      };
      loadMoreFocusTrackingRef.current = tracking;
      document.addEventListener('focusin', tracking.onFocusIn);
    }
    setLoadingMore(true);
    loadMoreTimerRef.current = window.setTimeout(() => {
      setTransactions((current) => [...current, ...nextBatch]);
      setRemaining((current) => current.slice(nextBatch.length));
      setLoadingMore(false);
      loadMoreTimerRef.current = null;
      const tracking = loadMoreFocusTrackingRef.current;
      if (tracking) {
        window.requestAnimationFrame(() => {
          if (!tracking.cancelled && !tracking.userMoved) {
            if (remaining.length === nextBatch.length) {
              completionStatusRef.current?.focus();
            } else {
              loadMoreButtonRef.current?.focus();
            }
          }
          if (loadMoreFocusTrackingRef.current === tracking) {
            document.removeEventListener('focusin', tracking.onFocusIn);
            loadMoreFocusTrackingRef.current = null;
          }
        });
      }
    }, 400);
  };

  const statusMessage = isLoading
    ? `加载中：已显示 ${transactions.length} 条流水记录，剩余 ${remaining.length} 条`
    : state === 'error'
      ? `读取失败：已显示 ${transactions.length} 条流水记录，剩余 ${remaining.length} 条`
      : `已显示 ${transactions.length} 条流水记录，剩余 ${remaining.length} 条`;
  const loadMoreLabel =
    remaining.length > 0
      ? `加载更多交易流水记录（剩余 ${remaining.length} 条）`
      : '已展示全部交易流水记录';

  return (
    <DataDisplayDemoFrame demoId="list-demo">
      <details className={styles.exampleStates} ref={stateDisclosureRef}>
        <summary>状态演示</summary>
        <div className={styles.exampleStateControls}>
          <Button onClick={showLoading}>显示加载</Button>
          <Button ref={readyButtonRef} onClick={showContent}>
            显示内容
          </Button>
          <Button onClick={showError}>模拟失败</Button>
          <Button onClick={clearTransactions}>清空流水</Button>
          <Button onClick={restoreTransactions}>恢复流水</Button>
        </div>
      </details>
      <div className={styles.reserved}>
        {state === 'error' ? (
          <Result
            status="error"
            title="交易流水暂时无法读取"
            subTitle="本地错误演示；重试后恢复当前记录。"
            extra={
              <Button
                onClick={() => {
                  clearLoadMoreTimer();
                  setLoadingMore(false);
                  setState('ready');
                  focusReadyButton();
                }}
              >
                重试
              </Button>
            }
          />
        ) : (
          <section className={styles.ledgerRegion} aria-labelledby="list-demo-heading">
            <div className={styles.ledgerHeader}>
              <h3 className={styles.ledgerHeading} id="list-demo-heading" tabIndex={-1}>
                企业资金流水
              </h3>
              <span className={styles.ledgerUnit}>金额单位：人民币</span>
              <span className={styles.ledgerUnit}>时区：Asia/Shanghai（UTC+08:00）</span>
            </div>
            <Spin spinning={isLoading} delay={0}>
              <List<Transaction>
                className={styles.ledgerList}
                dataSource={transactions}
                locale={{
                  emptyText: (
                    <Empty
                      variant="small"
                      description="暂无资金流水"
                      action={<Button onClick={restoreTransactions}>恢复流水</Button>}
                    />
                  ),
                }}
                rowKey="id"
                split={false}
                renderItem={(transaction) => {
                  const presentation = kindPresentation[transaction.kind];

                  return (
                    <List.Item
                      className={styles.ledgerItem}
                      data-testid="list-demo-transaction"
                      data-transaction-id={transaction.id}
                      key={transaction.id}
                    >
                      <div className={styles.ledgerIdentity} data-testid="list-demo-identity">
                        <span
                          className={`${styles.ledgerIcon} ${presentation.iconClassName}`}
                          aria-hidden="true"
                        >
                          <Icon component={presentation.icon} size={20} />
                        </span>
                        <div className={styles.ledgerText}>
                          <span className={styles.visuallyHidden}>{presentation.label}</span>
                          <div className={styles.ledgerTitleLine}>
                            <span className={styles.ledgerTitle} data-testid="list-demo-title">
                              {transaction.title}
                            </span>
                            <Tag
                              className={styles.ledgerStatusTag}
                              data-testid="list-demo-status"
                              style={statusPresentation[transaction.status]}
                            >
                              {transaction.status}
                            </Tag>
                          </div>
                          <p className={styles.ledgerDescription}>
                            {transaction.id} · {transaction.description}
                          </p>
                        </div>
                      </div>
                      <div className={styles.ledgerFinancial} data-testid="list-demo-financial">
                        <span
                          className={`${styles.ledgerAmount} ${presentation.amountClassName}`}
                          data-testid="list-demo-amount"
                        >
                          {transaction.amount}
                        </span>
                        <time
                          className={styles.ledgerDate}
                          dateTime={transaction.occurredAt}
                          data-testid="list-demo-date"
                        >
                          {formatTransactionTime(transaction.occurredAt)}
                        </time>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </Spin>
            {transactions.length > 0 && (
              <div className={styles.loadMoreArea}>
                {remaining.length > 0 ? (
                  <Button
                    ref={loadMoreButtonRef}
                    className={styles.loadMoreButton}
                    disabled={state !== 'ready' || loadingMore}
                    icon={<Icon component={DownCircleOutlined} size={16} />}
                    loading={loadingMore}
                    onClick={loadMore}
                  >
                    <span className={styles.loadMoreText}>{loadMoreLabel}</span>
                  </Button>
                ) : (
                  <div
                    className={styles.loadMoreComplete}
                    data-testid="list-demo-complete"
                    ref={completionStatusRef}
                    tabIndex={-1}
                  >
                    {loadMoreLabel}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
      <p className={styles.muted} role="status">
        {statusMessage}
      </p>
    </DataDisplayDemoFrame>
  );
}
