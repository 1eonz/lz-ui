import { describe, expect, it } from 'vitest';
import {
  formatAvatarAcceptanceReport,
  formatErrorMessage,
} from '../../scripts/avatar-acceptance-reporter.mjs';

describe('Avatar 验收报告错误摘要', () => {
  it('把 LF 换行和缩进合并为一行', () => {
    expect(formatErrorMessage('断言失败\n    at avatar.spec.ts:20')).toBe(
      '断言失败 at avatar.spec.ts:20',
    );
  });

  it('把 Windows CRLF 换行和缩进合并为一行', () => {
    expect(formatErrorMessage('断言失败\r\n    at avatar.spec.ts:20')).toBe(
      '断言失败 at avatar.spec.ts:20',
    );
  });

  it('合并换行后转义 Markdown 表格分隔符', () => {
    expect(formatErrorMessage('期望值 | 实际值\n    下一项 | 结果')).toBe(
      '期望值 \\| 实际值 下一项 \\| 结果',
    );
  });

  it('报告显示本轮进行中状态和唯一运行标识', () => {
    const report = formatAvatarAcceptanceReport({
      status: '进行中',
      stage: '预览构建与静态导出运行中',
      runAt: new Date('2026-10-13T00:00:00.000Z'),
      runId: 'avatar-run-1',
    });

    expect(report).toContain('- 总体结果：进行中');
    expect(report).toContain('- 当前阶段：预览构建与静态导出运行中');
    expect(report).toContain('- 运行标识：avatar-run-1');
    expect(report).not.toContain('- 总体结果：passed');
  });

  it('报告表格中的用例错误摘要保留转义后的分隔符', () => {
    const report = formatAvatarAcceptanceReport({
      status: 'failed',
      runAt: new Date('2026-10-13T00:00:00.000Z'),
      results: [
        {
          browser: 'chromium',
          title: 'Avatar 错误摘要转义',
          status: 'failed',
          duration: 12,
          error: '失败原因 | 更多信息',
        },
      ],
    });

    expect(report).toContain(
      '| chromium | Avatar 错误摘要转义 | failed：失败原因 \\| 更多信息 | 12 ms |',
    );
  });
});
