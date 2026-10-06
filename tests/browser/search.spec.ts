import { expect, test, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const searchName = '输入关键字搜索...';
const targetResultName = /^Table 表格 展示带列定义的数据，业务请求、权限和缓存由宿主处理。/;
const searchShortcut = process.platform === 'darwin' ? 'Meta+k' : 'Control+k';

async function expectNoRootHorizontalOverflow(page: Page): Promise<void> {
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
}

test('320px 与 390px 搜索入口可见，展开结果不造成页面横向溢出', async ({ page }, testInfo) => {
  const browserHealth = collectBrowserErrors(page);
  const searchInput = page.getByRole('textbox', { name: searchName });

  for (const viewport of [
    { width: 320, height: 740 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/components/form/input/');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', '搜索');

    const inputBox = await searchInput.boundingBox();
    expect(inputBox).not.toBeNull();
    expect(inputBox!.width).toBe(96);
    expect(inputBox!.x).toBeGreaterThanOrEqual(0);
    expect(inputBox!.x + inputBox!.width).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({
      path: testInfo.outputPath(`search-collapsed-${viewport.width}.png`),
      fullPage: false,
    });

    await page.keyboard.press(searchShortcut);
    await expect(searchInput).toBeFocused();
    await searchInput.fill('Table');
    const results = page.getByRole('region', { name: '搜索结果' });
    await expect(results).toBeVisible();
    await expect(results.getByRole('link', { name: targetResultName })).toBeVisible();
    const expandedInputBox = await searchInput.boundingBox();
    expect(expandedInputBox).not.toBeNull();
    expect(expandedInputBox!.x).toBeGreaterThanOrEqual(0);
    expect(expandedInputBox!.x + expandedInputBox!.width).toBeLessThanOrEqual(viewport.width);
    await expectNoRootHorizontalOverflow(page);
    await page.screenshot({
      path: testInfo.outputPath(`search-${viewport.width}.png`),
      fullPage: false,
    });
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('长结果列表在常见和矮视口中最多露出四项并可滚动', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  const searchInput = page.getByRole('textbox', { name: searchName });
  const viewports = [
    { width: 320, height: 740 },
    { width: 390, height: 844 },
    { width: 390, height: 450 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/components/form/input/');
    await searchInput.fill('button');

    const results = page.locator('.dumi-default-search-result > dl > dd > a');
    const scroller = page.locator('.dumi-default-search-popover > section');
    await expect(results.first()).toBeVisible();
    await expect.poll(() => results.count()).toBeGreaterThanOrEqual(20);
    await expect(scroller).toBeVisible();

    const initialMetrics = await scroller.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const items = [...element.querySelectorAll('.dumi-default-search-result > dl > dd > a')];
      const visibleCount = items.filter((item) => {
        const itemBounds = item.getBoundingClientRect();
        return (
          itemBounds.height > 0 && itemBounds.bottom > bounds.top && itemBounds.top < bounds.bottom
        );
      }).length;

      return {
        top: bounds.top,
        bottom: bounds.bottom,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        visibleCount,
      };
    });

    expect(initialMetrics.top).toBeGreaterThanOrEqual(0);
    expect(initialMetrics.bottom).toBeLessThanOrEqual(viewport.height);
    expect(initialMetrics.visibleCount).toBeGreaterThanOrEqual(3);
    expect(initialMetrics.visibleCount).toBeLessThanOrEqual(4);
    expect(initialMetrics.scrollHeight).toBeGreaterThan(initialMetrics.clientHeight);

    await results.last().scrollIntoViewIfNeeded();
    await expect.poll(() => scroller.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
    await expect
      .poll(() =>
        results.last().evaluate((item) => {
          const itemBounds = item.getBoundingClientRect();
          const scrollerBounds = item
            .closest('.dumi-default-search-popover > section')
            ?.getBoundingClientRect();
          return Boolean(
            scrollerBounds &&
            itemBounds.bottom > scrollerBounds.top &&
            itemBounds.top < scrollerBounds.bottom,
          );
        }),
      )
      .toBe(true);
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('搜索快捷键与 Escape 在窄屏展开和收起搜索，关闭后保留查询且检查搜索焦点', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  const searchInput = page.getByRole('textbox', { name: searchName });
  const results = page.getByRole('region', { name: '搜索结果' });

  for (const viewport of [
    { width: 320, height: 740 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/components/form/input/');
    await expect(searchInput).toBeVisible();
    await page.keyboard.press(searchShortcut);
    await expect(searchInput).toBeFocused();

    await searchInput.fill('Table');
    await expect(results).toBeVisible();
    await expect(results.getByRole('link', { name: targetResultName })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(results).toBeHidden();
    await expect(searchInput).toHaveValue('Table');
    await expect(searchInput, `${viewport.width}px 下 Escape 后焦点应留在搜索框`).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(results).toBeHidden();
    await expect(
      searchInput,
      `${viewport.width}px 下第二次 Escape 应允许离开搜索框`,
    ).not.toBeFocused();

    await page.keyboard.press(searchShortcut);
    await expect(searchInput).toBeFocused();
    await expect(searchInput).toHaveValue('Table');
    await expect(results).toBeVisible();
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('方向键浏览移动搜索结果，Enter 导航后不把焦点送回旧搜索框', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/components/form/input/');

  const searchInput = page.getByRole('textbox', { name: searchName });
  await expect(searchInput).toBeVisible();
  await page.keyboard.press(searchShortcut);
  await expect(searchInput).toBeFocused();
  await searchInput.fill('Table');

  const results = page.getByRole('region', { name: '搜索结果' });
  const targetResult = results.getByRole('link', { name: targetResultName });
  await expect(targetResult).toBeVisible();
  await searchInput.press('ArrowDown');
  await expect(results.getByRole('status')).toContainText('第 1 个搜索结果');

  await searchInput.press('Enter');
  await expect(page).toHaveURL(/\/components\/data-display\/table\/?$/);
  await expect(page.getByRole('heading', { name: 'Table 表格', level: 1 })).toBeVisible();
  await expect(searchInput).not.toBeFocused();

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});
