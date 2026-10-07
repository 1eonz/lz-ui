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
  width: number;
  height: number;
}

interface TableThemeSnapshot {
  tokens: {
    primary: string;
    text: string;
    textSecondary: string;
    surface: string;
    headerBackground: string;
    rowHeight: string;
    panelRadius: string;
  };
  visible: {
    tableBackground: string;
    tableSurfaceRadius: string;
    headerBackground: string;
    headerColor: string;
    bodyColor: string;
    rowHeight: string;
  };
}

function cssHexToRgb(value: string): string {
  const match = /^#([0-9a-f]{6})$/i.exec(value);
  if (!match) throw new Error(`主题变量不是六位十六进制颜色：${value}`);
  const channels = [0, 2, 4].map((index) => Number.parseInt(match[1].slice(index, index + 2), 16));
  return `rgb(${channels.join(', ')})`;
}

async function readTableThemeSnapshot(
  themeRoot: Locator,
  tableRegion: Locator,
): Promise<TableThemeSnapshot> {
  const table = tableRegion.getByRole('table').first();
  const header = tableRegion.getByRole('columnheader').first();
  const bodyCell = tableRegion.getByRole('cell').first();
  const bodyRow = tableRegion.getByRole('row').nth(1);
  const provider = await themeRoot.elementHandle();
  if (!provider) throw new Error('找不到主 Table 的主题作用域');
  const [root, tableStyle, tableSurfaceRadius, headerStyle, bodyStyle, rowHeight] =
    await Promise.all([
      themeRoot.evaluate((element) => {
        const style = window.getComputedStyle(element);
        return {
          tokens: {
            primary: style.getPropertyValue('--lx-color-primary').trim(),
            text: style.getPropertyValue('--lx-color-text').trim(),
            textSecondary: style.getPropertyValue('--lx-color-text-secondary').trim(),
            surface: style.getPropertyValue('--lx-color-surface').trim(),
            headerBackground: style.getPropertyValue('--lx-color-item-hover-bg').trim(),
            rowHeight: style.getPropertyValue('--lx-table-row-height').trim(),
            panelRadius: style.getPropertyValue('--lx-panel-radius').trim(),
          },
        };
      }),
      table.evaluate((element, providerElement) => {
        const isOpaque = (color: string) => {
          if (color === 'transparent') return false;
          const legacyAlpha = /^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)$/i.exec(color);
          if (legacyAlpha) return Number(legacyAlpha[1]) >= 1;
          const modernAlpha = /\/\s*([\d.]+)(%)?\s*\)$/i.exec(color);
          if (modernAlpha) {
            const alpha = Number(modernAlpha[1]) / (modernAlpha[2] ? 100 : 1);
            return alpha >= 1;
          }
          return true;
        };
        let backgroundOwner: HTMLElement | null = element as HTMLElement;
        while (backgroundOwner) {
          const background = window.getComputedStyle(backgroundOwner).backgroundColor;
          if (isOpaque(background)) return { background };
          if (backgroundOwner === providerElement) break;
          backgroundOwner = backgroundOwner.parentElement;
        }
        throw new Error('主题作用域内找不到不透明的表格背景');
      }, provider),
      table.evaluate((element, providerElement) => {
        for (
          let ancestor = (element as HTMLElement).parentElement;
          ancestor;
          ancestor = ancestor.parentElement
        ) {
          const style = window.getComputedStyle(ancestor);
          const radii = [
            style.borderTopLeftRadius,
            style.borderTopRightRadius,
            style.borderBottomRightRadius,
            style.borderBottomLeftRadius,
          ];
          if (radii.some((radius) => Number.parseFloat(radius) > 0))
            return style.borderTopLeftRadius;
          if (ancestor === providerElement) break;
        }
        throw new Error('语义表格的祖先中找不到非零圆角');
      }, provider),
      header.evaluate((element) => {
        const style = window.getComputedStyle(element);
        return { background: style.backgroundColor, color: style.color };
      }),
      bodyCell.evaluate((element) => window.getComputedStyle(element).color),
      bodyRow.evaluate((element) => window.getComputedStyle(element).height),
    ]);
  return {
    ...root,
    visible: {
      tableBackground: tableStyle.background,
      tableSurfaceRadius,
      headerBackground: headerStyle.background,
      headerColor: headerStyle.color,
      bodyColor: bodyStyle,
      rowHeight,
    },
  };
}

function expectTableThemeStyles(snapshot: TableThemeSnapshot): void {
  expect(snapshot.visible.tableBackground).toBe(cssHexToRgb(snapshot.tokens.surface));
  expect(snapshot.visible.headerBackground).toBe(cssHexToRgb(snapshot.tokens.headerBackground));
  expect(snapshot.visible.headerColor).toBe(cssHexToRgb(snapshot.tokens.textSecondary));
  expect(snapshot.visible.bodyColor).toBe(cssHexToRgb(snapshot.tokens.text));
  expect(snapshot.visible.tableSurfaceRadius).toBe(snapshot.tokens.panelRadius);
  expect(snapshot.visible.rowHeight).toBe(snapshot.tokens.rowHeight);
}

async function chooseRadio(themeRoot: Locator, name: string): Promise<void> {
  const radio = themeRoot.getByRole('radio', { name, exact: true });
  await themeRoot.getByText(name, { exact: true }).click();
  await expect(radio).toBeChecked();
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
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  });
}

