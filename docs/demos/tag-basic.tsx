import { Tag } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

export default function TagBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Tag>常规标签</Tag>
        <Tag color="blue">信息同步</Tag>
        <Tag color="success">审核通过</Tag>
        <Tag color="warning">待审核</Tag>
        <Tag color="error">审核失败</Tag>
      </div>
    </DataDisplayDemoFrame>
  );
}
