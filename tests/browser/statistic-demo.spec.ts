import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const viewports = [
  { width: 1280, height: 720 },
  { width: 930, height: 720 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

const brandColors = ['海洋蓝', '活力橙', '翡翠绿', '智慧紫', '清透青', '品牌玫红'] as const;
const paletteColors = [
  '青瓷桂影',
  '暮桃微光',
  '石榴杏仁',
  '松针琥珀',
  '雾色燕麦',
  '豆沙墨色',
  '奶酪远青',
] as const;

async function openStatisticDemo(page: Page): Promise<Locator> {
  await page.goto('/components/data-display/statistic/');
  await expect(page.getByRole('heading', { name: 'Statistic 统计数值', level: 1 })).toBeVisible();

  const demo = page.getByTestId('statistic-demo');
  await expect(demo).toHaveCount(1);
  await expect(demo.getByRole('status')).toHaveText('本月指标');
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

async function expectMetricGroupFits(demo: Locator, title: string, value: string): Promise<void> {
  const primary = demo.getByTestId('statistic-demo-primary');
  const trend = demo.getByTestId('statistic-demo-trend');
  const titleBounds = await demo.getByText(title, { exact: true }).boundingBox();
  const valueBounds = await demo.getByText(value, { exact: true }).boundingBox();
  const trendBounds = await trend.boundingBox();
  const trendLabel = trend.getByTestId('statistic-demo-trend-text');
  const trendLabelBounds = await trendLabel.boundingBox();
  const labelBounds = await trend.getByText(/较上(?:月|季度)/).boundingBox();
  const sparklineBounds = await demo.getByTestId('statistic-demo-sparkline').boundingBox();
  const metricBounds = await primary.boundingBox();
  const metricGroupBounds = await demo.getByRole('group', { name: '经营指标' }).boundingBox();
  const secondaryBounds = await demo.getByTestId('statistic-demo-secondary').boundingBox();

  expect(titleBounds).not.toBeNull();
  expect(valueBounds).not.toBeNull();
  expect(trendBounds).not.toBeNull();
  expect(trendLabelBounds).not.toBeNull();
  expect(labelBounds).not.toBeNull();
  expect(sparklineBounds).not.toBeNull();
  expect(metricBounds).not.toBeNull();
  expect(metricGroupBounds).not.toBeNull();
  expect(secondaryBounds).not.toBeNull();

  for (const bounds of [titleBounds, valueBounds, trendBounds, labelBounds, sparklineBounds]) {
    if (!bounds || !metricBounds) throw new Error('指标布局缺少可测量的内容');
    expect(bounds.x).toBeGreaterThanOrEqual(metricBounds.x - 1);
    expect(bounds.y).toBeGreaterThanOrEqual(metricBounds.y - 1);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(metricBounds.x + metricBounds.width + 1);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(metricBounds.y + metricBounds.height + 1);
  }

  if (!labelBounds || !sparklineBounds || !valueBounds || !trendBounds) {
    throw new Error('指标布局缺少用于比较的边界');
  }
  const trendItemsOverlap =
    labelBounds.x < sparklineBounds.x + sparklineBounds.width &&
    labelBounds.x + labelBounds.width > sparklineBounds.x &&
    labelBounds.y < sparklineBounds.y + sparklineBounds.height &&
    labelBounds.y + labelBounds.height > sparklineBounds.y;
  const valueAndTrendOverlap =
    valueBounds.x < trendBounds.x + trendBounds.width &&
    valueBounds.x + valueBounds.width > trendBounds.x &&
    valueBounds.y < trendBounds.y + trendBounds.height &&
    valueBounds.y + valueBounds.height > trendBounds.y;

  expect(trendItemsOverlap).toBe(false);
  expect(valueAndTrendOverlap).toBe(false);

  if (await demo.evaluate(() => window.innerWidth <= 360)) {
    const prefixBounds = await demo.getByText('¥', { exact: true }).boundingBox();
    const secondaryValue = title.includes('本月') ? '1,829' : '5,291';
    const secondaryValueText = demo
      .getByTestId('statistic-demo-secondary')
      .getByText(secondaryValue, { exact: true });
    if (!prefixBounds || !valueBounds) throw new Error('窄屏金额缺少前缀或数值');
    expect(Math.abs(prefixBounds.y - valueBounds.y)).toBeLessThan(10);

    const valueLineCount = await demo.getByText(value, { exact: true }).evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return new Set(Array.from(range.getClientRects(), (rect) => Math.round(rect.top))).size;
    });
    expect(valueLineCount).toBe(1);
    await expect(demo.getByText(value, { exact: true })).toHaveCSS('font-size', '20px');
    await expect(secondaryValueText).toHaveCSS('font-size', '18px');
    const valueHierarchy = await Promise.all([
      demo
        .getByText(value, { exact: true })
        .evaluate((element) => Number.parseFloat(window.getComputedStyle(element).fontSize)),
      secondaryValueText.evaluate((element) =>
        Number.parseFloat(window.getComputedStyle(element).fontSize),
      ),
    ]);
    expect(valueHierarchy[0]).toBeGreaterThan(valueHierarchy[1]);

    const trendLineCount = await trend.getByText(/较上/).evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return new Set(Array.from(range.getClientRects(), (rect) => Math.round(rect.top))).size;
    });
    expect(trendLineCount).toBe(1);
    if (!trendLabelBounds || !sparklineBounds) throw new Error('窄屏趋势区缺少边界');
    const trendGap = sparklineBounds.y - trendLabelBounds.y - trendLabelBounds.height;
    expect(trendGap).toBeLessThanOrEqual(8);
    await expect(demo.getByTestId('statistic-demo-sparkline')).toHaveCSS('height', '24px');
  }

  if (!metricGroupBounds || !metricBounds || !secondaryBounds) {
    throw new Error('指标卡片缺少用于比较的边界');
  }
  for (const bounds of [metricBounds, secondaryBounds]) {
    expect(bounds.x).toBeGreaterThanOrEqual(metricGroupBounds.x - 1);
    expect(bounds.y).toBeGreaterThanOrEqual(metricGroupBounds.y - 1);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(
      metricGroupBounds.x + metricGroupBounds.width + 1,
    );
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(
      metricGroupBounds.y + metricGroupBounds.height + 1,
    );
  }
  const cardsOverlap =
    metricBounds.x < secondaryBounds.x + secondaryBounds.width &&
    metricBounds.x + metricBounds.width > secondaryBounds.x &&
    metricBounds.y < secondaryBounds.y + secondaryBounds.height &&
    metricBounds.y + metricBounds.height > secondaryBounds.y;
  expect(cardsOverlap).toBe(false);

  const metricWidth = await primary.evaluate((node) => ({
    client: node.clientWidth,
    scroll: node.scrollWidth,
  }));
  expect(metricWidth.scroll).toBeLessThanOrEqual(metricWidth.client);
}

