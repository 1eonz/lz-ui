import { Pagination } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

export default function PaginationBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <div className={styles.scroll}>
        <Pagination defaultCurrent={1} defaultPageSize={10} total={50} showSizeChanger={false} />
      </div>
    </DataDisplayDemoFrame>
  );
}
