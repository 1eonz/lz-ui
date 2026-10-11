import { useId, useState } from 'react';
import { Button, Empty, Input, List, Pagination, Select } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import { handleHorizontalScrollKeyDown } from './data-display-horizontal-scroll';
import styles from './data-display-demo.module.css';

const orders = Array.from({ length: 248 }, (_, index) => ({
  id: index + 1,
  name: `采购单 PO-2024-${String(index + 1).padStart(4, '0')}`,
}));

const pageSizeOptions = [10, 20, 50];

export default function PaginationDemo() {
  const pageSizeId = useId();
  const pageJumpId = useId();
  const [current, setCurrent] = useState(3);
  const [pageSize, setPageSize] = useState(10);
  const [empty, setEmpty] = useState(false);
  const [pageInput, setPageInput] = useState('');
  const total = empty ? 0 : orders.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (current - 1) * pageSize;

  const toggleEmpty = () => {
    setEmpty((value) => !value);
    setCurrent(1);
    setPageInput('');
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrent(1);
    setPageInput('');
  };

  const handlePageJump = () => {
    const target = Number.parseInt(pageInput, 10);
    if (!Number.isInteger(target) || target < 1 || target > pageCount) return;
    setCurrent(target);
    setPageInput('');
  };
  return (
    <DataDisplayDemoFrame demoId="pagination-controlled-demo">
      {!empty && (
        <Button className={styles.paginationAction} onClick={toggleEmpty}>
          清空订单
        </Button>
      )}
      <List
        dataSource={empty ? [] : orders.slice(start, start + pageSize)}
        locale={
          empty
            ? {
                emptyText: (
                  <Empty
                    variant="small"
                    description="暂无订单"
                    action={
                      <Button className={styles.paginationAction} onClick={toggleEmpty}>
                        恢复订单
                      </Button>
                    }
                  />
                ),
              }
            : undefined
        }
        renderItem={(order) => <List.Item key={order.id}>{order.name}</List.Item>}
      />
      <div
        className={styles.paginationFrame}
        role="region"
        aria-label="订单分页控件"
        tabIndex={0}
        onKeyDown={handleHorizontalScrollKeyDown}
      >
        <div className={styles.paginationLayout}>
          <Pagination
            aria-label="订单分页"
            className={styles.paginationRoot}
            current={current}
            pageSize={pageSize}
            total={total}
            disabled={empty}
            showSizeChanger={false}
            showQuickJumper={false}
            showTotal={(count) => (
              <span className={styles.paginationSummary}>{`共 ${count} 条`}</span>
            )}
            locale={{
              items_per_page: '条/页',
              jump_to: '跳至',
              jump_to_confirm: '确定',
              page: '页',
              page_size: '每页',
              prev_page: '上一页',
              next_page: '下一页',
              prev_5: '向前 5 页',
              next_5: '向后 5 页',
              prev_3: '向前 3 页',
              next_3: '向后 3 页',
            }}
            onChange={(page, size) => {
              setPageSize(size);
              setCurrent(size !== pageSize ? 1 : page);
              setPageInput('');
            }}
          />
          <div className={styles.paginationTools} aria-label="分页设置">
            <div className={styles.paginationField}>
              <label className={styles.paginationFieldLabel} htmlFor={pageSizeId}>
                每页
              </label>
              <Select
                id={pageSizeId}
                aria-label="每页"
                className={styles.paginationToolControl}
                value={pageSize}
                disabled={empty}
                options={pageSizeOptions.map((value) => ({
                  label: `${value} 条/页`,
                  value,
                }))}
                onChange={(value: number) => handlePageSizeChange(value)}
              />
            </div>
            <div className={styles.paginationField}>
              <label className={styles.paginationFieldLabel} htmlFor={pageJumpId}>
                跳至
              </label>
              <Input
                id={pageJumpId}
                aria-label="页"
                className={styles.paginationToolControl}
                inputMode="numeric"
                maxLength={3}
                value={pageInput}
                disabled={empty}
                onChange={(event) => setPageInput(event.target.value.replace(/\D/g, ''))}
                onPressEnter={handlePageJump}
              />
              <Button
                className={styles.paginationToolControl}
                disabled={empty || !pageInput || Number(pageInput) > pageCount}
                onClick={handlePageJump}
              >
                确定
              </Button>
            </div>
          </div>
        </div>
      </div>
      <p className={styles.muted} role="status">
        {empty ? '暂无订单；' : ''}第 {current} 页，每页 {pageSize} 条
      </p>
    </DataDisplayDemoFrame>
  );
}
