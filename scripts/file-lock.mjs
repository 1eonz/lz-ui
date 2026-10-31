import { randomUUID } from 'node:crypto';
import { mkdir, open, readFile, stat, unlink } from 'node:fs/promises';
import path from 'node:path';

const malformedLockGraceMs = 60_000;

/**
 * 仅用 PID 的存活性保守判断锁主是否可能仍在运行；权限不足也视为存活。
 * 不比较进程启动时间，因此 PID 被系统重用时可能保留旧锁并阻止新任务，
 * 代价是需要人工核实，收益是不会因无法可靠识别跨平台进程身份而误删活锁。
 */
function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === 'EPERM';
  }
}

/**
 * 同时读取原始内容和锁主信息，供回收者检查内容是否已被其他持有者替换。
 * 文件独占创建与写入并非一个原子动作，损坏或尚未写完的内容只在超过
 * 60 秒宽限期后视为遗留锁；合法 PID 则始终以进程存活性为准，不按文件年龄回收。
 */
async function readLock(lockFilePath) {
  try {
    const contents = await readFile(lockFilePath, 'utf8');
    try {
      const owner = JSON.parse(contents);
      if (Number.isInteger(owner.pid) && owner.pid > 0) {
        return { contents, owner, stale: !isProcessRunning(owner.pid) };
      }
    } catch {
      // 写入中断可能留下不完整内容；宽限期后再回收，避免误删刚创建的锁。
    }

    const fileInfo = await stat(lockFilePath);
    return {
      contents,
      owner: undefined,
      stale: Date.now() - fileInfo.mtimeMs > malformedLockGraceMs,
    };
  } catch (error) {
    if (error?.code === 'ENOENT') return undefined;
    throw error;
  }
}

/**
 * 为主锁的“重读、校验、删除”取得独立恢复锁，串行化多个遗留锁回收者。
 * 恢复锁自身不递归回收，即使其 PID 已退出也返回冲突，避免为回收锁再引入
 * 同样的删除竞态。人工清理必须先停止新任务，并确认原回收进程已退出、
 * 没有其他相关构建或回收操作；仅凭文件年龄或一次 PID 检查不足以安全删除。
 */
async function acquireRecoveryLock(lockFilePath) {
  const recoveryPath = `${lockFilePath}.recovery`;

  while (true) {
    const owner = { pid: process.pid, token: randomUUID() };
    const ownerContents = JSON.stringify(owner);
    let handle;
    let created = false;

    try {
      handle = await open(recoveryPath, 'wx', 0o600);
      created = true;
      await handle.writeFile(ownerContents);
      await handle.sync();
      await handle.close();
      return {
        release: async () => {
          const current = await readLock(recoveryPath);
          if (current?.owner?.token === owner.token && current.owner.pid === owner.pid) {
            await unlink(recoveryPath);
          }
        },
      };
    } catch (error) {
      await handle?.close().catch(() => undefined);
      if (created) await unlink(recoveryPath).catch(() => undefined);
      if (error?.code !== 'EEXIST') throw error;

      const current = await readLock(recoveryPath);
      if (!current) continue;
      return { conflict: current, path: recoveryPath };
    }
  }
}

/**
 * 在恢复锁内重新核实主锁的存活状态与完整内容，避免两个回收者删除新锁。
 * 外层第一次观察到的遗留状态只作为候选，内容变化即放弃本次删除；主锁已
 * 消失则允许调用者重试独占创建。恢复锁冲突交给调用者报告，不自行强行清理。
 */
async function removeStaleLock(lockFilePath, expectedContents) {
  const recoveryLock = await acquireRecoveryLock(lockFilePath);
  if (recoveryLock.conflict) {
    return { removed: false, recoveryConflict: recoveryLock };
  }

  try {
    const current = await readLock(lockFilePath);
    if (!current) return { removed: true };
    if (!current.stale || current.contents !== expectedContents) return { removed: false };
    await unlink(lockFilePath);
    return { removed: true };
  } finally {
    await recoveryLock.release();
  }
}

