import { useId } from 'react';
import { Input } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './input.module.css';

export default function InputSizeDemo() {
  const id = useId();
  return (
    <DataDisplayDemoFrame>
      <div className={styles.fields}>
        {(['large', 'middle', 'small'] as const).map((size) => (
          <div className={styles.field} key={size}>
            <label htmlFor={`${id}-${size}`}>
              {size === 'large' ? '大尺寸' : size === 'middle' ? '默认尺寸' : '小尺寸'}
            </label>
            <Input id={`${id}-${size}`} size={size} placeholder="请输入采购单编号" />
          </div>
        ))}
      </div>
    </DataDisplayDemoFrame>
  );
}
