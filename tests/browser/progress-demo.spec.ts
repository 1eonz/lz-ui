import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

async function getProgressDemo(page: Page, accessibleName: string): Promise<Locator> {
  const progress = page.getByRole('progressbar', { name: accessibleName, exact: true });
  const demo = page.locator('.dumi-default-previewer').filter({ has: progress });
  await expect(demo).toHaveCount(1);
  return demo;
}

async function finishBrowserCheck(
  page: Page,
  browserHealth: ReturnType<typeof collectBrowserErrors>,
): Promise<void> {
  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
}

test('Progress 的线形、圆形、仪表盘与分步 demo 暴露任务名称和总进度', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/progress');
  await expect(page.getByRole('heading', { name: 'Progress', exact: true })).toBeVisible();

  const basicDemo = await getProgressDemo(page, '客户导入');
  const basicValues = [30, 62.5, 70, 100, 45];
  const basicBars = basicDemo.getByRole('progressbar');
  await expect(basicBars).toHaveCount(basicValues.length);
  for (let index = 0; index < basicValues.length; index += 1) {
    const progress = basicBars.nth(index);
    await expect(progress).toHaveAttribute('aria-valuemin', '0');
    await expect(progress).toHaveAttribute('aria-valuemax', '100');
    await expect(progress).toHaveAttribute('aria-valuenow', String(basicValues[index]));
  }

  const shapesDemo = await getProgressDemo(page, '附件导入');
  const shapeValues = [62.5, 80, 100, 62.5];
  const shapeBars = shapesDemo.getByRole('progressbar');
  await expect(shapeBars).toHaveCount(shapeValues.length);
  for (let index = 0; index < shapeValues.length; index += 1) {
    await expect(shapeBars.nth(index)).toHaveAttribute('aria-valuenow', String(shapeValues[index]));
  }

  await finishBrowserCheck(page, browserHealth);
});

test('Progress 受控更新可用键盘完成，失败后保留进度并可恢复', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/progress');
  const demo = await getProgressDemo(page, '受控客户导入');
  const progress = demo.getByRole('progressbar', { name: '受控客户导入', exact: true });
  const increase = demo.getByRole('button', { name: '增加', exact: true });
  const decrease = demo.getByRole('button', { name: '减少', exact: true });
  const status = demo.getByRole('status');

  await expect(progress).toHaveAttribute('aria-valuenow', '62.5');
  await increase.focus();
  await page.keyboard.press('Enter');
  await expect(progress).toHaveAttribute('aria-valuenow', '75');

  await demo.getByRole('button', { name: '模拟失败', exact: true }).click();
  await expect(status).toHaveText('导入失败，已完成比例保留，可恢复。');
  await expect(progress).toHaveAttribute('aria-valuenow', '75');
  await expect(increase).toBeDisabled();

  await demo.getByRole('button', { name: '恢复导入', exact: true }).click();
  await expect(status).toHaveText('客户导入进行中');
  await expect(progress).toHaveAttribute('aria-valuenow', '75');
  await decrease.focus();
  await page.keyboard.press('Space');
  await expect(progress).toHaveAttribute('aria-valuenow', '62.5');

  await finishBrowserCheck(page, browserHealth);
});

test('Progress 将非有限和越界数值规范到可访问的 0–100 范围', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/progress');
  const demo = await getProgressDemo(page, '受控客户导入');
  const normalizedProgress = demo.getByRole('progressbar', { name: '规范后的进度', exact: true });

  for (const [label, expected] of [
    ['-10', '0'],
    ['62.5', '62.5'],
    ['120', '100'],
    ['NaN', '0'],
    ['Infinity', '0'],
  ]) {
    const radio = demo.getByRole('radio', { name: label, exact: true });
    await expect(radio).toHaveCount(1);
    await demo.getByText(label, { exact: true }).click();
    await expect(radio).toBeChecked();
    await expect(normalizedProgress).toHaveAttribute('aria-valuenow', expected);
  }

  await finishBrowserCheck(page, browserHealth);
});

