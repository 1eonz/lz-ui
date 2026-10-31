import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { withFileLock } from './file-lock.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lockFilePath = path.join(projectRoot, '.codex', 'dumi-build.lock');
const patchCli = path.join(projectRoot, 'node_modules', 'patch-package', 'index.js');
const dumiCli = path.join(projectRoot, 'node_modules', 'dumi', 'bin', 'dumi.js');

/**
 * 用当前 Node 启动子命令并等待退出，避免调用者在构建仍写入时提前释放锁。
 * 父进程收到中断或终止信号时先转发给子进程，待退出事件再结束 Promise；
 * 退出与启动失败都移除监听器，避免后续命令重复收到转发。强制终止父进程
 * 无法保证此清理路径执行，遗留锁仍需按文件锁协议处理。
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
 * 串行化会修改同一工作区 Dumi 补丁或生成目录的任务，默认共用构建主锁。
 * 只保护调用者等待的 task 生命周期；不检测或锁住已运行的 dev 服务，
 * 也无法拦截直接 npx dumi。启动前仍须停止 dev，避免共用 .dumi/tmp 被覆盖。
 *
 * @template T
 * @param {() => T | Promise<T>} task 已包含全部受保护异步步骤的任务。
 * @param {string} [lockPath] 主锁路径；覆盖值供隔离测试使用，生产入口必须共用默认值。
 * @returns {Promise<T>} 任务结果；占用与任务失败直接传播，不排队等待。
 */
export function withDumiBuildLock(task, lockPath = lockFilePath) {
  return withFileLock(task, lockPath, 'Dumi 构建');
}

/**
 * 在共享构建锁内重放 Dumi 补丁，避免与其他入口的补丁或构建交叉写入。
 * 此锁只持续到补丁子命令退出；dev 入口随后运行的长期服务不在锁内，
 * 不能据此允许 dev 与 build 并发。补丁失败会拒绝并由包装层释放锁。
 *
 * @param {object} [options] 调用配置。
 * @param {string} [options.lockPath] 隔离测试使用的替代主锁路径。
 * @param {Function} [options.runCommand] 可注入的命令执行器，必须等待子命令结束。
 * @returns {Promise<void>} 补丁检查全部完成时兑现。
 */
export async function runDumiPatch({ lockPath = lockFilePath, runCommand = runNode } = {}) {
  await withDumiBuildLock(
    () => runCommand([patchCli, '--error-on-fail'], 'Dumi 补丁检查'),
    lockPath,
  );
}

/**
 * 将补丁重放和 Dumi 构建放入同一共享锁，避免两步之间被其他构建插入。
 * 构建专用环境通过浅拷贝追加 DUMI_ENV，不修改进程环境；补丁仍使用命令执行器
 * 的默认环境。锁在构建子命令退出后释放，调用方后续导出检查或测试需自行保护。
 * 不要在已持有相同构建锁的 task 内再次调用，本协议不支持可重入锁。
 *
 * @param {object} [options] 构建配置。
 * @param {string} [options.dumiEnv] 隔离预览使用的 Dumi 环境名称。
 * @param {NodeJS.ProcessEnv} [options.environment] 构建子命令的基础环境。
 * @param {string} [options.lockPath] 隔离测试使用的替代主锁路径。
 * @param {Function} [options.runCommand] 可注入的执行器；必须返回覆盖命令全程的 Promise。
 * @returns {Promise<void>} 补丁和构建完成时兑现，任一步失败均向上传播。
 */
export async function runDumiBuild({
  dumiEnv,
  environment = process.env,
  lockPath = lockFilePath,
  runCommand = runNode,
} = {}) {
  const buildEnvironment = dumiEnv ? { ...environment, DUMI_ENV: dumiEnv } : environment;
  await withDumiBuildLock(async () => {
    await runCommand([patchCli, '--error-on-fail'], 'Dumi 补丁检查');
    await runCommand([dumiCli, 'build'], 'Dumi 构建', buildEnvironment);
  }, lockPath);
}

async function main() {
  const [mode = 'build'] = process.argv.slice(2);
  if (mode === 'patch') {
    await runDumiPatch();
    return;
  }
  if (mode === 'build') {
    await runDumiBuild();
    return;
  }
  throw new Error('用法：node scripts/run-dumi-build.mjs <patch|build>');
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
