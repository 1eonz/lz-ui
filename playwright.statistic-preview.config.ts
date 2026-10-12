import { defineConfig, devices } from '@playwright/test';

const previewPort = Number(process.env.PLAYWRIGHT_STATISTIC_PORT ?? 8005);
if (!Number.isInteger(previewPort) || previewPort < 1024 || previewPort > 65535) {
  throw new Error('PLAYWRIGHT_STATISTIC_PORT 必须是 1024 到 65535 之间的整数');
}
const baseURL = `http://127.0.0.1:${previewPort}`;

export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'statistic-demo.spec.ts',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 30_000 },
  reporter: [['list']],
  outputDir: '.codex/test-results/statistic-preview',
  use: {
    baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], browserName: 'webkit' } },
  ],
  webServer: {
    command: `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port ${previewPort} --strictPort --outDir .codex/statistic-docs-dist`,
    url: `${baseURL}/components/data-display/statistic/`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
