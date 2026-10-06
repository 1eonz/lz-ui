import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

type Axis = 'x' | 'y';
type ScrollEdge = 'start' | 'middle' | 'end' | 'keep';

interface ScrollportEvidence {
  tagName: string;
  overflow: string;
  scrollLeft: number;
  scrollTop: number;
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

async function inspectTableScrollport(
  content: Locator,
  axis: Axis,
  edge: ScrollEdge = 'keep',
): Promise<ScrollportEvidence> {
  return content.evaluate(
    (element, options) => {
      const { axis, edge } = options;
      const overflowKey = axis === 'x' ? 'overflowX' : 'overflowY';
      const scrollKey = axis === 'x' ? 'scrollWidth' : 'scrollHeight';
      const clientKey = axis === 'x' ? 'clientWidth' : 'clientHeight';
      let scrollport: HTMLElement | null = null;
      const ancestors: Array<Record<string, number | string>> = [];

      // 从真实单元格向外查找有几何滚动范围的祖先，不绑定 AntD 类名或层级。
      for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
        const style = window.getComputedStyle(ancestor);
        const overflow = style[overflowKey];
        ancestors.push({
          tagName: ancestor.tagName.toLowerCase(),
          overflowX: style.overflowX,
          overflowY: style.overflowY,
          scrollWidth: ancestor.scrollWidth,
          scrollHeight: ancestor.scrollHeight,
          clientWidth: ancestor.clientWidth,
          clientHeight: ancestor.clientHeight,
        });
        if (
          (overflow === 'auto' ||
            overflow === 'scroll' ||
            (axis === 'y' && overflow === 'hidden')) &&
          ancestor[scrollKey] > ancestor[clientKey] + 1
        ) {
          scrollport = ancestor;
          break;
        }
      }

      if (!scrollport)
        throw new Error(`未找到可滚动的 ${axis} 轴容器：${JSON.stringify(ancestors)}`);
      if (edge !== 'keep') {
        if (axis === 'x') {
          scrollport.scrollLeft =
            edge === 'start'
              ? 0
              : edge === 'end'
                ? scrollport.scrollWidth
                : Math.round((scrollport.scrollWidth - scrollport.clientWidth) / 2);
        } else {
          scrollport.scrollTop =
            edge === 'start'
              ? 0
              : edge === 'end'
                ? scrollport.scrollHeight
                : Math.round((scrollport.scrollHeight - scrollport.clientHeight) / 2);
        }
      }

      const rect = scrollport.getBoundingClientRect();
      const left = rect.left + scrollport.clientLeft;
      const top = rect.top + scrollport.clientTop;
      return {
        tagName: scrollport.tagName.toLowerCase(),
        overflow: window.getComputedStyle(scrollport)[overflowKey],
        scrollLeft: scrollport.scrollLeft,
        scrollTop: scrollport.scrollTop,
        scrollWidth: scrollport.scrollWidth,
        scrollHeight: scrollport.scrollHeight,
        clientWidth: scrollport.clientWidth,
        clientHeight: scrollport.clientHeight,
        left,
        right: left + scrollport.clientWidth,
        top,
        bottom: top + scrollport.clientHeight,
      };
    },
    { axis, edge },
  );
}

async function readBounds(element: Locator): Promise<Bounds> {
  return element.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
  });
}

async function expectNoDocumentOverflow(page: Page): Promise<void> {
  // viewport 调整与响应式布局可能跨多个渲染帧生效；等待浏览器提交新布局后再检查，持续溢出仍会超时失败。
  await expect
    .poll(() =>
      page.evaluate(() => {
        const root = document.documentElement;
        return Math.max(root.scrollWidth, document.body.scrollWidth) - root.clientWidth;
      }),
    )
    .toBeLessThanOrEqual(1);
}

async function readFixedCellBounds(demo: Locator, orderId: string) {
  const row = demo.getByRole('row').filter({ hasText: orderId });
  const cells = row.getByRole('cell');
  return {
    selection: await readBounds(cells.nth(0)),
    orderId: await readBounds(cells.nth(1)),
    action: await readBounds(cells.last()),
  };
}