async function expectVisuallyHidden(element: Locator): Promise<void> {
  await expect(element).toHaveCSS('width', '1px');
  await expect(element).toHaveCSS('height', '1px');
  await expect(element).toHaveCSS('overflow', 'hidden');
  await expect(element).toHaveCSS('clip-path', 'inset(50%)');
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

async function pressKeyAndReadDefault(
  page: Page,
  key: 'ArrowLeft' | 'ArrowRight',
): Promise<boolean> {
  const defaultPrevented = page.evaluate(
    () =>
      new Promise<boolean>((resolve) => {
        window.addEventListener('keydown', (event) => resolve(event.defaultPrevented), {
          once: true,
        });
      }),
  );
  await page.keyboard.press(key);
  return defaultPrevented;
}

test('Table 公开主题控件切换会更新 data-lx 状态、token 与可见表格样式', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/data-display/table/');

  const tableRegion = page.getByRole('region', { name: '采购订单表格', exact: true });
  const themeRoot = page.locator('[data-lx-mode]').filter({ has: tableRegion });
  await expect(themeRoot).toHaveCount(1);
  await expect(tableRegion.getByRole('table').first()).toBeVisible();
  await themeRoot.getByText('主题设置', { exact: true }).click();

  const darkSwitch = themeRoot.getByRole('switch', { name: '暗色模式' });
  await expect(darkSwitch).toBeVisible();

  const setMode = async (mode: 'light' | 'dark') => {
    if ((await themeRoot.getAttribute('data-lx-mode')) !== mode) await darkSwitch.click();
    await expect(themeRoot).toHaveAttribute('data-lx-mode', mode);
    const snapshot = await readTableThemeSnapshot(themeRoot, tableRegion);
    expectTableThemeStyles(snapshot);
    return snapshot;
  };

  const light = await setMode('light');
  const dark = await setMode('dark');
  expect(dark.tokens.text).not.toBe(light.tokens.text);
  expect(dark.tokens.surface).not.toBe(light.tokens.surface);
  expect(dark.visible.tableBackground).not.toBe(light.visible.tableBackground);
  expect(dark.visible.headerBackground).not.toBe(light.visible.headerBackground);
  await setMode('light');

  for (const appearance of [
    { label: '商务', value: 'business', radius: '4px' },
    { label: '轻盈', value: 'soft', radius: '8px' },
    { label: '玻璃', value: 'glass', radius: '12px' },
  ]) {
    await chooseRadio(themeRoot, appearance.label);
    await expect(themeRoot).toHaveAttribute('data-lx-appearance', appearance.value);
    const snapshot = await readTableThemeSnapshot(themeRoot, tableRegion);
    expect(snapshot.tokens.panelRadius).toBe(appearance.radius);
    expectTableThemeStyles(snapshot);
  }

  for (const density of [
    { label: '舒适 · 48px 基础', value: 'comfortable', height: '48px' },
    { label: '紧凑 · 36px 基础', value: 'compact', height: '36px' },
  ]) {
    await chooseRadio(themeRoot, density.label);
    await expect(themeRoot).toHaveAttribute('data-lx-density', density.value);
    const snapshot = await readTableThemeSnapshot(themeRoot, tableRegion);
    expect(snapshot.tokens.rowHeight).toBe(density.height);
    expectTableThemeStyles(snapshot);
  }

  await chooseRadio(themeRoot, '商务');
  await chooseRadio(themeRoot, '舒适 · 48px 基础');

  const brandColors = [
    { label: '海洋蓝', value: 'blue' },
    { label: '活力橙', value: 'orange' },
    { label: '翡翠绿', value: 'green' },
    { label: '智慧紫', value: 'purple' },
    { label: '清透青', value: 'cyan' },
    { label: '品牌玫红', value: 'rose' },
  ];
  const paletteColors = [
    { label: '青瓷桂影', value: 'celadon-laurel' },
    { label: '暮桃微光', value: 'twilight-peach' },
    { label: '石榴杏仁', value: 'garnet-almond' },
    { label: '松针琥珀', value: 'pine-amber' },
    { label: '雾色燕麦', value: 'misty-oatmeal' },
    { label: '豆沙墨色', value: 'bean-sand-ink' },
    { label: '奶酪远青', value: 'cheese-distant-cyan' },
  ];
  const brandLabels = brandColors.map(({ label }) => label);
  const paletteLabels = ['使用品牌色', ...paletteColors.map(({ label }) => label)];
  const selectedIndexes = new Map<string, number>([
    ['品牌色', 0],
    ['东方配色', 0],
  ]);
  const chooseOption = async (name: string, label: string, options: readonly string[]) => {
    const optionIndex = options.indexOf(label);
    expect(optionIndex).toBeGreaterThanOrEqual(0);
    const currentIndex = selectedIndexes.get(name);
    expect(currentIndex).toBeDefined();
    const select = themeRoot.getByRole('combobox', { name });
    await select.evaluate((element) =>
      element.scrollIntoView({ block: 'center', inline: 'nearest' }),
    );
    await select.press('Enter');
    const popup = page.getByRole('listbox');
    await expect(popup).toHaveCount(1);
    await expect(select).toHaveAttribute('aria-expanded', 'true');
    const distance = Math.abs(optionIndex - currentIndex!);
    const direction = optionIndex >= currentIndex! ? 'ArrowDown' : 'ArrowUp';
    for (let index = 0; index < distance; index += 1) await select.press(direction);
    const option = popup.getByRole('option', { name: label, exact: true });
    await expect(option).toHaveCount(1);
    const activeOptionId = await select.getAttribute('aria-activedescendant');
    expect(activeOptionId).toBe(await option.getAttribute('id'));
    await select.press('Enter');
    await expect(select).toHaveAttribute('aria-expanded', 'false');
    selectedIndexes.set(name, optionIndex);
  };
  await expect(themeRoot).toHaveAttribute('data-lx-color', 'blue');
  await expect(themeRoot.getByText('使用品牌色', { exact: true })).toBeVisible();
  let previous = await readTableThemeSnapshot(themeRoot, tableRegion);
  expectTableThemeStyles(previous);

  for (const color of brandColors.slice(1)) {
    await chooseOption('品牌色', color.label, brandLabels);
    await expect(themeRoot).toHaveAttribute('data-lx-mode', 'light');
    await expect(themeRoot).toHaveAttribute('data-lx-appearance', 'business');
    await expect(themeRoot).toHaveAttribute('data-lx-density', 'comfortable');
    await expect(themeRoot).toHaveAttribute('data-lx-color', color.value);
    const snapshot = await readTableThemeSnapshot(themeRoot, tableRegion);
    expectTableThemeStyles(snapshot);
    expect(snapshot.tokens.primary).not.toBe(previous.tokens.primary);
    expect(snapshot.visible.headerBackground).not.toBe(previous.visible.headerBackground);
    previous = snapshot;
  }

  await expect(themeRoot.getByText('使用品牌色', { exact: true })).toBeVisible();
  for (const palette of paletteColors) {
    await chooseOption('东方配色', palette.label, paletteLabels);
    await expect(themeRoot).toHaveAttribute('data-lx-mode', 'light');
    await expect(themeRoot).toHaveAttribute('data-lx-appearance', 'business');
    await expect(themeRoot).toHaveAttribute('data-lx-density', 'comfortable');
    await expect(themeRoot).toHaveAttribute('data-lx-color', palette.value);
    const snapshot = await readTableThemeSnapshot(themeRoot, tableRegion);
    expectTableThemeStyles(snapshot);
    expect(snapshot.tokens.primary).not.toBe(previous.tokens.primary);
    expect(snapshot.visible.headerBackground).not.toBe(previous.visible.headerBackground);
    previous = snapshot;
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('普通 Table 滚动区仅横向响应方向键，边界保留默认行为且 Tab 可离开', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/components/data-display/table/');

  const region = page.getByRole('region', { name: '基础采购订单表格', exact: true });
  await region.scrollIntoViewIfNeeded();
  await expect(region).toBeVisible();
  const sequentialTabStops = await region
    .locator('a, button, input, select, textarea, [tabindex]')
    .evaluateAll((elements) =>
      elements
        .filter((element) => (element as HTMLElement).tabIndex >= 0)
        .map((element) => {
          const node = element as HTMLElement;
          return {
            tagName: node.tagName.toLowerCase(),
            role: node.getAttribute('role'),
            tabIndex: node.tabIndex,
            ariaLabel: node.getAttribute('aria-label'),
          };
        }),
    );
  expect(sequentialTabStops).toEqual([]);
  await region.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(region).toBeFocused();

  const initial = await region.evaluate((element) => ({
    scrollLeft: element.scrollLeft,
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));
  expect(initial.scrollWidth).toBeGreaterThan(initial.clientWidth);
  const documentScrollBefore = await page.evaluate(() => ({
    x: window.scrollX,
    y: window.scrollY,
  }));

  await region.evaluate((element) => {
    element.scrollLeft = 0;
  });
  expect(await pressKeyAndReadDefault(page, 'ArrowLeft')).toBe(false);
  expect(await region.evaluate((element) => element.scrollLeft)).toBe(0);

  expect(await pressKeyAndReadDefault(page, 'ArrowRight')).toBe(true);
  expect(await region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  const focusRing = await region.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      keyboardVisible: element.matches(':focus-visible'),
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });
  expect(focusRing).toEqual({ keyboardVisible: true, outlineStyle: 'solid', outlineWidth: '2px' });
  expect(await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }))).toEqual(
    documentScrollBefore,
  );

  await region.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
  });
  const maxScrollLeft = await region.evaluate((element) => element.scrollLeft);
  expect(maxScrollLeft).toBeGreaterThan(0);
  expect(await pressKeyAndReadDefault(page, 'ArrowRight')).toBe(false);
  expect(await region.evaluate((element) => element.scrollLeft)).toBe(maxScrollLeft);
  expect(await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }))).toEqual(
    documentScrollBefore,
  );

  await page.keyboard.press('Tab');
  expect(await region.evaluate((element) => element.contains(document.activeElement))).toBe(false);

  const tableRegion = page.getByRole('region', { name: '采购订单表格', exact: true });
  const rowSelection = tableRegion.getByRole('checkbox', { name: '选择采购单 PO-2024-1881' });
  await tableRegion.scrollIntoViewIfNeeded();
  await rowSelection.focus();
  await expect(rowSelection).toBeFocused();
  const childControlScrollBefore = await Promise.all([
    tableRegion.evaluate((element) => element.scrollLeft),
    page.evaluate(() => ({ x: window.scrollX, y: window.scrollY })),
  ]);
  expect(await pressKeyAndReadDefault(page, 'ArrowRight')).toBe(false);
  expect(await tableRegion.evaluate((element) => element.scrollLeft)).toBe(
    childControlScrollBefore[0],
  );
  expect(await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }))).toEqual(
    childControlScrollBefore[1],
  );

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('基础采购表格仅在内容溢出时显示横向滚动提示并提供条件式描述', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  const hintText =
    '表格超出可视区域时，可横向滚动查看；也可按 Tab 聚焦表格区后，用左右方向键滚动。';
  await page.goto('/components/data-display/table/');

  const region = page.getByRole('region', { name: '基础采购订单表格', exact: true });
  const scrollHint = page.getByText(hintText, { exact: true });
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(region).toBeVisible();
    await expect(scrollHint).toBeVisible();
    await expect(region).toHaveAccessibleDescription(hintText);
    const dimensions = await region.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
    await expectNoDocumentOverflow(page);
  }

  await page.setViewportSize({ width: 1280, height: 844 });
  await expect(scrollHint).not.toBeVisible();
  await expect(region).toHaveAttribute('aria-describedby');
  await expect(region).toHaveAccessibleDescription(hintText);
  await expect(scrollHint).toHaveText(hintText);

  const tableViewport = region.locator('xpath=..');
  for (const boundary of [
    { inlineSize: 479.5, hintVisible: true },
    { inlineSize: 480, hintVisible: false },
  ]) {
    const measuredWidth = await tableViewport.evaluate((element, inlineSize) => {
      (element as HTMLElement).style.inlineSize = `${inlineSize}px`;
      return element.getBoundingClientRect().width;
    }, boundary.inlineSize);
    expect(measuredWidth).toBeCloseTo(boundary.inlineSize, 1);
    if (boundary.hintVisible) await expect(scrollHint).toBeVisible();
    else await expect(scrollHint).not.toBeVisible();
  }
  await tableViewport.evaluate((element) => {
    (element as HTMLElement).style.removeProperty('inline-size');
  });

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('主 Table 在 640px 与 320px CSS viewport 下仍能操作密度、详情并限制横向滚动', async ({
  page,
}) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/data-display/table/');

  const tableRegion = page.getByRole('region', { name: '采购订单表格', exact: true });
  const tableViewport = tableRegion.locator('xpath=..');
  const themeRoot = page.locator('[data-lx-mode]').filter({ has: tableRegion });
  const settingsSummary = themeRoot.getByText('主题设置', { exact: true });
  const darkSwitch = themeRoot.getByRole('switch', { name: '暗色模式' });
  const firstOrder = tableRegion.getByRole('row').filter({ hasText: 'PO-2024-1881' });
  const orderIdCell = firstOrder.getByRole('cell').nth(1);

  for (const width of [320, 640]) {
    await page.setViewportSize({ width, height: 844 });
    await expectNoDocumentOverflow(page);
    await inspectTableScrollport(orderIdCell, 'x', 'start');
    const viewportBounds = await readBounds(tableViewport);
    const needsCompactLayout = viewportBounds.width <= 855;
    if (needsCompactLayout) {
      await tableRegion.evaluate((region) => {
        region.scrollLeft = 0;
      });
      await expect(
        themeRoot.getByText(
          '可左右滑动查看完整表格；按 Tab 聚焦表格区域后，左右方向键横向滚动，不会在单元格间移动焦点。',
          {
            exact: true,
          },
        ),
      ).toBeVisible();
      const pagination = themeRoot.getByRole('navigation', { name: '采购订单分页' });
      const previousPage = pagination.getByRole('button', { name: '上一页' });
      const nextPage = pagination.getByRole('button', { name: '下一页' });
      const pageJump = pagination.getByRole('combobox', { name: '跳至页码' });
      const pageAnnouncement = pagination.getByText(/^第 \d+ 页，共 \d+ 页$/);
      await expect(pagination).toBeVisible();
      await expect(pageJump).toBeVisible();
      await expect(pageAnnouncement).toHaveAttribute('aria-live', 'polite');
      await expectVisuallyHidden(pageAnnouncement);
      await expect(previousPage).toBeDisabled();
      await expect(nextPage).toBeEnabled();

      await tableRegion.focus();
      let reachedNextPage = false;
      for (let index = 0; index < 40; index += 1) {
        await page.keyboard.press('Tab');
        if (await nextPage.evaluate((button) => button === document.activeElement)) {
          reachedNextPage = true;
          break;
        }
      }
      expect(reachedNextPage).toBe(true);
      await page.keyboard.press('Space');
      await expect(pageAnnouncement).toHaveText('第 2 页，共 5 页');
      await expect(themeRoot.getByRole('status')).toContainText(
        '当前显示 5 条采购订单，每页 5 条，已选择 0 条',
      );
      await expect(themeRoot.getByRole('status')).not.toContainText('第 2 页');
      await expect(nextPage).toBeFocused();

      await page.keyboard.press('Shift+Tab');
      await expect(previousPage).toBeFocused();
      await expect(previousPage).toBeEnabled();
      await page.keyboard.press('Space');
      await expect(pageAnnouncement).toHaveText('第 1 页，共 5 页');
      await page.keyboard.press('Tab');
      await expect(nextPage).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(pageAnnouncement).toHaveText('第 2 页，共 5 页');
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Space');
      await expect(pageAnnouncement).toHaveText('第 1 页，共 5 页');
      await pageJump.focus();
      await pageJump.press('Enter');
      for (let index = 1; index < 5; index += 1) await pageJump.press('ArrowDown');
      await pageJump.press('Enter');
      await expect(pageAnnouncement).toHaveText('第 5 页，共 5 页');
      await expect(pagination.getByText('第 5 / 5 页 · 共 24 条', { exact: true })).toBeVisible();
      await expect(nextPage).toBeDisabled();
      await expect(
        themeRoot.getByRole('checkbox', { name: '选择采购单 PO-2024-1901' }),
      ).toBeVisible();
      for (let currentPage = 5; currentPage > 1; currentPage -= 1) {
        await previousPage.click();
      }
      await expect(pageAnnouncement).toHaveText('第 1 页，共 5 页');
      await expect(pagination.getByText('第 1 / 5 页 · 共 24 条', { exact: true })).toBeVisible();
      await expect(tableRegion).toHaveAccessibleDescription(
        '可左右滑动查看完整表格；按 Tab 聚焦表格区域后，左右方向键横向滚动，不会在单元格间移动焦点。',
      );
      const viewportBounds = await readBounds(tableViewport);
      const paginationBounds = await readBounds(pagination);
      // 340px 以下为了避免摘要与操作按钮挤在同一行，分页会采用三行布局。
      const paginationHeightLimit = viewportBounds.width <= 340 ? 140 : 100;
      expect(paginationBounds.height).toBeLessThanOrEqual(paginationHeightLimit);
      expect(
        paginationBounds.left,
        `紧凑分页越出表格容器：${JSON.stringify({ paginationBounds, viewportBounds })}`,
      ).toBeGreaterThanOrEqual(viewportBounds.left - 1);
      expect(paginationBounds.right).toBeLessThanOrEqual(viewportBounds.right + 1);
      for (const control of [previousPage, nextPage]) {
        const controlBounds = await readBounds(control);
        expect(controlBounds.height).toBeGreaterThanOrEqual(44);
        expect(controlBounds.left).toBeGreaterThanOrEqual(viewportBounds.left - 1);
        expect(controlBounds.right).toBeLessThanOrEqual(viewportBounds.right + 1);
      }
    } else {
      await expect(
        themeRoot.getByText(
          '可左右滑动查看完整表格；按 Tab 聚焦表格区域后，左右方向键横向滚动，不会在单元格间移动焦点。',
          {
            exact: true,
          },
        ),
      ).not.toBeVisible();
      const pagination = themeRoot.getByRole('navigation', { name: '采购订单分页' });
      await expect(pagination.getByRole('button', { name: '第 1 页' })).toHaveAttribute(
        'aria-current',
        'page',
      );
      await expect(pagination.getByRole('combobox', { name: '每页条数' })).toBeVisible();
      await expect(tableRegion).not.toHaveAttribute('aria-describedby');
    }
    await expect(themeRoot.getByText('紧凑 · 36px 基础', { exact: true })).toBeVisible();
    await chooseRadio(themeRoot, '紧凑 · 36px 基础');
    await expect(themeRoot).toHaveAttribute('data-lx-density', 'compact');
    const compact = await readTableThemeSnapshot(themeRoot, tableRegion);
    expect(compact.tokens.rowHeight).toBe('36px');
    expect(compact.visible.rowHeight).toBe('36px');

    await chooseRadio(themeRoot, '舒适 · 48px 基础');
    await expect(themeRoot).toHaveAttribute('data-lx-density', 'comfortable');
    const comfortable = await readTableThemeSnapshot(themeRoot, tableRegion);
    expect(comfortable.tokens.rowHeight).toBe('48px');
    expect(comfortable.visible.rowHeight).toBe('48px');

    await settingsSummary.scrollIntoViewIfNeeded();
    await expect(settingsSummary).toBeVisible();
    await settingsSummary.click();
    await expect(darkSwitch).toBeVisible();
    await settingsSummary.click();
    await expect(darkSwitch).not.toBeVisible();

    const scrollport = await inspectTableScrollport(orderIdCell, 'x', 'end');
    expect(scrollport.scrollWidth).toBeGreaterThan(scrollport.clientWidth + 1);
    expect(['auto', 'scroll']).toContain(scrollport.overflow);
    await expectNoDocumentOverflow(page);

    await firstOrder.getByRole('button', { name: '查看 PO-2024-1881 详情' }).click();
    const orderDetail = themeRoot.getByRole('region', { name: '采购订单 PO-2024-1881 详情' });
    await expect(orderDetail).toBeVisible();
    await expect(orderDetail.getByRole('group')).toHaveCount(3);
    await expect(orderDetail.getByRole('group', { name: '采购信息' })).toBeVisible();
    await expect(orderDetail.getByRole('group', { name: '履约进度' })).toBeVisible();
    await expect(orderDetail.getByRole('group', { name: '审批与结算' })).toBeVisible();
    await expect(orderDetail.getByRole('progressbar', { name: '订单履约进度' })).toHaveAttribute(
      'aria-valuenow',
      '82',
    );
    await expect(orderDetail.getByRole('definition')).toHaveText([
      'PO-2024-1881',
      '上海深蓝光电高新材料有限公司',
      '82%',
      '¥ 1,428,900.00',
      '已审批',
    ]);
    await expect(orderDetail.getByRole('button', { name: '收起详情' })).toBeVisible();
    const groupColumns = await orderDetail
      .getByRole('group')
      .first()
      .evaluate((group) => {
        const grid = group.parentElement;
        if (!grid) throw new Error('未能读取采购订单详情分组布局');
        return window.getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length;
      });
    expect(groupColumns).toBe(1);
    await expectNoDocumentOverflow(page);
    await orderDetail.getByRole('button', { name: '收起详情' }).click();
    await expect(orderDetail).toHaveCount(0);
  }

  await page.setViewportSize({ width: 1280, height: 844 });
  await firstOrder.getByRole('button', { name: '查看 PO-2024-1881 详情' }).click();
  const desktopOrderDetail = themeRoot.getByRole('region', { name: '采购订单 PO-2024-1881 详情' });
  const desktopGroupColumns = await desktopOrderDetail
    .getByRole('group')
    .first()
    .evaluate((group) => {
      const grid = group.parentElement;
      if (!grid) throw new Error('未能读取桌面采购订单详情分组布局');
      return window.getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length;
    });
  expect(desktopGroupColumns).toBe(3);
  await desktopOrderDetail.getByRole('button', { name: '收起详情' }).click();

  for (const containerWidth of [855, 856]) {
    await tableViewport.evaluate((node, inlineSize) => {
      (node as HTMLElement).style.inlineSize = `${inlineSize}px`;
    }, containerWidth);

    const scrollHint = themeRoot.getByText(
      '可左右滑动查看完整表格；按 Tab 聚焦表格区域后，左右方向键横向滚动，不会在单元格间移动焦点。',
      { exact: true },
    );
    if (containerWidth === 855) {
      await expect(scrollHint).toBeVisible();
      await expect(themeRoot.getByRole('navigation', { name: '采购订单分页' })).toBeVisible();
      await expect(
        themeRoot.getByRole('navigation', { name: '采购订单分页' }).getByRole('combobox', {
          name: '跳至页码',
        }),
      ).toBeVisible();
      await expect(tableRegion).toHaveAccessibleDescription(
        '可左右滑动查看完整表格；按 Tab 聚焦表格区域后，左右方向键横向滚动，不会在单元格间移动焦点。',
      );
    } else {
      await expect(scrollHint).not.toBeVisible();
      const pagination = themeRoot.getByRole('navigation', { name: '采购订单分页' });
      await expect(pagination.getByRole('combobox', { name: '跳至页码' })).not.toBeVisible();
      await expect(pagination.getByRole('combobox', { name: '每页条数' })).toBeVisible();
      await expect(pagination.getByRole('button', { name: '第 1 页' })).toHaveAttribute(
        'aria-current',
        'page',
      );
      await expect(tableRegion).not.toHaveAttribute('aria-describedby');
    }
  }

  await tableViewport.evaluate((node) => {
    (node as HTMLElement).style.removeProperty('inline-size');
  });
  await page.setViewportSize({ width: 320, height: 844 });
  await expectNoDocumentOverflow(page);
  await firstOrder.getByRole('button', { name: '查看 PO-2024-1881 详情' }).click();
  const narrowOrderDetail = themeRoot.getByRole('region', { name: '采购订单 PO-2024-1881 详情' });
  const detailTitleSuffix = narrowOrderDetail.getByRole('heading', { level: 4 }).locator('span');
  await detailTitleSuffix.evaluate((element) => {
    const heading = element.closest('h4');
    if (!heading) throw new Error('未能读取采购订单详情标题');
    heading.style.inlineSize = '120px';
  });
  await expect(detailTitleSuffix).toHaveText('详情');
  await expect
    .poll(() =>
      detailTitleSuffix.evaluate((element) => window.getComputedStyle(element).whiteSpace),
    )
    .toBe('nowrap');
  const detailTitleSuffixLineCount = await detailTitleSuffix.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getClientRects().length;
  });
  expect(detailTitleSuffixLineCount).toBe(1);
  const narrowGroupColumns = await narrowOrderDetail
    .getByRole('group')
    .first()
    .evaluate((group) => {
      const grid = group.parentElement;
      if (!grid) throw new Error('未能读取窄屏采购订单详情分组布局');
      return window.getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length;
    });
  expect(narrowGroupColumns).toBe(1);
  await expect(narrowOrderDetail.getByRole('group')).toHaveCount(3);
  await narrowOrderDetail.getByRole('button', { name: '收起详情' }).click();
  await expect(firstOrder.getByRole('button', { name: '查看 PO-2024-1881 详情' })).toBeFocused();

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('宽屏 Table 分页使用原生按钮维护键盘与当前页语义', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/data-display/table/');
  await page.setViewportSize({ width: 1280, height: 844 });

  const themeRoot = page.locator('[data-lx-mode]').filter({
    has: page.getByRole('region', { name: '采购订单表格', exact: true }),
  });
  const pagination = themeRoot.getByRole('navigation', { name: '采购订单分页' });
  const pageSize = pagination.getByRole('combobox', { name: '每页条数' });
  const firstPage = pagination.getByRole('button', { name: '第 1 页' });
  const secondPage = pagination.getByRole('button', { name: '第 2 页' });
  const thirdPage = pagination.getByRole('button', { name: '第 3 页' });
  const fifthPage = pagination.getByRole('button', { name: '第 5 页' });
  const previousPage = pagination.getByRole('button', { name: '上一页' });
  const nextPage = pagination.getByRole('button', { name: '下一页' });

  await expect(pagination).toContainText('共 24 条');
  await expect(previousPage).toBeDisabled();
  await expect(firstPage).toHaveAttribute('aria-current', 'page');
  await pageSize.focus();
  await page.keyboard.press('Tab');
  await expect(firstPage).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(firstPage).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Tab');
  await expect(secondPage).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(secondPage).toHaveAttribute('aria-current', 'page');
  await expect(themeRoot.getByRole('status')).toContainText(
    '当前显示 5 条采购订单，每页 5 条，已选择 0 条',
  );
  await page.keyboard.press('Tab');
  await expect(thirdPage).toBeFocused();
  await page.keyboard.press('Space');
  await expect(thirdPage).toHaveAttribute('aria-current', 'page');
  await fifthPage.click();
  await expect(fifthPage).toHaveAttribute('aria-current', 'page');
  await expect(nextPage).toBeDisabled();
  await expect(previousPage).toBeEnabled();

  await pageSize.press('Enter');
  await expect(pageSize).toHaveAttribute('aria-expanded', 'true');
  await pageSize.press('ArrowDown');
  const tenRows = page.getByText('10 条/页', { exact: true });
  await expect(tenRows).toBeVisible();
  await pageSize.press('Enter');
  await expect(themeRoot.getByRole('status')).toContainText(
    '当前显示 10 条采购订单，每页 10 条，已选择 0 条',
  );
  await expect(pagination).toContainText('共 3 页');
  await expect(pagination.getByRole('button', { name: '第 1 页' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('切换到紧凑分页后排序保留宽屏选定的页大小', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/data-display/table/');
  await page.setViewportSize({ width: 1280, height: 844 });

  const tableRegion = page.getByRole('region', { name: '采购订单表格', exact: true });
  const tableViewport = tableRegion.locator('xpath=..');
  const themeRoot = page.locator('[data-lx-mode]').filter({ has: tableRegion });
  const totalOrderCount = 24;
  await tableViewport.evaluate((node) => {
    (node as HTMLElement).style.inlineSize = '856px';
  });

  let activePageSize = 5;
  for (const { pageSize, pageCount } of [
    { pageSize: 10, pageCount: 3 },
    { pageSize: 20, pageCount: 2 },
  ]) {
    const pagination = themeRoot.getByRole('navigation', { name: '采购订单分页' });
    await expect(pagination).toContainText(`共 ${totalOrderCount} 条`);
    const pageSizeSelect = pagination.getByRole('combobox', { name: '每页条数' });
    await expect(pageSizeSelect).toBeVisible();
    await pageSizeSelect.press('Enter');
    await expect(pageSizeSelect).toHaveAttribute('aria-expanded', 'true');
    const pageSizeOptions = [5, 10, 20];
    const optionIndex = pageSizeOptions.indexOf(pageSize);
    const currentIndex = pageSizeOptions.indexOf(activePageSize);
    const direction = optionIndex >= currentIndex ? 'ArrowDown' : 'ArrowUp';
    for (let index = 0; index < Math.abs(optionIndex - currentIndex); index += 1) {
      await pageSizeSelect.press(direction);
    }
    const pageSizeOption = page.getByText(`${pageSize} 条/页`, { exact: true });
    await expect(pageSizeOption).toBeVisible();
    await pageSizeSelect.press('Enter');
    activePageSize = pageSize;
    await expect(themeRoot.getByRole('status')).toContainText(`每页 ${pageSize} 条`);

    const visibleOrdersOnSecondPage = Math.min(pageSize, totalOrderCount - pageSize);
    await pagination.getByRole('button', { name: '下一页' }).click();
    await expect(themeRoot.getByRole('status')).toContainText(
      `当前显示 ${visibleOrdersOnSecondPage} 条采购订单，每页 ${pageSize} 条，已选择 0 条`,
    );
    await expect(tableRegion.getByRole('table').getByRole('row')).toHaveCount(
      visibleOrdersOnSecondPage + 1,
    );
    await tableViewport.evaluate((node) => {
      (node as HTMLElement).style.inlineSize = '855px';
    });
    const compactPagination = themeRoot.getByRole('navigation', { name: '采购订单分页' });
    await expect(compactPagination).toContainText(`第 2 页，共 ${pageCount} 页`);

    const amountHeader = tableRegion.getByRole('columnheader', { name: '结算金额' });
    await amountHeader.hover();
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await amountHeader.click();
    const expectedSort = pageSize === 10 ? 'ascending' : 'descending';
    await expect(amountHeader).toHaveAttribute('aria-sort', expectedSort);
    await expect(themeRoot.getByRole('status')).toContainText(
      `当前显示 ${pageSize} 条采购订单，每页 ${pageSize} 条，已选择 0 条`,
    );
    await expect(compactPagination).toContainText(`第 1 页，共 ${pageCount} 页`);
    await expect(tableRegion.getByRole('table').getByRole('row')).toHaveCount(pageSize + 1);
    const visibleAmounts = (await tableRegion.getByRole('cell').allTextContents())
      .filter((text) => text.includes('¥'))
      .map((text) => {
        const match = /¥\s*([\d,]+(?:\.\d+)?)/.exec(text);
        if (!match) throw new Error(`无法解析采购订单金额：${text}`);
        return Number(match[1].replace(/,/g, ''));
      });
    expect(visibleAmounts.length).toBe(pageSize);
    const expectedAmounts = [...visibleAmounts].sort((left, right) =>
      expectedSort === 'ascending' ? left - right : right - left,
    );
    expect(visibleAmounts).toEqual(expectedAmounts);
    expect(visibleAmounts[0]).toBe(expectedSort === 'ascending' ? 1_428_900 : 4_268_250);

    await tableViewport.evaluate((node) => {
      (node as HTMLElement).style.inlineSize = '856px';
    });
  }

  const compactPagination = themeRoot.getByRole('navigation', { name: '采购订单分页' });
  const previousPage = compactPagination.getByRole('button', { name: '上一页' });
  const nextPage = compactPagination.getByRole('button', { name: '下一页' });
  const pageStatus = compactPagination.getByText('第 1 页，共 2 页', { exact: true });
  const compactPageSummary = compactPagination.getByText('第 1 / 2 页 · 共 24 条', { exact: true });
  const pageJump = compactPagination.getByRole('combobox', { name: '跳至页码' });
  for (const containerWidth of [299, 300, 301, 339, 340, 341]) {
    await tableViewport.evaluate((node, width) => {
      (node as HTMLElement).style.inlineSize = `${width}px`;
    }, containerWidth);
    await expect(compactPagination).toBeVisible();
    await expectVisuallyHidden(pageStatus);
    await expect(compactPageSummary).toBeVisible();
    await expect(compactPageSummary).toHaveAttribute('aria-hidden', 'true');
    await expect(pageJump).toBeVisible();
    const display = await compactPagination.evaluate(
      (element) => window.getComputedStyle(element).display,
    );
    expect(display).toBe('grid');

    const containerBounds = await readBounds(tableViewport);
    const paginationBounds = await readBounds(compactPagination);
    const pageJumpBounds = await readBounds(pageJump);
    const summaryBounds = await readBounds(compactPageSummary);
    const previousBounds = await readBounds(previousPage);
    const nextBounds = await readBounds(nextPage);
    for (const bounds of [
      paginationBounds,
      pageJumpBounds,
      summaryBounds,
      previousBounds,
      nextBounds,
    ]) {
      expect(bounds.left).toBeGreaterThanOrEqual(containerBounds.left - 1);
      expect(bounds.right).toBeLessThanOrEqual(containerBounds.right + 1);
    }
    if (containerWidth <= 340) {
      expect(pageJumpBounds.bottom).toBeLessThanOrEqual(summaryBounds.top - 1);
      expect(summaryBounds.bottom).toBeLessThanOrEqual(previousBounds.top - 1);
      expect(Math.abs(previousBounds.top - nextBounds.top)).toBeLessThanOrEqual(1);
    } else {
      const jumpCenter = (pageJumpBounds.top + pageJumpBounds.bottom) / 2;
      const summaryCenter = (summaryBounds.top + summaryBounds.bottom) / 2;
      expect(Math.abs(jumpCenter - summaryCenter)).toBeLessThanOrEqual(1);
      expect(summaryBounds.left).toBeGreaterThanOrEqual(pageJumpBounds.right - 1);
      expect(summaryBounds.right).toBeLessThanOrEqual(containerBounds.right + 1);
      expect(pageJumpBounds.bottom).toBeLessThan(previousBounds.top);
      expect(Math.abs(previousBounds.top - nextBounds.top)).toBeLessThanOrEqual(1);
    }
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

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
      await expect(detailsPanel.getByRole('group')).toHaveCount(3);
      await expect(detailsPanel.getByRole('group').nth(0)).toHaveAccessibleName('审批与金额');
      await expect(detailsPanel.getByRole('group').nth(1)).toHaveAccessibleName('订单信息');
      await expect(detailsPanel.getByRole('group').nth(2)).toHaveAccessibleName('采购归属');
      const detailsHeading = detailsPanel.getByRole('heading', {
        name: `订单详情 ${orderId}`,
      });
      await expect(detailsHeading).toBeFocused();
      await expect(detailsPanel).toHaveAttribute(
        'aria-labelledby',
        (await detailsHeading.getAttribute('id'))!,
      );
      await expect(detailsPanel.getByRole('term')).toHaveText([
        '采购金额',
        '审批状态',
        '订单编号',
        '供应商',
        '下单日期',
        '所属部门',
        '采购员',
      ]);
      const supplierLabel = detailsPanel.getByText('供应商', { exact: true });
      const supplierValue = detailsPanel.getByRole('definition').nth(3);
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
          .nth(0)
          .evaluate((element) => window.getComputedStyle(element).fontWeight),
        10,
      );
      const [headingSize, groupHeadingSize, amountSize, groupBorder] = await Promise.all([
        detailsHeading.evaluate((element) => window.getComputedStyle(element).fontSize),
        detailsPanel
          .getByRole('group')
          .first()
          .getByRole('heading')
          .evaluate((element) => window.getComputedStyle(element).fontSize),
        detailsPanel
          .getByRole('definition')
          .first()
          .evaluate((element) => window.getComputedStyle(element).fontSize),
        detailsPanel
          .getByRole('group')
          .first()
          .evaluate((element) => window.getComputedStyle(element).borderBlockStartWidth),
      ]);
      expect(Number.parseFloat(headingSize)).toBeGreaterThan(Number.parseFloat(groupHeadingSize));
      expect(Number.parseFloat(amountSize)).toBeGreaterThan(supplierValueStyle.fontSize);
      expect(groupBorder).toBe('1px');
      expect(supplierLabelSize).toBeLessThan(supplierValueStyle.fontSize);
      expect(supplierValueStyle.fontWeight).toBeGreaterThanOrEqual(500);
      expect(amountWeight).toBeGreaterThan(supplierValueStyle.fontWeight);
      await expect(detailsPanel.getByRole('definition')).toHaveText([
        '¥ 1,428,900',
        '待审批',
        orderId,
        '上海深蓝光电高新材料有限公司',
        '2026-09-18',
        '精密制造中心',
        '周敏',
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
        '¥ 3,892,150',
        '已审批',
        'PO-2026-1042',
        '深圳创智精密半导体装备股份有限公司华南区域战略供应商',
        '2026-09-19',
        '半导体事业部',
        '陈立',
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

  const longVendorRow = demo.getByRole('row').filter({ hasText: 'PO-2026-1042' });
  const longVendorAction = longVendorRow.getByRole('button', {
    name: '查看订单 PO-2026-1042 详情',
  });
  await longVendorAction.click();
  const detailsId = await longVendorAction.getAttribute('aria-controls');
  expect(detailsId).toBeTruthy();
  const narrowDetails = demo.locator(`[id="${detailsId}"]`);
  await expect(narrowDetails).toBeVisible();
  const narrowHeading = narrowDetails.getByRole('heading', { level: 4 });
  await expect(narrowHeading).toHaveAccessibleName('订单详情 PO-2026-1042');
  const orderIdFragment = narrowHeading.getByText('PO-2026-1042', { exact: true });
  const orderIdMetrics = await orderIdFragment.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return {
      height: bounds.height,
      inlineSize: bounds.width,
      lineHeight: Number.parseFloat(style.lineHeight),
      scrollWidth: element.scrollWidth,
    };
  });
  expect(orderIdMetrics.height).toBeLessThanOrEqual(orderIdMetrics.lineHeight + 1);
  expect(orderIdMetrics.scrollWidth).toBeLessThanOrEqual(orderIdMetrics.inlineSize + 1);
  const headingBounds = await readBounds(narrowHeading);
  const orderIdBounds = await readBounds(orderIdFragment);
  expect(orderIdBounds.left).toBeGreaterThanOrEqual(headingBounds.left - 1);
  expect(orderIdBounds.right).toBeLessThanOrEqual(headingBounds.right + 1);
  expect(orderIdBounds.top).toBeGreaterThanOrEqual(headingBounds.top - 1);
  expect(orderIdBounds.bottom).toBeLessThanOrEqual(headingBounds.bottom + 1);
  const narrowCloseAction = narrowDetails.getByRole('button', { name: '关闭订单详情' });
  const closeBounds = await readBounds(narrowCloseAction);
  const orderIdOverlapsCloseAction =
    orderIdBounds.left < closeBounds.right &&
    orderIdBounds.right > closeBounds.left &&
    orderIdBounds.top < closeBounds.bottom &&
    orderIdBounds.bottom > closeBounds.top;
  expect(orderIdOverlapsCloseAction).toBe(false);
  expect(closeBounds.top).toBeGreaterThanOrEqual(headingBounds.bottom - 1);
  const detailGroups = narrowDetails.getByRole('group');
  await expect(detailGroups).toHaveCount(3);
  await expect(detailGroups.nth(0)).toHaveAccessibleName('审批与金额');
  await expect(detailGroups.nth(0).getByText('采购金额', { exact: true })).toBeVisible();
  await expect(detailGroups.nth(0).getByText('审批状态', { exact: true })).toBeVisible();
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

test('粗指针下 Table 与固定列示例的主要操作达到 44px 目标尺寸', async ({ browser }, testInfo) => {
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
    await page.setViewportSize({ width: 320, height: 844 });
    await expectNoDocumentOverflow(page);

    const table = page.getByRole('region', { name: '采购订单表格', exact: true });
    const themeRoot = page.locator('[data-lx-mode]').filter({ has: table });
    const tableRow = table.getByRole('row').filter({ hasText: 'PO-2024-1881' });
    const rowSelection = tableRow.getByRole('checkbox', { name: '选择采购单 PO-2024-1881' });
    const rowSelectionTarget = rowSelection.locator('xpath=ancestor::label[1]');
    const rowExpand = tableRow.getByRole('button', { name: '展开采购订单 PO-2024-1881' });
    const rowDetail = tableRow.getByRole('button', { name: '查看 PO-2024-1881 详情' });
    const exampleStates = themeRoot.getByText('示例状态', { exact: true });
    const selectedOrders = themeRoot.getByText('已选订单（0）', { exact: true });
    const rowHeight = () => tableRow.evaluate((row) => row.getBoundingClientRect().height);

    await chooseRadio(themeRoot, '舒适 · 48px 基础');
    expect(await rowHeight()).toBeGreaterThanOrEqual(48);
    expect(await rowHeight()).toBeLessThanOrEqual(49);
    await chooseRadio(themeRoot, '紧凑 · 36px 基础');
    const compactRowHeight = await rowHeight();
    expect(compactRowHeight).toBeGreaterThanOrEqual(44);
    expect(compactRowHeight).toBeLessThanOrEqual(46);
    await expect(
      themeRoot.getByText('粗指针下，紧凑基础行高会服从 44px 操作目标。', { exact: true }),
    ).toBeVisible();
    const headerHeight = await table
      .getByRole('row')
      .first()
      .evaluate((row) => row.getBoundingClientRect().height);
    expect(headerHeight).toBeGreaterThanOrEqual(44);
    expect(headerHeight).toBeLessThanOrEqual(46);
    await chooseRadio(themeRoot, '舒适 · 48px 基础');

    for (const control of [rowSelectionTarget, rowExpand, rowDetail]) {
      await control.scrollIntoViewIfNeeded();
      const bounds = await control.boundingBox();
      if (!bounds) throw new Error('未能测量粗指针下的采购订单操作目标');
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
    }
    for (const disclosure of [exampleStates, selectedOrders]) {
      const bounds = await disclosure.boundingBox();
      if (!bounds) throw new Error('未能测量粗指针下的订单示例展开目标');
      expect(bounds.height).toBeGreaterThanOrEqual(44);
    }
    await rowSelectionTarget.click();
    await expect(rowSelection).toBeChecked();
    await rowExpand.click();
    const rowCollapse = tableRow.getByRole('button', { name: '收起采购订单 PO-2024-1881' });
    await expect(rowCollapse).toHaveAttribute('aria-expanded', 'true');
    await rowDetail.click();
    const tableDetails = page.getByRole('region', { name: '采购订单 PO-2024-1881 详情' });
    await expect(tableDetails).toBeVisible();
    const closeDetails = tableDetails.getByRole('button', { name: '收起详情' });
    const closeDetailsBounds = await closeDetails.boundingBox();
    if (!closeDetailsBounds) throw new Error('未能测量粗指针下的详情关闭按钮');
    expect(closeDetailsBounds.width).toBeGreaterThanOrEqual(44);
    expect(closeDetailsBounds.height).toBeGreaterThanOrEqual(44);
    await closeDetails.click();
    await expect(rowDetail).toBeFocused();

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