test('Progress 在深色紧凑主题及 reduced-motion 下仍可辨认和操作', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/feedback/progress');
  const demo = await getProgressDemo(page, '客户导入');
  const settings = demo.getByText('主题设置', { exact: true });
  await settings.click();
  await demo.getByRole('switch', { name: '暗色模式', exact: true }).click();
  await demo.getByRole('switch', { name: '紧凑密度', exact: true }).click();
  await demo.getByText('玻璃', { exact: true }).click();

  const themedRoot = demo.locator('[data-lx-mode="dark"][data-lx-density="compact"]');
  await expect(themedRoot).toHaveCount(1);
  await expect(themedRoot).toHaveAttribute('data-lx-appearance', 'glass');
  await expect
    .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true);

  const motion = await demo.getByRole('progressbar').evaluateAll((roots) => {
    const violations: string[] = [];
    for (const root of roots) {
      const elements = [root, ...root.querySelectorAll('*')];
      for (const element of elements) {
        for (const pseudo of [null, '::before', '::after'] as const) {
          const style = getComputedStyle(element, pseudo);
          if (
            style.animationName !== 'none' ||
            style.animationDuration
              .split(',')
              .some((duration) => Number.parseFloat(duration) > 0) ||
            style.transitionDuration.split(',').some((duration) => Number.parseFloat(duration) > 0)
          ) {
            violations.push(`${element.tagName}${pseudo ?? ''}`);
          }
        }
      }
    }
    return violations;
  });
  expect(motion).toEqual([]);

  const activeProgress = await getProgressDemo(page, '受控客户导入');
  const increase = activeProgress.getByRole('button', { name: '增加', exact: true });
  await increase.click();
  await expect(
    activeProgress.getByRole('progressbar', { name: '受控客户导入', exact: true }),
  ).toHaveAttribute('aria-valuenow', '75');
  await finishBrowserCheck(page, browserHealth);
});

test('Progress 页面在 320、390、930 和 1280px 视口没有根横向溢出', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/progress');

  await page.setViewportSize({ width: 390, height: 844 });
  const apiTable = page.getByRole('region', { name: 'Progress 常用属性参数表', exact: true });
  await expect(apiTable).toHaveAttribute('tabindex', '0');
  await expect(apiTable).toHaveAttribute('aria-describedby', 'progress-docs-table-hint');
  const tableDimensions = await apiTable.locator('table').evaluate((table) => ({
    height: table.getBoundingClientRect().height,
    clientWidth: table.parentElement!.clientWidth,
    scrollWidth: table.parentElement!.scrollWidth,
  }));
  expect(tableDimensions.scrollWidth).toBeGreaterThan(tableDimensions.clientWidth);
  expect(tableDimensions.height).toBeLessThan(2200);

  await expect(apiTable.getByText('已废弃', { exact: true })).toBeVisible();
  for (const identifier of ['successPercent', 'aria-label', 'aria-labelledby', 'rootClassName']) {
    const propertyLines = await apiTable
      .getByText(identifier, { exact: true })
      .evaluate((element) => {
        const range = element.ownerDocument.createRange();
        range.selectNodeContents(element);
        return [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0)
          .length;
      });
    expect(propertyLines, `${identifier} should stay on one line`).toBe(1);
  }

  const propertyCell = apiTable
    .getByRole('row')
    .filter({ hasText: 'successPercent' })
    .getByRole('cell')
    .first();
  await apiTable.evaluate((element) => {
    element.scrollLeft = 0;
  });
  await apiTable.focus();
  await page.keyboard.press('ArrowRight');
  await expect
    .poll(() => apiTable.evaluate((element) => element.scrollLeft))
    .toBeGreaterThanOrEqual(30);
  const stickyGeometry = await propertyCell.evaluate((cell) => {
    const region = cell.closest('.lx-docs-table')!;
    return {
      cellLeft: cell.getBoundingClientRect().left,
      regionLeft: region.getBoundingClientRect().left,
    };
  });
  expect(Math.abs(stickyGeometry.cellLeft - stickyGeometry.regionLeft)).toBeLessThanOrEqual(1);
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => apiTable.evaluate((element) => element.scrollLeft)).toBe(0);

  await page.setViewportSize({ width: 320, height: 844 });
  await apiTable.evaluate((element) => {
    element.scrollLeft = 0;
  });
  const narrowPropertyWidth = await propertyCell.evaluate((cell) =>
    Math.round(cell.getBoundingClientRect().width),
  );
  expect(narrowPropertyWidth).toBe(144);
  const narrowIdentifierLines = await apiTable
    .getByText('aria-labelledby', { exact: true })
    .evaluate((element) => {
      const range = element.ownerDocument.createRange();
      range.selectNodeContents(element);
      return [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0).length;
    });
  expect(narrowIdentifierLines).toBe(1);

  for (const width of [320, 390, 930, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await expect
      .poll(() =>
        page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
        })),
      )
      .toEqual({ viewport: width, document: width, body: width });
  }

  await finishBrowserCheck(page, browserHealth);
});
