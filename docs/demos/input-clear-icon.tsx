import { CloseCircleFilled } from '@ant-design/icons';
import styles from './input.module.css';

/** 为 AntD 清除按钮提供具体的中文名称，同时保留原有圆形关闭图标。 */
export function InputClearIcon({ label }: { label: string }) {
  return (
    <>
      <CloseCircleFilled aria-hidden="true" />
      <span className={styles.clearIconLabel}>{label}</span>
    </>
  );
}
