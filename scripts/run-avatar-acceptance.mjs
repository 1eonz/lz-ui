import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  formatErrorMessage,
  readAvatarAcceptanceReportState,
  writeAvatarAcceptanceReport,
} from './avatar-acceptance-reporter.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function runCommand({ file, args, env }) {
  return new Promise((resolve) => {
    const child = spawn(file, args, {
      cwd: projectRoot,
      env,
      shell: process.platform === 'win32' && file === 'npm',
      stdio: 'inherit',
    });

    child.once('error', (error) => resolve({ error }));
    child.once('exit', (code, signal) => resolve({ code, signal }));
  });
}

function commandFailed(result) {
  return Boolean(result.error || result.signal || result.code !== 0);
}

function failureReason(result) {
  if (result.error) return formatErrorMessage(result.error.message);
  if (result.signal) return `收到信号 ${result.signal}`;
  return `退出码 ${result.code ?? 1}`;
}

function npmInvocation() {
  if (process.env.npm_execpath) {
    return {
      file: process.execPath,
      args: [process.env.npm_execpath, 'run', 'build:docs:avatar-preview'],
    };
  }

  return {
    file: 'npm',
    args: ['run', 'build:docs:avatar-preview'],
  };
}

export async function runAvatarAcceptance({
  executeCommand = runCommand,
  writeReport = writeAvatarAcceptanceReport,
  readReport = readAvatarAcceptanceReportState,
  runId = randomUUID(),
  runAt = new Date(),
} = {}) {
  const reportContext = { runId, runAt };
  const buildStage = '预览构建与静态导出';

  await writeReport({
    ...reportContext,
    status: '进行中',
    stage: `${buildStage}运行中`,
  });

  let buildResult;
  try {
    buildResult = await executeCommand({ ...npmInvocation(), env: process.env });
  } catch (error) {
    buildResult = { error };
  }

  if (commandFailed(buildResult)) {
    await writeReport({
      ...reportContext,
      status: 'failed',
      stage: `${buildStage}失败：${failureReason(buildResult)}`,
    });
    return buildResult.code ?? 1;
  }

  await writeReport({
    ...reportContext,
    status: '进行中',
    stage: 'Chromium 与 WebKit 浏览器验收运行中',
  });

  let browserResult;
  try {
    browserResult = await executeCommand({
      file: process.execPath,
      args: [
        path.join(projectRoot, 'node_modules', '@playwright', 'test', 'cli.js'),
        'test',
        'tests/browser/avatar-demo.spec.ts',
        '--config=playwright.avatar-preview.config.ts',
      ],
      env: { ...process.env, AVATAR_ACCEPTANCE_RUN_ID: runId },
    });
  } catch (error) {
    browserResult = { error };
  }

  const latestReport = await readReport();
  const reportIsCurrent = latestReport?.runId === runId;

  if (commandFailed(browserResult)) {
    if (
      reportIsCurrent &&
      latestReport.status &&
      latestReport.status !== '进行中' &&
      latestReport.status !== 'passed'
    ) {
      return browserResult.code ?? 1;
    }

    await writeReport({
      ...reportContext,
      status: 'failed',
      stage: `Chromium 与 WebKit 浏览器验收失败：${failureReason(browserResult)}`,
    });
    return browserResult.code ?? 1;
  }

  if (!reportIsCurrent || latestReport.status === '进行中') {
    await writeReport({
      ...reportContext,
      status: 'failed',
      stage: '浏览器进程结束，但没有生成本轮最终验收报告',
    });
    return 1;
  }

  return latestReport.status === 'passed' ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runAvatarAcceptance()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error('Avatar 验收入口执行失败：', error);
      process.exitCode = 1;
    });
}
