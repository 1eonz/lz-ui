import { useId, useRef, useState } from 'react';
import { Button, Input } from 'lx-ui';
import type { InputRef } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './input.module.css';

export default function InputRefDemo() {
  const id = useId();
  const ref = useRef<InputRef>(null);
  const [query, setQuery] = useState('PO-2024-1881');
  const [submitted, setSubmitted] = useState<string | null>(null);
  return (
    <DataDisplayDemoFrame>
      <div className={styles.field}>
        <label htmlFor={id}>采购单查询</label>
        <Input
          id={id}
          ref={ref}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onPressEnter={(event) => {
            // 中文输入法确认候选词也可能发出 Enter；仅在组合输入结束后查询。
            // keyCode 229 保留为部分浏览器组合态标记不完整时的兼容分支。
            if (event.nativeEvent.isComposing || event.keyCode === 229) return;
            setSubmitted(query);
          }}
        />
        <div className={styles.actions}>
          <Button onClick={() => ref.current?.focus({ cursor: 'all', preventScroll: true })}>
            聚焦并全选
          </Button>
          <Button onClick={() => setSubmitted(query)}>查询</Button>
        </div>
        <p role="status">
          {submitted === null ? '尚未提交查询' : `已提交查询：${submitted || '全部采购单'}`}
        </p>
      </div>
    </DataDisplayDemoFrame>
  );
}
