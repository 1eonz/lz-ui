import type { CSSProperties } from 'react';
import { Avatar, AvatarGroup } from 'lx-ui';
import AvatarSizeSamples from './avatar-size-samples';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

const avatarStackMembers = ['刘倩', '孙鹏', '吴宁'];
type AvatarStackStyle = CSSProperties & {
  '--lx-avatar-stack-index'?: string;
};

export default function AvatarBasicDemo() {
  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <AvatarSizeSamples />
        <div role="group" aria-label="团队成员">
          <AvatarGroup className={styles.avatarStack}>
            {avatarStackMembers.map((name, index) => (
              <Avatar
                key={name}
                className={styles.avatarStackMember}
                name={name}
                style={{ '--lx-avatar-stack-index': String(index) } as AvatarStackStyle}
              />
            ))}
          </AvatarGroup>
        </div>
      </div>
    </DataDisplayDemoFrame>
  );
}
