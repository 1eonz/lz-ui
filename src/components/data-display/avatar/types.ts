import type { AvatarProps as AntAvatarProps } from 'antd';
import type { Avatar as AntAvatar } from 'antd';
import type { AriaAttributes, AriaRole, ComponentProps } from 'react';
/**
 * 单个头像参数；AntD 参数保持原样，name 用于生成姓名缩写、稳定身份色和无障碍名称。
 * 显式 children、ARIA、role、title 与 style 优先级高于 name 派生值。
 */
export type AvatarProps = Omit<AntAvatarProps, 'name' | 'role' | keyof AriaAttributes> &
  AriaAttributes & {
    /** 姓名或稳定身份标识；显式 children、ARIA 标签与背景样式分别覆盖对应派生值。 */
    name?: string;
    /** 未显式设置时，有可访问名称的头像默认为 img；可按宿主语义覆盖。 */
    role?: AriaRole;
    /** 原生悬停提示；可能成为可访问描述，内容与 aria-label 相同时应提供不同的 aria-description。 */
    title?: string;
  };
/** 头像组参数；数量限制沿用 AntD。ref 与 style 指向 lx-ui 容器，className 同时附加到该容器和 AntD Group 根节点。 */
export type AvatarGroupProps = ComponentProps<typeof AntAvatar.Group>;
