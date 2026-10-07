import { useEffect, useId, useRef, useState } from 'react';
import { usePrefersColor, useSiteData } from 'dumi';
import '../../src/style.css';
import { Button, DynamicForm, LxConfigProvider, useLxTheme } from '../../src/index';
import type { ButtonRef, DynamicFormRef, DynamicFormValues, FieldSchema } from '../../src/index';
import type {
  LxAppearance,
  LxColorPreset,
  LxDensity,
  LxPalettePreset,
  LxThemeMode,
} from '../../src/theme';
import { scrollDynamicFormFieldIntoView } from './dynamic-form-utils';
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

const brandColorOptions: readonly { label: string; value: LxColorPreset }[] = [
  { label: '海洋蓝', value: 'blue' },
  { label: '活力橙', value: 'orange' },
  { label: '翡翠绿', value: 'green' },
  { label: '智慧紫', value: 'purple' },
  { label: '清透青', value: 'cyan' },
  { label: '品牌玫红', value: 'rose' },
];

const paletteOptions: readonly { label: string; value: LxPalettePreset }[] = [
  { label: '青瓷桂影', value: 'celadon-laurel' },
  { label: '暮桃微光', value: 'twilight-peach' },
  { label: '石榴杏仁', value: 'garnet-almond' },
  { label: '松针琥珀', value: 'pine-amber' },
  { label: '雾色燕麦', value: 'misty-oatmeal' },
  { label: '豆沙墨色', value: 'bean-sand-ink' },
  { label: '奶酪远青', value: 'cheese-distant-cyan' },
];

function getColorSelection(theme: {
  colorPreset: LxColorPreset;
  palettePreset?: LxPalettePreset | null;
}) {
  const palette = paletteOptions.find((option) => option.value === theme.palettePreset);
  if (palette) {
    return { label: palette.label, type: '东方配色' };
  }
  const brand = brandColorOptions.find((option) => option.value === theme.colorPreset);
  return { label: brand?.label ?? '品牌色', type: '品牌色' };
}

