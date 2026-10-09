import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const tableRoute = '/components/data-display/table/';
const dynamicFormRoute = '/components/form/dynamic-form/';

async function createTouchPage(
  browser: Browser,
): Promise<{ page: Page; close: () => Promise<void> }> {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    screen: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  return { page, close: () => context.close() };
}

async function expectTouchSimulation(page: Page): Promise<void> {
  const evidence = await page.evaluate(() => ({
    maxTouchPoints: navigator.maxTouchPoints,
    coarsePointer: window.matchMedia('(any-pointer: coarse)').matches,
  }));
  test.info().annotations.push({
    type: 'touch-emulation',
    description: `Playwright hasTouch=true；maxTouchPoints=${evidence.maxTouchPoints}；coarsePointer=${evidence.coarsePointer}`,
  });
  test.skip(evidence.maxTouchPoints <= 0, '当前浏览器运行时没有暴露触控点，无法验证触控仿真。');
  expect(evidence.coarsePointer).toBe(true);
}

async function tapWithTouchscreen(page: Page, locator: Locator): Promise<void> {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box || box.width <= 0 || box.height <= 0) {
    throw new Error('触控目标没有可测量的可见边界');
  }
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
}

async function expectNoRootHorizontalOverflow(page: Page, width: 390 | 320): Promise<void> {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 740 });
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
      { message: `${width}px 触控仿真视口下文档根节点发生横向溢出`, timeout: 5_000 },
    )
    .toBeLessThanOrEqual(0);
}

test.describe('Playwright hasTouch 触控仿真 smoke', () => {
  test('Table 详情可用 tap 打开、触控屏幕关闭并恢复焦点', async ({ browser }) => {
    const { page, close } = await createTouchPage(browser);
    const browserHealth = collectBrowserErrors(page);
    try {
      await page.goto(tableRoute);
      await expectTouchSimulation(page);

      const tableRegion = page.getByRole('region', { name: '采购订单表格', exact: true });
      const row = tableRegion.getByRole('row').filter({ hasText: 'PO-2024-1881' });
      const openButton = row.getByRole('button', { name: '查看 PO-2024-1881 详情' });
      await expect(openButton).toBeVisible();
      await openButton.tap();

      const detail = page.getByRole('region', { name: '采购订单 PO-2024-1881 详情' });
      await expect(detail).toBeVisible();
      await expect(detail.getByRole('heading', { level: 4 })).toBeFocused();
      const detailPanelId = await detail.getAttribute('id');
      expect(detailPanelId).toBeTruthy();
      const closeButton = detail.getByRole('button', { name: '关闭订单详情' });
      await tapWithTouchscreen(page, closeButton);
      await expect(page.locator(`[id="${detailPanelId}"]`)).toHaveAttribute('hidden');
      await expect(openButton).toBeFocused();

      await expectNoRootHorizontalOverflow(page, 390);
      await expectNoRootHorizontalOverflow(page, 320);
      await waitForBrowserQuiescence(page, browserHealth);
      expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
    } finally {
      await close();
    }
  });

  test('DynamicForm 触控可展开选项、触发条件字段并重置表单', async ({ browser }) => {
    const { page, close } = await createTouchPage(browser);
    const browserHealth = collectBrowserErrors(page);
    try {
      await page.goto(dynamicFormRoute);
      await expectTouchSimulation(page);

      const summary = page.locator('summary').filter({ hasText: '显示选项' });
      const details = summary.locator('xpath=..');
      const frame = summary.locator('xpath=ancestor::*[@data-lx-mode][1]');
      await summary.tap();
      await expect(details).toHaveAttribute('open', '');

      const customerLevel = frame.getByRole('combobox', { name: /客户等级/ });
      await frame.getByText('普通客户', { exact: true }).tap();
      await expect(customerLevel).toHaveAttribute('aria-expanded', 'true');
      await page.getByText('重点客户', { exact: true }).tap();
      const owner = frame.getByRole('textbox', { name: /专属负责人/ });
      await expect(owner).toBeVisible();
      await frame.getByRole('button', { name: '重置', exact: true }).tap();
      await expect(owner).toBeHidden();
      await expect(frame.getByText('普通客户', { exact: true })).toBeVisible();

      await expectNoRootHorizontalOverflow(page, 390);
      await expectNoRootHorizontalOverflow(page, 320);
      await waitForBrowserQuiescence(page, browserHealth);
      expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
    } finally {
      await close();
    }
  });
});
