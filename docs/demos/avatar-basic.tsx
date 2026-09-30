import { Avatar, AvatarGroup } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

export default function AvatarBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Avatar size={48} aria-label="周晓轩">
          周
        </Avatar>
        <Avatar size={36} aria-label="张莉">
          张
        </Avatar>
        <Avatar size={24} aria-label="赵明">
          赵
        </Avatar>
        <Avatar shape="square" aria-label="ERP 应用">
          ERP
        </Avatar>
        <AvatarGroup max={{ count: 2 }}>
          <Avatar aria-label="刘倩">刘</Avatar>
          <Avatar aria-label="孙鹏">孙</Avatar>
          <Avatar aria-label="吴宁">吴</Avatar>
        </AvatarGroup>
      </div>
    </DataDisplayDemoFrame>
  );
}
