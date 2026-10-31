import { defineConfig, devices } from '@playwright/test';

const previewPort = Number(process.env.LX_DYNAMIC_FORM_PREVIEW_PORT ?? '8027');
if (!Number.isInteger(previewPort) || previewPort < 1 || previewPort > 65535) {
  throw new Error('LX_DYNAMIC_FORM_PREVIEW_PORT 必须为 1 到 65535 之间的整数');
}
const baseURL = `http://127.0.0.1:${previewPort}`;

export default defineConfig({
  testDir: './tests/browser',
  testMatch: ['dynamic-form-workflow.spec.ts'],
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 30_000 },
  reporter: [['list']],
  outputDir: '.codex/test-results/dynamic-form-final-20261015',
  use: {
    baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'edge',
      use: {
        browserName: 'chromium',
        channel: 'msedge',
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], browserName: 'webkit' },
    },
  ],
  webServer: {
    command: `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port ${previewPort} --strictPort --outDir .codex/dynamic-form-docs-dist`,
    url: `${baseURL}/components/form/dynamic-form/`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
