import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { acquirePreviewLock, withPreviewLock } from '../../scripts/run-dynamic-form-preview.mjs';

async function withTemporaryLockPath(run) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'lx-dynamic-form-lock-'));
  const lockPath = path.join(directory, 'preview.lock');
  try {
    await run(lockPath);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test('持锁期间拒绝并发 runner，并在释放后删除锁', async () => {
  await withTemporaryLockPath(async (lockPath) => {
    const release = await acquirePreviewLock(lockPath);
    await assert.rejects(acquirePreviewLock(lockPath), /锁已被占用/);
    await release();
    await assert.rejects(readFile(lockPath), { code: 'ENOENT' });
  });
});

test('回收退出进程遗留的锁', async () => {
  await withTemporaryLockPath(async (lockPath) => {
    const child = spawn(process.execPath, ['-e', ''], { stdio: 'ignore' });
    await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', resolve);
    });
    await writeFile(
      lockPath,
      JSON.stringify({ pid: child.pid, startedAt: new Date().toISOString(), token: 'stale' }),
    );

    const release = await acquirePreviewLock(lockPath);
    const owner = JSON.parse(await readFile(lockPath, 'utf8'));
    assert.equal(owner.pid, process.pid);
    await release();
  });
});

test('并发回收同一陈旧锁时只允许一个 runner 获得锁', async () => {
  await withTemporaryLockPath(async (lockPath) => {
    const child = spawn(process.execPath, ['-e', ''], { stdio: 'ignore' });
    await new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('exit', resolve);
    });
    await writeFile(
      lockPath,
      JSON.stringify({ pid: child.pid, startedAt: new Date().toISOString(), token: 'stale' }),
    );

    const attempts = await Promise.allSettled([
      acquirePreviewLock(lockPath),
      acquirePreviewLock(lockPath),
    ]);
    const winners = attempts.filter((attempt) => attempt.status === 'fulfilled');
    const losers = attempts.filter((attempt) => attempt.status === 'rejected');
    assert.equal(winners.length, 1);
    assert.equal(losers.length, 1);
    assert.match(losers[0].reason.message, /锁已被占用/);
    await winners[0].value();
  });
});

test('任务抛错时仍清理锁', async () => {
  await withTemporaryLockPath(async (lockPath) => {
    await assert.rejects(
      withPreviewLock(async () => {
        throw new Error('preview failed');
      }, lockPath),
      /preview failed/,
    );
    await assert.rejects(readFile(lockPath), { code: 'ENOENT' });
  });
});