function parseRgb(color: string): [number, number, number] {
  const channels = color
    .match(/[\d.]+/g)
    ?.slice(0, 3)
    .map(Number);
  if (!channels || channels.length !== 3) throw new Error(`无法读取计算后的颜色：${color}`);
  return [channels[0], channels[1], channels[2]];
}

function relativeLuminance(color: string): number {
  const channels = parseRgb(color).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

async function expectTrendContrast(demo: Locator): Promise<void> {
  const trendText = demo.getByTestId('statistic-demo-trend-text');
  const colors = await trendText.evaluate((element) => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--lx-color-success)';
    probe.style.backgroundColor = 'var(--lx-color-success-bg)';
    element.parentElement?.append(probe);
    const tokenForeground = window.getComputedStyle(probe).color;
    const tokenBackground = window.getComputedStyle(probe).backgroundColor;
    probe.remove();
    const actual = window.getComputedStyle(element);
    return {
      foreground: actual.color,
      background: actual.backgroundColor,
      tokenForeground,
      tokenBackground,
    };
  });
  expect(colors.foreground).toBe(colors.tokenForeground);
  expect(colors.background).toBe(colors.tokenBackground);
  const luminance = [
    relativeLuminance(colors.foreground),
    relativeLuminance(colors.background),
  ].sort((first, second) => second - first);
  const contrast = (luminance[0] + 0.05) / (luminance[1] + 0.05);
  expect(contrast, `趋势文字对比度为 ${contrast.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
}

async function chooseThemeOption(
  demo: Locator,
  name: '品牌色' | '东方配色',
  label: string,
  options: readonly string[],
  currentIndex: { value: number },
): Promise<string> {
  const index = options.indexOf(label);
  expect(index, `${name} 缺少选项“${label}”`).toBeGreaterThanOrEqual(0);
  const select = demo.getByRole('combobox', { name, exact: true });
  await select.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await select.press('Enter');
  await expect(select).toHaveAttribute('aria-expanded', 'true');
  const distance = Math.abs(index - currentIndex.value);
  const direction = index >= currentIndex.value ? 'ArrowDown' : 'ArrowUp';
  for (let step = 0; step < distance; step += 1) await select.press(direction);
  await select.press('Enter');
  await expect(select).toHaveAttribute('aria-expanded', 'false');
  await expectTrendContrast(demo);
  currentIndex.value = index;
  const tokenName = name === '品牌色' ? '--lx-color-primary' : '--lx-color-ambient';
  const token = await demo.evaluate(
    (element, property) => getComputedStyle(element).getPropertyValue(property).trim(),
    tokenName,
  );
  expect(token, `${label} 没有生成主题 token`).not.toBe('');
  return token;
}

async function setDarkMode(demo: Locator, dark: boolean): Promise<void> {
  const toggle = demo.getByRole('switch', { name: '暗色模式', exact: true });
  const checked = await toggle.getAttribute('aria-checked');
  if (checked !== String(dark)) await toggle.click();
  await expect(toggle).toHaveAttribute('aria-checked', String(dark));
}

async function expectReducedMotion(demo: Locator): Promise<void> {
  const activeAnimations = await demo.getByTestId('statistic-demo-primary').evaluate((root) =>
    [root, ...root.querySelectorAll<HTMLElement>('*')].flatMap((element) =>
      element.getAnimations().map((animation) => ({
        element: element.tagName.toLowerCase(),
        playState: animation.playState,
        duration: animation.effect?.getComputedTiming().duration,
      })),
    ),
  );
  expect(activeAnimations).toEqual([]);
}

test('Statistic 周期切换、宿主占位和窄屏趋势布局可用', async ({ page, browserName }) => {
  const browserHealth = collectBrowserErrors(page);
  const demo = await openStatisticDemo(page);
  const metrics = demo.getByRole('group', { name: '经营指标' });
  const periodButton = demo.getByRole('button', { name: '查看本季度', exact: true });
  const loadingButton = demo.getByRole('button', { name: '显示加载状态', exact: true });
  const status = demo.getByRole('status');

  await expect(metrics).toHaveAttribute('aria-busy', 'false');
  await expect(demo.getByText('本月采购净清算总额', { exact: true })).toBeVisible();
  await expect(demo.getByText('1,280,450.00', { exact: true })).toBeVisible();
  await expect(demo.getByText('本月采购订单', { exact: true })).toBeVisible();
  await expect(demo.getByText('1,829', { exact: true })).toBeVisible();
  await expect(demo.getByText('较上月 +14.8%', { exact: true })).toBeVisible();
  await expectTrendContrast(demo);
  await expect(demo.getByTestId('statistic-demo-sparkline')).toHaveAttribute(
    'aria-label',
    '近五个月净清算金额走势示意',
  );
  await expect(demo.getByTestId('statistic-demo-disclaimer')).toContainText('演示数据');
  await expectMetricGroupFits(demo, '本月采购净清算总额', '1,280,450.00');

  await periodButton.focus();
  await page.keyboard.press('Enter');
  await expect(demo.getByRole('button', { name: '查看本月', exact: true })).toBeFocused();
  await expect(demo.getByText('本季度采购净清算总额', { exact: true })).toBeVisible();
  await expect(demo.getByText('3,812,900.00', { exact: true })).toBeVisible();
  await expect(demo.getByText('本季度采购订单', { exact: true })).toBeVisible();
  await expect(demo.getByText('5,291', { exact: true })).toBeVisible();
  await expect(demo.getByText('较上季度 +9.2%', { exact: true })).toBeVisible();
  await expect(status).toHaveText('本季度指标');
  await expectMetricGroupFits(demo, '本季度采购净清算总额', '3,812,900.00');

  await loadingButton.focus();
  await page.keyboard.press('Enter');
  await expect(demo.getByRole('button', { name: '显示指标', exact: true })).toBeFocused();
  await expect(metrics).toHaveAttribute('aria-busy', 'true');
  await expect(status).toHaveText('指标加载中');
  await expect(demo.getByRole('status')).toHaveCount(1);
  await expect(metrics).toBeVisible();
  await expect(
    demo.getByTestId('statistic-demo-primary').getByText('1,280,450.00', { exact: true }),
  ).toHaveCount(0);
  await expect(demo.getByRole('button', { name: '查看本月', exact: true })).toBeVisible();

  await demo.getByRole('button', { name: '查看本月', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(demo.getByRole('button', { name: '查看本季度', exact: true })).toBeFocused();
  await expect(metrics).toHaveAttribute('aria-busy', 'true');
  await expect(status).toHaveText('指标加载中');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expectReducedMotion(demo);
  const showMetricsButton = demo.getByRole('button', { name: '显示指标', exact: true });
  await showMetricsButton.focus();
  await expect(showMetricsButton).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(metrics).toHaveAttribute('aria-busy', 'false');
  await expect(status).toHaveText('本月指标');
  await expect(demo.getByText('本月采购净清算总额', { exact: true })).toBeVisible();
  await expect(demo.getByText('1,280,450.00', { exact: true })).toBeVisible();
  await expect(demo.getByText('1,829', { exact: true })).toBeVisible();
  await expect(demo.getByText('较上月 +14.8%', { exact: true })).toBeVisible();

  const screenshotName = browserName === 'webkit' ? 'webkit' : 'chromium';
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `.codex/statistic-${screenshotName}-1280.png`, fullPage: true });

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await expectNoRootHorizontalOverflow(page, viewport.width);
    await expectMetricGroupFits(demo, '本月采购净清算总额', '1,280,450.00');
    if (viewport.width === 320) {
      await demo.screenshot({ path: `.codex/statistic-${screenshotName}-320.png` });
    }
    if (viewport.width === 390) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: `.codex/statistic-${screenshotName}-390.png`, fullPage: true });
    }
  }

  await demo.locator('details').getByText('主题设置', { exact: true }).click();
  await setDarkMode(demo, true);
  await demo.getByRole('switch', { name: '紧凑密度' }).click();
  await expect(demo.getByRole('switch', { name: '暗色模式' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expect(demo.getByRole('switch', { name: '紧凑密度' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await expectNoRootHorizontalOverflow(page, 320);
  await expectMetricGroupFits(demo, '本月采购净清算总额', '1,280,450.00');
  await expectTrendContrast(demo);

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors).toEqual([]);
});

test('Statistic 内置 loading 可以通过键盘进入和恢复', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/data-display/statistic/');
  const demo = page.getByTestId('statistic-loading-demo');
  await expect(demo).toBeVisible();
  const metric = demo.getByRole('group', { name: 'Statistic 内置加载示例' });
  const status = demo.getByRole('status');
  const loadingButton = demo.getByRole('button', { name: '显示加载状态', exact: true });

  await expect(metric).toHaveAttribute('aria-busy', 'false');
  await expect(demo.getByText('1,280,450.00', { exact: true })).toBeVisible();
  await loadingButton.focus();
  await page.keyboard.press('Enter');
  await expect(demo.getByRole('button', { name: '显示指标', exact: true })).toBeFocused();
  await expect(metric).toHaveAttribute('aria-busy', 'true');
  await expect(status).toHaveText('指标加载中');

  await page.keyboard.press('Enter');
  await expect(loadingButton).toBeFocused();
  await expect(metric).toHaveAttribute('aria-busy', 'false');
  await expect(status).toHaveText('指标已加载，数据为演示值');
  await expect(demo.getByText('1,280,450.00', { exact: true })).toBeVisible();

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Statistic 参数表在窄屏可聚焦并用方向键横向浏览', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/data-display/statistic/');
  const region = page.getByRole('region', { name: 'Statistic 参数表' });
  await expect(region).toBeVisible();
  await page.setViewportSize({ width: 320, height: 740 });
  await region.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  const firstHeader = region.locator('thead th').first();
  const firstCell = region.locator('tbody tr').first().locator('td').first();
  await expect(firstHeader).toHaveCSS('position', 'sticky');
  await expect(firstCell).toHaveCSS('position', 'sticky');
  const geometry = await region.evaluate((element) => {
    const table = element.querySelector('table');
    if (!table) throw new Error('Statistic 参数区域没有参数表格');
    return {
      regionWidth: element.clientWidth,
      contentWidth: element.scrollWidth,
      tableWidth: table.getBoundingClientRect().width,
    };
  });
  expect(geometry.contentWidth).toBeGreaterThan(geometry.regionWidth);
  expect(geometry.tableWidth).toBeGreaterThan(geometry.regionWidth);

  await region.focus();
  await expect(region).toBeFocused();
  for (let step = 0; step < 8; step += 1) await page.keyboard.press('ArrowRight');
  await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  const stickyColumnOffset = await Promise.all([
    region.boundingBox(),
    firstCell.boundingBox(),
  ]).then(([regionBounds, cellBounds]) => {
    if (!regionBounds || !cellBounds) throw new Error('无法读取参数表固定列位置');
    return cellBounds.x - regionBounds.x;
  });
  expect(stickyColumnOffset).toBeGreaterThanOrEqual(0);
  expect(stickyColumnOffset).toBeLessThanOrEqual(4);
  await expect(firstCell).toBeVisible();
  await expect(firstCell).toContainText('title');
  for (let step = 0; step < 8; step += 1) await page.keyboard.press('ArrowLeft');
  await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBe(0);
  await region.evaluate((element) => element.setAttribute('dir', 'rtl'));
  // RTL 横移使用负向 scrollLeft，避免依赖浏览器对方向键默认行为的差异。
  await region.evaluate((element) => element.scrollBy({ left: -80 }));
  await expect
    .poll(() => region.evaluate((element) => Math.abs(element.scrollLeft)))
    .toBeGreaterThan(0);
  const rtlStickyOffset = await Promise.all([region.boundingBox(), firstCell.boundingBox()]).then(
    ([regionBounds, cellBounds]) => {
      if (!regionBounds || !cellBounds) throw new Error('无法读取 RTL 参数表固定列位置');
      return regionBounds.x + regionBounds.width - (cellBounds.x + cellBounds.width);
    },
  );
  expect(rtlStickyOffset).toBeGreaterThanOrEqual(0);
  expect(rtlStickyOffset).toBeLessThanOrEqual(4);
  await expect(firstCell).toHaveCSS('border-inline-end-width', '1px');
  await region.evaluate((element) => element.removeAttribute('dir'));
  await expectNoRootHorizontalOverflow(page, 320);

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Statistic 趋势配色在浅深色品牌色和东方配色下满足文字对比度', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  const demo = await openStatisticDemo(page);
  await demo.locator('details').getByText('主题设置', { exact: true }).click();
  await demo.getByText('轻盈', { exact: true }).click();
  await expect(demo.getByRole('radio', { name: '轻盈', exact: true })).toBeChecked();

  const brandIndex = { value: 0 };
  const paletteIndex = { value: 0 };
  const paletteOptions = ['使用品牌色', ...paletteColors];
  for (const dark of [false, true]) {
    await setDarkMode(demo, dark);
    await expectTrendContrast(demo);
    let previousBrandToken = '';
    for (const label of brandColors) {
      const token = await chooseThemeOption(demo, '品牌色', label, brandColors, brandIndex);
      if (previousBrandToken)
        expect(token, `${label} 没有更新品牌主色`).not.toBe(previousBrandToken);
      previousBrandToken = token;
      paletteIndex.value = 0;
    }
    let previousPaletteToken = previousBrandToken;
    for (const label of paletteColors) {
      const token = await chooseThemeOption(demo, '东方配色', label, paletteOptions, paletteIndex);
      expect(token, `${label} 没有更新东方配色`).not.toBe(previousPaletteToken);
      previousPaletteToken = token;
    }
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});
