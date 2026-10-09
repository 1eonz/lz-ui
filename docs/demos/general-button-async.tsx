import { useEffect, useId, useRef, useState } from 'react';
import SaveOutlined from '@ant-design/icons/SaveOutlined';
import { Button, Input, Space, Switch, Text } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './general-demo.module.css';

export default function GeneralButtonAsyncDemo() {
  const id = useId();
  const [name, setName] = useState('杭州云栖科技');
  const [fail, setFail] = useState(true);
  const [state, setState] = useState<'idle' | 'saving' | 'error' | 'success'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = null;
    },
    [],
  );
  const submit = () => {
    if (timer.current !== null || !name.trim()) return;
    setState('saving');
    // 本地计时模拟保存结果；卸载时清理，宿主实际请求应另行处理取消和重复提交。
    timer.current = setTimeout(() => {
      timer.current = null;
      setState(fail ? 'error' : 'success');
    }, 900);
  };
  return (
    <DataDisplayDemoFrame demoId="button-async">
      <form
        className={`${styles.stack} ${styles.content}`}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        aria-busy={state === 'saving'}
      >
        <div className={styles.field}>
          <label htmlFor={`${id}-name`}>客户名称</label>
          <Input
            id={`${id}-name`}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (state !== 'saving') setState('idle');
            }}
            disabled={state === 'saving'}
          />
        </div>
        <Space wrap align="center">
          <label htmlFor={`${id}-fail`}>保存服务不可用</label>
          <Switch
            id={`${id}-fail`}
            checked={fail}
            disabled={state === 'saving'}
            onChange={setFail}
          />
        </Space>
        <Space wrap>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined aria-hidden="true" />}
            loading={state === 'saving'}
            disabled={!name.trim()}
          >
            {state === 'error' ? '重试保存' : '保存客户'}
          </Button>
          <Button
            disabled={state === 'saving'}
            onClick={() => {
              setFail(false);
              setState('idle');
            }}
          >
            恢复服务
          </Button>
        </Space>
        <div className={styles.status} role="status" aria-live="polite">
          <Text type={state === 'error' ? 'danger' : state === 'success' ? 'success' : 'secondary'}>
            {state === 'saving'
              ? '正在保存客户资料…'
              : state === 'error'
                ? '保存失败，客户名称已保留。'
                : state === 'success'
                  ? `已保存：${name}`
                  : '客户资料尚未提交。'}
          </Text>
        </div>
      </form>
    </DataDisplayDemoFrame>
  );
}
