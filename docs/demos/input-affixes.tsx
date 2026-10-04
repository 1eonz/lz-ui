import { useId } from 'react';
import { Input } from 'lx-ui';
import { Select } from 'lx-ui/antd';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import { InputClearIcon } from './input-clear-icon';
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
          <div className={styles.protocolGroup}>
            <Select
              className={styles.protocol}
              style={{ height: 'var(--lx-select-control-height)' }}
              aria-label="企业网站协议"
              defaultValue="https://"
              options={[
                { value: 'https://', label: 'https://' },
                { value: 'http://', label: 'http://' },
              ]}
            />
            <Input id={`${id}-url`} className={styles.address} defaultValue="portal.example.com" />
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-code`}>合同简称</label>
          <Input
            id={`${id}-code`}
            allowClear={{ clearIcon: <InputClearIcon label="清除合同简称" /> }}
            showCount
            maxLength={20}
            defaultValue="设备采购"
          />
          <p>
            键盘清空时聚焦输入框，按 Ctrl+A（macOS 使用 Command+A）全选，再按 Backspace 或 Delete。
          </p>
        </div>
      </div>
    </DataDisplayDemoFrame>
  );
}
