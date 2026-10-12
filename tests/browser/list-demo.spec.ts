import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const initialStatus = '已显示 3 条流水记录，剩余 18 条';
const loadedStatus = '已显示 6 条流水记录，剩余 15 条';
const viewports = [
  { width: 1280, height: 720 },
  { width: 930, height: 720 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;
const transactionIds = Array.from(
  { length: 21 },
  (_, index) => `TRX-202610-${String(982 + index).padStart(4, '0')}`,
);
const statusColorTokens = {
  已入账: 'success',
  外汇审核: 'error',
  内部结转: 'primary',
  待复核: 'warning',
  已支付: 'success',
  海关待核: 'warning',
} as const;

async function openListDemo(page: Page): Promise<Locator> {
  await page.goto('/components/data-display/list/');
  await expect(page.getByRole('heading', { name: 'List 列表', level: 1 })).toBeVisible();

  const demo = page.getByTestId('list-demo');
  await expect(demo).toHaveCount(1);
  await expect(demo.getByRole('status')).toHaveText(initialStatus);
  return demo;
}

async function expectNoRootHorizontalOverflow(page: Page, width: number): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(() =>
        Math.max(
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
          document.body.scrollWidth - document.documentElement.clientWidth,
        ),
      ),
    )
    .toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.clientWidth)).toBe(width);
}

async function expectReducedMotion(root: Locator): Promise<void> {
  const violations = await root.evaluate((element) =>
    [element, ...element.querySelectorAll<HTMLElement>('*')]
      .map((node) => {
        const style = window.getComputedStyle(node);
        const numbers = (value: string) =>
          value.split(',').map((part) => Number.parseFloat(part) || 0);
        const animationNames = style.animationName.split(',').map((name) => name.trim());
        const animationDurations = numbers(style.animationDuration);
        const animationDelays = numbers(style.animationDelay);
        const transitionDurations = numbers(style.transitionDuration);
        const transitionDelays = numbers(style.transitionDelay);
        return {
          element: `${node.tagName.toLowerCase()}[aria-busy=${node.getAttribute('aria-busy')}]`,
          animationNames,
          animationDurations,
          animationDelays,
          transitionDurations,
          transitionDelays,
          valid:
            animationNames.every((name) => name === 'none') &&
            animationDurations.every((duration) => duration === 0) &&
            animationDelays.every((delay) => delay === 0) &&
            transitionDurations.every((duration) => duration === 0) &&
            transitionDelays.every((delay) => delay === 0),
        };
      })
      .filter((entry) => !entry.valid)
      .slice(0, 20),
  );
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
}

async function readStatusColorMatches(tags: Locator): Promise<boolean[]> {
  return tags.evaluateAll((elements, tokenByStatus) => {
    return elements.map((tag) => {
      const status = tag.textContent?.trim() ?? '';
      const token = tokenByStatus[status as keyof typeof tokenByStatus];
      if (!token) return false;

      const probe = document.createElement('span');
      probe.style.color = `var(--lx-color-${token})`;
      probe.style.backgroundColor = `var(--lx-color-${token}-bg)`;
      probe.style.display = 'none';
      tag.parentElement?.append(probe);
      const expected = getComputedStyle(probe);
      const expectedColor = expected.color;
      const expectedBackgroundColor = expected.backgroundColor;
      probe.remove();
      const actual = getComputedStyle(tag);
      return actual.color === expectedColor && actual.backgroundColor === expectedBackgroundColor;
    });
  }, statusColorTokens);
}

async function expectMobileLedgerFinancialLayout(records: Locator): Promise<void> {
  const measurements = await records.evaluateAll((items) =>
    items.map((item) => {
      const identity = item.querySelector<HTMLElement>('[data-testid="list-demo-identity"]');
      const title = item.querySelector<HTMLElement>('[data-testid="list-demo-title"]');
      const financial = item.querySelector<HTMLElement>('[data-testid="list-demo-financial"]');
      const amount = item.querySelector<HTMLElement>('[data-testid="list-demo-amount"]');
      const date = item.querySelector<HTMLElement>('[data-testid="list-demo-date"]');
      if (!identity || !title || !financial || !amount || !date) return null;

      const readBounds = (element: Element) => {
        const { left, top, right, bottom } = element.getBoundingClientRect();
        return { left, top, right, bottom };
      };

      return {
        item: readBounds(item),
        identity: readBounds(identity),
        title: readBounds(title),
        financial: readBounds(financial),
        amount: readBounds(amount),
        date: readBounds(date),
      };
    }),
  );

  expect(measurements).toHaveLength(21);
  for (const measurement of measurements) {
    if (!measurement) throw new Error('资金流水项缺少用于布局验收的元素');

    expect(Math.abs(measurement.financial.left - measurement.title.left)).toBeLessThanOrEqual(1);
    expect(measurement.financial.top).toBeGreaterThanOrEqual(measurement.identity.bottom - 1);
    for (const bounds of [
      measurement.identity,
      measurement.title,
      measurement.financial,
      measurement.amount,
      measurement.date,
    ]) {
      expect(bounds.left).toBeGreaterThanOrEqual(measurement.item.left);
      expect(bounds.right).toBeLessThanOrEqual(measurement.item.right);
    }

    const amountAndDateOverlap =
      measurement.amount.left < measurement.date.right &&
      measurement.amount.right > measurement.date.left &&
      measurement.amount.top < measurement.date.bottom &&
      measurement.amount.bottom > measurement.date.top;
    expect(amountAndDateOverlap).toBe(false);
  }
}

