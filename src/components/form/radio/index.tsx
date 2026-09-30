import { Radio as AntRadio } from 'antd';
import { forwardRef } from 'react';
import styles from './index.module.css';
import type { RadioGroupProps, RadioProps, RadioRef } from './types';

/** One mutually exclusive choice. Use `Radio.Group` for a value-bearing set. */
const RadioBase = forwardRef<RadioRef, RadioProps>(function Radio({ className, ...props }, ref) {
  return (
    <AntRadio {...props} ref={ref} className={[styles.root, className].filter(Boolean).join(' ')} />
  );
});

/** Radio set with controlled/uncontrolled value and native arrow-key navigation. */
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