async function fixedEdgesArePinnedAtMiddle(demo: Locator, idCell: Locator, orderId: string) {
  const middle = await inspectTableScrollport(idCell, 'x', 'middle');
  const cells = await readFixedCellBounds(demo, orderId);
  return (
    Math.abs(cells.selection.left - middle.left) <= 2 &&
    Math.abs(cells.action.right - middle.right) <= 2
  );
}

function expectFixedEdges(
  port: ScrollportEvidence,
  cells: Awaited<ReturnType<typeof readFixedCellBounds>>,
): void {
  expect(Math.abs(cells.selection.left - port.left)).toBeLessThanOrEqual(2);
  expect(Math.abs(cells.orderId.left - cells.selection.right)).toBeLessThanOrEqual(2);
  expect(Math.abs(cells.action.right - port.right)).toBeLessThanOrEqual(2);
}

test('固定列按容器宽度释放空间，窄屏采购员可滚入并真实点击', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/data-display/table/');

  const demo = page.getByRole('region', { name: '固定列采购订单示例' });
  await demo.scrollIntoViewIfNeeded();
  await expect(demo).toBeVisible();
  await expect(demo.getByRole('table').first()).toBeVisible();
  await expect(demo.getByRole('note')).toContainText('左右滚动可查看更多订单列');

  const orderId = 'PO-2026-1041';
  const orderRow = demo.getByRole('row').filter({ hasText: orderId });
  const selection = orderRow.getByRole('checkbox', { name: `选择订单 ${orderId}` });
  await expect(orderRow.getByText('待审批', { exact: true })).toBeVisible();
  await expect(
    demo.getByRole('row').filter({ hasText: 'PO-2026-1042' }).getByText('已审批', { exact: true }),
  ).toBeVisible();
  await expect(demo.getByRole('checkbox', { name: '选择当前页全部订单' })).toBeVisible();
  const idCell = orderRow.getByRole('cell').nth(1);
  const buyerButton = orderRow.getByRole('button', { name: '查看采购员 周敏' });
  const orderActionButton = orderRow.getByRole('button', { name: `查看订单 ${orderId} 详情` });
  const geometry: Array<Record<string, unknown>> = [];

  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 930, height: 800 },
    { width: 390, height: 844 },
    { width: 320, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await expectNoDocumentOverflow(page);

    const sectionWidth = await demo.evaluate((section) => section.getBoundingClientRect().width);
    const hasRoomForFixedColumns = sectionWidth >= 448;
    expect(hasRoomForFixedColumns).toBe(viewport.width >= 930);

    // 检查中段几何以等待 ResizeObserver 实际切换配置，避免依赖实现私有属性。
    await expect
      .poll(() => fixedEdgesArePinnedAtMiddle(demo, idCell, orderId))
      .toBe(hasRoomForFixedColumns);

    const atStart = await inspectTableScrollport(idCell, 'x', 'start');
    expect(atStart.scrollWidth).toBeGreaterThan(atStart.clientWidth + 1);
    const startCells = await readFixedCellBounds(demo, orderId);

    const atEnd = await inspectTableScrollport(idCell, 'x', 'end');
    expect(atEnd.scrollLeft).toBeGreaterThan(0);
    const endCells = await readFixedCellBounds(demo, orderId);
    if (hasRoomForFixedColumns) {
      expectFixedEdges(atStart, startCells);
      expectFixedEdges(atEnd, endCells);
    } else {
      expect(endCells.selection.right).toBeLessThan(atEnd.left - 2);
    }
    await expectNoDocumentOverflow(page);

    geometry.push({
      viewport,
      sectionWidth,
      hasRoomForFixedColumns,
      atStart,
      startCells,
      atEnd,
      endCells,
    });

    if (viewport.width === 1280) {
      const secondRow = demo.getByRole('row').filter({ hasText: 'PO-2026-1042' });
      const secondOrderActionButton = secondRow.getByRole('button', {
        name: '查看订单 PO-2026-1042 详情',
      });

      await orderActionButton.focus();
      await expect(orderActionButton).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(orderActionButton).toHaveAttribute('aria-expanded', 'true');
      const detailsId = await orderActionButton.getAttribute('aria-controls');
      expect(detailsId).toBeTruthy();
      expect(secondOrderActionButton).toHaveAttribute('aria-controls', detailsId!);

      const detailsPanel = demo.locator(`[id="${detailsId}"]`);
      await expect(detailsPanel).toBeVisible();
      await expect(detailsPanel).toHaveAttribute('role', 'region');
      await expect(detailsPanel).toHaveAccessibleName(`订单详情 ${orderId}`);
      const detailsHeading = detailsPanel.getByRole('heading', {
        name: `订单详情 ${orderId}`,
      });
      await expect(detailsHeading).toBeFocused();
      await expect(detailsPanel).toHaveAttribute(
        'aria-labelledby',
        (await detailsHeading.getAttribute('id'))!,
      );
      await expect(detailsPanel.getByRole('term')).toHaveText([
        '订单编号',
        '供应商',
        '下单日期',
        '所属部门',
        '采购员',
        '采购金额',
        '审批状态',
      ]);
      const supplierLabel = detailsPanel.getByText('供应商', { exact: true });
      const supplierValue = detailsPanel.getByRole('definition').nth(1);
      const supplierLabelSize = Number.parseFloat(
        await supplierLabel.evaluate((element) => window.getComputedStyle(element).fontSize),
      );
      const supplierValueStyle = await supplierValue.evaluate((element) => {
        const style = window.getComputedStyle(element);
        return {
          fontSize: Number.parseFloat(style.fontSize),
          fontWeight: Number.parseInt(style.fontWeight, 10),
        };
      });
      const amountWeight = Number.parseInt(
        await detailsPanel
          .getByRole('definition')
          .nth(5)
          .evaluate((element) => window.getComputedStyle(element).fontWeight),
        10,
      );
      expect(supplierLabelSize).toBeLessThan(supplierValueStyle.fontSize);
      expect(supplierValueStyle.fontWeight).toBeGreaterThanOrEqual(500);
      expect(amountWeight).toBeGreaterThan(supplierValueStyle.fontWeight);
      await expect(detailsPanel.getByRole('definition')).toHaveText([
        orderId,
        '上海深蓝光电高新材料有限公司',
        '2026-09-18',
        '精密制造中心',
        '周敏',
        '¥ 1,428,900',
        '待审批',
      ]);

      await secondOrderActionButton.click();
      await expect(orderActionButton).toHaveAttribute('aria-expanded', 'false');
      await expect(secondOrderActionButton).toHaveAttribute('aria-expanded', 'true');
      await expect(detailsPanel).toHaveAccessibleName('订单详情 PO-2026-1042');
      await expect(
        detailsPanel.getByRole('heading', {
          level: 4,
          name: '订单详情 PO-2026-1042',
        }),
      ).toBeFocused();
      await expect(detailsPanel.getByRole('definition')).toHaveText([
        'PO-2026-1042',
        '深圳创智精密半导体装备股份有限公司华南区域战略供应商',
        '2026-09-19',
        '半导体事业部',
        '陈立',
        '¥ 3,892,150',
        '已审批',
      ]);

      await detailsPanel.getByRole('button', { name: '关闭订单详情' }).click();
      await expect(detailsPanel).toBeHidden();
      await expect(secondOrderActionButton).toHaveAttribute('aria-expanded', 'false');
      await expect(secondOrderActionButton).toBeFocused();
    }

    if (!hasRoomForFixedColumns) {
      const beforeTab = await inspectTableScrollport(idCell, 'x', 'start');
      expect(beforeTab.scrollLeft).toBe(0);
      await selection.focus();
      await page.keyboard.press('Tab');
      await expect(buyerButton).toBeFocused();

      const afterTab = await inspectTableScrollport(buyerButton, 'x', 'keep');
      const buyerBounds = await readBounds(buyerButton);
      const cellsAfterTab = await readFixedCellBounds(demo, orderId);
      expect(afterTab.scrollLeft).toBeGreaterThan(beforeTab.scrollLeft);
      expect(buyerBounds.left).toBeGreaterThanOrEqual(afterTab.left - 1);
      expect(buyerBounds.right).toBeLessThanOrEqual(afterTab.right + 1);
      const buyerClearOfLeftSide = cellsAfterTab.orderId.right + 2 <= buyerBounds.left;
      const buyerClearOfRightSide = buyerBounds.right + 2 <= cellsAfterTab.action.left;
      expect(buyerClearOfLeftSide).toBe(true);
      expect(buyerClearOfRightSide).toBe(true);
      const clickPoint = {
        x: (buyerBounds.left + buyerBounds.right) / 2,
        y: (buyerBounds.top + buyerBounds.bottom) / 2,
      };
      const hitByElementFromPoint = await buyerButton.evaluate((button, point) => {
        const hit = document.elementFromPoint(point.x, point.y);
        return hit === button || (hit instanceof Node && button.contains(hit));
      }, clickPoint);
      expect(hitByElementFromPoint).toBe(true);
      await page.mouse.click(clickPoint.x, clickPoint.y);
      await expect(demo.getByRole('status')).toContainText('采购员：周敏');

      const keyboardEvidence = {
        beforeScrollLeft: beforeTab.scrollLeft,
        scrollLeft: afterTab.scrollLeft,
        scrollWidth: afterTab.scrollWidth,
        clientWidth: afterTab.clientWidth,
        portLeft: afterTab.left,
        portRight: afterTab.right,
        buyerBounds,
        focused: await buyerButton.evaluate((element) => document.activeElement === element),
        buyerInsideScrollport:
          buyerBounds.left >= afterTab.left - 1 && buyerBounds.right <= afterTab.right + 1,
        clickPoint,
        hitByElementFromPoint,
        cellsAfterTab,
        buyerClearOfLeftSide,
        buyerClearOfRightSide,
      };
      geometry.push({ viewport, keyboard: keyboardEvidence });

      expect(cellsAfterTab.selection.right).toBeLessThan(afterTab.left - 2);
      expect(cellsAfterTab.action.left).toBeGreaterThan(afterTab.right + 2);
      await expectNoDocumentOverflow(page);
    } else if (viewport.width === 930) {
      const beforeTab = await inspectTableScrollport(idCell, 'x', 'start');
      await selection.focus();
      await page.keyboard.press('Tab');
      await expect(buyerButton).toBeFocused();

      const afterTab = await inspectTableScrollport(buyerButton, 'x', 'keep');
      const buyerBounds = await readBounds(buyerButton);
      const cellsAfterTab = await readFixedCellBounds(demo, orderId);
      expect(afterTab.scrollLeft).toBeGreaterThan(beforeTab.scrollLeft);
      expect(buyerBounds.left).toBeGreaterThanOrEqual(afterTab.left - 1);
      expect(buyerBounds.right).toBeLessThanOrEqual(afterTab.right + 1);
      expect(cellsAfterTab.orderId.right + 2).toBeLessThanOrEqual(buyerBounds.left);
      expect(buyerBounds.right + 2).toBeLessThanOrEqual(cellsAfterTab.action.left);

      const clickPoint = {
        x: (buyerBounds.left + buyerBounds.right) / 2,
        y: (buyerBounds.top + buyerBounds.bottom) / 2,
      };
      await page.mouse.click(clickPoint.x, clickPoint.y);
      await expect(demo.getByRole('status')).toContainText('采购员：周敏');
      geometry.push({
        viewport,
        keyboard: {
          beforeScrollLeft: beforeTab.scrollLeft,
          scrollLeft: afterTab.scrollLeft,
          buyerBounds,
          cellsAfterTab,
          focused: await buyerButton.evaluate((element) => document.activeElement === element),
        },
      });
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoDocumentOverflow(page);
  const longVendorRow = demo.getByRole('row').filter({ hasText: 'PO-2026-1042' });
  const longVendorAction = longVendorRow.getByRole('button', {
    name: '查看订单 PO-2026-1042 详情',
  });
  await longVendorAction.click();
  const detailsId = await longVendorAction.getAttribute('aria-controls');
  expect(detailsId).toBeTruthy();
  const narrowDetails = demo.locator(`[id="${detailsId}"]`);
  await expect(narrowDetails).toBeVisible();
  const detailGroups = narrowDetails.getByRole('group');
  await expect(detailGroups).toHaveCount(3);
  const gridColumns = await detailGroups.first().evaluate((group) => {
    const grid = group.parentElement;
    if (!grid) throw new Error('未能读取订单详情分组布局');
    return window.getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length;
  });
  expect(gridColumns).toBe(1);
  const detailOverflow = await narrowDetails.evaluate((panel) => {
    return panel.scrollWidth - panel.clientWidth;
  });
  expect(detailOverflow).toBeLessThanOrEqual(1);
  await expectNoDocumentOverflow(page);
  const vendorValue = narrowDetails.getByRole('definition').nth(1);
  const vendorWraps = await vendorValue.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getClientRects().length > 1;
  });
  expect(vendorWraps).toBe(true);
  await narrowDetails.getByRole('button', { name: '关闭订单详情' }).click();
  await expect(longVendorAction).toBeFocused();

  await page.setViewportSize({ width: 320, height: 844 });
  await expectNoDocumentOverflow(page);
  await longVendorAction.focus();
  await expect(longVendorAction).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(narrowDetails).toBeVisible();
  await expect(narrowDetails.getByRole('heading', { level: 4 })).toBeFocused();
  await expect(detailGroups).toHaveCount(3);
  await expectNoDocumentOverflow(page);
  expect(
    await narrowDetails.evaluate((panel) => panel.scrollWidth - panel.clientWidth),
  ).toBeLessThanOrEqual(1);
  const narrowVendorValue = narrowDetails.getByRole('definition').nth(1);
  const narrowVendorWraps = await narrowVendorValue.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getClientRects().length > 1;
  });
  expect(narrowVendorWraps).toBe(true);
  const narrowCloseAction = narrowDetails.getByRole('button', { name: '关闭订单详情' });
  await narrowCloseAction.focus();
  await page.keyboard.press('Enter');
  await expect(narrowDetails).toBeHidden();
  await expect(longVendorAction).toBeFocused();

  await page.setViewportSize({ width: 1280, height: 800 });
  await demo.evaluate((section) => section.style.removeProperty('inline-size'));
  await expect.poll(() => fixedEdgesArePinnedAtMiddle(demo, idCell, orderId)).toBe(true);
  const breakpointEvidence: Array<Record<string, unknown>> = [];
  for (const sectionWidth of [447, 448]) {
    await demo.evaluate((section, width) => {
      section.style.inlineSize = `${width}px`;
    }, sectionWidth);
    await expect
      .poll(() => demo.evaluate((section) => section.getBoundingClientRect().width))
      .toBe(sectionWidth);
    const fixed = sectionWidth >= 448;
    await expect.poll(() => fixedEdgesArePinnedAtMiddle(demo, idCell, orderId)).toBe(fixed);
    if (sectionWidth === 448) {
      const port = await inspectTableScrollport(idCell, 'x', 'start');
      await selection.focus();
      await page.keyboard.press('Tab');
      await expect(buyerButton).toBeFocused();
      const buyerBounds = await readBounds(buyerButton);
      const portAfterTab = await inspectTableScrollport(buyerButton, 'x', 'keep');
      const cellsAfterTab = await readFixedCellBounds(demo, orderId);
      expect(buyerBounds.left).toBeGreaterThanOrEqual(portAfterTab.left - 1);
      expect(buyerBounds.right).toBeLessThanOrEqual(portAfterTab.right + 1);
      expect(cellsAfterTab.orderId.right + 2).toBeLessThanOrEqual(buyerBounds.left);
      expect(buyerBounds.right + 2).toBeLessThanOrEqual(cellsAfterTab.action.left);
      breakpointEvidence.push({
        sectionWidth,
        fixed,
        keyboard: { port, portAfterTab, buyerBounds, cellsAfterTab },
      });
    } else {
      breakpointEvidence.push({ sectionWidth, fixed });
    }
  }
  await demo.evaluate((section) => section.style.removeProperty('inline-size'));

  await test.info().attach('fixed-column-geometry.json', {
    body: Buffer.from(
      JSON.stringify({ viewports: geometry, breakpoint: breakpointEvidence }, null, 2),
    ),
    contentType: 'application/json',
  });

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('粗指针下固定列示例的主要操作达到 44px 目标尺寸', async ({ browser }, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (typeof baseURL !== 'string') throw new Error('浏览器测试项目必须配置 HTTP baseURL');

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  try {
    const page = await context.newPage();
    const browserHealth = collectBrowserErrors(page);
    await page.goto(new URL('/components/data-display/table/', baseURL).href);

    const demo = page.getByRole('region', { name: '固定列采购订单示例' });
    await demo.scrollIntoViewIfNeeded();
    await expect(demo.getByRole('note')).toContainText('左右滚动可查看更多订单列');
    expect(await page.evaluate(() => matchMedia('(any-pointer: coarse)').matches)).toBe(true);

    const orderId = 'PO-2026-1041';
    const row = demo.getByRole('row').filter({ hasText: orderId });
    const selection = row.getByRole('checkbox', { name: `选择订单 ${orderId}` });
    const selectionTarget = selection.locator('xpath=ancestor::label[1]');
    const headerSelection = demo.getByRole('checkbox', { name: '选择当前页全部订单' });
    const headerSelectionTarget = headerSelection.locator('xpath=ancestor::label[1]');
    await expect
      .poll(() => selection.evaluate((input: HTMLInputElement) => input.labels?.length))
      .toBe(1);
    await expect
      .poll(() => headerSelection.evaluate((input: HTMLInputElement) => input.labels?.length))
      .toBe(1);
    const controls = [
      selectionTarget,
      headerSelectionTarget,
      demo.getByRole('button', { name: '查看采购员 周敏' }),
      demo.getByRole('button', { name: '查看订单 PO-2026-1041 详情' }),
    ];
    for (const control of controls) {
      const bounds = await control.boundingBox();
      if (!bounds) throw new Error('未能测量粗指针下的表格操作目标');
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
    }

    const orderAction = demo.getByRole('button', { name: `查看订单 ${orderId} 详情` });
    await orderAction.click();
    const detailsId = await orderAction.getAttribute('aria-controls');
    expect(detailsId).toBeTruthy();
    const detailsPanel = demo.locator(`[id="${detailsId}"]`);
    await expect(detailsPanel).toBeVisible();
    const closeAction = detailsPanel.getByRole('button', { name: '关闭订单详情' });
    const closeBounds = await closeAction.boundingBox();
    if (!closeBounds) throw new Error('未能测量粗指针下的订单详情关闭按钮');
    expect(closeBounds.width).toBeGreaterThanOrEqual(44);
    expect(closeBounds.height).toBeGreaterThanOrEqual(44);
    await closeAction.click();
    await expect(orderAction).toBeFocused();

    const selectionBounds = await selectionTarget.boundingBox();
    if (!selectionBounds) throw new Error('未能测量粗指针下的行选择标签区域');
    await selectionTarget.click({
      position: { x: selectionBounds.width / 2, y: selectionBounds.height / 2 },
    });
    await expect(selection).toBeChecked();

    const headerSelectionBounds = await headerSelectionTarget.boundingBox();
    if (!headerSelectionBounds) throw new Error('未能测量粗指针下的表头选择标签区域');
    await headerSelectionTarget.click({
      position: {
        x: headerSelectionBounds.width / 2,
        y: headerSelectionBounds.height / 2,
      },
    });
    await expect(headerSelection).toBeChecked();
    await expect
      .poll(() =>
        demo
          .getByRole('checkbox', { name: /^选择订单 PO-/ })
          .evaluateAll((inputs) => inputs.every((input) => (input as HTMLInputElement).checked)),
      )
      .toBe(true);

    const orderIdCell = row.getByRole('cell').nth(1);
    const buyerButton = row.getByRole('button', { name: '查看采购员 周敏' });
    const coarseBoundary: Array<Record<string, unknown>> = [];

    await page.setViewportSize({ width: 1280, height: 800 });
    for (const sectionWidth of [447, 448]) {
      await demo.evaluate((section, width) => {
        section.style.inlineSize = `${width}px`;
      }, sectionWidth);
      await expect
        .poll(() => demo.evaluate((section) => section.getBoundingClientRect().width))
        .toBe(sectionWidth);

      const fixed = sectionWidth >= 448;
      await expect.poll(() => fixedEdgesArePinnedAtMiddle(demo, orderIdCell, orderId)).toBe(fixed);
      if (!fixed) {
        coarseBoundary.push({ sectionWidth, fixed });
        continue;
      }

      await inspectTableScrollport(orderIdCell, 'x', 'start');
      await selection.focus();
      await page.keyboard.press('Tab');
      await expect(buyerButton).toBeFocused();
      const buyerBounds = await readBounds(buyerButton);
      const cells = await readFixedCellBounds(demo, orderId);
      const focusRing = await buyerButton.evaluate((button) => {
        const style = window.getComputedStyle(button);
        return {
          outlineStyle: style.outlineStyle,
          outlineClearance:
            Number.parseFloat(style.outlineWidth) + Number.parseFloat(style.outlineOffset),
        };
      });
      expect(focusRing.outlineStyle).not.toBe('none');
      const requiredClearance = focusRing.outlineClearance + 4;
      expect(cells.orderId.right + requiredClearance).toBeLessThanOrEqual(buyerBounds.left);
      expect(buyerBounds.right + requiredClearance).toBeLessThanOrEqual(cells.action.left);
      coarseBoundary.push({ sectionWidth, fixed, buyerBounds, cells, focusRing });
    }
    await demo.evaluate((section) => section.style.removeProperty('inline-size'));

    await test.info().attach('coarse-fixed-column-boundary.json', {
      body: Buffer.from(JSON.stringify(coarseBoundary, null, 2)),
      contentType: 'application/json',
    });

    await expectNoDocumentOverflow(page);
    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  } finally {
    await context.close();
  }
});

