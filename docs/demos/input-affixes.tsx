import { useId } from 'react';
import { Input } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './input.module.css';

export default function InputAffixesDemo() {
  const id = useId();
  return (
    <DataDisplayDemoFrame>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor={`${id}-amount`}>合同金额</label>
          <Input
            id={`${id}-amount`}
            prefix="¥"
            suffix="元"
            inputMode="decimal"
            placeholder="请输入金额"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-url`}>企业网站</label>
          <Input id={`${id}-url`} addonBefore="https://" addonAfter=".com" defaultValue="example" />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-code`}>合同简称</label>
          <Input id={`${id}-code`} allowClear showCount maxLength={20} defaultValue="设备采购" />
        </div>
      </div>
    </DataDisplayDemoFrame>
  );
}
