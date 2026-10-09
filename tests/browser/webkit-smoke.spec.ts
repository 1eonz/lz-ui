import { expect, test, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const tableRoute = '/components/data-display/table/';
const dynamicFormRoute = '/components/form/dynamic-form/';
const smokeViewports = [
  { width: 930, height: 720 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

async function expectNoRootHorizontalOverflow(
  page: Page,
  viewport: (typeof smokeViewports)[number],
): Promise<void> {
  await page.setViewportSize(viewport);
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
      { message: `WebKit ${viewport.width}px 视口下文档根节点发生横向溢出`, timeout: 5_000 },
    )
    .toBeLessThanOrEqual(0);
}

test.describe('WebKit 桌面组件 smoke', () => {
  test('Table 公开详情角色路径和窄屏根溢出可回归', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'webkit', '该 smoke 只在 Playwright WebKit project 执行。');
    const browserHealth = collectBrowserErrors(page);

    await page.goto(tableRoute);
    await expect(page.getByRole('heading', { name: 'Table 表格', level: 1 })).toBeVisible();
    const tableRegion = page.getByRole('region', { name: '采购订单表格', exact: true });
    const row = tableRegion.getByRole('row').filter({ hasText: 'PO-2024-1881' });
    const openButton = row.getByRole('button', { name: '查看 PO-2024-1881 详情' });
    await openButton.click();
    const detail = page.getByRole('region', { name: '采购订单 PO-2024-1881 详情' });
    await expect(detail).toBeVisible();
    await expect(detail.getByRole('heading', { level: 4 })).toBeFocused();
    const detailPanelId = await detail.getAttribute('id');
    expect(detailPanelId).toBeTruthy();
    await detail.getByRole('button', { name: '关闭订单详情' }).click();
    await expect(page.locator(`[id="${detailPanelId}"]`)).toHaveAttribute('hidden');

    for (const viewport of smokeViewports) {
      await expectNoRootHorizontalOverflow(page, viewport);
    }
    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  });

  test('DynamicForm 公开 label 路径和窄屏根溢出可回归', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'webkit', '该 smoke 只在 Playwright WebKit project 执行。');
    const browserHealth = collectBrowserErrors(page);

    await page.goto(dynamicFormRoute);
    await expect(
      page.getByRole('heading', { name: 'DynamicForm 动态表单', level: 1 }),
    ).toBeVisible();
    const summary = page.locator('summary').filter({ hasText: '显示选项' });
    const details = summary.locator('xpath=..');
    const frame = summary.locator('xpath=ancestor::*[@data-lx-mode][1]');
    await summary.click();
    await expect(details).toHaveAttribute('open', '');
    await frame.getByRole('combobox', { name: '主题', exact: true }).selectOption('dark');
    await expect(frame).toHaveAttribute('data-lx-mode', 'dark');
    const customerName = frame.getByRole('textbox', { name: /客户名称/ });
    await customerName.fill('WebKit smoke');
    await frame.getByRole('button', { name: '重置', exact: true }).click();
    await expect(customerName).toHaveValue('');

    for (const viewport of smokeViewports) {
      await expectNoRootHorizontalOverflow(page, viewport);
    }
    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  });
});
