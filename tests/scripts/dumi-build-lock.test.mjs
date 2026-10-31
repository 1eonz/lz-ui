import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, unlink, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { runDumiBuild, runDumiPatch, withDumiBuildLock } from '../../scripts/run-dumi-build.mjs';

async function withTemporaryLockPath(run) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'lx-dumi-build-lock-'));
  const lockPath = path.join(directory, 'dumi-build.lock');
  try {
    await run(lockPath);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function exitedProcessId() {
  const child = spawn(process.execPath, ['-e', ''], { stdio: 'ignore' });
  await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', resolve);
  });
  return child.pid;
}

test('Dumi runner 在全局锁内顺序执行补丁和构建，并保留 DUMI_ENV', async () => {
  await withTemporaryLockPath(async (lockPath) => {
    const calls = [];
    await runDumiBuild({
      dumiEnv: 'list-preview',
      lockPath,
      runCommand: async (args, label, environment) => {
        calls.push({
          args,
          label,
          environment,
          lock: JSON.parse(await readFile(lockPath, 'utf8')),
        });
      },
    });

    assert.equal(calls.length, 2);
    assert.equal(calls[0].label, 'Dumi 补丁检查');
    assert.equal(calls[1].label, 'Dumi 构建');
    assert.equal(calls[1].environment.DUMI_ENV, 'list-preview');
    assert.equal(calls[0].lock.token, calls[1].lock.token);
    await assert.rejects(readFile(lockPath), { code: 'ENOENT' });
  });
});

test('独立 patch 命令也持有全局锁，命令失败后释放锁', async () => {
  await withTemporaryLockPath(async (lockPath) => {
    await runDumiPatch({
      lockPath,
      runCommand: async () => {
        const owner = JSON.parse(await readFile(lockPath, 'utf8'));
        assert.equal(owner.pid, process.pid);
      },
    });
    await assert.rejects(readFile(lockPath), { code: 'ENOENT' });

    await assert.rejects(
      runDumiBuild({
        lockPath,
        runCommand: async (_args, label) => {
          if (label === 'Dumi 构建') throw new Error('build failed');
        },
      }),
      /build failed/,
    );
    await assert.rejects(readFile(lockPath), { code: 'ENOENT' });
    await assert.rejects(readFile(`${lockPath}.recovery`), { code: 'ENOENT' });
  });
});

test('并发进程回收主锁和回收锁时只让一个构建进入临界区', async () => {
  await withTemporaryLockPath(async (lockPath) => {
    const deadPid = await exitedProcessId();
    await writeFile(
      lockPath,
      JSON.stringify({ pid: deadPid, startedAt: new Date().toISOString(), token: 'stale' }),
    );

    let entered = 0;
    const attempts = await Promise.allSettled([
      withDumiBuildLock(async () => {
        entered += 1;
        await new Promise((resolve) => setTimeout(resolve, 30));
      }, lockPath),
      withDumiBuildLock(async () => {
        entered += 1;
      }, lockPath),
    ]);

    assert.equal(attempts.filter((attempt) => attempt.status === 'fulfilled').length, 1);
    assert.equal(attempts.filter((attempt) => attempt.status === 'rejected').length, 1);
    assert.equal(entered, 1);
    await assert.rejects(readFile(lockPath), { code: 'ENOENT' });
    await assert.rejects(readFile(`${lockPath}.recovery`), { code: 'ENOENT' });
  });
});

test('遗留回收锁不会被自动删除，可手动清理后回收主锁', async () => {
  await withTemporaryLockPath(async (lockPath) => {
    const deadPid = await exitedProcessId();
    await writeFile(
      lockPath,
      JSON.stringify({ pid: deadPid, startedAt: new Date().toISOString(), token: 'stale' }),
    );
    const recoveryPath = `${lockPath}.recovery`;
    const recoveryContents = JSON.stringify({ pid: deadPid, token: 'stale-recovery' });
    await writeFile(recoveryPath, recoveryContents);

    await assert.rejects(
      withDumiBuildLock(async () => {}, lockPath),
      (error) => {
        assert.match(error.message, new RegExp(`PID ${deadPid}`));
        assert.ok(error.message.includes(path.resolve(recoveryPath)));
        assert.match(error.message, /手动删除此文件并重试/);
        return true;
      },
    );
    assert.equal(await readFile(recoveryPath, 'utf8'), recoveryContents);

    await unlink(recoveryPath);
    await withDumiBuildLock(async () => {}, lockPath);
    await assert.rejects(readFile(lockPath), { code: 'ENOENT' });
    await assert.rejects(readFile(recoveryPath), { code: 'ENOENT' });
  });
});
