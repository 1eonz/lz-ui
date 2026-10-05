import { useEffect, useId, useRef, useState } from 'react';
import { Button, DynamicForm } from '../../src/index';
import type { DynamicFormRef, DynamicFormValues, FieldSchema } from '../../src/index';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import recoveryStyles from './dynamic-form.module.css';
import { scrollDynamicFormFieldIntoView } from './dynamic-form-utils';
import styles from './input.module.css';

const schema: readonly FieldSchema[] = [
  { key: 'name', name: 'name', type: 'text', label: '客户名称', required: true },
];

/** 错误携带产生它的请求身份，避免 finally 解锁后旧错误误写新请求。 */
class SubmissionError extends Error {
  constructor(
    reason: unknown,
    readonly request: AbortController,
  ) {
    super(reason instanceof Error ? reason.message : '保存失败，请重试。');
  }
}

/** 本地请求首次失败，后续成功；不引入真实服务或不可取消的计时器。 */
function saveCustomer(fail: boolean, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const cancel = () => {
      window.clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      reject(new DOMException('请求已取消', 'AbortError'));
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', cancel);
      if (fail) reject(new Error('保存失败，请重试。'));
      else resolve();
    }, 600);
    signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) cancel();
  });
}

export default function DynamicSubmitDemo() {
  const id = useId();
  const formRef = useRef<DynamicFormRef>(null);
  const formScope = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const mounted = useRef(false);
  const locked = useRef(false);
  const attempts = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<DynamicFormValues | null>(null);

  useEffect(() => {
    // setup 恢复标志，兼容 StrictMode 的 setup/cleanup/setup 检查。
    mounted.current = true;
    // 加载期间用户若主动转向其他控件，取消恢复，避免异步完成抢走焦点。
    const movedFocus = (event: FocusEvent) => {
      const focusStayedInDisabledForm =
        locked.current && event.target instanceof Node && formScope.current?.contains(event.target);
      if (
        !focusStayedInDisabledForm &&
        event.target !== returnFocus.current &&
        event.target !== document.body
      ) {
        returnFocus.current = null;
      }
    };
    document.addEventListener('focusin', movedFocus);
    return () => {
      mounted.current = false;
      document.removeEventListener('focusin', movedFocus);
      returnFocus.current = null;
      controller.current?.abort();
      controller.current = null;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    // 等 React 提交重新启用的 DOM 后再恢复，不使用悬空计时器。仅恢复本次
    // 表单内仍连接且可交互的原控件；成功后的操作或用户新焦点具有优先权。
    const target = returnFocus.current;
    returnFocus.current = null;
    const active = document.activeElement;
    const focusStayedInForm = active instanceof Node && formScope.current?.contains(active);
    if (
      target?.isConnected &&
      formScope.current?.contains(target) &&
      !target.matches(':disabled') &&
      (active === document.body || active === target || focusStayedInForm)
    ) {
      target.focus();
    }
  }, [loading]);

  async function handleFinish(values: DynamicFormValues) {
    // ref 锁同步覆盖 React loading 渲染前的窗口，也保护命令式 submit。
    if (locked.current) return;
    locked.current = true;
    const request = new AbortController();
    controller.current = request;
    const isCurrent = () => mounted.current && controller.current === request;
    const active = document.activeElement;
    returnFocus.current =
      active instanceof HTMLElement && formScope.current?.contains(active) ? active : null;
    setLoading(true);
    setError('');
    setSaved(null);
    try {
      await saveCustomer(++attempts.current === 1, request.signal);
      // 身份检查挡住过期响应；真实请求应同时把 signal 传给 fetch。
      if (isCurrent()) setSaved(values);
    } catch (reason) {
      // onFinishError 在拒绝处理的微任务中运行；显式保留来源身份，不能只
      // 检查当时最新 controller 的 aborted 状态来推断旧错误是否有效。
      throw new SubmissionError(reason, request);
    } finally {
      // 失败继续拒绝交给 onFinishError；不 reset，保留输入以便重试。
      if (isCurrent()) {
        locked.current = false;
        setLoading(false);
      }
    }
  }

  return (
    <DataDisplayDemoFrame>
      <div ref={formScope}>
        <DynamicForm
          name={id}
          ref={formRef}
          schema={schema}
          loading={loading}
          disabled={loading}
          onFinish={handleFinish}
          onFinishFailed={({ errorFields, outOfDate }) => {
            // 校验失败只聚焦当前首错字段；共享策略会为文档吸顶栏预留可见空间。
            if (outOfDate || !errorFields[0]) return;
            scrollDynamicFormFieldIntoView(formRef.current?.form, errorFields[0].name);
          }}
          onFinishError={(reason) => {
            // 组件会在 Promise 拒绝后通知，即使已经卸载也不能回写状态。
            if (
              !mounted.current ||
              !(reason instanceof SubmissionError) ||
              controller.current !== reason.request ||
              reason.request.signal.aborted
            )
              return;
            setError(reason.message);
          }}
        >
          <div className={styles.actions}>
            <div
              className={recoveryStyles.submissionRecovery}
              role={error ? 'group' : undefined}
              aria-label={error ? '保存失败恢复操作' : undefined}
            >
              {error && (
                <p className={recoveryStyles.submissionError} role="alert">
                  {error}
                </p>
              )}
              <Button
                key="submission-action"
                htmlType={error ? 'button' : 'submit'}
                type="primary"
                loading={loading}
                disabled={loading}
                onClick={error ? () => formRef.current?.submit() : undefined}
              >
                {error ? '重试保存' : '保存客户'}
              </Button>
            </div>
          </div>
        </DynamicForm>
      </div>
      {!error && (
        <p role="status" aria-live="polite">
          {loading ? '正在保存客户' : saved ? `已保存客户：${String(saved.name)}` : '尚未保存'}
        </p>
      )}
    </DataDisplayDemoFrame>
  );
}
