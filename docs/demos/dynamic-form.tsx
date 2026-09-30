import { useEffect, useRef, useState } from 'react';
import '../../src/style.css';
import { Button, DynamicForm, LxConfigProvider, useLxTheme } from '../../src/index';
import type { DynamicFormRef, DynamicFormValues, FieldSchema } from '../../src/index';
import type { LxAppearance, LxDensity, LxThemeMode } from '../../src/theme';
import styles from './dynamic-form.module.css';

const schema: FieldSchema[] = [
  {
    key: 'name',
    name: 'name',
    type: 'text',
    label: '客户名称',
    placeholder: '例如：杭州云栖科技',
    required: true,
  },
  {
    key: 'email',
    name: 'email',
    type: 'text',
    label: '联系邮箱',
    placeholder: 'name@company.com',
    required: true,
    rules: [{ antd: { type: 'email', message: '请输入有效的邮箱地址' } }],
  },
  {
    key: 'level',
    name: 'level',
    type: 'select',
    label: '客户等级',
    extra: '选择重点客户后，需要指定一位专属负责人。',
    required: true,
    options: [
      { label: '普通客户', value: 'standard' },
      { label: '重点客户', value: 'priority' },
    ],
  },
  {
    key: 'owner',
    name: 'owner',
    type: 'text',
    label: '专属负责人',
    placeholder: '例如：李明',
    required: true,
    visible: (values) => values.level === 'priority',
  },
];

function CustomerEntry() {
  const formRef = useRef<DynamicFormRef>(null);
  const [saved, setSaved] = useState<DynamicFormValues | null>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error' | 'success'>(
    'idle',
  );
  const [submitError, setSubmitError] = useState('');
  const [savedAction, setSavedAction] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const mountedRef = useRef(true);
  const submitTimerRef = useRef<number | null>(null);
  const submitGenerationRef = useRef(0);
  const submitLockRef = useRef(false);
  const { theme, setTheme } = useLxTheme();
  const submitting = submitState === 'submitting';

  useEffect(
    () => () => {
      mountedRef.current = false;
      submitGenerationRef.current += 1;
      if (submitTimerRef.current !== null) window.clearTimeout(submitTimerRef.current);
    },
    [],
  );

  async function handleFinish(values: DynamicFormValues) {
    // ref 锁填补 React 渲染提交状态前的同步窗口，同时保护命令式/程序化提交。
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    const generation = ++submitGenerationRef.current;
    const shouldUpdate = () => mountedRef.current && submitGenerationRef.current === generation;
    setSaved(null);
    setSavedAction('');
    setSubmitError('');
    setSubmitState('submitting');
    try {
      await new Promise<void>((resolve) => {
        submitTimerRef.current = window.setTimeout(resolve, 550);
      });
      if (!shouldUpdate()) return;
      if (simulateFailure) {
        setSubmitError('保存失败：演示请求未完成，已保留当前填写内容。');
        setSubmitState('error');
        return;
      }
      setSaved(values);
      setSubmitState('success');
    } finally {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
        submitTimerRef.current = null;
      }
      submitLockRef.current = false;
    }
  }

  function resetForm() {
    submitGenerationRef.current += 1;
    if (submitTimerRef.current !== null) {
      window.clearTimeout(submitTimerRef.current);
      submitTimerRef.current = null;
    }
    submitLockRef.current = false;
    formRef.current?.reset();
    setSaved(null);
    setSavedAction('');
    setSubmitError('');
    setSubmitState('idle');
  }

  return (
    <div className={styles.demo}>
      <details className={styles.demoOptions}>
        <summary>
          显示选项
          <span className={styles.demoSummaryMeta}>
            {theme.appearance === 'business'
              ? '商务'
              : theme.appearance === 'soft'
                ? '柔和'
                : '玻璃'}{' '}
            · {theme.mode === 'dark' ? '深色' : theme.mode === 'system' ? '跟随系统' : '浅色'} ·{' '}
            {theme.density === 'compact' ? '紧凑' : '舒适'}
          </span>
        </summary>
        <div className={styles.demoToolbar}>
          <label className={styles.demoControl}>
            外观
            <select
              className={styles.demoSelect}
              aria-label="外观"
              value={theme.appearance}
              onChange={(event) => setTheme({ appearance: event.target.value as LxAppearance })}
            >
              <option value="business">商务</option>
              <option value="soft">柔和</option>
              <option value="glass">玻璃</option>
            </select>
          </label>
          <label className={styles.demoControl}>
            主题
            <select
              className={styles.demoSelect}
              aria-label="主题"
              value={theme.mode}
              onChange={(event) => setTheme({ mode: event.target.value as LxThemeMode })}
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="system">跟随系统</option>
            </select>
          </label>
          <label className={styles.demoControl}>
            密度
            <select
              className={styles.demoSelect}
              aria-label="密度"
              value={theme.density}
              onChange={(event) => setTheme({ density: event.target.value as LxDensity })}
            >
              <option value="comfortable">舒适</option>
              <option value="compact">紧凑</option>
            </select>
          </label>
          <label className={styles.failureToggle}>
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(event) => setSimulateFailure(event.target.checked)}
            />
            模拟保存失败（用于演示恢复）
          </label>
        </div>
      </details>

      <DynamicForm
        ref={formRef}
        schema={schema}
        defaultValue={{ level: 'standard' }}
        omitHidden
        compact={theme.density === 'compact'}
        loading={submitting}
        disabled={submitting}
        error={
          submitState === 'error' ? (
            <span>
              {submitError}{' '}
              <button
                className={styles.retryAction}
                type="button"
                onClick={() => formRef.current?.submit()}
              >
                重试保存
              </button>
            </span>
          ) : undefined
        }
        onChange={() => {
          if (submitting) return;
          setSaved(null);
          setSavedAction('');
          setSubmitError('');
          setSubmitState('idle');
        }}
        onFinish={handleFinish}
      >
        <div className={styles.demoActions}>
          <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
            {submitting ? '保存中' : '保存客户'}
          </Button>
          <Button htmlType="button" disabled={submitting} onClick={resetForm}>
            重置
          </Button>
        </div>
      </DynamicForm>

      {saved && submitState === 'success' && (
        <div className={styles.demoSuccess} role="status" aria-live="polite">
          <p>已保存客户：{String(saved.name || '当前客户')}</p>
          <div className={styles.successActions}>
            <Button size="small" onClick={() => setSavedAction('已打开客户详情（演示）')}>
              查看客户
            </Button>
            <Button size="small" onClick={resetForm}>
              继续新增
            </Button>
          </div>
          {savedAction && <span className={styles.savedAction}>{savedAction}</span>}
        </div>
      )}
    </div>
  );
}

export default function DynamicFormDemo() {
  return (
    <LxConfigProvider>
      <CustomerEntry />
    </LxConfigProvider>
  );
}
