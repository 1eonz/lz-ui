import type { Tooltip as AntTooltip, TooltipProps as AntTooltipProps } from 'antd';
import type { AriaAttributes, ComponentRef } from 'react';

/**
 * AntD Tooltip 的公开位置联合类型，包含中心、边角和侧向对齐的 12 个方位。
 * 直接从公开 Props 派生，避免复制一份会随 AntD 版本漂移的位置枚举。
 */
export type TooltipPlacement = NonNullable<AntTooltipProps['placement']>;

/**
 * Tooltip 的公开属性。除默认触发方式外，其余行为遵循 AntD 5.24+ 的公开 API。
 * 未提供 `trigger` 时同时响应 hover 与 focus；传入值会完整交给 AntD 处理。
 * `title` 是提示内容，可传 React 节点或同步渲染函数；异步数据、加载和失败状态由宿主管理。
 */
export type TooltipProps = Omit<
  AntTooltipProps,
  'trigger' | 'destroyOnHidden' | 'aria-describedby'
> &
  Pick<AriaAttributes, 'aria-describedby'> & {
    /**
     * 触发方式。默认同时包含 `hover` 和 `focus`，便于鼠标与键盘用户按同一信息路径查看；
     * 显式传值时不合并默认项，宿主可以使用 click/contextMenu 或关闭自动触发。
     * 组件不为非焦点元素补 tabIndex，也不改写子元素的键盘事件。
     */
    trigger?: AntTooltipProps['trigger'];
  };

/**
 * AntD Tooltip 的公开 ref 类型，提供触发元素、弹层元素及 forceAlign。
 * 子元素若不支持 ref，nativeElement 可能不可用；未打开的弹层也没有可读取的 popupElement。
 */
export type TooltipRef = ComponentRef<typeof AntTooltip>;
