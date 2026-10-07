import { useCallback, useEffect, useId, useRef, useState } from 'react';
import '../../src/style.css';
import { CloudUploadOutlined } from '@ant-design/icons';
import { Button } from 'lx-ui';
import type { ButtonRef, UploadProps } from 'lx-ui';
import { Upload as AntUpload } from 'lx-ui/antd';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './upload-network.module.css';

const maxFileSize = 50 * 1024 * 1024;

type UploadItem = NonNullable<UploadProps['fileList']>[number];
type UploadRequest = NonNullable<UploadProps['customRequest']>;
type UploadRequestOptions = Parameters<UploadRequest>[0];
type UploadRequestInfo = Parameters<UploadRequest>[1];

function isSafeFileId(fileId: string): boolean {
  // 服务端标识会拼进删除请求路径，只接受一个不会改变 URL 路径结构的安全片段。
  const match = /^[A-Za-z0-9_-][A-Za-z0-9._~-]{0,127}/.exec(fileId);
  return match?.[0] === fileId;
}

function resolveRequestUrl(endpoint: string, fileId?: string): string | undefined {
  // 相对地址按当前文档解析；只接受 HTTP(S)，并把 fileId 编码为单独的路径段。
  const value = endpoint.trim();
  if (!value) {
    return undefined;
  }
  try {
    const url = new URL(value, document.baseURI);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined;
    }
    if (fileId !== undefined) {
      if (!isSafeFileId(fileId)) {
        return undefined;
      }
      url.pathname = url.pathname.replace(/\/+$/, '') + '/' + encodeURIComponent(fileId);
    }
    return url.href;
  } catch {
    return undefined;
  }
}

function getFileId(response: unknown): string | undefined {
  if (
    typeof response === 'object' &&
    response !== null &&
    'fileId' in response &&
    typeof response.fileId === 'string' &&
    isSafeFileId(response.fileId)
  ) {
    return response.fileId;
  }
  return undefined;
}

function getResponseMessage(response: unknown): string | undefined {
  if (
    typeof response === 'object' &&
    response !== null &&
    'message' in response &&
    typeof response.message === 'string'
  ) {
    return response.message;
  }
  return undefined;
}

function getErrorMessage(error: unknown): string | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return typeof error === 'string' ? error : undefined;
}

