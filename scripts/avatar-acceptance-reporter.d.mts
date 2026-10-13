/** 描述 Playwright 的 Avatar 测试用例信息。 */
export interface AvatarAcceptanceTest {
  parent: {
    project(): { name: string } | undefined;
  };
  title: string;
}

/** 描述 Playwright 单个 Avatar 测试的执行结果。 */
export interface AvatarAcceptanceResult {
  status: string;
  duration: number;
  error?: {
    message?: string;
  };
}

/** 描述一次 Avatar 浏览器验收报告。 */
export interface AvatarAcceptanceReportData {
  status: string;
  stage?: string;
  runAt?: Date;
  runId?: string;
  results?: Array<{
    browser: string;
    title: string;
    status: string;
    duration: number;
    error?: string;
  }>;
}

/** 描述当前 Avatar 验收报告所属运行及其状态。 */
export interface AvatarAcceptanceReportState {
  runId?: string;
  status?: string;
}

/** 将多行错误摘要压成 Markdown 表格中的单行文本。 */
export declare function formatErrorMessage(message: string): string;

/** 按当前验收阶段生成 Markdown 报告内容。 */
export declare function formatAvatarAcceptanceReport(report: AvatarAcceptanceReportData): string;

/** 写入当前验收状态和浏览器用例结果。 */
export declare function writeAvatarAcceptanceReport(
  report: AvatarAcceptanceReportData,
): Promise<void>;

/** 读取报告状态，用于确认 Playwright 已为本轮写入最终结果。 */
export declare function readAvatarAcceptanceReportState(): Promise<AvatarAcceptanceReportState | null>;

/** 生成 Avatar 浏览器验收记录，并把产物保存在仓库内的 .codex 目录。 */
declare class AvatarAcceptanceReporter {
  results: Array<{
    browser: string;
    title: string;
    status: string;
    duration: number;
    error: string | undefined;
  }>;

  onTestEnd(test: AvatarAcceptanceTest, result: AvatarAcceptanceResult): void;
  onEnd(fullResult: { status: string }): Promise<void>;
}

export default AvatarAcceptanceReporter;
