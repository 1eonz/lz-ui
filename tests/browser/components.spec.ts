import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';
import { browserComponentRoutes } from './routes';

const expectedBrowserRouteIdentities = [
  { name: 'Button', path: '/components/general/button' },
  { name: 'Icon', path: '/components/general/icon' },
  { name: 'Typography', path: '/components/general/typography' },
  { name: 'Space', path: '/components/general/space' },
  { name: 'Divider', path: '/components/general/divider' },
  { name: 'Input', path: '/components/form/input' },
  { name: 'InputNumber', path: '/components/form/input-number' },
  { name: 'Select', path: '/components/form/select' },
  { name: 'DatePicker', path: '/components/form/date-picker' },
  { name: 'Checkbox', path: '/components/form/checkbox' },
  { name: 'Switch', path: '/components/form/switch' },
  { name: 'Radio', path: '/components/form/radio' },
  { name: 'Upload', path: '/components/form/upload' },
  { name: 'FormItem', path: '/components/form/form-item' },
  { name: 'DynamicForm', path: '/components/form/dynamic-form' },
  { name: 'Pagination', path: '/components/data-display/pagination' },
  { name: 'Table', path: '/components/data-display/table' },
  { name: 'Tree', path: '/components/data-display/tree' },
  { name: 'Empty', path: '/components/data-display/empty' },
  { name: 'Skeleton', path: '/components/data-display/skeleton' },
  { name: 'Result', path: '/components/data-display/result' },
  { name: 'Tag', path: '/components/data-display/tag' },
  { name: 'Badge', path: '/components/data-display/badge' },
  { name: 'Descriptions', path: '/components/data-display/descriptions' },
  { name: 'Avatar', path: '/components/data-display/avatar' },
  { name: 'Statistic', path: '/components/data-display/statistic' },
  { name: 'Card', path: '/components/data-display/card' },
  { name: 'List', path: '/components/data-display/list' },
  { name: 'Alert', path: '/components/feedback/alert' },
  { name: 'Spin', path: '/components/feedback/spin' },
  { name: 'Progress', path: '/components/feedback/progress' },
  { name: 'Tooltip', path: '/components/feedback/tooltip' },
] as const;