function CustomerEntry({ docsMode }: { docsMode: 'light' | 'dark' }) {
  const id = useId();
  const formRef = useRef<DynamicFormRef>(null);
  const formScopeRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const focusMovedRef = useRef(false);
  const retryActionRef = useRef<ButtonRef>(null);
  const successActionRef = useRef<ButtonRef>(null);
  const focusNewCustomerRef = useRef(false);
  const [saved, setSaved] = useState<DynamicFormValues | null>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'error' | 'success'>(
    'idle',
  );
  const [submitError, setSubmitError] = useState('');
  const [savedAction, setSavedAction] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const failureConsumedRef = useRef(false);
  const mountedRef = useRef(true);
  const submitControllerRef = useRef<AbortController | null>(null);
  const submitGenerationRef = useRef(0);
  const submitLockRef = useRef(false);
  const { theme, setTheme } = useLxTheme();
  const submitting = submitState === 'submitting';
  const colorSelection = getColorSelection(theme);

  useEffect(() => {
    // 跟随文档模式变化；局部选择在文档模式不变时保持独立，不写入持久化。
    setTheme({ mode: docsMode });
  }, [docsMode, setTheme]);

  useEffect(() => {
    // StrictMode 会重放 effect，setup 必须恢复标志；取消会 settle Promise，
    // 避免只清理计时器导致请求及 finally 永远悬空。
    mountedRef.current = true;
    // 提交期间主动移到其它操作的用户拥有焦点，不被请求完成后的恢复打断。
    const movedFocus = (event: FocusEvent) => {
      const form = formScopeRef.current?.querySelector('form');
      const returnTargetUnmounted =
        returnFocusRef.current !== null && !returnFocusRef.current.isConnected;
      const focusStayedInDisabledForm =
        (submitLockRef.current || returnTargetUnmounted) &&
        event.target instanceof Node &&
        form?.contains(event.target);
      if (
        !focusStayedInDisabledForm &&
        event.target !== returnFocusRef.current &&
        event.target !== document.body
      ) {
        focusMovedRef.current = true;
        returnFocusRef.current = null;
      }
    };
    document.addEventListener('focusin', movedFocus);
    return () => {
      mountedRef.current = false;
      document.removeEventListener('focusin', movedFocus);
      returnFocusRef.current = null;
      submitGenerationRef.current += 1;
      submitControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (submitting) return;
    // 禁用输入可能让原生浏览器焦点落到 BODY；重新启用提交后的原控件时
    // 恢复键盘落点。若重试按钮被替换，则落到当前状态的有效恢复动作。
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (focusMovedRef.current) return;
    const active = document.activeElement;
    const focusStayedInForm =
      active instanceof Node && formScopeRef.current?.querySelector('form')?.contains(active);
    if (
      target?.isConnected &&
      formScopeRef.current?.contains(target) &&
      !target.matches(':disabled') &&
      (active === document.body || active === target || focusStayedInForm)
    ) {
      target.focus();
      return;
    }
    if (active === document.body || (target && !target.isConnected && submitState === 'success')) {
      if (submitState === 'error') retryActionRef.current?.focus();
      if (submitState === 'success') successActionRef.current?.focus();
    }
  }, [submitState, submitting]);

  useEffect(() => {
    if (!focusNewCustomerRef.current || submitState !== 'idle') return;
    focusNewCustomerRef.current = false;
    // “继续新增”会卸载成功区中的当前按钮；重置完成后用公开表单实例
    // 聚焦首字段，并通过共用滚动策略避开文档吸顶顶栏。
    // 普通重置不触发此路径，保留重置按钮焦点。
    if (document.activeElement === document.body) {
      scrollDynamicFormFieldIntoView(formRef.current?.form, 'name');
    }
  }, [submitState]);

  async function handleFinish(values: DynamicFormValues) {
    // ref 锁填补 React 渲染提交状态前的同步窗口，同时保护命令式/程序化提交。
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    const generation = ++submitGenerationRef.current;
    const controller = new AbortController();
    submitControllerRef.current = controller;
    const shouldUpdate = () => mountedRef.current && submitGenerationRef.current === generation;
    const active = document.activeElement;
    returnFocusRef.current =
      active instanceof HTMLElement &&
      formScopeRef.current?.contains(active) &&
      active.closest('form')
        ? active
        : null;
    focusMovedRef.current = false;
    setSaved(null);
    setSavedAction('');
    setSubmitError('');
    setSubmitState('submitting');
    try {
      await new Promise<void>((resolve, reject) => {
        const cancel = () => {
          window.clearTimeout(timer);
          controller.signal.removeEventListener('abort', cancel);
          reject(new DOMException('请求已取消', 'AbortError'));
        };
        const timer = window.setTimeout(() => {
          controller.signal.removeEventListener('abort', cancel);
          resolve();
        }, 550);
        controller.signal.addEventListener('abort', cancel, { once: true });
        if (controller.signal.aborted) cancel();
      });
      if (!shouldUpdate()) return;
      if (simulateFailure && !failureConsumedRef.current) {
        // 开关每次开启只消费一次失败；保留开关状态，原位重试即可成功。
        failureConsumedRef.current = true;
        setSubmitError('保存失败，已保留当前填写内容；重试保存即可完成。');
        setSubmitState('error');
        return;
      }
      setSaved(values);
      setSubmitState('success');
    } catch (error) {
      // 重置或卸载的取消只结束旧请求；真实失败保持既有恢复操作。
      if (!shouldUpdate() || controller.signal.aborted) return;
      setSubmitError(error instanceof Error ? error.message : '保存失败，请重试。');
      setSubmitState('error');
    } finally {
      // 旧请求 finally 不能释放新请求拥有的同步锁。
      if (submitGenerationRef.current === generation) {
        submitControllerRef.current = null;
        submitLockRef.current = false;
      }
    }
  }

  function resetForm(focusNewCustomer = false) {
    focusNewCustomerRef.current = focusNewCustomer;
    // 重置是新的用户动作，不把上次提交的焦点恢复到已重置或重建的字段。
    returnFocusRef.current = null;
    submitGenerationRef.current += 1;
    submitControllerRef.current?.abort();
    submitControllerRef.current = null;
    submitLockRef.current = false;
    formRef.current?.reset();
    setSaved(null);
    setSavedAction('');
    setSubmitError('');
    setSubmitState('idle');
  }

  return (
    <div className={styles.demo} ref={formScopeRef}>
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
            {theme.density === 'compact' ? '紧凑' : '舒适'} · {colorSelection.label}
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
          <label className={styles.demoControl}>
            品牌色
            <select
              className={styles.demoSelect}
              aria-label="品牌色"
              value={theme.colorPreset}
              onChange={(event) =>
                setTheme({
                  colorPreset: event.target.value as LxColorPreset,
                  palettePreset: null,
                })
              }
            >
              {brandColorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.demoControl}>
            东方配色
            <select
              className={styles.demoSelect}
              aria-label="东方配色"
              value={theme.palettePreset ?? 'brand'}
              onChange={(event) => {
                const value = event.target.value;
                setTheme({
                  palettePreset: value === 'brand' ? null : (value as LxPalettePreset),
                });
              }}
            >
              <option value="brand">使用品牌色</option>
              {paletteOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.colorPreview} aria-live="polite">
            <span
              className={styles.colorSwatch}
              aria-hidden="true"
              style={{ backgroundColor: 'var(--lx-color-primary)' }}
            />
            <span>
              当前配色：{colorSelection.label}（{colorSelection.type}）
            </span>
          </div>
          <label className={styles.failureToggle}>
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(event) => {
                failureConsumedRef.current = false;
                setSimulateFailure(event.target.checked);
              }}
            />
            模拟保存失败（用于演示恢复）
          </label>
        </div>
      </details>

      <DynamicForm
        name={id}
        ref={formRef}
        schema={schema}
        defaultValue={{ level: 'standard' }}
        omitHidden
        compact={theme.density === 'compact'}
        loading={submitting}
        disabled={submitting}
        onChange={() => {
          if (submitting) return;
          setSaved(null);
          setSavedAction('');
          setSubmitError('');
          setSubmitState('idle');
        }}
        onFinish={handleFinish}
        onFinishFailed={({ errorFields, outOfDate }) => {
          // 当前校验错误使用公开表单实例聚焦；共享滚动策略会为 Dumi 吸顶栏留出空间。
          if (outOfDate || !errorFields[0]) return;
          scrollDynamicFormFieldIntoView(formRef.current?.form, errorFields[0].name);
        }}
      >
        <div className={styles.demoActions}>
          {submitState === 'error' ? (
            <div className={styles.submissionRecovery}>
              <p className={styles.submissionError} role="alert">
                {submitError}
              </p>
              <Button
                key="retry"
                ref={retryActionRef}
                type="primary"
                htmlType="button"
                onClick={() => formRef.current?.submit()}
              >
                重试保存
              </Button>
            </div>
          ) : (
            <Button
              key="save"
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? '保存中' : '保存客户'}
            </Button>
          )}
          <Button htmlType="button" disabled={submitting} onClick={() => resetForm()}>
            重置
          </Button>
        </div>
      </DynamicForm>

      {saved && submitState === 'success' && (
        <div className={styles.demoSuccess} role="status" aria-live="polite">
          <p>已保存客户：{String(saved.name || '当前客户')}</p>
          <div className={styles.successActions}>
            <Button
              ref={successActionRef}
              size="small"
              onClick={() => setSavedAction('已打开客户详情（演示）')}
            >
              查看客户
            </Button>
            <Button size="small" onClick={() => resetForm(true)}>
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
  const [preferredColor] = usePrefersColor();
  const { themeConfig } = useSiteData();
  const docsMode =
    preferredColor ?? (themeConfig.prefersColor.default === 'dark' ? 'dark' : 'light');
  return (
    <LxConfigProvider theme={{ mode: docsMode, persist: false }}>
      <CustomerEntry docsMode={docsMode} />
    </LxConfigProvider>
  );
}
