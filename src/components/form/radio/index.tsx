import { Radio as AntRadio } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { RadioGroupProps, RadioProps, RadioRef } from './types';

/** 单个互斥选项；需要整组取值时使用 Radio.Group。 */
const RadioBase = forwardRef<RadioRef, RadioProps>(function Radio({ className, ...props }, ref) {
  return (
    <AntRadio {...props} ref={ref} className={[styles.root, className].filter(Boolean).join(' ')} />
  );
});

/** 单选组，提供受控/非受控值与原生方向键导航。 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { className, ...props },
  ref,
) {
  return (
    <AntRadio.Group
      {...props}
      ref={ref}
      className={[styles.group, className].filter(Boolean).join(' ')}
    />
  );
});

export const Radio = Object.assign(RadioBase, { Group: RadioGroup });
export type { RadioProps, RadioGroupProps, RadioRef } from './types';
