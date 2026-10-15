import { defineConfig, devices } from '@playwright/test';

const previewPort = 8025;
const baseURL = `http://127.0.0.1:${previewPort}`;

export default defineConfig({
  testDir: './tests/browser',
  testMatch: ['tooltip-demo.spec.ts', 'tooltip-theme-matrix.spec.ts'],
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 30_000 },
  reporter: [['list']],
  outputDir: '.codex/test-results/tooltip-preview',
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
    command: `node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port ${previewPort} --strictPort --outDir .codex/tooltip-docs-dist`,
    url: `${baseURL}/components/feedback/tooltip/`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
