import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { acquireFileLock, withFileLock } from './file-lock.mjs';
import { runDumiBuild } from './run-dumi-build.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lockPath = path.join(projectRoot, '.codex', 'dynamic-form-preview.lock');

/**
 * 为 DynamicForm preview 取得独立主锁，防止同类任务重建正在验收的隔离产物。
 * 此锁与共享 Dumi 构建锁职责不同：前者需覆盖构建、导出检查和浏览器测试，
 * 后者只在实际补丁及构建阶段由 runDumiBuild 取得；本函数本身不启动任何工作。
 * 遗留主锁和恢复锁按通用文件锁协议处理，不覆盖 dev 或绕过脚本的直接命令。
 *
 * @param {string} [lockFilePath] 同类 preview 共享的锁路径；替代路径仅用于隔离测试。
 * @returns {Promise<() => Promise<void>>} 释放函数；调用方须在全部验收工作结束后等待它完成。
 * @throws {Error} 活锁、恢复锁占用或文件操作失败时拒绝。
 */
export async function acquirePreviewLock(lockFilePath = lockPath) {
  return acquireFileLock(lockFilePath, 'DynamicForm preview');
}

/**
 * 将一次 preview 的完整产物生命周期包在锁内，失败时也尝试释放。
 * task 必须等待构建与测试全部结束，不能只返回后台进程的启动结果；
 * 否则其他 preview 会在浏览器仍读取产物时获得锁并覆盖文件。
 *
 * @template T
 * @param {() => T | Promise<T>} task 包含本次构建、检查与验收的任务。
 * @param {string} [lockFilePath] preview 主锁路径，默认在仓库 .codex 内。
 * @returns {Promise<T>} 任务结果；冲突及失败向上传播，不排队等待。
 */
export async function withPreviewLock(task, lockFilePath = lockPath) {
  return withFileLock(task, lockFilePath, 'DynamicForm preview');
}

/**
 * 等待子命令实际退出再结束任务，确保 preview 锁不会在浏览器仍运行时释放。
 * 中断和终止信号转发给当前子进程，并在退出或启动失败后移除监听器；
 * 无法捕获的强制终止仍可能遗留锁，需要下次入口按通用协议处理。
 */
function runNode(args, label, environment = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {
      cwd: projectRoot,
      env: environment,
      stdio: 'inherit',
    });
    const forwardSignal = (signal) => child.kill(signal);
    const forwardInterrupt = () => forwardSignal('SIGINT');
    const forwardTerminate = () => forwardSignal('SIGTERM');
    const removeSignalHandlers = () => {
      process.off('SIGINT', forwardInterrupt);
      process.off('SIGTERM', forwardTerminate);
    };
    process.on('SIGINT', forwardInterrupt);
    process.on('SIGTERM', forwardTerminate);

    child.once('error', (error) => {
      removeSignalHandlers();
      reject(error);
    });
    child.once('exit', (code, signal) => {
      removeSignalHandlers();
      if (signal) {
        reject(new Error(`${label} 被信号 ${signal} 终止`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`${label} 失败，退出码 ${code ?? 1}`));
        return;
      }
      resolve();
    });
  });
}

/**
 * 持有外层 preview 锁期间取得共享构建锁，统一锁顺序为 preview → Dumi 构建。
 * runDumiBuild 返回后共享锁已释放，导出检查和后续测试仍由 preview 锁保护；
 * 其他组件构建不会因此被浏览器测试长期阻塞，但仍须遵守禁止 dev/build 并发的规则。
 */
async function buildPreview() {
  await runDumiBuild({ dumiEnv: 'dynamic-form-preview' });
  await runNode(
    [
      path.join(projectRoot, 'scripts', 'check-docs-export.mjs'),
      '.codex/dynamic-form-docs-dist',
      '--required-page=components/form/dynamic-form/index.html',
    ],
    'DynamicForm 文档导出检查',
  );
}

async function runPreview(mode, extraArgs) {
  await buildPreview();
  if (mode === 'build') return;

  const playwrightArgs = [
    path.join(projectRoot, 'node_modules', '@playwright', 'test', 'cli.js'),
    'test',
    '--config=playwright.dynamic-form-preview.config.ts',
  ];
  if (mode === 'webkit') playwrightArgs.push('--project=webkit');
  playwrightArgs.push(...extraArgs);
  await runNode(playwrightArgs, 'DynamicForm 浏览器验收');
}

async function main() {
  const [mode, ...extraArgs] = process.argv.slice(2);
  if (!['build', 'test', 'webkit'].includes(mode)) {
    throw new Error(
      '用法：node scripts/run-dynamic-form-preview.mjs <build|test|webkit> [Playwright 参数]',
    );
  }
  await withPreviewLock(() => runPreview(mode, extraArgs));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
