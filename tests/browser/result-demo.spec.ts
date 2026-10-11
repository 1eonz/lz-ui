import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const viewports = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
  { width: 930, height: 720 },
  { width: 1280, height: 720 },
] as const;

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

async function expectResultArtworkFitsDemo(page: Page): Promise<void> {
  const demo = page.getByTestId('result-demo');
  const artwork = demo.locator('[data-lx-result-illustration]');
  await expect(artwork).toBeVisible();
  const fitsContent = await artwork.evaluate((wrapper) => {
    const demoSurface = wrapper.closest<HTMLElement>('[data-testid="result-demo"]');
    if (!demoSurface) throw new Error('Result 插画不在演示内容区内');
    const svg = wrapper.querySelector('svg');
    if (!svg) throw new Error('Result 状态插画缺少 SVG');
    const wrapperBounds = wrapper.getBoundingClientRect();
    const svgBounds = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    // AntD 5 的内置例外插画未声明 viewBox，使用根 SVG 的固有宽高作为画布比例。
    const viewBoxWidth = viewBox.width || Number.parseFloat(svg.getAttribute('width') ?? '');
    const viewBoxHeight = viewBox.height || Number.parseFloat(svg.getAttribute('height') ?? '');
    const demoBounds = demoSurface.getBoundingClientRect();
    const demoStyle = getComputedStyle(demoSurface);
    const contentStart = demoBounds.left + Number.parseFloat(demoStyle.paddingInlineStart);
    const contentEnd = demoBounds.right - Number.parseFloat(demoStyle.paddingInlineEnd);
    const expectedZoom = Math.min(1, wrapperBounds.width / 254);
    const viewBoxRatio = viewBoxWidth / viewBoxHeight;
    const renderedRatio = svgBounds.width / svgBounds.height;
    const zoom = Number.parseFloat(getComputedStyle(svg).zoom);
    return {
      wrapperFitsContent:
        wrapperBounds.left >= contentStart - 1 && wrapperBounds.right <= contentEnd + 1,
      svgFitsWrapper:
        svgBounds.left >= wrapperBounds.left - 1 && svgBounds.right <= wrapperBounds.right + 1,
      svgFitsContent: svgBounds.left >= contentStart - 1 && svgBounds.right <= contentEnd + 1,
      viewBoxRatio,
      renderedRatio,
      relativeRatioError: Math.abs(renderedRatio - viewBoxRatio) / viewBoxRatio,
      wrapperSvgHeightGap: wrapperBounds.height - svgBounds.height,
      zoom,
      expectedZoom,
      scaledWidthError: Math.abs(svgBounds.width - viewBoxWidth * zoom),
      scaledHeightError: Math.abs(svgBounds.height - viewBoxHeight * zoom),
      centerOffset: Math.abs(
        svgBounds.left + svgBounds.width / 2 - (wrapperBounds.left + wrapperBounds.width / 2),
      ),
    };
  });
  expect(fitsContent.wrapperFitsContent).toBe(true);
  expect(fitsContent.svgFitsWrapper).toBe(true);
  expect(fitsContent.svgFitsContent).toBe(true);
  expect(fitsContent.viewBoxRatio).toBeGreaterThan(0);
  expect(fitsContent.renderedRatio).toBeGreaterThan(0);
  expect(fitsContent.relativeRatioError).toBeLessThanOrEqual(0.03);
  expect(fitsContent.wrapperSvgHeightGap).toBeLessThanOrEqual(1);
  expect(fitsContent.zoom).toBeGreaterThan(0);
  expect(fitsContent.zoom).toBeLessThanOrEqual(1);
  expect(Math.abs(fitsContent.zoom - fitsContent.expectedZoom)).toBeLessThanOrEqual(0.01);
  expect(fitsContent.scaledWidthError).toBeLessThanOrEqual(1);
  expect(fitsContent.scaledHeightError).toBeLessThanOrEqual(1);
  if ((await page.evaluate(() => innerWidth)) === viewports[0].width) {
    expect(fitsContent.zoom).toBeLessThan(1);
  }
  expect(fitsContent.centerOffset).toBeLessThanOrEqual(1);
}

async function expectNoReceiptDetails(demo: Locator): Promise<void> {
  await expect(demo.getByText(/TRX-202410-0982/)).toHaveCount(0);
  await expect(demo.getByText(/¥ 1,280,000\.00/)).toHaveCount(0);
  await expect(demo.getByText(/凭证已保存/)).toHaveCount(0);
}

async function getStatusOptionBounds(demo: Locator) {
  return demo.locator('.lx-result-demo-status-option').evaluateAll((options) =>
    options.map((option) => {
      const bounds = option.getBoundingClientRect();
      return { width: bounds.width, height: bounds.height };
    }),
  );
}

