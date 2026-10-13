interface AvatarAcceptanceCommand {
  file: string;
  args: string[];
  env: NodeJS.ProcessEnv;
}

interface AvatarAcceptanceCommandResult {
  code?: number | null;
  signal?: string | null;
  error?: Error;
}

interface AvatarAcceptanceReportState {
  runId?: string;
  status?: string;
}

interface AvatarAcceptanceReportData extends AvatarAcceptanceReportState {
  status: string;
  runAt: Date;
  stage: string;
}

export declare function runAvatarAcceptance(options?: {
  executeCommand?: (command: AvatarAcceptanceCommand) => Promise<AvatarAcceptanceCommandResult>;
  writeReport?: (report: AvatarAcceptanceReportData) => Promise<void>;
  readReport?: () => Promise<AvatarAcceptanceReportState | null>;
  runId?: string;
  runAt?: Date;
}): Promise<number>;
