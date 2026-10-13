import { useId, useState } from 'react';
import type { CSSProperties } from 'react';
import { Avatar, AvatarGroup, Badge, Button } from 'lx-ui';
import AvatarSizeSamples from './avatar-size-samples';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './data-display-demo.module.css';

const approvers = ['周晓轩', '张莉', '赵明', '刘倩', '孙鹏', '吴宁', '王磊', '李悦'];
const collapsedApproverCount = 4;
const overflowDistance = `calc(${Array.from(
  { length: collapsedApproverCount },
  () => 'var(--lx-avatar-stack-step, 12px)',
).join(' + ')})`;

type AvatarStackStyle = CSSProperties & {
  '--lx-avatar-stack-index'?: string;
  '--lx-avatar-stack-overflow-distance'?: string;
};

// 本地插画用于展示图片与加载失败回退，避免文档演示依赖外部网络。
export default function AvatarDemo() {
  const [failedSource, setFailedSource] = useState(false);
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [expanded, setExpanded] = useState(false);
  const statusDescriptionId = useId();
  const approversId = useId();
  // AntD 的 URL src 不公开成功加载事件；用 ReactNode 传入图片，使状态播报跟随真实 load/error。
  const imageSource =
    imageStatus === 'error' ? undefined : (
      <img
        src={failedSource ? 'data:image/png;base64,invalid' : '/avatar-demo.svg'}
        alt=""
        draggable={false}
        onLoad={() => setImageStatus('loaded')}
        onError={() => setImageStatus('error')}
      />
    );
  const imageStatusText =
    imageStatus === 'loading'
      ? '正在加载审批负责人头像。'
      : imageStatus === 'error'
        ? '审批负责人头像加载失败，已显示回退内容 LX。'
        : '审批负责人头像图片已加载。';
  return (
    <DataDisplayDemoFrame demoId="avatar-demo">
      <AvatarSizeSamples />
      <div className={styles.row}>
        <Badge
          dot
          status="success"
          classNames={{ indicator: 'lx-avatar-demo-status-indicator' }}
          styles={{
            indicator: {
              position: 'absolute',
              insetBlockStart: 'auto',
              insetBlockEnd: 0,
              insetInlineEnd: 0,
              width: 12,
              minWidth: 12,
              height: 12,
              boxSizing: 'border-box',
              transform: 'none',
              border: '2px solid var(--lx-color-bg-base)',
            },
          }}
        >
          <Avatar
            name="审批负责人"
            src={imageSource}
            alt="审批负责人"
            aria-describedby={statusDescriptionId}
            size={48}
          >
            LX
          </Avatar>
        </Badge>
        <span className={styles.avatarStatusText} aria-hidden="true">
          在线
        </span>
        <span className={styles.visuallyHidden} id={statusDescriptionId}>
          在线
        </span>
      </div>
      <div className={styles.row}>
        <Button
          className={styles.avatarActionButton}
          style={{ minHeight: 'var(--lx-avatar-demo-action-min-height, 40px)' }}
          onClick={() => {
            const restoring = imageStatus === 'error';
            setFailedSource(!restoring);
            setImageStatus('loading');
          }}
        >
          {imageStatus === 'error' ? '恢复头像图片' : '模拟图片失败'}
        </Button>
        <Button
          className={styles.avatarActionButton}
          style={{ minHeight: 'var(--lx-avatar-demo-action-min-height, 40px)' }}
          aria-expanded={expanded}
          aria-controls={approversId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? '收起审批人' : '显示全部审批人'}
        </Button>
      </div>
      <div
        className={styles.avatarStackContainer}
        id={approversId}
        role="group"
        aria-label="审批协作人员"
      >
        {expanded ? (
          <ul className={styles.avatarMemberList} aria-label="全部审批人">
            {approvers.map((name) => (
              <li className={styles.avatarMember} key={name}>
                <Avatar
                  className={styles.avatarMemberAvatar}
                  name={name}
                  size={32}
                  aria-hidden="true"
                />
                <span className={styles.avatarMemberName}>{name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <AvatarGroup
            className={styles.avatarStack}
            style={{ '--lx-avatar-stack-overflow-distance': overflowDistance } as AvatarStackStyle}
            max={{
              count: collapsedApproverCount,
              style: {
                transform: 'translateX(var(--lx-avatar-stack-overflow-offset, 0px))',
                transition: 'transform var(--lx-motion-duration, 180ms) ease-out',
              },
              popover: { trigger: [] },
            }}
          >
            {approvers.map((name, index) => (
              <Avatar
                key={name}
                className={styles.avatarStackMember}
                name={name}
                title={name}
                aria-description="头像内容是成员姓名的缩写。"
                style={{ '--lx-avatar-stack-index': String(index) } as AvatarStackStyle}
              />
            ))}
          </AvatarGroup>
        )}
      </div>
      <p className={styles.muted} role="status">
        {imageStatusText}{' '}
        <span className={styles.avatarApproverCount}>共 {approvers.length} 位审批人协办</span>。
      </p>
    </DataDisplayDemoFrame>
  );
}
