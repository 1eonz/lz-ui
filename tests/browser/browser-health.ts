import type { Page, Request } from '@playwright/test';

export interface BrowserHealth {
  errors: string[];
  activeRequests: Set<Request>;
  lastActivityAt: number;
}

export function collectBrowserErrors(page: Page): BrowserHealth {
  const health: BrowserHealth = {
    errors: [],
    activeRequests: new Set(),
    lastActivityAt: Date.now(),
  };
  const markActivity = () => {
    health.lastActivityAt = Date.now();
  };

  page.on('pageerror', (error) => {
    health.errors.push(`pageerror: ${error.message}`);
    markActivity();
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      const url = message.location().url;
      health.errors.push(`console: ${message.text()}${url ? ` (${url})` : ''}`);
      markActivity();
    }
  });
  page.on('request', (request) => {
    health.activeRequests.add(request);
    markActivity();
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      health.errors.push(`HTTP ${response.status()}: ${response.url()}`);
    }
    markActivity();
  });
  page.on('requestfinished', (request) => {
    health.activeRequests.delete(request);
    markActivity();
  });
  page.on('requestfailed', (request) => {
    const reason = request.failure()?.errorText ?? 'unknown failure';
    health.errors.push(`requestfailed: ${reason}: ${request.url()}`);
    health.activeRequests.delete(request);
    markActivity();
  });
  return health;
}

export async function waitForBrowserQuiescence(
  page: Page,
  health: BrowserHealth,
  quietWindowMs = 1_000,
  timeoutMs = 15_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const quietForMs = Date.now() - health.lastActivityAt;
    if (health.activeRequests.size === 0 && quietForMs >= quietWindowMs) return;

    await page.waitForTimeout(100);
  }

  const pending = [...health.activeRequests].map((request) => request.url());
  throw new Error(
    `浏览器在 ${timeoutMs}ms 内未达到 ${quietWindowMs}ms 静默；仍在进行的请求：${pending.join(', ') || '无'}`,
  );
}
