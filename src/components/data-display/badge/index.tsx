import { Badge as AntBadge } from 'antd';
import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import type { BadgeProps } from './types';
import type { RibbonProps } from './types';
import styles from './index.module.css';

const defaultRibbonStyle: CSSProperties = {
  top: 'var(--lx-badge-ribbon-block-offset, 33px)',
  width: 'var(--lx-badge-ribbon-width, 100px)',
  height: 'var(--lx-badge-ribbon-height, 20px)',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxSizing: 'border-box',
  overflow: 'hidden',
  clipPath: 'inset(0)',
  fontSize: 'var(--lx-badge-ribbon-font-size, 10px)',
  fontWeight: 700,
  lineHeight: 'var(--lx-badge-ribbon-height, 20px)',
  whiteSpace: 'nowrap',
  transformOrigin: 'center',
  boxShadow: 'var(--lx-shadow-panel, none)',
};

/** 通知计数/状态标记，使用 token 保持稳定展示。 */
const BadgeBase = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(props, ref) {
  const hasStatusOnlyIndicator =
    props.count === undefined ||
    props.count === null ||
    ((props.count === 0 || props.count === '0') && !props.showZero);
  const isProcessingStatus =
    props.status === 'processing' && hasStatusOnlyIndicator && !props.children;
  const indicatorClassName = props.classNames?.indicator;
  /** backgroundImage 即使是透明渐变或 none，也代表宿主接管背景，不能再叠加默认填充。 */
  const hasHostIndicatorBackgroundColor =
    props.styles?.indicator?.background !== undefined ||
    props.styles?.indicator?.backgroundColor !== undefined;
  const hasHostIndicatorBackgroundImage = props.styles?.indicator?.backgroundImage !== undefined;
  /** 默认色放在公开 styles 插槽中，允许组件和 ConfigProvider 的公开样式继续覆盖。 */
  const badgeStyles =
    isProcessingStatus && props.color === undefined
      ? {
          ...props.styles,
          indicator: {
            ...props.styles?.indicator,
            color: props.styles?.indicator?.color ?? 'var(--lx-color-info)',
            ...(hasHostIndicatorBackgroundColor
              ? {}
              : {
                  backgroundColor: hasHostIndicatorBackgroundImage ? 'transparent' : 'currentColor',
                }),
          },
        }
      : props.styles;
  /**
   * AntD 未公开 processing 时长 token，因此将其渲染状态映射为静态语义色，再用公开 indicator 插槽绘制脉冲。
   * 只处理实际渲染状态点的分支，避免把带数字的计数徽标当成状态点；仍透传宿主颜色、语义类和样式。
   */
  return (
    <AntBadge
      {...props}
      ref={ref}
      status={isProcessingStatus ? 'default' : props.status}
      color={props.color}
      styles={badgeStyles}
      className={[styles.root, props.className].filter(Boolean).join(' ')}
      classNames={{
        ...props.classNames,
        ...(isProcessingStatus
          ? {
              indicator: [styles.processingIndicator, indicatorClassName].filter(Boolean).join(' '),
            }
          : {}),
      }}
    />
  );
});

function BadgeRibbon({
  className,
  rootClassName,
  style,
  color,
  placement = 'end',
  ...props
}: RibbonProps) {
  const isStart = placement === 'start';
  const hasHostBackground =
    style?.background !== undefined ||
    style?.backgroundColor !== undefined ||
    style?.backgroundImage !== undefined;
  const ribbonStyle: CSSProperties = {
    ...defaultRibbonStyle,
    insetInlineStart: isStart ? 'calc(0px - var(--lx-badge-ribbon-inline-offset, 7px))' : 'auto',
    insetInlineEnd: isStart ? 'auto' : 'calc(0px - var(--lx-badge-ribbon-inline-offset, 7px))',
    ...(color === undefined && !hasHostBackground
      ? {
          backgroundImage: 'linear-gradient(90deg, var(--lx-color-warning), var(--lx-color-error))',
        }
      : {}),
    ...style,
  };

  return (
    <AntBadge.Ribbon
      {...props}
      color={color}
      placement={placement}
      className={[styles.ribbon, isStart ? styles.ribbonStart : styles.ribbonEnd, className]
        .filter(Boolean)
        .join(' ')}
      rootClassName={[styles.ribbonRoot, rootClassName].filter(Boolean).join(' ')}
      style={ribbonStyle}
    />
  );
}

/** 保留 AntD Ribbon 的公开属性，并为默认展示添加可覆盖的斜向样式。 */
export const Badge = Object.assign(BadgeBase, { Ribbon: BadgeRibbon });

export type { BadgeProps, RibbonProps } from './types';