test('List 加载更多追加流水并更新已显示和剩余数量', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  const demo = await openListDemo(page);
  const status = demo.getByRole('status');
  const records = demo.getByTestId('list-demo-transaction');
  const statusTags = demo.getByTestId('list-demo-status');
  const readTransactionIds = () =>
    records.evaluateAll((items) => items.map((item) => item.getAttribute('data-transaction-id')));
  const iconDimensions = await records.evaluateAll((items) =>
    items.map((item) => {
      const icon = item.querySelector<HTMLElement>('[aria-hidden="true"]');
      if (!icon) return null;
      const { width, height } = icon.getBoundingClientRect();
      return {
        width,
        height,
        borderRadius: getComputedStyle(icon).borderRadius,
      };
    }),
  );
  const loadMore = demo.getByRole('button', {
    name: '加载更多交易流水记录（剩余 18 条）',
    exact: true,
  });

  await expect(records).toHaveCount(3);
  expect(await records.nth(0).ariaSnapshot()).toContain('收入');
  expect(await records.nth(1).ariaSnapshot()).toContain('支出');
  expect(await records.nth(2).ariaSnapshot()).toContain('转账');
  expect(iconDimensions).toEqual(
    Array.from({ length: 3 }, () => ({ width: 40, height: 40, borderRadius: '50%' })),
  );
  expect(await readTransactionIds()).toEqual(transactionIds.slice(0, 3));
  await expect(statusTags).toHaveText(['已入账', '外汇审核', '内部结转']);
  expect(await readStatusColorMatches(statusTags)).toEqual([true, true, true]);
  await expect(loadMore).toBeVisible();
  const buttonWidths = await loadMore.evaluate((button) => ({
    button: button.getBoundingClientRect().width,
    container: button.parentElement?.getBoundingClientRect().width ?? 0,
  }));
  expect(buttonWidths.button).toBe(buttonWidths.container);
  await loadMore.focus();
  await page.keyboard.press('Enter');
  await expect(status).toHaveText(loadedStatus);
  await expect(records).toHaveCount(6);
  expect(await readTransactionIds()).toEqual(transactionIds.slice(0, 6));
  await expect(statusTags).toHaveText([
    '已入账',
    '外汇审核',
    '内部结转',
    '已入账',
    '待复核',
    '内部结转',
  ]);
  expect(await readStatusColorMatches(statusTags)).toEqual([true, true, true, true, true, true]);
  const nextBatchButton = demo.getByRole('button', {
    name: '加载更多交易流水记录（剩余 15 条）',
    exact: true,
  });
  await expect(nextBatchButton).toBeVisible();
  await expect(nextBatchButton).toBeFocused();

  for (let loadedCount = 6; loadedCount < 21; loadedCount += 3) {
    const remainingCount = 21 - loadedCount;
    const batchButton = demo.getByRole('button', {
      name: `加载更多交易流水记录（剩余 ${remainingCount} 条）`,
      exact: true,
    });
    if (remainingCount === 3 || loadedCount === 6) {
      await batchButton.focus();
      await page.keyboard.press('Enter');
      if (loadedCount === 6) {
        await demo.getByRole('heading', { name: '企业资金流水', exact: true }).focus();
      }
    } else {
      await batchButton.click();
    }
    await expect(status).toHaveText(
      `已显示 ${loadedCount + 3} 条流水记录，剩余 ${remainingCount - 3} 条`,
    );
    expect(await readTransactionIds()).toEqual(transactionIds.slice(0, loadedCount + 3));
    if (loadedCount === 6) {
      await expect(demo.getByRole('heading', { name: '企业资金流水', exact: true })).toBeFocused();
    }
  }
  await expect(records).toHaveCount(21);
  await expect(statusTags).toHaveCount(21);
  const actualStatuses = Array.from(
    new Set((await statusTags.allTextContents()).map((status) => status.trim())),
  ).sort();
  expect(actualStatuses).toEqual(Object.keys(statusColorTokens).sort());
  expect(await readStatusColorMatches(statusTags)).toEqual(Array.from({ length: 21 }, () => true));
  const completionStatus = demo.getByTestId('list-demo-complete');
  await expect(completionStatus).toHaveText('已展示全部交易流水记录');
  await expect(completionStatus).toHaveAttribute('tabindex', '-1');
  await expect(completionStatus).toBeFocused();

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    await page.setViewportSize(viewport);
    await expectNoRootHorizontalOverflow(page, viewport.width);
    await expectMobileLedgerFinancialLayout(records);
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('List 状态演示的加载、重试与空态恢复保持计数和焦点', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const demo = await openListDemo(page);
  const status = demo.getByRole('status');
  const showContent = demo.getByRole('button', { name: '显示内容', exact: true });
  const stateSummary = demo.getByText('状态演示', { exact: true });
  const stateDisclosure = stateSummary.locator('xpath=..');

  await expect(stateDisclosure).not.toHaveAttribute('open', '');
  await expect(demo.getByRole('button', { name: '显示加载', exact: true })).toHaveCount(0);
  await stateSummary.click();
  await expect(showContent).toBeVisible();

  await demo.getByRole('button', { name: '显示加载', exact: true }).click();
  await expect(status).toContainText('加载中');
  const loadingSurface = demo.locator('[aria-busy="true"]').filter({
    has: page.getByRole('listitem'),
  });
  await expect(loadingSurface).toHaveCount(1);
  await expect(loadingSurface).toBeVisible();
  await expectReducedMotion(loadingSurface);
  await showContent.click();
  await expect(status).toHaveText(initialStatus);

  await demo.getByRole('button', { name: '模拟失败', exact: true }).click();
  await expect(status).toContainText(/失败|错误/);
  await demo.getByRole('button', { name: '重试', exact: true }).click();
  await expect(status).toHaveText(initialStatus);
  await expect(showContent).toBeFocused();

  await demo.getByRole('button', { name: /清空(事务|流水)/ }).click();
  await expect(demo.getByRole('listitem')).toHaveCount(0);
  const restoreButtons = demo.getByRole('button', { name: /恢复(事务|流水)/ });
  await expect(restoreButtons).toHaveCount(2);
  await restoreButtons.last().click();
  await expect(status).toHaveText(initialStatus);
  await expect(demo.getByRole('listitem')).toHaveCount(3);
  await expect(showContent).toBeFocused();

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('List API 参数表在主题和不同视口下可访问并能键盘滚动', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  const demo = await openListDemo(page);
  const themeSettings = demo.getByText('主题设置', { exact: true });
  const details = themeSettings.locator('xpath=..');
  if ((await details.getAttribute('open')) === null) await themeSettings.click();

  const darkSwitch = demo.getByRole('switch', { name: '暗色模式', exact: true });
  const compactSwitch = demo.getByRole('switch', { name: '紧凑密度', exact: true });
  if (!(await darkSwitch.isChecked())) await darkSwitch.click();
  if (!(await compactSwitch.isChecked())) await compactSwitch.click();
  const themeRoot = demo.locator('xpath=ancestor-or-self::*[@data-lx-mode][1]');
  await expect(themeRoot).toHaveAttribute('data-lx-mode', 'dark');
  await expect(themeRoot).toHaveAttribute('data-lx-density', 'compact');

  const apiRegion = page.getByRole('region', { name: 'List 参数表', exact: true });
  await expect(apiRegion).toHaveCount(1);
  await expect(apiRegion).toHaveAttribute('tabindex', '0');
  const describedBy = await apiRegion.getAttribute('aria-describedby');
  expect(describedBy?.trim()).toBeTruthy();
  const descriptions = await apiRegion.evaluate((region) =>
    (region.getAttribute('aria-describedby') ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? ''),
  );
  expect(descriptions.length).toBeGreaterThan(0);
  expect(descriptions.every((description) => description.length > 0)).toBe(true);
  await expect(apiRegion.getByRole('table')).toHaveCount(1);

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await expectNoRootHorizontalOverflow(page, viewport.width);
    await expect(apiRegion).toBeVisible();
  }

  await page.setViewportSize({ width: 320, height: 740 });
  const tableWidth = await apiRegion.getByRole('table').evaluate((table) => ({
    clientWidth: table.parentElement?.clientWidth ?? 0,
    scrollWidth: table.scrollWidth,
  }));
  expect(tableWidth.scrollWidth).toBeGreaterThan(tableWidth.clientWidth);
  await apiRegion.focus();
  await expect(apiRegion).toBeFocused();
  await apiRegion.evaluate((region) => {
    region.scrollLeft = 0;
  });
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => apiRegion.evaluate((region) => region.scrollLeft)).toBeGreaterThan(0);
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => apiRegion.evaluate((region) => region.scrollLeft)).toBe(0);

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});
