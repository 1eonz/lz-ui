import { useId, useRef, useState } from 'react';
import { Button, Input, Link, Space, Switch, Text } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './general-demo.module.css';

export default function GeneralTypographyCopyDemo() {
  const id = useId();
  const link = useRef<HTMLAnchorElement>(null);
  const [code, setCode] = useState('KH-1024');
  const [copied, setCopied] = useState('');
  const [enabled, setEnabled] = useState(true);
  return (
    <DataDisplayDemoFrame>
      <div className={`${styles.field} ${styles.content}`}>
        <label htmlFor={`${id}-code`}>客户编号</label>
        <Input
          id={`${id}-code`}
          value={code}
          maxLength={24}
          onChange={(event) => {
            setCode(event.target.value);
            setCopied('');
          }}
        />
      </div>
      <Text copyable={{ text: code, onCopy: setCopied }} disabled={!code.trim()}>
        <strong>客户编号：</strong>
        {code || '未填写'}
      </Text>
      <p className={styles.status} role="status">
        {copied ? `已复制客户编号：${copied}` : '客户编号尚未复制'}
      </p>
      <Space wrap align="center">
        <label htmlFor={`${id}-link`}>允许查看合同</label>
        <Switch id={`${id}-link`} checked={enabled} onChange={setEnabled} />
        <Link ref={link} href={`#${id}-contract`} disabled={!enabled}>
          合同记录
        </Link>
        <Button disabled={!enabled} onClick={() => link.current?.focus()}>
          聚焦合同链接
        </Button>
      </Space>
      <Text id={`${id}-contract`}>合同记录：2026 年度服务合同，待双方签署。</Text>
    </DataDisplayDemoFrame>
  );
}
