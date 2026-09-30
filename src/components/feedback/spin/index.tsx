import { Spin as AntSpin } from 'antd';
import type { SpinProps as AntSpinProps } from 'antd';
import type { SpinProps } from './types';
import styles from './index.module.css';

/** 接收 AntD 克隆 indicator 时传入的属性，避免 percent 泄漏到原生 DOM。 */
function DefaultIndicator({
  className,
  size,
  hasTip,
}: {
  className?: string;
  size: NonNullable<SpinProps['size']>;
  hasTip: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={[styles.arc, styles[size], hasTip && styles.withTip, className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

/**
 * 用于行内或业务区域的加载指示器。
 *
 * 区域模式持续挂载 children，原生 nested 根立即反映 spinning，默认300ms
 * delay 仅影响视觉。没有 children 时保留 AntD 原生延迟 aria-busy 语义：
 * 此时仅为视觉指示器，不代表业务内容区域。区域不额外添加 role=status，
 * 需要播报时由宿主提供独立短状态文本。请求、重试、inert、全屏及伪进度
 * 均不在本组件职责内。
 */
export function Spin(input: SpinProps) {
  // 运行时剥离同时保护 JavaScript 和对象展开调用；这里使用公开 AntD 类型
  // 仅用于在透传前移除不支持的字段，不能让全屏或伪进度绕过类型限制。
  const {
    fullscreen: _fullscreen,
    percent: _percent,
    className,
    wrapperClassName,
    spinning = true,
    delay = 300,
    size = 'default',
    indicator,
    children,
    ...props
  } = input as AntSpinProps;
  const nested = children !== undefined;
  return (
    <AntSpin
      {...props}
      {...(nested && { 'aria-busy': spinning })}
      spinning={spinning}
      delay={delay}
      size={size}
      indicator={
        indicator ?? <DefaultIndicator size={size} hasTip={nested && Boolean(props.tip)} />
      }
      className={[styles.root, className].filter(Boolean).join(' ')}
      wrapperClassName={[styles.region, wrapperClassName].filter(Boolean).join(' ')}
    >
      {children}
    </AntSpin>
  );
}

export type { SpinProps } from './types';
