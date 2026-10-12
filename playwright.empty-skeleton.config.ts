import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 30_000 },
  reporter: [['list']],
  outputDir: '.codex/test-results/empty-skeleton-final-20261012',
  webServer: {
    command:
      'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 8003 --strictPort --outDir .codex/empty-skeleton-docs-dist',
    url: 'http://127.0.0.1:8003/components/data-display/skeleton/',
    reuseExistingServer: false,
    timeout: 30_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:8003',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
