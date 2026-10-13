import { Avatar } from 'lx-ui';
import styles from './data-display-demo.module.css';

/** 把规格写在头像旁，文档截图无需依赖读者从比例反推尺寸。 */
export default function AvatarSizeSamples() {
  return (
    <div className={styles.avatarSizeSamples}>
      <div className={styles.avatarSizeSample}>
        <Avatar size={48} name="周晓轩" />
        <span className={styles.avatarSizeLabel}>大 · 48 px</span>
      </div>
      <div className={styles.avatarSizeSample}>
        <Avatar size={36} name="张莉" />
        <span className={styles.avatarSizeLabel}>中 · 36 px</span>
      </div>
      <div className={styles.avatarSizeSample}>
        <Avatar size={24} name="赵明" />
        <span className={styles.avatarSizeLabel}>小 · 24 px</span>
      </div>
      <div className={styles.avatarSizeSample}>
        <Avatar
          shape="square"
          name="ERP 应用"
          style={{ backgroundColor: 'var(--lx-color-primary-active)' }}
        >
          ERP
        </Avatar>
        <span className={styles.avatarSizeLabel}>应用 · 圆角 8 px</span>
      </div>
    </div>
  );
}
