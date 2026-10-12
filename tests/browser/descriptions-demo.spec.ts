import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const viewports = [
  { width: 1280, height: 720 },
  { width: 930, height: 720 },
  { width: 576, height: 720 },
  { width: 575, height: 720 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
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

async function getCellGeometry(text: Locator) {
  return text.evaluate((element) => {
    const cell = element.closest('th, td');
    const table = cell?.closest('table');
    if (!cell || !table) throw new Error('Descriptions 字段未处于可访问表格单元格中');
    const slotBounds = element.getBoundingClientRect();
    const cellBounds = cell.getBoundingClientRect();
    const tableBounds = table.getBoundingClientRect();
    return {
      left: slotBounds.left,
      right: slotBounds.right,
      top: slotBounds.top,
      bottom: slotBounds.bottom,
      width: slotBounds.width,
      cellWidth: cellBounds.width,
      tableWidth: tableBounds.width,
      background: getComputedStyle(element).backgroundColor,
      ambientBackground: (() => {
        const probe = element.ownerDocument.createElement('span');
        probe.style.position = 'absolute';
        probe.style.visibility = 'hidden';
        probe.style.backgroundColor = 'var(--lx-color-ambient)';
        element.append(probe);
        const background = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return background;
      })(),
      borders: [
        getComputedStyle(element).borderTopWidth,
        getComputedStyle(element).borderRightWidth,
        getComputedStyle(element).borderBottomWidth,
        getComputedStyle(element).borderLeftWidth,
      ],
      cellBorders: [
        getComputedStyle(cell).borderTopWidth,
        getComputedStyle(cell).borderRightWidth,
        getComputedStyle(cell).borderBottomWidth,
        getComputedStyle(cell).borderLeftWidth,
      ],
    };
  });
}

async function expectStackedFullWidthFields(
  demo: Locator,
  labelText: string,
  valueText: string,
): Promise<void> {
  const labelHeader = demo.getByRole('columnheader', { name: labelText });
  const valueCell = demo.getByRole('cell', { name: valueText, exact: true });
  await expect(labelHeader).toHaveCount(1);
  await expect(valueCell).toHaveCount(1);

  const label = await getCellGeometry(demo.getByText(labelText, { exact: true }));
  const value = await getCellGeometry(demo.getByText(valueText, { exact: true }));
  expect(await labelHeader.evaluate((element) => element.closest('th, td')?.tagName)).toBe('TH');
  expect(await valueCell.evaluate((element) => element.closest('th, td')?.tagName)).toBe('TD');
  expect(label.bottom).toBeLessThanOrEqual(value.top + 1);
  expect(label.cellWidth / label.tableWidth).toBeGreaterThanOrEqual(0.9);
  expect(value.cellWidth / value.tableWidth).toBeGreaterThanOrEqual(0.9);
  expect(label.width / label.cellWidth).toBeGreaterThanOrEqual(0.9);
  expect(value.width / value.cellWidth).toBeGreaterThanOrEqual(0.9);
  expect(label.width).toBeGreaterThanOrEqual(190);
  expect(value.width).toBeGreaterThanOrEqual(190);
  expect(
    [...label.cellBorders, ...value.cellBorders].every((width) => Number.parseFloat(width) === 0),
  ).toBe(true);
}

test('Descriptions 基础合同字段保持无边框分区与桌面 4:8 宽度', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/data-display/descriptions/');

  const demo = page.getByTestId('descriptions-basic-demo');
  await expect(demo.getByText('战略合作框架协议核心履约项', { exact: true })).toBeVisible();
  for (const label of [
    '协议系统全局 UID',
    '签约主体机构',
    '结算条款与 SLA 级别',
    '履约保证金账户状态',
    '首席法务审计签名状态',
  ]) {
    await expect(demo.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(demo.getByText('CTR-2024-GLOBAL-09941', { exact: true })).toBeVisible();
  await expect(demo.getByText('深蓝智造工业互联科技有限公司', { exact: true })).toBeVisible();
  await expect(demo.getByText('NET 60 天月结 · Tier-1 战略合作方', { exact: true })).toBeVisible();
  await expect(demo.getByText('¥ 5,000,000.00（足额质押）', { exact: true })).toBeVisible();
  await expect(demo.getByText('周铭轩 · CA 数字证书已验签', { exact: true })).toBeVisible();
  for (const name of [
    /协议系统全局 UID.*CTR-2024-GLOBAL-09941/,
    /签约主体机构.*深蓝智造工业互联科技有限公司/,
    /结算条款与 SLA 级别.*NET 60 天月结 · Tier-1 战略合作方/,
    /履约保证金账户状态.*¥ 5,000,000\.00（足额质押）/,
    /首席法务审计签名状态.*周铭轩 · CA 数字证书已验签/,
  ]) {
    const cell = demo.getByRole('cell', { name });
    await expect(cell).toHaveCount(1);
    await expect(cell).toBeVisible();
  }

  const label = demo.getByText('协议系统全局 UID', { exact: true });
  const value = demo.getByText('CTR-2024-GLOBAL-09941', { exact: true });
  const [labelGeometry, contentGeometry] = await Promise.all([
    getCellGeometry(label),
    getCellGeometry(value),
  ]);
  const ratio = labelGeometry.width / (labelGeometry.width + contentGeometry.width);
  expect(labelGeometry.width).toBeGreaterThan(0);
  expect(contentGeometry.width).toBeGreaterThan(0);
  expect(Math.abs(ratio - 1 / 3)).toBeLessThanOrEqual(0.04);
  expect(labelGeometry.background).toBe(labelGeometry.ambientBackground);
  expect(contentGeometry.background).toBe('rgba(0, 0, 0, 0)');
  expect(labelGeometry.background).not.toBe(contentGeometry.background);
  expect(
    [...labelGeometry.borders, ...contentGeometry.borders].every(
      (width) => Number.parseFloat(width) === 0,
    ),
  ).toBe(true);
  expect(
    [...labelGeometry.cellBorders, ...contentGeometry.cellBorders].every(
      (width) => Number.parseFloat(width) === 0,
    ),
  ).toBe(true);

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await expectNoRootHorizontalOverflow(page, viewport.width);
    if (viewport.width <= 575) {
      await expectStackedFullWidthFields(demo, '协议系统全局 UID', 'CTR-2024-GLOBAL-09941');
      await expectStackedFullWidthFields(
        demo,
        '首席法务审计签名状态',
        '周铭轩 · CA 数字证书已验签',
      );
    } else if (viewport.width === 576) {
      const labelAtBreakpoint = await getCellGeometry(
        demo.getByText('协议系统全局 UID', { exact: true }),
      );
      const valueAtBreakpoint = await getCellGeometry(
        demo.getByText('CTR-2024-GLOBAL-09941', { exact: true }),
      );
      expect(labelAtBreakpoint.right).toBeLessThanOrEqual(valueAtBreakpoint.left + 1);
    }
  }

  const themeSettings = demo.getByText('主题设置', { exact: true });
  const details = themeSettings.locator('xpath=..');
  if ((await details.getAttribute('open')) === null) await themeSettings.click();
  const darkSwitch = demo.getByRole('switch', { name: '暗色模式', exact: true });
  const compactSwitch = demo.getByRole('switch', { name: '紧凑密度', exact: true });
  if (!(await darkSwitch.isChecked())) await darkSwitch.click();
  if (!(await compactSwitch.isChecked())) await compactSwitch.click();
  const themeRoot = page.locator('[data-lx-mode]').filter({ has: demo });
  await expect(themeRoot).toHaveAttribute('data-lx-mode', 'dark');
  await expect(themeRoot).toHaveAttribute('data-lx-density', 'compact');
  const darkLabelGeometry = await getCellGeometry(
    demo.getByText('协议系统全局 UID', { exact: true }),
  );
  expect(darkLabelGeometry.background).toBe(darkLabelGeometry.ambientBackground);
  await expect(demo.getByText('NET 60 天月结 · Tier-1 战略合作方', { exact: true })).toBeVisible();
  await expectNoRootHorizontalOverflow(page, 320);

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Descriptions 完整合同说明在窄屏换行并可恢复摘要', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/data-display/descriptions/');

  const demo = page.getByTestId('descriptions-long-demo');
  const toggle = demo.getByRole('button', { name: '显示完整合同说明', exact: true });
  await expect(toggle).toBeVisible();
  await expect(
    demo.getByText('设备采购、安装调试与售后维护框架协议；摘要内容可展开查看。', { exact: true }),
  ).toBeVisible();

  await toggle.click();
  const collapse = demo.getByRole('button', { name: '恢复摘要', exact: true });
  await expect(collapse).toBeVisible();
  const fullDescription =
    '本协议涵盖华东、华南与华北区域的智能制造设备采购、安装调试及售后维护。供应商须在接到服务请求后四小时内响应，并在一个工作日内提交包含责任人、预计完成日期及验收依据的整改记录。每季度由双方复核服务等级、故障响应时限和备件库存；未经采购方书面同意，不得转包核心维护工作。合同附件、验收记录与主协议具有同等效力，争议处理依照双方签署的补充条款执行。';
  const fullText = demo.getByText(fullDescription, { exact: true });
  await expect(fullText).toBeVisible();

  await page.setViewportSize({ width: 320, height: 740 });
  await expectNoRootHorizontalOverflow(page, 320);
  await expectStackedFullWidthFields(demo, '合同履约说明', fullDescription);
  await fullText.scrollIntoViewIfNeeded();
  const wrapping = await fullText.evaluate((element) => {
    const range = element.ownerDocument.createRange();
    range.selectNodeContents(element);
    const rects = [...range.getClientRects()].filter((rect) => rect.width > 0 && rect.height > 0);
    const demoBounds = element.closest('[data-testid]')?.getBoundingClientRect();
    return {
      lineCount: rects.length,
      withinDemo: Boolean(
        demoBounds &&
        rects.every(
          (rect) => rect.left >= demoBounds.left - 1 && rect.right <= demoBounds.right + 1,
        ),
      ),
    };
  });
  expect(wrapping.lineCount).toBeGreaterThan(1);
  expect(wrapping.withinDemo).toBe(true);
  const descriptionValue = await getCellGeometry(fullText);
  expect(descriptionValue.cellWidth / descriptionValue.tableWidth).toBeGreaterThanOrEqual(0.9);
  expect(descriptionValue.width / descriptionValue.cellWidth).toBeGreaterThanOrEqual(0.9);
  expect(descriptionValue.width).toBeGreaterThanOrEqual(190);
  await collapse.click();
  await expect(demo.getByRole('button', { name: '显示完整合同说明', exact: true })).toBeVisible();
  await expect(fullText).toHaveCount(0);
  await expect(
    demo.getByText('设备采购、安装调试与售后维护框架协议；摘要内容可展开查看。', { exact: true }),
  ).toBeVisible();

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await expectNoRootHorizontalOverflow(page, viewport.width);
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Descriptions API 参数表在窄屏可聚焦横向浏览且属性标识符保持单行', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/data-display/descriptions/');
  await expect(
    page.getByRole('heading', { name: 'Descriptions 描述列表', level: 1 }),
  ).toBeVisible();

  const tableRegion = page.getByRole('region', { name: 'Descriptions 参数表', exact: true });
  const tableHint = page.getByText(/窄屏下可左右滑动参数表/);
  await expect(tableRegion).toBeVisible();
  await expect(tableRegion).toHaveAttribute('tabindex', '0');
  await expect(tableHint).toBeVisible();

  for (const propertyName of [
    'items',
    'title / extra',
    'column',
    'bordered',
    'layout',
    'size',
    'colon',
  ]) {
    const propertyCode = tableRegion.locator('td:first-child code').getByText(propertyName, {
      exact: true,
    });
    await expect(propertyCode).toHaveCount(1);
    await expect(propertyCode).toHaveCSS('white-space', 'nowrap');
    const identifierLineCount = await propertyCode.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getClientRects().length;
    });
    expect(identifierLineCount, `${propertyName} 应保持单行`).toBe(1);
  }

  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 740 });
    await expectNoRootHorizontalOverflow(page, width);

    const metrics = await tableRegion.evaluate((region) => {
      const table = region.querySelector('table');
      if (!table) throw new Error('未找到 Descriptions API 参数表');
      return {
        regionWidth: region.clientWidth,
        regionScrollWidth: region.scrollWidth,
        tableWidth: table.scrollWidth,
      };
    });
    expect(metrics.regionScrollWidth).toBeGreaterThan(metrics.regionWidth);
    expect(metrics.tableWidth).toBeGreaterThan(metrics.regionWidth);

    await tableRegion.focus();
    await tableRegion.evaluate((region) => {
      region.scrollLeft = 0;
    });
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => tableRegion.evaluate((region) => region.scrollLeft)).toBeGreaterThan(0);
    const rightScroll = await tableRegion.evaluate((region) => region.scrollLeft);
    await page.keyboard.press('ArrowLeft');
    await expect
      .poll(() => tableRegion.evaluate((region) => region.scrollLeft))
      .toBeLessThan(rightScroll);
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});
