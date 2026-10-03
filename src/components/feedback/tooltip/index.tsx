import { Tooltip as AntTooltip } from 'antd';
import {
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { TooltipProps, TooltipRef } from './types';
import { feedbackTooltipTokens } from '../../../theme/tokens';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** 合并 ARIA IDREF 列表并去重，避免 Tooltip 覆盖宿主已有的描述关系。 */
function mergeIdReferences(...references: Array<string | undefined>): string {
  return [
    ...new Set(
      references.flatMap((reference) => reference?.trim().split(/\s+/).filter(Boolean) ?? []),
    ),
  ].join(' ');
}

/**
 * 为短文字补充上下文的提示组件，定位、动画、受控状态和 portal 生命周期沿用 AntD 5。
 *
 * 默认 hover 与 focus 两种触发兼顾鼠标和键盘；子元素仍须自行提供合适的语义与焦点能力。
 * 这里不克隆或包装 children、不增添 tabIndex，也不拦截 Enter/Escape，避免破坏宿主控件行为。
 * 显式的 trigger 会完整覆盖默认值。open/defaultOpen/onOpenChange、主题、弹层容器和 ref 均交给
 * AntD 的公开接口，因此异步关闭、嵌套 Provider 和容器裁切策略由宿主结合页面布局决定。
 */
export const Tooltip = forwardRef<TooltipRef, TooltipProps>(function Tooltip(
  {
    trigger,
    id,
    open,
    defaultOpen,
    onOpenChange,
    visible,
    defaultVisible,
    onVisibleChange,
    title,
    overlay,
    color,
    styles,
    children,
    'aria-describedby': tooltipDescription,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const tooltipId = id ?? generatedId;
  const controlled = open !== undefined || visible !== undefined;
  const controlledOpen = open ?? visible;
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? defaultVisible ?? false);
  const mergedOpen = controlledOpen ?? internalOpen;
  const innerRef = useRef<TooltipRef | null>(null);
  const childDescription =
    isValidElement(children) && typeof children.props === 'object'
      ? (children.props as { 'aria-describedby'?: unknown })['aria-describedby']
      : undefined;
  const hasContent = Boolean(title) || title === 0 || Boolean(overlay);

  const mergedRef = useCallback(
    (instance: TooltipRef | null) => {
      innerRef.current = instance;
      if (typeof ref === 'function') ref(instance);
      else if (ref) ref.current = instance;
    },
    [ref],
  );
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!controlled) setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
      onVisibleChange?.(nextOpen);
    },
    [controlled, onOpenChange, onVisibleChange],
  );

  // AntD 5.24 的 Tooltip 会在弹层打开时把 aria-describedby 设为自己的 ID，
  // 覆盖触发元素已有的字段说明。用当前渲染的公开属性和 ref 在提交后同步描述 ID，
  // 不保存旧描述快照、不查询弹层 DOM，也不依赖动画事件。
  useIsomorphicLayoutEffect(() => {
    const triggerElement = innerRef.current?.nativeElement;
    if (!triggerElement) return;

    const describedBy = mergeIdReferences(
      typeof childDescription === 'string' ? childDescription : undefined,
      tooltipDescription,
      mergedOpen && hasContent ? tooltipId : undefined,
    );
    if (describedBy) triggerElement.setAttribute('aria-describedby', describedBy);
    else triggerElement.removeAttribute('aria-describedby');
  });

  const mergedStyles = {
    ...styles,
    body: { color: feedbackTooltipTokens.spotlightText, ...styles?.body },
  };

  return (
    <AntTooltip
      {...props}
      id={tooltipId}
      open={mergedOpen}
      onOpenChange={handleOpenChange}
      trigger={trigger ?? ['hover', 'focus']}
      title={title}
      overlay={overlay}
      color={color ?? feedbackTooltipTokens.spotlightBackground}
      styles={mergedStyles}
      ref={mergedRef}
    >
      {children}
    </AntTooltip>
  );
});

export type { TooltipPlacement, TooltipProps, TooltipRef } from './types';
