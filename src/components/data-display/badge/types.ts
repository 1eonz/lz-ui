import type { BadgeProps as AntBadgeProps } from 'antd';
import type { Badge as AntBadge } from 'antd';
import type { ComponentProps } from 'react';
/** Badge 属性；保留状态文本，确保颜色不是唯一状态信号。 */
export type BadgeProps = AntBadgeProps;

/** Badge.Ribbon 沿用 AntD 根入口公开静态成员的属性契约。 */
export type RibbonProps = ComponentProps<typeof AntBadge.Ribbon>;