test('虚拟采购订单区域可用键盘浏览并播报定位订单', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/data-display/table/');

  const demo = page.getByRole('region', { name: '采购订单大数据示例' });
  await demo.scrollIntoViewIfNeeded();
  const keyboardRegion = demo.getByRole('region', { name: '虚拟采购订单键盘滚动区域' });
  const firstOrder = demo.getByText('PO-2026-0001', { exact: true });
  const lastOrder = demo.getByText('PO-2026-1000', { exact: true });
  const announcement = demo.getByRole('status');
  const documentScrollBefore = await page.evaluate(() => document.documentElement.scrollTop);

  await keyboardRegion.focus();
  await expect(keyboardRegion).toBeFocused();
  await page.keyboard.press('End');
  await expect(lastOrder).toBeVisible();
  await expect(announcement).toHaveText('已定位到第 1000 条订单：PO-2026-1000');
  await page.keyboard.press('ArrowUp');
  await expect(demo.getByText('PO-2026-0999', { exact: true })).toBeVisible();
  await expect(announcement).toHaveText('已定位到第 999 条订单：PO-2026-0999');

  await page.keyboard.press('Home');
  await expect(firstOrder).toBeVisible();
  await expect(announcement).toHaveText('已定位到第 1 条订单：PO-2026-0001');

  await page.keyboard.press('PageDown');
  await expect(demo.getByText('PO-2026-0011', { exact: true })).toBeVisible();
  await expect(announcement).toHaveText('已定位到第 11 条订单：PO-2026-0011');

  const pageDownOrder = demo.getByText('PO-2026-0011', { exact: true });
  const scrollBeforeModifiedKey = await inspectTableScrollport(pageDownOrder, 'y', 'keep');
  await page.keyboard.press('Control+Alt+ArrowDown');
  await expect(announcement).toHaveText('已定位到第 11 条订单：PO-2026-0011');
  const scrollAfterModifiedKey = await inspectTableScrollport(pageDownOrder, 'y', 'keep');
  expect(scrollAfterModifiedKey.scrollTop).toBe(scrollBeforeModifiedKey.scrollTop);

  const scrollAtTop = await inspectTableScrollport(pageDownOrder, 'y', 'start');
  const wheelPoint = {
    x: (scrollAtTop.left + scrollAtTop.right) / 2,
    y: (scrollAtTop.top + scrollAtTop.bottom) / 2,
  };
  await keyboardRegion.focus();
  await page.mouse.move(wheelPoint.x, wheelPoint.y);
  await page.mouse.wheel(0, 60_000);
  await expect(keyboardRegion).toBeFocused();
  const manualScroll = await inspectTableScrollport(lastOrder, 'y', 'keep');
  expect(manualScroll.scrollTop).toBeGreaterThan(0);
  expect(manualScroll.scrollTop).toBeGreaterThanOrEqual(
    manualScroll.scrollHeight - manualScroll.clientHeight - 1,
  );
  await page.keyboard.press('ArrowDown');
  await expect(announcement).toHaveText('已定位到第 1000 条订单：PO-2026-1000');
  await page.keyboard.press('ArrowUp');
  await expect(demo.getByText('PO-2026-0999', { exact: true })).toBeVisible();
  await expect(announcement).toHaveText('已定位到第 999 条订单：PO-2026-0999');

  expect(await page.evaluate(() => document.documentElement.scrollTop)).toBe(documentScrollBefore);
  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('虚拟采购订单只渲染可视行并可滚到第 1000 条', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/data-display/table/');

  const demo = page.getByRole('region', { name: '采购订单大数据示例' });
  await demo.scrollIntoViewIfNeeded();
  await expect(demo).toBeVisible();
  const firstOrder = demo.getByText('PO-2026-0001', { exact: true });
  const lastOrder = demo.getByText('PO-2026-1000', { exact: true });
  const renderedOrderIds = demo.getByText(/^PO-2026-\d{4}$/);

  await expect(firstOrder).toBeVisible();
  const initialRows = await renderedOrderIds.count();
  expect(initialRows).toBeGreaterThan(0);
  expect(initialRows).toBeLessThan(40);

  const beforeScroll = await inspectTableScrollport(firstOrder, 'y', 'keep');
  expect(beforeScroll.scrollHeight).toBeGreaterThan(beforeScroll.clientHeight);
  const firstBounds = await readBounds(firstOrder);
  const documentScrollBefore = await page.evaluate(() => document.documentElement.scrollTop);
  const wheelPoint = {
    x: (firstBounds.left + firstBounds.right) / 2,
    y: (firstBounds.top + firstBounds.bottom) / 2,
  };
  await page.mouse.move(wheelPoint.x, wheelPoint.y);
  await page.mouse.wheel(0, 60_000);

  await expect(lastOrder).toBeVisible();
  const afterScroll = await inspectTableScrollport(lastOrder, 'y', 'keep');
  expect(afterScroll.scrollTop).toBeGreaterThan(beforeScroll.scrollTop);
  const documentScrollAfter = await page.evaluate(() => document.documentElement.scrollTop);
  expect(documentScrollAfter).toBe(documentScrollBefore);
  const finalRows = await renderedOrderIds.count();
  expect(finalRows).toBeLessThan(40);

  const lastBounds = await readBounds(lastOrder);
  const lastOrderInsideScrollport =
    lastBounds.top >= afterScroll.top - 1 && lastBounds.bottom <= afterScroll.bottom + 1;
  expect(lastOrderInsideScrollport).toBe(true);
  const evidence = {
    beforeScroll,
    afterScroll,
    initialRows,
    finalRows,
    wheelPoint,
    wheelDeltaY: 60_000,
    documentScrollBefore,
    documentScrollAfter,
    lastOrder: await lastOrder.textContent(),
    lastBounds,
    lastOrderInsideScrollport,
  };
  await test.info().attach('virtual-table-dom-and-scroll.json', {
    body: Buffer.from(JSON.stringify(evidence, null, 2)),
    contentType: 'application/json',
  });

  await expectNoDocumentOverflow(page);
  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});
