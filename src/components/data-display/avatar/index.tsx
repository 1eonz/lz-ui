import { Avatar as AntAvatar } from 'antd';
import { forwardRef } from 'react';
import type { AvatarGroupProps, AvatarProps } from './types';
import styles from './index.module.css';
/** 用户或实体头像；保留 alt 语义、显式尺寸以及 AntD 的图片失败回退。 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(props, ref) {
  return (
    <AntAvatar
      {...props}
      ref={ref}
      className={[styles.root, props.className].filter(Boolean).join(' ')}
    />
  );
});
/**
 * 带溢出限制的头像组。AntD 5.24 未公开 Group ref，因此 ref 指向 lx-ui 容器。
 * className 和 style 均控制同一个 inline-flex 根容器，避免 flex/grid 布局
 * 属性落在内部节点后失效。尺寸、数量限制和提示弹层仍由 AntD 公开参数控制。
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup(props, ref) {
    const { className, style, ...groupProps } = props;
    return (
      <div
        ref={ref}
        style={style}
        className={[styles.groupRoot, className].filter(Boolean).join(' ')}
      >
        <AntAvatar.Group {...groupProps} />
      </div>
    );
  },
);
export type { AvatarGroupProps, AvatarProps } from './types';
