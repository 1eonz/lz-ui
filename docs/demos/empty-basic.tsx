import { Empty } from 'lx-ui';
import FileAddOutlined from '@ant-design/icons/FileAddOutlined';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';
import illustrationStyles from './empty-illustration.module.css';
import { EmptyDemoIllustration } from './empty-illustration';

export default function EmptyBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <div className={styles.grid}>
        <Empty
          description="暂无关联采购单"
          image={<EmptyDemoIllustration />}
          styles={{ image: { height: '96px', opacity: 1 } }}
        />
        <Empty
          variant="small"
          description="筛选条件没有匹配结果"
          image={<EmptyDemoIllustration size="small" />}
          styles={{ image: { height: '32px', opacity: 1 } }}
        />
        <Empty
          description="自定义采购单图示"
          image={
            <span
              className={illustrationStyles.customImage}
              data-testid="custom-empty-image"
              aria-hidden="true"
            >
              <FileAddOutlined />
            </span>
          }
          classNames={{ image: 'custom-empty-image-slot' }}
          styles={{ image: { height: '36px', opacity: 1 } }}
        />
      </div>
    </DataDisplayDemoFrame>
  );
}