const rootOverflowViewports = [
  { width: 930, height: 720 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

const cardTabViewports = [
  {
    viewport: { width: 320, height: 740 },
    labels: ['结算', '风控', '审计'],
    accessibleNames: ['资金结算概况', '供应链风险告警', '外部承运审计'],
    panelText: ['采购总计单量', '高风险供应商', '本季度外部承运审计已完成，待整改事项 3 项。'],
    periodVisible: false,
    metricColumns: 1,
  },
  {
    viewport: { width: 360, height: 844 },
    labels: ['结算概况', '供应风险', '承运审计'],
    accessibleNames: ['资金结算概况', '供应链风险告警', '外部承运审计'],
    panelText: ['采购总计单量', '高风险供应商', '本季度外部承运审计已完成，待整改事项 3 项。'],
    periodVisible: false,
    metricColumns: 1,
  },
  {
    viewport: { width: 361, height: 844 },
    labels: ['结算概况', '供应风险', '承运审计'],
    accessibleNames: ['资金结算概况', '供应链风险告警', '外部承运审计'],
    panelText: ['采购总计单量', '高风险供应商', '本季度外部承运审计已完成，待整改事项 3 项。'],
    periodVisible: false,
    metricColumns: 1,
  },
  {
    viewport: { width: 375, height: 844 },
    labels: ['结算概况', '供应风险', '承运审计'],
    accessibleNames: ['资金结算概况', '供应链风险告警', '外部承运审计'],
    panelText: ['采购总计单量', '高风险供应商', '本季度外部承运审计已完成，待整改事项 3 项。'],
    periodVisible: false,
    metricColumns: 1,
  },
  {
    viewport: { width: 387, height: 844 },
    labels: ['结算概况', '供应风险', '承运审计'],
    accessibleNames: ['资金结算概况', '供应链风险告警', '外部承运审计'],
    panelText: ['采购总计单量', '高风险供应商', '本季度外部承运审计已完成，待整改事项 3 项。'],
    periodVisible: false,
    metricColumns: 1,
  },
  {
    viewport: { width: 388, height: 844 },
    labels: ['结算概况', '供应风险', '承运审计'],
    accessibleNames: ['资金结算概况', '供应链风险告警', '外部承运审计'],
    panelText: ['采购总计单量', '高风险供应商', '本季度外部承运审计已完成，待整改事项 3 项。'],
    periodVisible: false,
    metricColumns: 1,
  },
  {
    viewport: { width: 390, height: 844 },
    labels: ['结算概况', '供应风险', '承运审计'],
    accessibleNames: ['资金结算概况', '供应链风险告警', '外部承运审计'],
    panelText: ['采购总计单量', '高风险供应商', '本季度外部承运审计已完成，待整改事项 3 项。'],
    periodVisible: false,
    metricColumns: 1,
  },
  {
    viewport: { width: 930, height: 720 },
    labels: ['资金结算概况', '供应链风险告警', '外部承运审计'],
    accessibleNames: ['资金结算概况', '供应链风险告警', '外部承运审计'],
    panelText: ['采购总计单量', '高风险供应商', '本季度外部承运审计已完成，待整改事项 3 项。'],
    periodVisible: true,
    metricColumns: 2,
  },
  {
    viewport: { width: 1280, height: 720 },
    labels: ['资金结算概况', '供应链风险告警', '外部承运审计'],
    accessibleNames: ['资金结算概况', '供应链风险告警', '外部承运审计'],
    panelText: ['采购总计单量', '高风险供应商', '本季度外部承运审计已完成，待整改事项 3 项。'],
    periodVisible: true,
    metricColumns: 4,
  },
] as const;

function componentTitlePattern(name: string): RegExp {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escapedName}$`);
}

async function hasRenderedDemo(page: Page): Promise<boolean> {
  return page.locator('.dumi-default-previewer').evaluateAll((previewers) =>
    previewers.some((previewer) => {
      const demo = previewer.querySelector('.dumi-default-previewer-demo');
      if (!demo || demo.hasAttribute('data-loading') || demo.hasAttribute('data-error'))
        return false;

      return Array.from(demo.querySelectorAll('*')).some((element) => {
        const box = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return (
          box.width > 0 &&
          box.height > 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden'
        );
      });
    }),
  );
}

async function expectNoRootHorizontalOverflow(
  page: Page,
  viewport: { width: number; height: number },
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
      {
        message: `${viewport.width}×${viewport.height} 视口下文档根节点发生横向溢出`,
        timeout: 1_500,
      },
    )
    .toBeLessThanOrEqual(0);
}

async function expectTabTextVisible(tab: Locator, label: string): Promise<void> {
  await expect(tab.getByText(label, { exact: true }).filter({ visible: true })).toHaveCount(1);

  const geometry = await tab.evaluate((element, expectedLabel) => {
    type Bounds = { left: number; top: number; right: number; bottom: number };
    type Clip = Bounds & { name: string; clipsX: boolean; clipsY: boolean };

    const textFragments: Array<{ bounds: Bounds; clips: Clip[] }> = [];
    let matchingTextNodeCount = 0;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeValue !== expectedLabel) continue;
      matchingTextNodeCount += 1;

      // 从精确匹配的标签文本节点向上检查，覆盖标签 wrapper、tab 与 nav-wrap 的裁切。
      const clips: Clip[] = [];
      for (let ancestor = node.parentElement; ancestor; ancestor = ancestor.parentElement) {
        const style = window.getComputedStyle(ancestor);
        const clipsX = style.overflowX !== 'visible';
        const clipsY = style.overflowY !== 'visible';
        if (!clipsX && !clipsY) continue;

        const rect = ancestor.getBoundingClientRect();
        const left = rect.left + ancestor.clientLeft;
        const top = rect.top + ancestor.clientTop;
        clips.push({
          name: `${ancestor.tagName.toLowerCase()}.${String(ancestor.className)}`,
          left,
          top,
          right: left + ancestor.clientWidth,
          bottom: top + ancestor.clientHeight,
          clipsX,
          clipsY,
        });
      }
      clips.push({
        name: 'viewport',
        left: 0,
        top: 0,
        right: document.documentElement.clientWidth,
        bottom: window.innerHeight,
        clipsX: true,
        clipsY: true,
      });

      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (rect.width > 0 && rect.height > 0) {
          textFragments.push({
            bounds: {
              left: rect.left,
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom,
            },
            clips,
          });
        }
      }
    }

    const clippedText = textFragments.flatMap(({ bounds, clips }) =>
      clips
        .filter(
          (clip) =>
            (clip.clipsX && (bounds.left < clip.left - 0.5 || bounds.right > clip.right + 0.5)) ||
            (clip.clipsY && (bounds.top < clip.top - 0.5 || bounds.bottom > clip.bottom + 0.5)),
        )
        .map((clip) => ({ clip: clip.name, textRect: bounds })),
    );

    return { matchingTextNodeCount, textFragmentCount: textFragments.length, clippedText };
  }, label);

  expect(geometry.matchingTextNodeCount, `${label} 没有精确匹配的文本节点`).toBeGreaterThan(0);
  expect(geometry.textFragmentCount, `${label} 没有可测量的文本片段`).toBeGreaterThan(0);
  expect(geometry.clippedText, `${label} 的文本片段超出可视裁切边界`).toEqual([]);
}

async function textLineCount(target: Locator, expectedText: string): Promise<number> {
  return target.evaluate((element, text) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const tops: number[] = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeValue?.trim() !== text) continue;

      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (rect.width <= 0 || rect.height <= 0) continue;
        if (!tops.some((top) => Math.abs(top - rect.top) <= 1)) tops.push(rect.top);
      }
    }
    return tops.length;
  }, expectedText);
}

async function selectThemeOptionByKeyboard(select: Locator, arrowDownCount: number): Promise<void> {
  await select.focus();
  await select.press('Enter');
  await expect(select).toHaveAttribute('aria-expanded', 'true');

  for (let index = 0; index < arrowDownCount; index += 1) {
    await select.press('ArrowDown');
  }
  await select.press('Enter');
  await expect(select).toHaveAttribute('aria-expanded', 'false');
}

async function cardThemeState(card: Locator) {
  return card.evaluate((element) => {
    const provider = element.closest<HTMLElement>('[data-lx-appearance]');
    if (!provider) return null;
    return {
      appearance: provider.getAttribute('data-lx-appearance'),
      mode: provider.getAttribute('data-lx-mode'),
      density: provider.getAttribute('data-lx-density'),
      color: provider.getAttribute('data-lx-color'),
      panelRadius: window.getComputedStyle(provider).getPropertyValue('--lx-radius-panel').trim(),
    };
  });
}

test('验收清单固定映射 32 个公开路由和 3 个根节点溢出视口', () => {
  expect(browserComponentRoutes.map(({ name, path }) => ({ name, path }))).toEqual(
    expectedBrowserRouteIdentities,
  );
  expect(browserComponentRoutes).toHaveLength(expectedBrowserRouteIdentities.length);
  expect(rootOverflowViewports).toEqual([
    { width: 930, height: 720 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]);
});

test('浏览器错误排空会捕获静默期前完成的延迟错误响应与失败请求', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.route('**/late-error-resource.txt', async (route) => {
    await new Promise<void>((resolve) => setTimeout(resolve, 1_200));
    await route.fulfill({ status: 404, contentType: 'text/plain', body: 'missing' });
  });
  await page.route('**/failed-resource.txt', (route) => route.abort());
  await page.goto('/');
  await page.evaluate(() => {
    void fetch('/late-error-resource.txt');
    void fetch('/failed-resource.txt').catch(() => undefined);
  });

  await expect
    .poll(() =>
      [...browserHealth.activeRequests].some((request) =>
        request.url().endsWith('/late-error-resource.txt'),
      ),
    )
    .toBe(true);
  await waitForBrowserQuiescence(page, browserHealth);

  expect(
    browserHealth.errors.some(
      (error) => error.startsWith('HTTP 404: ') && error.endsWith('/late-error-resource.txt'),
    ),
  ).toBe(true);
  expect(
    browserHealth.errors.some(
      (error) => error.startsWith('requestfailed: ') && error.includes('/failed-resource.txt'),
    ),
  ).toBe(true);
});

for (const component of browserComponentRoutes) {
  test(`${component.name}：页面标题、H1、真实 demo、三视口根节点溢出与浏览器错误`, async ({
    page,
  }) => {
    const browserHealth = collectBrowserErrors(page);
    await page.goto(`${component.path}/`);

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(componentTitlePattern(component.expectedHeading));
    await expect(page).toHaveTitle(componentTitlePattern(component.expectedTitle));
    await expect
      .poll(() => hasRenderedDemo(page), {
        message: `${component.name} 页面没有加载出可见的 Dumi 运行示例`,
      })
      .toBe(true);

    for (const viewport of rootOverflowViewports) {
      await expectNoRootHorizontalOverflow(page, viewport);
    }

    if (component.name === 'Card') {
      const cardDemo = page.getByTestId('card-demo-frame');
      const cardRegion = cardDemo.getByRole('region', { name: '运营指标概览' });
      const controls = cardDemo.getByRole('group', { name: '卡片加载演示' });
      const periodHeader = cardDemo.getByTestId('card-period-header');
      const tabs = cardDemo.getByRole('tab');
      const bodyTexts = [
        '采购总计单量',
        '高风险供应商',
        '本季度外部承运审计已完成，待整改事项 3 项。',
      ] as const;
      const expectActiveTabAndBody = async (index: 0 | 1 | 2) => {
        const activeTab = tabs.nth(index);
        await expect(activeTab).toHaveAttribute('aria-selected', 'true');
        const panel = cardDemo.getByRole('tabpanel');
        await expect(panel).toBeVisible();
        await expect(panel).toContainText(bodyTexts[index]);
        const tabId = await activeTab.getAttribute('id');
        const panelId = await panel.getAttribute('id');
        expect(tabId).toBeTruthy();
        expect(panelId).toBeTruthy();
        await expect(activeTab).toHaveAttribute('aria-controls', panelId ?? '');
        await expect(panel).toHaveAttribute('aria-labelledby', tabId ?? '');
        await expect(cardDemo.locator(`[id="${panelId}"]`)).toHaveAttribute('role', 'tabpanel');
      };

      await page.setViewportSize({ width: 320, height: 740 });
      await expectNoRootHorizontalOverflow(page, { width: 320, height: 740 });
      const basicHeading = page.getByRole('heading', { name: '基础用法', exact: true });
      await expect(basicHeading).toBeVisible();
      expect(await textLineCount(basicHeading, '基础用法')).toBe(1);
      const basicDemo = page.getByTestId('card-basic-demo');
      await expect(basicDemo).toBeVisible();
      const basicCard = basicDemo.getByTestId('card-basic-card');
      const basicCardBox = await basicCard.boundingBox();
      const basicTitle = basicDemo.getByText('采购协议', { exact: true });
      const contractField = basicDemo.getByTestId('card-contract-field');
      const organizationField = basicDemo.getByTestId('card-organization-field');
      const contractNumber = contractField.locator('code');
      const [titleBox, contractBox, organizationBox, numberBox] = await Promise.all([
        basicTitle.boundingBox(),
        contractField.boundingBox(),
        organizationField.boundingBox(),
        contractNumber.boundingBox(),
      ]);
      expect(basicCardBox).not.toBeNull();
      expect(titleBox).not.toBeNull();
      expect(contractBox).not.toBeNull();
      expect(organizationBox).not.toBeNull();
      expect(numberBox).not.toBeNull();
      const contractFieldColumns = await contractField.evaluate(
        (element) =>
          window.getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
      );
      expect(contractFieldColumns).toBe(1);
      expect(await textLineCount(basicTitle, '采购协议')).toBe(1);
      expect(await textLineCount(contractNumber, 'CTR-2024-89941')).toBe(1);
      expect(contractBox!.y + contractBox!.height).toBeLessThanOrEqual(organizationBox!.y + 1);
      expect(numberBox!.x).toBeGreaterThanOrEqual(basicCardBox!.x);
      expect(numberBox!.x + numberBox!.width).toBeLessThanOrEqual(
        basicCardBox!.x + basicCardBox!.width,
      );

      await expect(tabs).toHaveCount(3);
      await expectActiveTabAndBody(0);
      for (const {
        viewport,
        labels,
        accessibleNames,
        panelText,
        periodVisible,
        metricColumns,
      } of cardTabViewports) {
        await page.setViewportSize(viewport);
        await expectNoRootHorizontalOverflow(page, viewport);
        await expect(cardRegion).toBeVisible();
        await tabs.nth(0).click();
        await expectActiveTabAndBody(0);
        const periodContent = cardDemo.getByRole('tabpanel').getByTestId('card-period-content');
        if (periodVisible) {
          await expect(periodHeader).toContainText('近 30 天');
          await expect(periodHeader).toBeVisible();
          await expect(periodContent).toBeHidden();
        } else {
          await expect(periodHeader).toBeHidden();
          await expect(periodContent).toContainText('近 30 天');
          await expect(periodContent).toBeVisible();
        }

        const metricGrid = cardDemo.getByTestId('card-metric-grid');
        const metricLayout = await metricGrid.evaluate((element) => ({
          columns: window.getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
          cells: Array.from(element.children).map((cell) => ({
            clientWidth: cell.clientWidth,
            scrollWidth: cell.scrollWidth,
          })),
        }));
        expect(metricLayout.columns).toBe(metricColumns);
        expect(metricLayout.cells).toHaveLength(4);
        for (const cell of metricLayout.cells) {
          expect(cell.scrollWidth).toBeLessThanOrEqual(cell.clientWidth + 1);
        }

        const card = cardDemo.getByTestId('card-demo');
        const cardBox = await card.evaluate((element) => element.getBoundingClientRect());
        const controlsBox = await controls.evaluate((element) => element.getBoundingClientRect());
        const frameBox = await cardDemo.evaluate((element) => element.getBoundingClientRect());
        expect(controlsBox.bottom).toBeLessThanOrEqual(cardBox.top + 1);
        expect(cardBox.left).toBeGreaterThanOrEqual(frameBox.left);
        expect(cardBox.right).toBeLessThanOrEqual(frameBox.right);
        expect(
          Math.abs((cardBox.left + cardBox.right - frameBox.left - frameBox.right) / 2),
        ).toBeLessThanOrEqual(1);
        await card.evaluate((element) => element.scrollIntoView({ block: 'center' }));

        for (let index = 0; index < labels.length; index += 1) {
          await expect(tabs.nth(index)).toHaveAccessibleName(accessibleNames[index]);
          await expectTabTextVisible(tabs.nth(index), labels[index]);
        }

        for (let index = 0; index < labels.length; index += 1) {
          const tab = tabs.nth(index);
          await tab.click();
          await expectActiveTabAndBody(index as 0 | 1 | 2);
          await expect(cardDemo.getByText(panelText[index], { exact: true })).toBeVisible();
          const expectedPeriod = index === 2 ? '本季度' : '近 30 天';
          await expect(periodHeader).toContainText(expectedPeriod);
          await expect(periodContent).toContainText(expectedPeriod);
        }
      }

      await tabs.nth(0).click();
      await expectActiveTabAndBody(0);
      await page.keyboard.press('ArrowRight');
      await expect(tabs.nth(1)).toBeFocused();
      await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'false');
      await expect(cardDemo.getByRole('tabpanel')).toContainText(bodyTexts[0]);
      await page.keyboard.press('ArrowLeft');
      await expect(tabs.nth(0)).toBeFocused();
      await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'false');
      await expect(cardDemo.getByRole('tabpanel')).toContainText(bodyTexts[0]);
      await page.keyboard.press('ArrowRight');
      await expect(tabs.nth(1)).toBeFocused();
      await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'false');
      await page.keyboard.press('Enter');
      await expectActiveTabAndBody(1);
      await expect(tabs.nth(1)).toBeFocused();
      await page.keyboard.press('ArrowLeft');
      await expect(tabs.nth(0)).toBeFocused();
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
      await expect(cardDemo.getByRole('tabpanel')).toContainText(bodyTexts[1]);
      await page.keyboard.press('Enter');
      await expectActiveTabAndBody(0);
      await expect(tabs.nth(0)).toBeFocused();
      await page.keyboard.press('ArrowRight');
      await expect(tabs.nth(1)).toBeFocused();
      await page.keyboard.press('Space');
      await expectActiveTabAndBody(1);
      await expect(tabs.nth(1)).toBeFocused();

      const status = cardDemo.getByRole('status');
      const loadingButton = cardDemo.getByRole('button', { name: '显示加载', exact: true });
      const completeButton = cardDemo.getByRole('button', { name: '完成加载', exact: true });
      const card = cardDemo.getByTestId('card-demo');
      await expect(status).toHaveText('运营指标已加载');
      await expect(card).toHaveAttribute('aria-busy', 'false');
      await loadingButton.focus();
      await page.keyboard.press('Enter');
      await expect(loadingButton).toBeDisabled();
      await expect(completeButton).toBeFocused();
      await expect(status).toHaveText('运营指标加载中');
      await expect(card).toHaveAttribute('aria-busy', 'true');
      await expect(completeButton).toBeEnabled();
      await expect(cardDemo.getByRole('tabpanel')).toHaveCount(0);
      await expect(cardDemo.getByText(bodyTexts[1], { exact: true })).toHaveCount(0);
      const loadingCardBounds = await card.boundingBox();
      expect(loadingCardBounds).not.toBeNull();
      expect(loadingCardBounds!.width).toBeGreaterThan(0);
      expect(loadingCardBounds!.height).toBeGreaterThan(0);

      await completeButton.focus();
      await page.keyboard.press('Enter');
      await expect(loadingButton).toBeFocused();
      await expect(completeButton).toBeDisabled();
      await expect(status).toHaveText('运营指标已加载');
      await expect(card).toHaveAttribute('aria-busy', 'false');
      await expectActiveTabAndBody(1);

      const cardStatesDemo = page.getByTestId('card-states-demo');
      const supplierStateGroup = cardStatesDemo.getByRole('group', {
        name: '供应商资料状态',
      });
      await expect(supplierStateGroup.getByRole('radio', { name: '暂无数据' })).toBeChecked();
      await expect(cardStatesDemo.getByText('暂无供应商资料', { exact: true })).toBeVisible();
      await expect(cardStatesDemo.getByRole('status')).toHaveText('当前状态：暂无数据');
      const supplierRecoveryTitle = cardStatesDemo.getByRole('heading', {
        name: '供应商档案：华东精密制造有限公司',
        level: 4,
      });
      const addSupplierButton = cardStatesDemo.getByRole('button', {
        name: '添加供应商',
        exact: true,
      });
      await addSupplierButton.focus();
      await page.keyboard.press('Enter');
      await expect(supplierRecoveryTitle).toBeFocused();
      await expect(cardStatesDemo.getByText('供应商档案：华东精密制造有限公司')).toBeVisible();
      await expect(cardStatesDemo.getByRole('status')).toHaveText('当前状态：供应商资料已恢复');

      await supplierStateGroup.getByText('加载失败', { exact: true }).click();
      await expect(cardStatesDemo.getByRole('alert')).toContainText('供应商资料加载失败');
      await expect(cardStatesDemo.getByRole('status')).toHaveText('当前状态：加载失败，可重试');
      await page.setViewportSize({ width: 320, height: 740 });
      await expectNoRootHorizontalOverflow(page, { width: 320, height: 740 });
      await expect(cardStatesDemo.getByTestId('card-state-card')).toBeVisible();
      const errorCard = cardStatesDemo.getByTestId('card-state-card');
      const errorDescription = cardStatesDemo.getByText('检查连接后重试。', { exact: true });
      const retryButton = cardStatesDemo.getByRole('button', { name: '重试', exact: true });
      const [errorCardBox, errorDescriptionBox, retryBox] = await Promise.all([
        errorCard.boundingBox(),
        errorDescription.boundingBox(),
        retryButton.boundingBox(),
      ]);
      expect(errorCardBox).not.toBeNull();
      expect(errorDescriptionBox).not.toBeNull();
      expect(retryBox).not.toBeNull();
      expect(retryBox!.y).toBeGreaterThanOrEqual(
        errorDescriptionBox!.y + errorDescriptionBox!.height,
      );
      expect(retryBox!.x).toBeGreaterThanOrEqual(errorCardBox!.x);
      expect(retryBox!.x + retryBox!.width).toBeLessThanOrEqual(
        errorCardBox!.x + errorCardBox!.width,
      );
      expect(retryBox!.y + retryBox!.height).toBeLessThanOrEqual(
        errorCardBox!.y + errorCardBox!.height,
      );
      await retryButton.focus();
      await page.keyboard.press('Enter');
      await expect(supplierRecoveryTitle).toBeFocused();
      await expect(cardStatesDemo.getByText('供应商档案：华东精密制造有限公司')).toBeVisible();
      await expect(cardStatesDemo.getByRole('status')).toHaveText('当前状态：供应商资料已恢复');

      const appearanceDemo = page.getByTestId('card-appearance-demo');
      const appearanceGrid = appearanceDemo.getByTestId('card-appearance-grid');
      const appearanceCards = ['business', 'soft', 'glass'].map((appearance) =>
        appearanceDemo.getByTestId(`card-appearance-${appearance}`),
      );
      for (const [width, expectedColumns] of [
        [320, 1],
        [390, 1],
        [930, 2],
        [1280, 3],
      ] as const) {
        await page.setViewportSize({ width, height: 844 });
        await expectNoRootHorizontalOverflow(page, { width, height: 844 });
        const columns = await appearanceGrid.evaluate(
          (element) =>
            window.getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
        );
        expect(columns, `${width}px 下外观卡片列数`).toBe(expectedColumns);
        const gridBox = await appearanceGrid.boundingBox();
        const cardBoxes = await Promise.all(appearanceCards.map((card) => card.boundingBox()));
        expect(gridBox).not.toBeNull();
        for (const cardBox of cardBoxes) {
          expect(cardBox).not.toBeNull();
          expect(cardBox!.x).toBeGreaterThanOrEqual(gridBox!.x);
          expect(cardBox!.x + cardBox!.width).toBeLessThanOrEqual(gridBox!.x + gridBox!.width);
        }
      }

      const appearanceLabels = ['business', 'soft', 'glass'] as const;
      const panelRadii = ['4px', '8px', '12px'] as const;
      const readAppearanceStates = () => Promise.all(appearanceCards.map(cardThemeState));
      const appearanceUseCases = [
        '适合财务与运营后台',
        '适合轻量分组与运营工作台',
        '适合有内容底图的展示面板',
      ] as const;
      for (const [index, card] of appearanceCards.entries()) {
        await expect(card).toContainText(appearanceUseCases[index]);
        await expect(card).toContainText('12 笔待复核');
        await expect(card).toContainText('预警金额 ¥284,600');
      }

      const glassBackdrop = appearanceDemo.getByTestId('card-appearance-glass-backdrop');
      const glassCard = appearanceDemo.getByTestId('card-appearance-glass');
      await expect(glassBackdrop).toHaveCount(1);
      await expect(glassBackdrop).toHaveAttribute('aria-hidden', 'true');
      const glassEnhancementSupported = await page.evaluate(
        () =>
          CSS.supports('backdrop-filter', 'blur(1px)') &&
          CSS.supports('background', 'color-mix(in srgb, #ffffff 85%, transparent)'),
      );
      const readGlassBackdropTheme = () =>
        glassBackdrop.evaluate((element) => {
          const provider = element.closest<HTMLElement>('[data-lx-appearance]');
          if (!provider) return null;
          const styles = window.getComputedStyle(provider);
          return {
            appearance: provider.getAttribute('data-lx-appearance'),
            mode: provider.getAttribute('data-lx-mode'),
            opacity: styles.getPropertyValue('--lx-panel-glass-opacity').trim(),
            surface: styles.getPropertyValue('--lx-panel-surface').trim(),
            surfaceBase: styles.getPropertyValue('--lx-panel-surface-base').trim(),
            backdropFilter: styles.getPropertyValue('--lx-panel-backdrop-filter').trim(),
          };
        });
      const readCardSurface = (card: Locator) =>
        card.evaluate((element) => {
          const styles = window.getComputedStyle(element);
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) return null;

          const readColor = (color: string) => {
            context.clearRect(0, 0, 1, 1);
            context.fillStyle = color;
            context.fillRect(0, 0, 1, 1);
            const { data } = context.getImageData(0, 0, 1, 1);
            return [data[0], data[1], data[2], data[3]];
          };

          return {
            backgroundColor: readColor(styles.backgroundColor),
            baseSurface: readColor(styles.getPropertyValue('--lx-panel-surface-base').trim()),
            backdropFilter: styles.getPropertyValue('backdrop-filter').trim() || 'none',
          };
        });
      const glassBackdropTheme = await readGlassBackdropTheme();
      expect(glassBackdropTheme).toMatchObject({
        appearance: 'glass',
        mode: 'light',
        opacity: '85%',
      });
      expect(glassBackdropTheme?.backdropFilter).toBe(
        glassEnhancementSupported ? 'blur(16px)' : 'none',
      );
      const glassCardSurface = await readCardSurface(glassCard);
      expect(glassCardSurface).not.toBeNull();
      if (glassEnhancementSupported) {
        expect(glassCardSurface!.backgroundColor[3] / 255).toBeCloseTo(0.85, 2);
      } else {
        expect(glassBackdropTheme?.surface).toBe(glassBackdropTheme?.surfaceBase);
        expect(glassCardSurface!.backgroundColor).toEqual(glassCardSurface!.baseSurface);
      }
      expect(glassCardSurface!.backdropFilter).toBe(
        glassEnhancementSupported ? 'blur(16px)' : 'none',
      );

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect.poll(async () => (await readGlassBackdropTheme())?.backdropFilter).toBe('none');
      const reducedMotionGlassSurface = await readCardSurface(glassCard);
      expect(reducedMotionGlassSurface).not.toBeNull();
      expect(reducedMotionGlassSurface!.backgroundColor).toEqual(
        reducedMotionGlassSurface!.baseSurface,
      );
      expect(reducedMotionGlassSurface!.backdropFilter).toBe('none');
      await page.emulateMedia({ reducedMotion: 'no-preference' });

      let appearanceStates = await readAppearanceStates();
      expect(appearanceStates.map((state) => state?.appearance)).toEqual(appearanceLabels);
      expect(appearanceStates.map((state) => state?.panelRadius)).toEqual(panelRadii);
      const themeSettings = appearanceDemo.locator('details');
      await appearanceDemo.getByText('主题设置', { exact: true }).click();
      await expect(themeSettings.getByRole('radio')).toHaveCount(0);

      await themeSettings.getByRole('switch', { name: '暗色模式', exact: true }).click();
      await expect.poll(readAppearanceStates).toEqual(
        appearanceLabels.map((appearance, index) => ({
          appearance,
          mode: 'dark',
          density: 'comfortable',
          color: 'blue',
          panelRadius: panelRadii[index],
        })),
      );
      await expect
        .poll(() =>
          glassBackdrop.evaluate((element) =>
            element.closest<HTMLElement>('[data-lx-appearance]')?.getAttribute('data-lx-mode'),
          ),
        )
        .toBe('dark');

      await themeSettings.getByRole('switch', { name: '紧凑密度', exact: true }).click();
      await expect.poll(readAppearanceStates).toEqual(
        appearanceLabels.map((appearance, index) => ({
          appearance,
          mode: 'dark',
          density: 'compact',
          color: 'blue',
          panelRadius: panelRadii[index],
        })),
      );

      const brandSelect = themeSettings.getByRole('combobox', { name: '品牌色', exact: true });
      await selectThemeOptionByKeyboard(brandSelect, 1);
      await expect.poll(readAppearanceStates).toEqual(
        appearanceLabels.map((appearance, index) => ({
          appearance,
          mode: 'dark',
          density: 'compact',
          color: 'orange',
          panelRadius: panelRadii[index],
        })),
      );

      const paletteSelect = themeSettings.getByRole('combobox', {
        name: '东方配色',
        exact: true,
      });
      await selectThemeOptionByKeyboard(paletteSelect, 4);
      await expect.poll(readAppearanceStates).toEqual(
        appearanceLabels.map((appearance, index) => ({
          appearance,
          mode: 'dark',
          density: 'compact',
          color: 'pine-amber',
          panelRadius: panelRadii[index],
        })),
      );

      await selectThemeOptionByKeyboard(brandSelect, 1);
      appearanceStates = await readAppearanceStates();
      expect(appearanceStates).toEqual(
        appearanceLabels.map((appearance, index) => ({
          appearance,
          mode: 'dark',
          density: 'compact',
          color: 'green',
          panelRadius: panelRadii[index],
        })),
      );

      const apiRegion = page.getByRole('region', { name: 'Card API 参数表', exact: true });
      const apiTable = apiRegion.getByRole('table');
      const apiHint = page.locator('#card-docs-table-hint');
      await page.setViewportSize({ width: 320, height: 844 });
      await expectNoRootHorizontalOverflow(page, { width: 320, height: 844 });
      await expect(apiRegion).toHaveAttribute('tabindex', '0');
      await expect(apiHint).toBeVisible();
      await expect(apiRegion).toHaveAttribute('aria-describedby', 'card-docs-table-hint');
      await expect(apiTable).toBeVisible();
      await apiRegion.evaluate((element) => {
        element.scrollLeft = 0;
      });
      await apiRegion.focus();
      await page.keyboard.press('ArrowRight');
      await expect
        .poll(() => apiRegion.evaluate((element) => element.scrollLeft))
        .toBeGreaterThan(0);
      await page.keyboard.press('ArrowLeft');
      await expect.poll(() => apiRegion.evaluate((element) => element.scrollLeft)).toBe(0);
      const apiIdentifierLines = await apiTable
        .locator('tbody tr td:first-child code')
        .evaluateAll((identifiers) =>
          identifiers.map((identifier) => {
            const range = document.createRange();
            range.selectNodeContents(identifier);
            return Array.from(range.getClientRects()).filter(
              (rect) => rect.width > 0 && rect.height > 0,
            ).length;
          }),
        );
      expect(apiIdentifierLines.length).toBeGreaterThan(0);
      expect(apiIdentifierLines).toEqual(apiIdentifierLines.map(() => 1));
    }

    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  });
}

test('Card：中间视口标签、周期位置与指标列几何', async ({ page }) => {
  const fullLabels = ['资金结算概况', '供应链风险告警', '外部承运审计'] as const;
  const compactLabels = ['结算概况', '供应风险', '承运审计'] as const;
  const ultraCompactLabels = ['结算', '风控', '审计'] as const;
  const viewports = [
    {
      viewport: { width: 320, height: 844 },
      cardWidth: 190,
      cardContentWidth: 188,
      compactTabs: true,
      ultraCompactTabs: true,
      periodHeaderVisible: false,
      metricColumns: 1,
    },
    {
      viewport: { width: 330, height: 844 },
      cardWidth: 200,
      compactTabs: true,
      ultraCompactTabs: true,
      periodHeaderVisible: false,
      metricColumns: 1,
    },
    {
      viewport: { width: 331, height: 844 },
      cardWidth: 201,
      compactTabs: true,
      ultraCompactTabs: true,
      periodHeaderVisible: false,
      metricColumns: 1,
    },
    {
      viewport: { width: 342, height: 844 },
      cardWidth: 212,
      compactTabs: true,
      ultraCompactTabs: true,
      periodHeaderVisible: false,
      metricColumns: 1,
    },
    {
      viewport: { width: 343, height: 844 },
      cardWidth: 213,
      compactTabs: true,
      ultraCompactTabs: true,
      periodHeaderVisible: false,
      metricColumns: 1,
    },
    {
      viewport: { width: 344, height: 844 },
      cardWidth: 214,
      cardContentWidth: 212,
      compactTabs: true,
      ultraCompactTabs: true,
      labelFontSize: '14px',
      periodHeaderVisible: false,
      metricColumns: 1,
    },
    {
      viewport: { width: 345, height: 844 },
      cardWidth: 215,
      cardContentWidth: 213,
      compactTabs: true,
      ultraCompactTabs: true,
      labelFontSize: '14px',
      periodHeaderVisible: false,
      metricColumns: 1,
    },
    {
      viewport: { width: 346, height: 844 },
      cardWidth: 216,
      cardContentWidth: 214,
      compactTabs: true,
      ultraCompactTabs: true,
      labelFontSize: '14px',
      periodHeaderVisible: false,
      metricColumns: 1,
    },
    {
      viewport: { width: 347, height: 844 },
      cardWidth: 217,
      cardContentWidth: 215,
      compactTabs: true,
      ultraCompactTabs: true,
      labelFontSize: '14px',
      periodHeaderVisible: false,
      metricColumns: 1,
    },
    {
      viewport: { width: 348, height: 844 },
      cardWidth: 218,
      cardContentWidth: 216,
      compactTabs: true,
      ultraCompactTabs: false,
      labelFontSize: '14px',
      periodHeaderVisible: false,
      metricColumns: 1,
    },
    {
      viewport: { width: 414, height: 844 },
      cardWidth: 284,
      compactTabs: true,
      ultraCompactTabs: false,
      periodHeaderVisible: false,
      metricColumns: 1,
    },
    {
      viewport: { width: 480, height: 844 },
      cardWidth: 350,
      compactTabs: false,
      periodHeaderVisible: false,
      metricColumns: 1,
    },
    {
      viewport: { width: 560, height: 844 },
      cardWidth: 430,
      compactTabs: false,
      periodHeaderVisible: false,
      metricColumns: 2,
    },
    {
      viewport: { width: 594, height: 844 },
      cardWidth: 464,
      compactTabs: false,
      periodHeaderVisible: false,
      metricColumns: 2,
    },
    {
      viewport: { width: 595, height: 844 },
      cardWidth: 465,
      compactTabs: false,
      periodHeaderVisible: false,
      metricColumns: 2,
    },
    {
      viewport: { width: 596, height: 844 },
      cardWidth: 466,
      compactTabs: false,
      periodHeaderVisible: false,
      metricColumns: 2,
    },
    {
      viewport: { width: 597, height: 844 },
      cardWidth: 467,
      compactTabs: false,
      periodHeaderVisible: true,
      metricColumns: 2,
    },
    {
      viewport: { width: 600, height: 844 },
      cardWidth: 470,
      compactTabs: false,
      periodHeaderVisible: true,
      metricColumns: 2,
    },
    {
      viewport: { width: 640, height: 844 },
      cardWidth: 510,
      compactTabs: false,
      periodHeaderVisible: true,
      metricColumns: 2,
    },
  ] as const;

  await page.goto('/components/data-display/card/');
  await expect
    .poll(() => hasRenderedDemo(page), {
      message: 'Card 页面没有加载出可见的 Dumi 运行示例',
    })
    .toBe(true);

  const cardDemo = page.getByTestId('card-demo');
  const tabs = cardDemo.getByRole('tab');
  const periodHeader = cardDemo.getByTestId('card-period-header');

  await expect(tabs).toHaveCount(3);

  for (const expected of viewports) {
    await expectNoRootHorizontalOverflow(page, expected.viewport);
    await cardDemo.evaluate((element) => element.scrollIntoView({ block: 'center' }));

    const cardBounds = await cardDemo.boundingBox();
    expect(cardBounds).not.toBeNull();
    expect(Math.abs(cardBounds!.width - expected.cardWidth)).toBeLessThanOrEqual(1);
    if ('cardContentWidth' in expected) {
      const cardContentWidth = await cardDemo.evaluate((element) => {
        const styles = window.getComputedStyle(element);
        const pixels = (value: string) => Number.parseFloat(value) || 0;
        return (
          element.getBoundingClientRect().width -
          pixels(styles.borderInlineStartWidth) -
          pixels(styles.borderInlineEndWidth) -
          pixels(styles.paddingInlineStart) -
          pixels(styles.paddingInlineEnd)
        );
      });
      expect(Math.abs(cardContentWidth - expected.cardContentWidth)).toBeLessThanOrEqual(1);
    }

    const ultraCompactTabs = 'ultraCompactTabs' in expected && expected.ultraCompactTabs;
    const labels = expected.compactTabs
      ? ultraCompactTabs
        ? ultraCompactLabels
        : compactLabels
      : fullLabels;
    for (let index = 0; index < fullLabels.length; index += 1) {
      const tab = tabs.nth(index);
      await expect(tab).toHaveAccessibleName(fullLabels[index]);
      await expectTabTextVisible(tab, labels[index]);
      const compactLabelVisible = await tab
        .getByText(compactLabels[index], { exact: true })
        .isVisible();
      const ultraCompactLabelVisible = await tab
        .getByText(ultraCompactLabels[index], { exact: true })
        .isVisible();
      expect([compactLabelVisible, ultraCompactLabelVisible]).toEqual(
        expected.compactTabs ? (ultraCompactTabs ? [false, true] : [true, false]) : [false, false],
      );
      if ('labelFontSize' in expected) {
        const visibleLabel = ultraCompactTabs
          ? tab.getByTestId('card-ultra-compact-tab-label')
          : tab.getByText(labels[index], { exact: true });
        const fontSize = await visibleLabel.evaluate(
          (element) => window.getComputedStyle(element).fontSize,
        );
        expect(fontSize).toBe(expected.labelFontSize);
      }
      if (ultraCompactTabs) {
        const tabBounds = await tab.boundingBox();
        expect(tabBounds).not.toBeNull();
        expect(tabBounds!.width).toBeGreaterThanOrEqual(44);
        expect(tabBounds!.height).toBeGreaterThanOrEqual(44);
      }
    }

    if (ultraCompactTabs) {
      const navigationGeometry = await tabs.first().evaluate((element) => {
        const tabItem = element.parentElement;
        const tabList = tabItem?.parentElement;
        const navWrap = tabList?.parentElement;
        if (!tabItem || !tabList || !navWrap) return null;
        const roleTabs = Array.from(tabList.querySelectorAll<HTMLElement>('[role="tab"]'));
        const firstTab = roleTabs[0]?.getBoundingClientRect();
        const lastTab = roleTabs[roleTabs.length - 1]?.getBoundingClientRect();
        const navBounds = navWrap.getBoundingClientRect();
        if (!firstTab || !lastTab) return null;
        return {
          navWidth: navWrap.clientWidth,
          listScrollWidth: tabList.scrollWidth,
          firstTabLeft: firstTab.left,
          lastTabRight: lastTab.right,
          navLeft: navBounds.left,
          navRight: navBounds.right,
        };
      });
      expect(navigationGeometry).not.toBeNull();
      expect(navigationGeometry!.listScrollWidth).toBeLessThanOrEqual(navigationGeometry!.navWidth);
      expect(navigationGeometry!.firstTabLeft).toBeGreaterThanOrEqual(
        navigationGeometry!.navLeft - 1,
      );
      expect(navigationGeometry!.lastTabRight).toBeLessThanOrEqual(
        navigationGeometry!.navRight + 1,
      );
    }

    const panel = cardDemo.getByRole('tabpanel');
    const periodContent = panel.getByTestId('card-period-content');
    if (expected.periodHeaderVisible) {
      await expect(periodHeader).toBeVisible();
      await expect(periodHeader).toContainText('近 30 天');
      await expect(periodContent).toBeHidden();

      const [lastTabBounds, periodBounds] = await Promise.all([
        tabs.nth(2).boundingBox(),
        periodHeader.boundingBox(),
      ]);
      expect(lastTabBounds).not.toBeNull();
      expect(periodBounds).not.toBeNull();
      expect(periodBounds!.x).toBeGreaterThanOrEqual(lastTabBounds!.x + lastTabBounds!.width + 8);
    } else {
      await expect(periodHeader).toBeHidden();
      await expect(periodContent).toBeVisible();
      await expect(periodContent).toContainText('近 30 天');

      const [periodBounds, metricBounds] = await Promise.all([
        periodContent.boundingBox(),
        cardDemo.getByTestId('card-metric-grid').boundingBox(),
      ]);
      expect(periodBounds).not.toBeNull();
      expect(metricBounds).not.toBeNull();
      expect(periodBounds!.y + periodBounds!.height).toBeLessThanOrEqual(metricBounds!.y + 1);
    }

    const metricColumns = await cardDemo
      .getByTestId('card-metric-grid')
      .evaluate(
        (element) =>
          window.getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
      );
    expect(metricColumns).toBe(expected.metricColumns);
  }
});

test('Card：粗指针下所有标签命中框均至少 44px 且上下边缘可激活', async ({ browser }) => {
  const previewPort = process.env.PLAYWRIGHT_CARD_PORT ?? '8022';
  const context = await browser.newContext({
    baseURL: `http://127.0.0.1:${previewPort}`,
    hasTouch: true,
    isMobile: true,
    viewport: { width: 348, height: 844 },
  });
  const page = await context.newPage();

  try {
    await page.goto('/components/data-display/card/');
    const cardDemo = page.getByTestId('card-demo');
    await expect(cardDemo).toBeVisible();
    await cardDemo.evaluate((element) => element.scrollIntoView({ block: 'center' }));

    for (const [width, targetIndex] of [
      [348, 1],
      [390, 2],
    ] as const) {
      await page.setViewportSize({ width, height: 844 });
      const tabs = page.getByRole('tab');
      await expect(tabs).toHaveCount(3);
      const tab = tabs.nth(targetIndex);
      await cardDemo.evaluate((element) => element.scrollIntoView({ block: 'center' }));
      await expect(tab).toBeVisible();
      await expect(tab).toHaveAttribute('aria-selected', /^(true|false)$/);

      const hitAreas = await Promise.all([0, 1, 2].map((index) => tabs.nth(index).boundingBox()));
      for (const hitArea of hitAreas) {
        expect(hitArea).not.toBeNull();
        expect(hitArea!.width).toBeGreaterThanOrEqual(44);
        expect(hitArea!.height).toBeGreaterThanOrEqual(44);
      }

      if ((await tab.getAttribute('aria-selected')) === 'true') {
        await tabs.first().click();
      }

      const bounds = await tab.boundingBox();
      expect(bounds).not.toBeNull();

      for (const verticalOffset of [1, bounds!.height - 1]) {
        if ((await tab.getAttribute('aria-selected')) === 'true') {
          await tabs.first().click();
        }

        await page.touchscreen.tap(bounds!.x + bounds!.width / 2, bounds!.y + verticalOffset);
        await expect(tab).toHaveAttribute('aria-selected', 'true');
      }
    }
  } finally {
    await context.close();
  }
});
