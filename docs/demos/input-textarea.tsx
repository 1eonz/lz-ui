import { useId, useState } from 'react';
import { TextArea } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './input.module.css';

export default function InputTextAreaDemo() {
  const id = useId();
  const [notes, setNotes] = useState('请在付款前核对供应商账户及合同附件。');
  return (
    <DataDisplayDemoFrame>
      <div className={styles.field}>
        <label htmlFor={id}>采购备注</label>
        <TextArea
          id={id}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          autoSize={{ minRows: 3, maxRows: 6 }}
          maxLength={200}
          showCount
          allowClear
        />
        <p role="status">已填写 {notes.length} 字</p>
      </div>
    </DataDisplayDemoFrame>
  );
}
