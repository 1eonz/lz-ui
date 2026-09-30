import type { AvatarProps as AntAvatarProps } from 'antd';
import type { Avatar as AntAvatar } from 'antd';
import type { ComponentProps } from 'react';
/** Individual avatar props, including image fallback handled by AntD's public API. */
export type AvatarProps = AntAvatarProps;
/** Group props with maxCount/omittedCount overflow semantics. */
export type AvatarGroupProps = ComponentProps<typeof AntAvatar.Group>;
