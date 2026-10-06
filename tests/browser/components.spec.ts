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
    labels: ['采购', '供应链', '审计'],
    panelText: ['本月采购订单', '高风险供应商', '本季度外部审计已完成，待整改事项 3 项。'],
  },
  {
    viewport: { width: 360, height: 844 },
    labels: ['采购', '供应链', '审计'],
    panelText: ['本月采购订单', '高风险供应商', '本季度外部审计已完成，待整改事项 3 项。'],
  },
  {
    viewport: { width: 361, height: 844 },
    labels: ['采购', '供应链', '审计'],
    panelText: ['本月采购订单', '高风险供应商', '本季度外部审计已完成，待整改事项 3 项。'],
  },
  {
    viewport: { width: 375, height: 844 },
    labels: ['采购', '供应链', '审计'],
    panelText: ['本月采购订单', '高风险供应商', '本季度外部审计已完成，待整改事项 3 项。'],
  },
  {
    viewport: { width: 387, height: 844 },
    labels: ['采购', '供应链', '审计'],
    panelText: ['本月采购订单', '高风险供应商', '本季度外部审计已完成，待整改事项 3 项。'],
  },
  {
    viewport: { width: 388, height: 844 },
    labels: ['采购运营', '供应链风险', '外部审计'],
    panelText: ['本月采购订单', '高风险供应商', '本季度外部审计已完成，待整改事项 3 项。'],
  },
  {
    viewport: { width: 390, height: 844 },
    labels: ['采购运营', '供应链风险', '外部审计'],
    panelText: ['本月采购订单', '高风险供应商', '本季度外部审计已完成，待整改事项 3 项。'],
  },
  {
    viewport: { width: 1280, height: 720 },
    labels: ['采购运营', '供应链风险', '外部审计'],
    panelText: ['本月采购订单', '高风险供应商', '本季度外部审计已完成，待整改事项 3 项。'],
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
      const cardDemo = page
        .locator('.dumi-default-previewer-demo')
        .filter({ hasText: '运营指标概览' });
      const cardTitle = cardDemo.getByText('运营指标概览', { exact: true });
      for (const { viewport, labels, panelText } of cardTabViewports) {
        await page.setViewportSize(viewport);
        await expectNoRootHorizontalOverflow(page, viewport);
        await expect(cardTitle).toBeVisible();

        const titleBox = await cardTitle.evaluate((element) => ({
          clientHeight: element.clientHeight,
          clientWidth: element.clientWidth,
          scrollHeight: element.scrollHeight,
          scrollWidth: element.scrollWidth,
        }));
        expect(titleBox.scrollWidth).toBeLessThanOrEqual(titleBox.clientWidth);
        expect(titleBox.scrollHeight).toBeLessThanOrEqual(titleBox.clientHeight);

        const card = cardDemo.getByTestId('card-demo');
        const cardBox = await card.evaluate((element) => element.getBoundingClientRect());
        const frameBox = await cardDemo.evaluate((element) => element.getBoundingClientRect());
        expect(cardBox.left).toBeGreaterThanOrEqual(frameBox.left);
        expect(cardBox.right).toBeLessThanOrEqual(frameBox.right);
        expect(
          Math.abs((cardBox.left + cardBox.right - frameBox.left - frameBox.right) / 2),
        ).toBeLessThanOrEqual(1);
        await card.evaluate((element) => element.scrollIntoView({ block: 'center' }));

        const tabList = cardDemo.getByRole('tablist');
        const tabs = tabList.getByRole('tab');
        await expect(tabs).toHaveCount(3);
        for (let index = 0; index < labels.length; index += 1) {
          await expect(tabs.nth(index)).toHaveAccessibleName(labels[index]);
          await expectTabTextVisible(tabs.nth(index), labels[index]);
        }

        for (let index = 0; index < labels.length; index += 1) {
          const tab = tabs.nth(index);
          await tab.click();
          await expect(tab).toHaveAttribute('aria-selected', 'true');
          await expect(cardDemo.getByText(panelText[index], { exact: true })).toBeVisible();
        }
      }
    }

    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  });
}
