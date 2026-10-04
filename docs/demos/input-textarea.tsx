import { useId, useState } from 'react';
import { TextArea } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import { InputClearIcon } from './input-clear-icon';
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
          allowClear={{ clearIcon: <InputClearIcon label="清除采购备注" /> }}
        />
        <p>
          键盘清空时聚焦文本框，按 Ctrl+A（macOS 使用 Command+A）全选，再按 Backspace 或 Delete。
        </p>
        <p role="status">已填写 {notes.length} 字</p>
      </div>
    </DataDisplayDemoFrame>
  );
}
