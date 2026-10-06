import { expect, test, type Page, type Request } from '@playwright/test';
import { browserComponentRoutes } from './routes';

const expectedBrowserRouteIdentities = [
  { name: 'Button', path: '/components/general/button' },
  { name: 'Icon', path: '/components/general/icon' },
  { name: 'Typography', path: '/components/general/typography' },
  { name: 'Space', path: '/components/general/space' },
  { name: 'Divider', path: '/components/general/divider' },
  { name: 'Input', path: '/components/form/input' },
  { name: 'InputNumber', path: '/components/form/input-number' },
  { name: 'Select', path: '/components/form/select' },
  { name: 'DatePicker', path: '/components/form/date-picker' },
  { name: 'Checkbox', path: '/components/form/checkbox' },
  { name: 'Switch', path: '/components/form/switch' },
  { name: 'Radio', path: '/components/form/radio' },
  { name: 'Upload', path: '/components/form/upload' },
  { name: 'FormItem', path: '/components/form/form-item' },
  { name: 'DynamicForm', path: '/components/form/dynamic-form' },
  { name: 'Pagination', path: '/components/data-display/pagination' },
  { name: 'Table', path: '/components/data-display/table' },
  { name: 'Tree', path: '/components/data-display/tree' },
  { name: 'Empty', path: '/components/data-display/empty' },
  { name: 'Skeleton', path: '/components/data-display/skeleton' },
  { name: 'Result', path: '/components/data-display/result' },
  { name: 'Tag', path: '/components/data-display/tag' },
  { name: 'Badge', path: '/components/data-display/badge' },
  { name: 'Descriptions', path: '/components/data-display/descriptions' },
  { name: 'Avatar', path: '/components/data-display/avatar' },
  { name: 'Statistic', path: '/components/data-display/statistic' },
  { name: 'Card', path: '/components/data-display/card' },
  { name: 'List', path: '/components/data-display/list' },
  { name: 'Alert', path: '/components/feedback/alert' },
  { name: 'Spin', path: '/components/feedback/spin' },
  { name: 'Progress', path: '/components/feedback/progress' },
  { name: 'Tooltip', path: '/components/feedback/tooltip' },
] as const;

interface BrowserHealth {
  errors: string[];
  activeRequests: Set<Request>;
  lastActivityAt: number;
}

function collectBrowserErrors(page: Page): BrowserHealth {
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

async function waitForBrowserQuiescence(
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

function componentTitlePattern(name: string): RegExp {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escapedName}$`);
}

async function hasRenderedDemo(page: Page): Promise<boolean> {
  return page.locator('.dumi-default-previewer').evaluateAll((previewers) =>
    previewers.some((previewer) => {
      const demo = previewer.querySelector('.dumi-default-previewer-demo');
      if (!demo || demo.hasAttribute('data-loading') || demo.hasAttribute('data-error'))
        return false;

      return Array.from(demo.querySelectorAll('*')).some((element) => {
        const box = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return (
          box.width > 0 &&
          box.height > 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden'
        );
      });
    }),
  );
}

async function expectNoRootHorizontalOverflow(page: Page, width: number): Promise<void> {
  const heights = new Map([
    [930, 720],
    [390, 844],
    [320, 740],
  ]);
  await page.setViewportSize({ width, height: heights.get(width) ?? 720 });
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const root = document.documentElement;
          return Math.max(
            root.scrollWidth - root.clientWidth,
            document.body.scrollWidth - root.clientWidth,
          );
        }),
      { message: `${width}px 视口下文档根节点发生横向溢出` },
    )
    .toBeLessThanOrEqual(0);
}

test('验收清单固定映射 32 个公开路由和 8 个窄屏重点页', () => {
  expect(browserComponentRoutes.map(({ name, path }) => ({ name, path }))).toEqual(
    expectedBrowserRouteIdentities,
  );
  expect(browserComponentRoutes).toHaveLength(expectedBrowserRouteIdentities.length);
  expect(browserComponentRoutes.filter((component) => component.checkNarrowOverflow)).toHaveLength(
    8,
  );
});

test('浏览器错误排空会捕获静默期前完成的延迟错误响应与失败请求', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.route('**/late-error-resource.txt', async (route) => {
    await new Promise<void>((resolve) => setTimeout(resolve, 1_200));
    await route.fulfill({ status: 404, contentType: 'text/plain', body: 'missing' });
  });
  await page.route('**/failed-resource.txt', (route) => route.abort());
  await page.goto('/');
  await page.evaluate(() => {
    void fetch('/late-error-resource.txt');
    void fetch('/failed-resource.txt').catch(() => undefined);
  });

  await expect
    .poll(() =>
      [...browserHealth.activeRequests].some((request) =>
        request.url().endsWith('/late-error-resource.txt'),
      ),
    )
    .toBe(true);
  await waitForBrowserQuiescence(page, browserHealth);

  expect(
    browserHealth.errors.some(
      (error) => error.startsWith('HTTP 404: ') && error.endsWith('/late-error-resource.txt'),
    ),
  ).toBe(true);
  expect(
    browserHealth.errors.some(
      (error) => error.startsWith('requestfailed: ') && error.includes('/failed-resource.txt'),
    ),
  ).toBe(true);
});

for (const component of browserComponentRoutes) {
  test(`${component.name}：页面标题、H1、真实 demo 与浏览器错误`, async ({ page }) => {
    const browserHealth = collectBrowserErrors(page);
    await page.goto(`${component.path}/`);

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(componentTitlePattern(component.expectedHeading));
    await expect(page).toHaveTitle(componentTitlePattern(component.expectedTitle));
    await expect
      .poll(() => hasRenderedDemo(page), {
        message: `${component.name} 页面没有加载出可见的 Dumi 运行示例`,
      })
      .toBe(true);

    if (component.checkNarrowOverflow) {
      for (const width of [930, 390, 320]) {
        await expectNoRootHorizontalOverflow(page, width);
      }
    }

    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  });
}
