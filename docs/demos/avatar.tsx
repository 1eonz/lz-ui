import { useState } from 'react';
import { Avatar, AvatarGroup, Button } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

// 无效数据地址用于验证 AntD 公开的图片失败回退；默认姓名头像不依赖网络资源。
export default function AvatarDemo() {
  const [broken, setBroken] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <DataDisplayDemoFrame>
      <div className={styles.row}>
        <Avatar size={48} className={styles.avatar} aria-label="周晓轩">
          周
        </Avatar>
        <Avatar size={36} className={styles.avatar} aria-label="张莉">
          张
        </Avatar>
        <Avatar size={24} aria-label="赵明">
          赵
        </Avatar>
        <Avatar shape="square" aria-label="ERP 应用">
          ERP
        </Avatar>
        <Avatar src={broken ? 'data:image/png;base64,invalid' : undefined} alt="团队头像样例">
          LX
        </Avatar>
      </div>
      <div className={styles.row}>
        <Button onClick={() => setBroken((value) => !value)}>
          {broken ? '恢复姓名头像' : '模拟图片失败'}
        </Button>
        <Button onClick={() => setExpanded((value) => !value)}>
          {expanded ? '收起成员' : '显示全部成员'}
        </Button>
      </div>
      <AvatarGroup max={{ count: expanded ? 6 : 3 }}>
        {['周晓轩', '张莉', '赵明', '刘倩', '孙鹏', '吴宁'].map((name) => (
          <Avatar key={name} className={styles.avatar} aria-label={name}>
            {name.slice(0, 1)}
          </Avatar>
        ))}
      </AvatarGroup>
      <p className={styles.muted} role="status">
        {broken ? '图片加载失败，显示姓名缩写 LX。' : '显示姓名缩写 LX。'} 团队共 6 人。
      </p>
    </DataDisplayDemoFrame>
  );
}
