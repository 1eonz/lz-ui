import type { AvatarProps as AntAvatarProps } from 'antd';
import type { Avatar as AntAvatar } from 'antd';
import type { ComponentProps } from 'react';
/** 单个头像参数；图片失败回退沿用 AntD 公开 API。 */
export type AvatarProps = AntAvatarProps;
/** 头像组参数；数量限制沿用 AntD，style/className/ref 归属 lx-ui 容器。 */
export type AvatarGroupProps = ComponentProps<typeof AntAvatar.Group>;
