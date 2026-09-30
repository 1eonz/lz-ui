import { useId, useState } from 'react';
import { Input } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './input.module.css';

export default function InputStatesDemo() {
  const id = useId();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  // 示例只演示失焦后的本地提示；业务校验使用 FormItem 或 DynamicForm。
  const invalid = touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return (
    <DataDisplayDemoFrame>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor={`${id}-email`}>联系邮箱（必填）</label>
          <Input
            id={`${id}-email`}
            value={email}
            type="email"
            required
            aria-required="true"
            autoComplete="email"
            status={invalid ? 'error' : undefined}
            aria-invalid={invalid}
            aria-describedby={invalid ? `${id}-error` : undefined}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="name@example.com"
          />
          {invalid && (
            <p id={`${id}-error`} role="alert" className={styles.error}>
              请填写完整邮箱，例如 name@example.com。
            </p>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-warning`}>合同编号</label>
          <Input
            id={`${id}-warning`}
            status="warning"
            defaultValue="HT-2024-0982"
            aria-describedby={`${id}-warning-text`}
          />
          <p id={`${id}-warning-text`}>合同即将到期，请核对续约日期。</p>
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-disabled`}>停用客户编号</label>
          <Input id={`${id}-disabled`} disabled defaultValue="CRM-00018" />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-readonly`}>系统流水号</label>
          <Input id={`${id}-readonly`} readOnly value="TRX-202410-0982" />
        </div>
      </div>
    </DataDisplayDemoFrame>
  );
}
