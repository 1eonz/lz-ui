import { describe, expect, it } from 'vitest';
import { runAvatarAcceptance } from '../../scripts/run-avatar-acceptance.mjs';

const runAt = new Date('2026-10-13T00:00:00.000Z');

function createReportStore() {
  let currentReport: { runId?: string; status?: string } | null = null;
  const writes: Array<{ runId?: string; status: string; stage: string }> = [];

  return {
    writes,
    readReport: async () => currentReport,
    writeReport: async (report: { runId?: string; status: string; stage: string }) => {
      currentReport = { runId: report.runId, status: report.status };
      writes.push(report);
    },
  };
}

describe('Avatar 验收入口状态', () => {
  it('预览构建或静态导出失败时写入本轮失败状态并跳过浏览器', async () => {
    const store = createReportStore();
    const commands: Array<{ args: string[] }> = [];

    const code = await runAvatarAcceptance({
      runId: 'build-failed-run',
      runAt,
      writeReport: store.writeReport,
      readReport: store.readReport,
      executeCommand: async (command) => {
        commands.push(command);
        return { code: 2 };
      },
    });

    expect(code).toBe(2);
    expect(commands).toHaveLength(1);
    expect(commands[0].args).toContain('build:docs:avatar-preview');
    expect(store.writes.map(({ status }) => status)).toEqual(['进行中', 'failed']);
    expect(store.writes.slice(-1)[0]?.stage).toContain('预览构建与静态导出失败');
  });

  it('浏览器进程失败且 reporter 未收尾时不会留下绿色报告', async () => {
    const store = createReportStore();
    let commandIndex = 0;

    const code = await runAvatarAcceptance({
      runId: 'browser-failed-run',
      runAt,
      writeReport: store.writeReport,
      readReport: store.readReport,
      executeCommand: async () => {
        commandIndex += 1;
        return commandIndex === 1 ? { code: 0 } : { error: new Error('启动失败') };
      },
    });

    expect(code).toBe(1);
    expect(store.writes.map(({ status }) => status)).toEqual(['进行中', '进行中', 'failed']);
    expect(store.writes.slice(-1)[0]?.stage).toContain('浏览器验收失败：启动失败');
  });

  it('浏览器进程成功但没有本轮最终报告时标记失败', async () => {
    const store = createReportStore();

    const code = await runAvatarAcceptance({
      runId: 'missing-final-run',
      runAt,
      writeReport: store.writeReport,
      readReport: store.readReport,
      executeCommand: async () => ({ code: 0 }),
    });

    expect(code).toBe(1);
    expect(store.writes.slice(-1)[0]).toMatchObject({
      status: 'failed',
      stage: '浏览器进程结束，但没有生成本轮最终验收报告',
    });
  });

  it('保留 reporter 写入的本轮失败结果', async () => {
    const store = createReportStore();
    let commandIndex = 0;

    const code = await runAvatarAcceptance({
      runId: 'reporter-failed-run',
      runAt,
      writeReport: store.writeReport,
      readReport: store.readReport,
      executeCommand: async () => {
        commandIndex += 1;
        if (commandIndex === 1) return { code: 0 };
        await store.writeReport({
          runId: 'reporter-failed-run',
          status: 'failed',
          stage: '浏览器验收结束',
        });
        return { code: 1 };
      },
    });

    expect(code).toBe(1);
    expect(store.writes.slice(-1)[0]).toMatchObject({
      status: 'failed',
      stage: '浏览器验收结束',
    });
  });

  it('只在 reporter 为本轮写入 passed 后返回成功', async () => {
    const store = createReportStore();
    let commandIndex = 0;

    const code = await runAvatarAcceptance({
      runId: 'passed-run',
      runAt,
      writeReport: store.writeReport,
      readReport: store.readReport,
      executeCommand: async () => {
        commandIndex += 1;
        if (commandIndex === 1) return { code: 0 };
        await store.writeReport({
          runId: 'passed-run',
          status: 'passed',
          stage: '浏览器验收结束',
        });
        return { code: 0 };
      },
    });

    expect(code).toBe(0);
    expect(store.writes.slice(-1)[0]).toMatchObject({
      status: 'passed',
      stage: '浏览器验收结束',
    });
  });
});
