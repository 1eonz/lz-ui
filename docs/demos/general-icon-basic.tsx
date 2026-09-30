import SearchOutlined from '@ant-design/icons/SearchOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import CloseCircleOutlined from '@ant-design/icons/CloseCircleOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import { Icon, Text } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './general-demo.module.css';

export default function GeneralIconBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <span className={styles.iconSample}>
          <Icon component={SearchOutlined} size={20} />
          <Text>客户查询</Text>
        </span>
        <span className={styles.iconSample}>
          <Icon component={FileTextOutlined} label="合同文件" size={20} />
          {/* 图标已有可访问名称，可见文字不重复播报同一名称。 */}
          <Text aria-hidden="true">合同文件</Text>
        </span>
        <span className={styles.iconSample}>
          <Icon component={CheckCircleOutlined} color="var(--lx-color-success)" size={20} />
          <Text type="success">审核通过</Text>
        </span>
        <span className={styles.iconSample}>
          <Icon component={WarningOutlined} color="var(--lx-color-warning)" size={20} />
          <Text type="warning">资料待补充</Text>
        </span>
        <span className={styles.iconSample}>
          <Icon component={CloseCircleOutlined} color="var(--lx-color-error)" size={20} />
          <Text type="danger">同步失败</Text>
        </span>
      </div>
    </DataDisplayDemoFrame>
  );
}