test('Result 文档的失败恢复和权限边界可通过公开控件操作', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/data-display/result/');
  await expect(page.getByRole('heading', { name: 'Result 结果反馈', level: 1 })).toBeVisible();
  await page.setViewportSize(viewports[0]);
  await expectNoRootHorizontalOverflow(page, viewports[0].width);

  const demo = page.getByTestId('result-demo');
  const initialDemoHeight = await demo.evaluate(
    (element) => element.getBoundingClientRect().height,
  );
  const desktopOptionBounds = await getStatusOptionBounds(demo);
  expect(desktopOptionBounds).toHaveLength(7);
  expect(desktopOptionBounds.every(({ height }) => height < 44)).toBe(true);
  const status = demo.getByRole('status');
  await demo.getByRole('radio', { name: '失败', exact: true }).click();
  await expect(status).toHaveText('付款凭证提交失败');
  await demo.getByRole('button', { name: '重试提交', exact: true }).click();
  await expect(status).toContainText('采购付款凭证提交成功');

  await demo.getByRole('radio', { name: '500', exact: true }).click();
  await expect(status).toHaveText('采购服务暂时不可用');
  await expectResultArtworkFitsDemo(page);
  await demo.getByRole('button', { name: '重试提交', exact: true }).click();
  await expect(status).toContainText('采购付款凭证提交成功');

  await page.setViewportSize(viewports[3]);
  await demo.getByRole('radio', { name: '403', exact: true }).click();
  await expectResultArtworkFitsDemo(page);
  await expectNoRootHorizontalOverflow(page, viewports[3].width);

  await page.setViewportSize(viewports[0]);
  await demo.getByRole('radio', { name: '403', exact: true }).click();
  await expectNoRootHorizontalOverflow(page, viewports[0].width);
  await expectResultArtworkFitsDemo(page);
  await expectNoReceiptDetails(demo);
  await demo.getByRole('button', { name: '返回采购列表', exact: true }).click();
  await expect(demo.getByText(/采购列表 · 当前没有可访问的采购记录/)).toBeVisible();
  await expectNoReceiptDetails(demo);
  await expectNoRootHorizontalOverflow(page, viewports[0].width);
  await demo.getByRole('button', { name: '查看处理说明', exact: true }).click();
  await expect(demo.getByText(/请联系权限管理员申请角色/)).toBeVisible();
  await expectNoReceiptDetails(demo);
  await expectNoRootHorizontalOverflow(page, viewports[0].width);

  await demo.getByRole('radio', { name: '404', exact: true }).click();
  await expectNoRootHorizontalOverflow(page, viewports[0].width);
  await expectResultArtworkFitsDemo(page);
  await expectNoReceiptDetails(demo);
  await demo.getByRole('button', { name: '返回采购列表', exact: true }).click();
  await expect(demo.getByText(/采购列表 · 当前没有可访问的采购记录/)).toBeVisible();
  await expectNoReceiptDetails(demo);
  await demo.getByRole('button', { name: '查看处理说明', exact: true }).click();
  await expect(demo.getByText(/当前编号不存在/)).toBeVisible();
  await expectNoReceiptDetails(demo);
  await expectNoRootHorizontalOverflow(page, viewports[0].width);
  await demo.getByRole('radio', { name: '成功', exact: true }).click();
  await expect(status).toHaveText('采购付款凭证提交成功');
  await expect
    .poll(() => demo.evaluate((element) => element.getBoundingClientRect().height))
    .toBe(initialDemoHeight);

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await expectNoRootHorizontalOverflow(page, viewport.width);
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Result 状态单选项在粗指针触控上下文中至少为 44×44', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  try {
    await page.goto('/components/data-display/result/');
    await expect(page.getByRole('heading', { name: 'Result 结果反馈', level: 1 })).toBeVisible();
    expect(await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches)).toBe(true);

    const bounds = await getStatusOptionBounds(page.getByTestId('result-demo'));
    expect(bounds).toHaveLength(7);
    expect(bounds.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
  } finally {
    await context.close();
  }
});

test('Result API 表在窄屏和中屏支持完整类型与键盘横向滚动', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/data-display/result/');
  await expect(page.getByRole('heading', { name: 'Result 结果反馈', level: 1 })).toBeVisible();
  const tableRegion = page.getByRole('region', { name: 'Result 常用属性参数表' });
  await expect(tableRegion).toHaveAttribute('tabindex', '0');
  await expect(tableRegion).toHaveAttribute('aria-describedby', 'result-docs-table-hint');
  await expect(page.getByText('表格可横向滚动；聚焦表格区域后按左右方向键浏览。')).toBeVisible();

  const statusRow = tableRegion.getByRole('row').filter({ hasText: 'status' }).first();
  const typeCell = statusRow.getByRole('cell').nth(1);
  const defaultCell = statusRow.getByRole('cell').nth(2);
  await expect(typeCell).toContainText("ResultProps['status']");
  await expect(defaultCell).toContainText('info');

  for (const cell of [typeCell, defaultCell]) {
    const codeGeometry = await cell.locator('code').evaluate((code) => {
      const range = code.ownerDocument.createRange();
      range.selectNodeContents(code);
      const rects = [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0);
      const tableCell = code.closest('td');
      if (!tableCell) throw new Error('Result API 单元格不在表格数据行内');
      const cellBounds = tableCell.getBoundingClientRect();
      const cellStyle = getComputedStyle(tableCell);
      const contentStart = cellBounds.left + Number.parseFloat(cellStyle.paddingLeft);
      const contentEnd = cellBounds.right - Number.parseFloat(cellStyle.paddingRight);
      return {
        lineCount: rects.length,
        insideCell: rects.every(
          (rect) => rect.left >= contentStart - 1 && rect.right <= contentEnd + 1,
        ),
      };
    });
    expect(codeGeometry.lineCount).toBe(1);
    expect(codeGeometry.insideCell).toBe(true);
  }

  for (const viewport of viewports.slice(0, 3)) {
    await page.setViewportSize(viewport);
    await expectNoRootHorizontalOverflow(page, viewport.width);
    await expect
      .poll(() => tableRegion.evaluate((region) => region.scrollWidth - region.clientWidth))
      .toBeGreaterThan(0);
    await tableRegion.focus();
    await expect(tableRegion).toBeFocused();
    for (let step = 0; step < 8; step += 1) await page.keyboard.press('ArrowRight');
    await expect.poll(() => tableRegion.evaluate((region) => region.scrollLeft)).toBeGreaterThan(0);
    for (let step = 0; step < 8; step += 1) await page.keyboard.press('ArrowLeft');
    await expect.poll(() => tableRegion.evaluate((region) => region.scrollLeft)).toBe(0);
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});