/**
 * 为配合本协议的任务取得独占主锁；发现活锁立即报错，不排队等待。
 * 使用独占创建决定归属，PID 判断遗留状态，随机 token 防止释放时删除已被
 * 替换的锁；异常退出遗留的主锁由后续调用在恢复锁保护下尝试回收。
 * PID 重用会保守阻塞，不能提供系统级进程身份认证，也无法阻止绕过本封装的任务。
 *
 * @param {string} lockFilePath 同类互斥任务必须共享的主锁路径。
 * @param {string} [label='任务'] 冲突提示中的任务名称。
 * @returns {Promise<() => Promise<void>>} 异步释放函数；仅在 PID 与 token 仍匹配时删除主锁。
 * 调用者须等待受保护任务真正结束后再释放，通常优先使用 withFileLock 管理生命周期。
 * @throws {Error} 主锁占用、恢复锁冲突或文件操作失败时拒绝，不静默跳过保护。
 */
export async function acquireFileLock(lockFilePath, label = '任务') {
  await mkdir(path.dirname(lockFilePath), { recursive: true });
  const owner = {
    pid: process.pid,
    startedAt: new Date().toISOString(),
    token: randomUUID(),
    command: process.argv.slice(2).join(' '),
  };

  while (true) {
    let handle;
    let created = false;
    try {
      handle = await open(lockFilePath, 'wx', 0o600);
      created = true;
      await handle.writeFile(JSON.stringify(owner));
      await handle.sync();
      await handle.close();
      return async () => {
        const current = await readLock(lockFilePath);
        if (current?.owner?.token === owner.token && current.owner.pid === owner.pid) {
          await unlink(lockFilePath);
        }
      };
    } catch (error) {
      await handle?.close().catch(() => undefined);
      if (created) await unlink(lockFilePath).catch(() => undefined);
      if (error?.code !== 'EEXIST') throw error;

      let current = await readLock(lockFilePath);
      if (!current) continue;
      let recoveryConflict;
      if (current.stale) {
        const result = await removeStaleLock(lockFilePath, current.contents);
        if (result.removed) continue;
        recoveryConflict = result.recoveryConflict;
        current = await readLock(lockFilePath);
        if (!current) continue;
        if (current.stale && !recoveryConflict) continue;
      }

      const ownerDescription = current.owner
        ? `PID ${current.owner.pid}（${current.owner.command || label}）`
        : '尚未完成初始化或内容无法解析';
      const recoveryPath = path.resolve(`${lockFilePath}.recovery`);
      const recoveryDescription = recoveryConflict
        ? `回收锁 ${path.resolve(recoveryConflict.path)}（PID ${recoveryConflict.conflict.owner?.pid ?? '未知'}）已存在；为避免并发误删，不会自动清理。确认该进程已退出且没有其他构建后，请手动删除此文件并重试。`
        : `请等待运行结束后重试；如确认没有相关进程，请检查并清理 ${recoveryPath}。`;
      throw new Error(`${label}锁已被占用：${ownerDescription}。${recoveryDescription}`);
    }
  }
}

/**
 * 在同一主锁生命周期内执行并等待任务，成功和失败路径都在 finally 中释放。
 * task 必须返回覆盖全部受保护工作的 Promise；自行启动而不等待的后台工作
 * 会早于实际完成时间解锁。强制结束进程无法运行 finally，需由后续调用回收主锁。
 *
 * @template T
 * @param {() => T | Promise<T>} task 取得锁后才调用的任务。
 * @param {string} lockFilePath 与其他竞争者约定的主锁路径。
 * @param {string} [label='任务'] 锁冲突提示名称。
 * @returns {Promise<T>} 任务结果；任务或锁操作失败会向调用者传播。
 */
export async function withFileLock(task, lockFilePath, label = '任务') {
  const release = await acquireFileLock(lockFilePath, label);
  try {
    return await task();
  } finally {
    await release();
  }
}
