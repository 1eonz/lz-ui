import { Avatar as AntAvatar } from 'antd';
import { forwardRef } from 'react';
import type { AvatarGroupProps, AvatarProps } from './types';
import styles from './index.module.css';
/** User/entity avatar with alt semantics and AntD image error fallback. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(props, ref) {
  return (
    <AntAvatar
      {...props}
      ref={ref}
      className={[styles.root, props.className].filter(Boolean).join(' ')}
    />
  );
});
/** Grouped avatars with bounded overflow. */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup(props, ref) {
    const { className, ...groupProps } = props;
    return (
      <div ref={ref} className={[styles.groupRoot, className].filter(Boolean).join(' ')}>
        <AntAvatar.Group {...groupProps} />
      </div>
    );
  },
);
export type { AvatarGroupProps, AvatarProps } from './types';
