import { Statistic as AntStatistic } from 'antd';
import { forwardRef } from 'react';
import type { StatisticProps } from './types';
import styles from './index.module.css';
/** Numeric metric with semantic title/value and optional loading state. */
const statisticComponent: React.ForwardRefExoticComponent<
  StatisticProps & React.RefAttributes<HTMLDivElement>
> = forwardRef<HTMLDivElement, StatisticProps>(function Statistic(props, ref) {
  const { className, ...statisticProps } = props;
  return (
    <div ref={ref} className={[styles.root, className].filter(Boolean).join(' ')}>
      <AntStatistic {...statisticProps} className={className} />
    </div>
  );
});
/** Numeric metric with semantic title/value and optional loading state. */
export const Statistic: React.ForwardRefExoticComponent<
  StatisticProps & React.RefAttributes<HTMLDivElement>
> = statisticComponent;
export type { StatisticProps } from './types';
