import { Statistic as AntStatistic } from 'antd';
import { forwardRef } from 'react';
import type { StatisticProps } from './types';
import styles from './index.module.css';
/** 带语义标题、数值和加载状态的指标；ref 指向 lx-ui 指标容器。 */
const statisticComponent: React.ForwardRefExoticComponent<
  StatisticProps & React.RefAttributes<HTMLDivElement>
> = forwardRef<HTMLDivElement, StatisticProps>(function Statistic(props, ref) {
  const { className, valueStyle, ...statisticProps } = props;
  return (
    <div ref={ref} className={[styles.root, className].filter(Boolean).join(' ')}>
      <AntStatistic
        {...statisticProps}
        className={className}
        valueStyle={{
          lineHeight: 'var(--lx-statistic-value-line-height, 36px)',
          fontWeight: 'var(--lx-statistic-value-weight, 700)',
          ...valueStyle,
        }}
      />
    </div>
  );
});
/** 数字指标；格式化、精度与加载由 AntD 公开 API 控制，业务趋势图由宿主组合。 */
export const Statistic: React.ForwardRefExoticComponent<
  StatisticProps & React.RefAttributes<HTMLDivElement>
> = statisticComponent;
export type { StatisticProps } from './types';
