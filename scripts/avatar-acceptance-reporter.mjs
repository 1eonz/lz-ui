import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 将多行错误压成 Markdown 表格中的单行摘要。 */
export function formatErrorMessage(message) {
  return message
    .replace(/\r?\n\s*/g, ' ')
    .trim()
    .replace(/\|/g, '\\|');
}

/** 按当前验收阶段生成报告，避免前置失败时沿用旧的通过记录。 */
export function formatAvatarAcceptanceReport({
  status,
  stage,
  runAt = new Date(),
  runId,
  results = [],
}) {
  const rows = results.map((result) => {
    const detail = result.error ? '：' + formatErrorMessage(result.error) : '';
    return `| ${result.browser} | ${result.title} | ${result.status}${detail} | ${result.duration} ms |`;
  });
  const report = [
    '# Avatar 浏览器验收报告',
    '',
    `- 运行时间：${runAt.toISOString()}`,
    `- 总体结果：${status}`,
    stage && `- 当前阶段：${stage}`,
    runId && `- 运行标识：${runId}`,
    '- 静态文档：`.codex/avatar-docs-dist`',
    '- Dumi 临时目录：`.dumi/tmp-production`',
    '- 验收报告：`.codex/avatar-acceptance-report.md`',
    '- 浏览器：Chromium、WebKit',
    '- 视口：1280×720、930×720、390×844、320×740 CSS px',
    '- 复现命令：`npm run test:browser:avatar:preview`',
    '',
    '| 浏览器 | 用例 | 结果 | 耗时 |',
    '| --- | --- | --- | ---: |',
    ...rows,
    '',
    '响应式视口用例会为每个浏览器保存 1280、930、390 和 320px 截图；失败时 Playwright 会在该目录额外保留失败截图与 trace。',
    '最近一次 Playwright 运行状态记录在 `.codex/test-results/avatar-preview/.last-run.json`。',
    '',
  ];

  return report.filter((line) => line !== undefined && line !== false).join('\n');
}

/** 写入当前验收状态和浏览器用例结果。 */
export async function writeAvatarAcceptanceReport(reportData) {
  const outputDirectory = path.join(projectRoot, '.codex');
  const reportPath = path.join(outputDirectory, 'avatar-acceptance-report.md');
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(reportPath, formatAvatarAcceptanceReport(reportData), 'utf8');
  console.log(`Avatar 验收报告：${reportPath}`);
}

/** 读取报告状态，用于确认 Playwright 已为本轮写入最终结果。 */
export async function readAvatarAcceptanceReportState() {
  const reportPath = path.join(projectRoot, '.codex', 'avatar-acceptance-report.md');
  let report;

  try {
    report = await readFile(reportPath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }

  return {
    runId: report.match(/^- 运行标识：(.+)$/m)?.[1],
    status: report.match(/^- 总体结果：(.+)$/m)?.[1],
  };
}

/** 汇总双浏览器验收结果，便于按同一命令复跑并比较结果。 */
export default class AvatarAcceptanceReporter {
  results = [];

  onTestEnd(test, result) {
    this.results.push({
      browser: test.parent.project()?.name ?? 'default',
      title: test.title,
      status: result.status,
      duration: result.duration,
      error: result.error?.message,
    });
  }

  async onEnd(fullResult) {
    await writeAvatarAcceptanceReport({
      status: fullResult.status,
      stage: '浏览器验收结束',
      runId: process.env.AVATAR_ACCEPTANCE_RUN_ID,
      results: this.results,
    });
  }
}