function formatSize(size: number): string {
  return size < 1024 * 1024
    ? (size / 1024).toFixed(0) + ' KB'
    : (size / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function UploadNetworkDemo() {
  const endpointId = useId();
  const endpointErrorId = useId();
  const consentId = useId();
  const chooseButtonRef = useRef<ButtonRef | null>(null);
  const deleteButtonRefs = useRef(new Map<string, ButtonRef>());
  const currentFileList = useRef<UploadItem[]>([]);
  const [endpoint, setEndpoint] = useState('/api/uploads');
  const [networkEnabled, setNetworkEnabled] = useState(false);
  const [fileList, setFileList] = useState<UploadItem[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  const [deletingUids, setDeletingUids] = useState<Set<string>>(() => new Set());
  const [notice, setNotice] = useState('文件默认只保留在本地，不会发送网络请求。');
  const mounted = useRef(false);
  const filePickerPending = useRef(false);
  const filePickerBlurred = useRef(false);
  const requestFiles = useRef(new Map<string, File>());
  const requests = useRef(new Map<string, XMLHttpRequest>());
  const deleteRequests = useRef(new Set<AbortController>());
  const deletingUidsRef = useRef(new Set<string>());
  const uploadedEndpoints = useRef(new Map<string, string>());
  const endpointInvalid = networkEnabled && !resolveRequestUrl(endpoint);

  const markFilePickerPending = useCallback(() => {
    filePickerPending.current = true;
    filePickerBlurred.current = false;
  }, []);

  // 原生选择器取消时没有文件列表变更；仅在窗口确实失焦并返回后尝试恢复焦点。
  const restoreFilePickerFocus = useCallback(() => {
    window.requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      const focusIsUnplaced =
        activeElement === document.body ||
        (activeElement instanceof HTMLInputElement && activeElement.type === 'file');
      if (mounted.current && focusIsUnplaced) {
        chooseButtonRef.current?.focus();
      }
    });
  }, []);

  useEffect(() => {
    const activeRequests = requests.current;
    const activeDeleteRequests = deleteRequests.current;
    const activeRequestFiles = requestFiles.current;
    const activeUploadedEndpoints = uploadedEndpoints.current;
    const activeDeletingUids = deletingUidsRef.current;
    const handleWindowBlur = () => {
      if (filePickerPending.current) {
        filePickerBlurred.current = true;
      }
    };
    const handleWindowFocus = () => {
      if (!filePickerPending.current || !filePickerBlurred.current) {
        return;
      }
      filePickerPending.current = false;
      filePickerBlurred.current = false;
      restoreFilePickerFocus();
    };
    mounted.current = true;
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      // 卸载时中止网络操作并释放 File 引用，避免过期回调写状态或大文件继续占用内存。
      mounted.current = false;
      filePickerPending.current = false;
      filePickerBlurred.current = false;
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      activeRequests.forEach((request) => request.abort());
      activeRequests.clear();
      activeDeleteRequests.forEach((request) => request.abort());
      activeDeleteRequests.clear();
      activeDeletingUids.clear();
      activeRequestFiles.clear();
      activeUploadedEndpoints.clear();
    };
  }, [restoreFilePickerFocus]);

  const updateFile = useCallback((uid: string, changes: Partial<UploadItem>) => {
    if (!mounted.current) {
      return;
    }
    setFileList((current) => {
      const next = current.map((file) => (file.uid === uid ? { ...file, ...changes } : file));
      currentFileList.current = next;
      return next;
    });
  }, []);

  const customRequest = useCallback<UploadRequest>((options) => {
    const target = resolveRequestUrl(options.action);
    if (!target) {
      options.onError?.(new Error('服务端地址无效，请填写 HTTP 或 HTTPS 地址。'));
      return;
    }
    if (!(options.file instanceof Blob)) {
      options.onError?.(new Error('浏览器没有提供可上传的文件内容。'));
      return;
    }

    // XHR 提供浏览器上传进度事件；FormData 的 boundary 必须交给浏览器生成。
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    const fileName =
      'name' in options.file && typeof options.file.name === 'string'
        ? options.file.name
        : 'upload.bin';
    const uid =
      'uid' in options.file && typeof options.file.uid === 'string' ? options.file.uid : undefined;

    formData.append(options.filename || 'file', options.file, fileName);
    Object.entries(options.data ?? {}).forEach(([name, value]) => {
      if (value instanceof Blob) {
        formData.append(name, value);
      } else {
        formData.append(name, String(value));
      }
    });

    xhr.upload.addEventListener('progress', (event) => {
      if (mounted.current && event.lengthComputable && event.total > 0) {
        options.onProgress?.({
          percent: Math.round((event.loaded / event.total) * 100),
        });
      }
    });
    xhr.addEventListener('load', () => {
      if (uid) {
        requests.current.delete(uid);
      }
      if (!mounted.current) {
        return;
      }
      let response: unknown;
      try {
        response = JSON.parse(xhr.responseText) as unknown;
      } catch {
        response = undefined;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        const detail = getResponseMessage(response);
        options.onError?.(
          new Error(
            detail
              ? '服务端返回 HTTP ' + xhr.status + '：' + detail
              : '服务端返回 HTTP ' + xhr.status + '，请检查服务状态后重试。',
          ),
          response,
        );
        return;
      }
      if (!getFileId(response)) {
        options.onError?.(
          new Error('服务端响应缺少有效 fileId；仅支持安全的单路径标识，请检查接口响应格式。'),
          response,
        );
        return;
      }
      if (uid) {
        uploadedEndpoints.current.set(uid, options.action);
      }
      options.onSuccess?.(response, xhr);
    });
    xhr.addEventListener('error', () => {
      if (uid) {
        requests.current.delete(uid);
      }
      if (mounted.current) {
        options.onError?.(new Error('无法连接服务端；请检查地址或网络后重试。'));
      }
    });
    xhr.addEventListener('abort', () => {
      if (uid) {
        requests.current.delete(uid);
      }
      if (mounted.current) {
        options.onError?.(new Error('上传已取消。'));
      }
    });

    try {
      xhr.open('POST', target);
      xhr.withCredentials = options.withCredentials ?? false;
      Object.entries(options.headers ?? {}).forEach(([name, value]) => {
        // multipart 的 boundary 由浏览器生成，不能手动覆盖 Content-Type。
        if (name.toLowerCase() !== 'content-type') {
          xhr.setRequestHeader(name, value);
        }
      });
      if (uid) {
        requests.current.set(uid, xhr);
      }
      xhr.send(formData);
    } catch {
      if (uid) {
        requests.current.delete(uid);
      }
      options.onError?.(new Error('无法发送上传请求；请检查服务端地址后重试。'));
    }

    return {
      abort: () => xhr.abort(),
    };
  }, []);

  const beforeUpload: NonNullable<UploadProps['beforeUpload']> = (file) => {
    requestFiles.current.set(file.uid, file);
    setValidationErrors((current) => {
      const next = { ...current };
      delete next[file.uid];
      return next;
    });
    if (file.size > maxFileSize) {
      const message = '文件超过 50 MB 上限，请压缩或选择较小文件。';
      setValidationErrors((current) => ({ ...current, [file.uid]: message }));
      setNotice(file.name + '：' + message);
      return false;
    }
    if (!networkEnabled) {
      setNotice(file.name + ' 已保留在本地；启用传输后可单独上传。');
      return false;
    }
    if (!resolveRequestUrl(endpoint)) {
      setNotice(file.name + ' 已暂存；修正服务端地址后即可上传。');
      return false;
    }
    setNotice(file.name + ' 正在发送到已配置的服务端。');
    return true;
  };

  const startUpload = (file: UploadItem) => {
    if (file.status === 'uploading' || validationErrors[file.uid]) {
      return;
    }
    if (!networkEnabled) {
      setNotice('请先启用网络传输，再上传文件。');
      return;
    }
    const target = resolveRequestUrl(endpoint);
    if (!target) {
      setNotice('服务端地址无效，请修正后重试。');
      return;
    }
    const source = requestFiles.current.get(file.uid);
    if (!source) {
      setNotice('原文件已不可用，请移除后重新选择。');
      return;
    }

    setValidationErrors((current) => {
      const next = { ...current };
      delete next[file.uid];
      return next;
    });
    setDeleteErrors((current) => {
      const next = { ...current };
      delete next[file.uid];
      return next;
    });
    setNotice(file.name + ' 正在发送到已配置的服务端。');
    updateFile(file.uid, { status: 'uploading', percent: 0, error: undefined });
    const options: UploadRequestOptions = {
      action: target,
      method: 'POST',
      filename: 'file',
      file: source,
      data: {},
      headers: {},
      withCredentials: false,
      onProgress: (event) => {
        updateFile(file.uid, {
          status: 'uploading',
          percent: event.percent ?? 0,
        });
      },
      onSuccess: (response) => {
        updateFile(file.uid, {
          status: 'done',
          percent: 100,
          response,
          error: undefined,
        });
        setNotice(file.name + ' 上传成功。');
      },
      onError: (error, response) => {
        updateFile(file.uid, {
          status: 'error',
          response,
          error,
        });
        setNotice(file.name + ' 上传失败。');
      },
    };
    const requestInfo: UploadRequestInfo = {
      defaultRequest: () => undefined,
    };
    customRequest(options, requestInfo);
  };

  const removeRemoteFile: NonNullable<UploadProps['onRemove']> = async (file) => {
    if (deletingUidsRef.current.has(file.uid)) {
      return false;
    }
    // 只有服务端确认删除成功才允许移除列表项；失败时保留 fileId 和原文件供重试。
    const fileId = getFileId(file.response as unknown);
    if (!fileId) {
      return true;
    }
    if (!resolveRequestUrl(endpoint)) {
      setDeleteErrors((current) => ({
        ...current,
        [file.uid]: '服务端地址无效；文件仍保留在列表中，请填写有效地址后重试删除。',
      }));
      return false;
    }
    const deleteEndpoint = uploadedEndpoints.current.get(file.uid) || endpoint;
    const target = resolveRequestUrl(deleteEndpoint, fileId);
    if (!target) {
      setDeleteErrors((current) => ({
        ...current,
        [file.uid]: '服务端地址无效；文件仍保留在列表中，请修正地址后重试删除。',
      }));
      return false;
    }
    const controller = new AbortController();
    deletingUidsRef.current.add(file.uid);
    setDeletingUids((current) => new Set(current).add(file.uid));
    setDeleteErrors((current) => {
      const next = { ...current };
      delete next[file.uid];
      return next;
    });
    deleteRequests.current.add(controller);
    try {
      const response = await fetch(target, { method: 'DELETE', signal: controller.signal });
      if (!mounted.current) {
        return false;
      }
      if (!response.ok) {
        setDeleteErrors((current) => ({
          ...current,
          [file.uid]:
            '删除请求失败（HTTP ' +
            response.status +
            '）；远端文件仍保留在列表中。检查地址或服务端状态后重试删除。',
        }));
        return false;
      }
      setDeleteErrors((current) => {
        const next = { ...current };
        delete next[file.uid];
        return next;
      });
      return true;
    } catch {
      if (!mounted.current) {
        return false;
      }
      setDeleteErrors((current) => ({
        ...current,
        [file.uid]: '无法连接服务端；文件仍保留在列表中。检查地址或网络后重试删除。',
      }));
      return false;
    } finally {
      deleteRequests.current.delete(controller);
      deletingUidsRef.current.delete(file.uid);
      if (mounted.current) {
        setDeletingUids((current) => {
          const next = new Set(current);
          next.delete(file.uid);
          return next;
        });
      }
    }
  };

  const removeFromList = async (
    file: UploadItem,
    buttonWasFocusedAtStart: boolean,
    initiatingButton: HTMLElement,
  ) => {
    // 异步操作期间用户可能移到别处；只在焦点仍落在原按钮或 BODY 时恢复，不抢用户焦点。
    const shouldRestoreFocus = () =>
      buttonWasFocusedAtStart &&
      (document.activeElement === document.body || document.activeElement === initiatingButton);

    if (file.status === 'uploading') {
      requests.current.get(file.uid)?.abort();
    }
    const shouldRemove = await removeRemoteFile(file);
    if (!mounted.current) {
      return;
    }
    if (shouldRemove === false) {
      if (buttonWasFocusedAtStart) {
        window.requestAnimationFrame(() => {
          if (!mounted.current || !shouldRestoreFocus()) {
            return;
          }
          deleteButtonRefs.current.get(file.uid)?.focus();
        });
      }
      return;
    }
    const current = currentFileList.current;
    if (!current.some((item) => item.uid === file.uid)) {
      return;
    }
    const removedIndex = current.findIndex((item) => item.uid === file.uid);
    const focusUid = removedIndex < current.length - 1 ? current[removedIndex + 1]?.uid : undefined;
    const next = current.filter((item) => item.uid !== file.uid);
    currentFileList.current = next;
    setFileList(next);
    requestFiles.current.delete(file.uid);
    uploadedEndpoints.current.delete(file.uid);
    setValidationErrors((current) => {
      const next = { ...current };
      delete next[file.uid];
      return next;
    });
    setDeleteErrors((current) => {
      const next = { ...current };
      delete next[file.uid];
      return next;
    });
    setNotice(file.name + ' 已从列表移除。');
    if (buttonWasFocusedAtStart) {
      window.requestAnimationFrame(() => {
        if (!mounted.current || !shouldRestoreFocus()) {
          return;
        }
        if (focusUid && currentFileList.current.some((item) => item.uid === focusUid)) {
          deleteButtonRefs.current.get(focusUid)?.focus();
          return;
        }
        chooseButtonRef.current?.focus();
      });
    }
  };

  const counts = {
    uploading: fileList.filter((file) => file.status === 'uploading').length,
    success: fileList.filter((file) => file.status === 'done').length,
    error: fileList.filter((file) => file.status === 'error' || Boolean(validationErrors[file.uid]))
      .length,
  };

  return (
    <DataDisplayDemoFrame>
      <section className={styles.root} aria-label="Upload 宿主网络传输示例">
        <div className={styles.settings}>
          <label className={styles.label} htmlFor={endpointId}>
            服务端地址
            <input
              id={endpointId}
              className={styles.endpoint}
              value={endpoint}
              aria-invalid={endpointInvalid || undefined}
              aria-describedby={endpointInvalid ? endpointErrorId : undefined}
              onChange={(event) => {
                const nextEndpoint = event.target.value;
                setEndpoint(nextEndpoint);
                if (resolveRequestUrl(nextEndpoint)) {
                  setDeleteErrors((current) => {
                    const next = { ...current };
                    Object.entries(next).forEach(([uid, message]) => {
                      if (message.startsWith('服务端地址无效')) {
                        delete next[uid];
                      }
                    });
                    return next;
                  });
                  setNotice((current) => {
                    return current.includes('修正服务端地址后即可上传。')
                      ? '服务端地址已更新；已暂存文件可单独上传。'
                      : current;
                  });
                }
              }}
              spellCheck={false}
              autoComplete="url"
            />
          </label>
          {endpointInvalid ? (
            <p id={endpointErrorId} className={styles.errorText} role="alert">
              服务端地址无效，请填写 HTTP 或 HTTPS 地址；不会发送网络请求。
            </p>
          ) : null}
          <p className={styles.contract}>
            接口约定：POST multipart 字段 <code>file</code>，成功返回 JSON{' '}
            <code>{'{ "fileId": "..." }'}</code>。fileId 限 1-128 位安全路径字符，首位不能为点；
            移除时请求 <code>DELETE /&#123;fileId&#125;</code>。
          </p>
          <label className={styles.consent} htmlFor={consentId}>
            <input
              id={consentId}
              type="checkbox"
              checked={networkEnabled}
              onChange={(event) => {
                const enabled = event.target.checked;
                setNetworkEnabled(enabled);
              }}
            />
            <span>
              启用网络传输。启用后，新选文件会立即发送到上方地址；已暂存文件需单独点击上传。
            </span>
          </label>
        </div>

        <AntUpload.Dragger
          className={styles.dropZone}
          hasControlInside
          action={endpoint}
          accept=".pdf,.xlsx,.csv,.zip"
          multiple
          fileList={fileList}
          beforeUpload={beforeUpload}
          customRequest={customRequest}
          onChange={({ fileList: nextFileList }) => {
            currentFileList.current = nextFileList;
            setFileList(nextFileList);
            if (filePickerPending.current) {
              filePickerPending.current = false;
              filePickerBlurred.current = false;
              restoreFilePickerFocus();
            }
          }}
          onRemove={removeRemoteFile}
          showUploadList={false}
        >
          <div className={styles.draggerContent}>
            <div className={styles.uploadMark} aria-hidden="true">
              <CloudUploadOutlined />
            </div>
            <h3 className={styles.title}>拖放文件到此处，或选择文件</h3>
            <p className={styles.description}>
              支持 PDF、XLSX、CSV 和 ZIP。单文件上限 50 MB；文件类型仍需由服务端校验。
            </p>
            <Button
              ref={chooseButtonRef}
              type="primary"
              className={styles.action}
              onClick={markFilePickerPending}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  markFilePickerPending();
                }
              }}
            >
              选择文件
            </Button>
          </div>
        </AntUpload.Dragger>

        <div className={styles.phaseSummary} aria-label="上传阶段计数">
          <div className={styles.phase}>
            <span>正在上传</span>
            <strong>{counts.uploading}</strong>
          </div>
          <div className={styles.phase}>
            <span>上传成功</span>
            <strong>{counts.success}</strong>
          </div>
          <div className={styles.phase}>
            <span>上传失败</span>
            <strong>{counts.error}</strong>
          </div>
        </div>

        <p className={styles.notice} role="status" aria-live="polite">
          {notice}
        </p>

        {fileList.length > 0 ? (
          <ul className={styles.fileList} aria-label="已选择文件">
            {fileList.map((file) => {
              const validationError = validationErrors[file.uid];
              const deleteError = deleteErrors[file.uid];
              const fileId = getFileId(file.response as unknown);
              const error =
                validationError ||
                getErrorMessage(file.error) ||
                '上传失败，请检查服务状态后重试。';
              const status = validationError ? 'error' : file.status || 'local';
              const percent = Math.max(0, Math.min(100, file.percent ?? 0));

              return (
                <li className={styles.fileRow} key={file.uid}>
                  <div className={styles.fileHeader}>
                    <div className={styles.fileInfo}>
                      <span className={styles.statusMark} data-status={status} aria-hidden="true">
                        {status === 'done' ? '✓' : status === 'error' ? '!' : '·'}
                      </span>
                      <div className={styles.fileText}>
                        <strong className={styles.fileName}>{file.name}</strong>
                        <span className={styles.fileMeta}>{formatSize(file.size || 0)}</span>
                      </div>
                    </div>
                    <div className={styles.actions}>
                      {status !== 'done' ? (
                        <Button
                          className={styles.action}
                          aria-label={
                            status === 'uploading'
                              ? '正在上传 ' + file.name
                              : status === 'error'
                                ? '重试上传 ' + file.name
                                : '上传到服务端 ' + file.name
                          }
                          aria-disabled={status === 'uploading'}
                          disabled={Boolean(validationError) || !networkEnabled || endpointInvalid}
                          onClick={() => startUpload(file)}
                        >
                          {status === 'uploading'
                            ? '正在上传'
                            : status === 'error'
                              ? '重试上传'
                              : '上传到服务端'}
                        </Button>
                      ) : null}
                      <Button
                        className={styles.action}
                        aria-label={
                          status === 'uploading'
                            ? '取消上传文件 ' + file.name
                            : deletingUids.has(file.uid)
                              ? '正在删除远端文件 ' + file.name
                              : deleteError
                                ? '重试删除远端文件 ' + file.name
                                : fileId
                                  ? '删除已上传文件 ' + file.name
                                  : '移除本地文件 ' + file.name
                        }
                        disabled={deletingUids.has(file.uid)}
                        ref={(instance) => {
                          if (instance) {
                            deleteButtonRefs.current.set(file.uid, instance);
                          } else {
                            deleteButtonRefs.current.delete(file.uid);
                          }
                        }}
                        onClick={(event) => {
                          const initiatingButton = event.currentTarget;
                          const buttonWasFocusedAtStart =
                            document.activeElement === initiatingButton;
                          void removeFromList(file, buttonWasFocusedAtStart, initiatingButton);
                        }}
                      >
                        {status === 'uploading'
                          ? '取消上传'
                          : deletingUids.has(file.uid)
                            ? '正在删除'
                            : deleteError
                              ? '重试删除'
                              : fileId
                                ? '删除远端文件'
                                : '移除'}
                      </Button>
                    </div>
                  </div>

                  {status === 'uploading' ? (
                    <div className={styles.progressGroup}>
                      <div
                        className={styles.progressTrack}
                        role="progressbar"
                        aria-label={'上传进度 ' + file.name}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={percent}
                      >
                        <span
                          className={styles.progressValue}
                          style={{ transform: 'scaleX(' + percent / 100 + ')' }}
                        />
                      </div>
                      <span className={styles.stateText}>正在上传 {percent}%</span>
                    </div>
                  ) : null}

                  {status === 'done' && fileId ? (
                    <p className={styles.successText}>
                      上传成功 · 服务端 fileId：<code>{fileId}</code>
                    </p>
                  ) : null}
                  {status === 'error' ? (
                    <p className={styles.errorText} role="alert">
                      {error}
                      {!validationError && !networkEnabled ? ' 启用网络传输后可重试。' : ''}
                    </p>
                  ) : null}
                  {status === 'local' ? (
                    <p className={styles.stateText}>
                      仅本地选择，尚未上传
                      {networkEnabled ? '；可单独点击“上传到服务端”。' : '；网络传输未启用。'}
                    </p>
                  ) : null}
                  {deleteError ? (
                    <p
                      className={styles.errorText}
                      role={deleteError.startsWith('服务端地址无效') ? undefined : 'alert'}
                    >
                      {deleteError}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.empty}>尚未选择文件。</p>
        )}

        <p className={styles.boundary}>
          断点续传、SHA-256 校验、认证与权限均需服务端契约，本示例未实现、未验收。
        </p>
      </section>
    </DataDisplayDemoFrame>
  );
}
