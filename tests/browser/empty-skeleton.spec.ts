import { expect, test, type Locator, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const evidenceRunId = `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}`;
const viewports = [
  { width: 930, height: 720 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

async function expectNoRootHorizontalOverflow(
  page: Page,
  viewport: (typeof viewports)[number],
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
      { message: `${viewport.width}px 视口下 Data Display 页面发生根节点横向溢出` },
    )
    .toBeLessThanOrEqual(0);
}

async function expectInsideViewport(locator: Locator, width: number): Promise<void> {
  await expect(locator).toBeVisible();
  await locator.scrollIntoViewIfNeeded();
  const bounds = await locator.boundingBox();
  if (!bounds) throw new Error('未能测量组件的可见边界');
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(width + 1);
}

async function applyDarkCompactTheme(frame: Locator): Promise<void> {
  const settings = frame.locator('details').first();
  if ((await settings.getAttribute('open')) === null) {
    await frame.getByText('主题设置', { exact: true }).click();
  }

  const initialMode = await frame.getAttribute('data-lx-mode');
  const initialBackground = await frame.evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--lx-color-bg-base').trim(),
  );
  const darkSwitch = frame.getByRole('switch', { name: '暗色模式', exact: true });
  if (initialMode !== 'dark') await darkSwitch.click();
  await expect(frame).toHaveAttribute('data-lx-mode', 'dark');
  if (initialMode !== 'dark') {
    await expect
      .poll(() =>
        frame.evaluate((element) =>
          getComputedStyle(element).getPropertyValue('--lx-color-bg-base').trim(),
        ),
      )
      .not.toBe(initialBackground);
  }

  const densitySwitch = frame.getByRole('switch', { name: '紧凑密度', exact: true });
  if ((await frame.getAttribute('data-lx-density')) !== 'compact') await densitySwitch.click();
  await expect(frame).toHaveAttribute('data-lx-density', 'compact');
}

async function readCssColor(root: Locator, tokenName: string): Promise<string> {
  return root.evaluate((element, name) => {
    const probe = document.createElement('span');
    probe.style.color = `var(${name})`;
    element.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, tokenName);
}

async function expectSkeletonShimmerUsesTheme(skeleton: Locator, frame: Locator): Promise<void> {
  await expect
    .poll(async () => {
      const [backgroundImages, primaryBackground, selectedHoverBackground] = await Promise.all([
        skeleton.evaluate((element) =>
          [element, ...element.querySelectorAll<HTMLElement>('*')]
            .map((child) => getComputedStyle(child).backgroundImage)
            .filter((image) => image !== 'none'),
        ),
        readCssColor(frame, '--lx-color-primary-bg'),
        readCssColor(frame, '--lx-color-item-selected-hover-bg'),
      ]);
      return backgroundImages.some(
        (image) =>
          image.includes('linear-gradient') &&
          image.includes(primaryBackground) &&
          image.includes(selectedHoverBackground),
      );
    })
    .toBe(true);
}

async function expectSkeletonAnimation(skeleton: Locator, enabled: boolean): Promise<void> {
  await expect
    .poll(() =>
      skeleton.evaluate((element) =>
        [element, ...element.querySelectorAll<HTMLElement>('*')].some((child) => {
          const style = window.getComputedStyle(child);
          const names = style.animationName.split(',').map((name) => name.trim());
          const durations = style.animationDuration.split(',').map((duration) => duration.trim());
          const states = style.animationPlayState.split(',').map((state) => state.trim());

          return names.some((name, index) => {
            const duration = Number.parseFloat(durations[index] ?? durations[0] ?? '0');
            return name !== 'none' && duration > 0 && (states[index] ?? states[0]) === 'running';
          });
        }),
      ),
    )
    .toBe(enabled);
}

async function expectSkeletonStaticColorUsesTheme(
  skeleton: Locator,
  frame: Locator,
): Promise<void> {
  await expect
    .poll(async () => {
      const [backgroundColors, backgroundImages, primaryBackground] = await Promise.all([
        skeleton.evaluate((element) =>
          [element, ...element.querySelectorAll<HTMLElement>('*')].map(
            (child) => getComputedStyle(child).backgroundColor,
          ),
        ),
        skeleton.evaluate((element) =>
          [element, ...element.querySelectorAll<HTMLElement>('*')]
            .map((child) => getComputedStyle(child).backgroundImage)
            .filter((image) => image !== 'none'),
        ),
        readCssColor(frame, '--lx-color-primary-bg'),
      ]);
      return backgroundColors.includes(primaryBackground) && backgroundImages.length === 0;
    })
    .toBe(true);
}

async function expectTouchSizedButtons(root: Locator): Promise<void> {
  const buttons = root.locator('button:visible');
  const count = await buttons.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    const bounds = await button.boundingBox();
    expect(bounds, `第 ${index + 1} 个可见操作按钮应能测量`).not.toBeNull();
    const targetSize = await button.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const before = getComputedStyle(element, '::before');
      const hasExpandedTarget = before.content !== 'none' && before.content !== 'normal';
      return {
        width: Math.max(bounds.width, hasExpandedTarget ? Number.parseFloat(before.width) || 0 : 0),
        height: Math.max(
          bounds.height,
          hasExpandedTarget ? Number.parseFloat(before.height) || 0 : 0,
        ),
      };
    });
    expect(targetSize.width, `第 ${index + 1} 个可见操作按钮宽度`).toBeGreaterThanOrEqual(44);
    expect(targetSize.height, `第 ${index + 1} 个可见操作按钮高度`).toBeGreaterThanOrEqual(44);
  }
}

async function readMotionFailures(root: Locator): Promise<string[]> {
  return root.evaluate((element) =>
    [element, ...element.querySelectorAll<HTMLElement>('*')]
      .map((element) => {
        const style = window.getComputedStyle(element);
        const durations = (value: string) =>
          value.split(',').map((duration) => Number.parseFloat(duration) || 0);
        const animationNames = style.animationName.split(',').map((name) => name.trim());
        const animationDurations = durations(style.animationDuration);
        const animationDelays = durations(style.animationDelay);
        const transitionDurations = durations(style.transitionDuration);
        const transitionDelays = durations(style.transitionDelay);
        const valid =
          animationNames.every((name) => name === 'none') &&
          animationDurations.every((duration) => duration === 0) &&
          animationDelays.every((delay) => delay === 0) &&
          transitionDurations.every((duration) => duration === 0) &&
          transitionDelays.every((delay) => delay === 0);
        return valid
          ? null
          : `${element.tagName.toLowerCase()}: ${style.animationName} / ${style.animationDuration} / ${style.transitionDuration}`;
      })
      .filter((failure): failure is string => failure !== null)
      .slice(0, 20),
  );
}

async function expectReducedMotion(root: Locator): Promise<void> {
  await expect.poll(() => readMotionFailures(root)).toEqual([]);
}

test('Empty 创建、筛选恢复与窄屏状态保持公开语义', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/data-display/empty');

  await expect(page.locator('h1')).toHaveText('Empty 空状态');
  await expect(page).toHaveTitle('Empty 空状态');

  const demoContent = page.getByTestId('empty-demo');
  const demo = page.locator('[data-lx-mode]').filter({ has: demoContent });
  const status = demo.getByRole('status');
  const search = demo.getByRole('textbox', { name: '采购单筛选', exact: true });
  const create = demo.getByRole('button', { name: '立即新建采购单', exact: true });
  const clearOrders = demo.getByRole('button', { name: '清空采购单', exact: true });
  const defaultEmpty = demo.locator('[data-lx-empty-variant="default"]');
  const illustration = defaultEmpty.locator('[aria-hidden="true"]').first();
  const illustrationColor = () =>
    illustration.evaluate((element) => getComputedStyle(element).backgroundColor);

  const customImage = page.getByTestId('custom-empty-image');
  const customImageSlot = page.locator('.custom-empty-image-slot');
  await expect(customImage).toBeVisible();
  await expect(customImageSlot).toBeVisible();
  await expect
    .poll(() => customImageSlot.evaluate((element) => getComputedStyle(element).height))
    .toBe('36px');

  await expect(demo).toHaveCount(1);
  await expect(defaultEmpty).toBeVisible();
  const defaultIllustrationBounds = await illustration.boundingBox();
  expect(defaultIllustrationBounds?.width).toBe(96);
  expect(defaultIllustrationBounds?.height).toBe(96);
  const defaultIllustrationSvg = illustration.locator('svg');
  await expect(defaultIllustrationSvg).toBeVisible();
  const defaultIllustrationSvgBounds = await defaultIllustrationSvg.boundingBox();
  expect(defaultIllustrationSvgBounds?.width).toBe(56);
  expect(defaultIllustrationSvgBounds?.height).toBe(56);
  await expect(demo.getByText('暂无关联采购单', { exact: true })).toBeVisible();
  await expect(create).toBeVisible();
  await expect(clearOrders).toBeDisabled();
  await expect(status).toHaveText('共 0 张采购单，匹配 0 张');
  await expect
    .poll(async () => illustrationColor())
    .toBe(await readCssColor(illustration, '--lx-color-ambient'));
  expect((await create.boundingBox())?.height).toBe(40);
  expect((await clearOrders.boundingBox())?.height).toBe(40);
  await expectReducedMotion(defaultEmpty);
  const changedToDark = (await demo.getAttribute('data-lx-mode')) !== 'dark';
  const initialIllustrationBackground = await illustrationColor();
  await applyDarkCompactTheme(demo);
  await expect
    .poll(async () => illustrationColor())
    .toBe(await readCssColor(illustration, '--lx-color-ambient'));
  if (changedToDark) {
    await expect.poll(() => illustrationColor()).not.toBe(initialIllustrationBackground);
  }

  await create.focus();
  await expect(create).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(demo.getByText('PO-2024-1881', { exact: true })).toBeVisible();
  await expect(search).toBeFocused();
  await expect(status).toHaveText('共 1 张采购单，匹配 1 张');

  await search.fill('no-match');
  const smallEmpty = demo.locator('[data-lx-empty-variant="small"]');
  await expect(smallEmpty).toBeVisible();
  const smallIllustrationBounds = await smallEmpty
    .locator('[aria-hidden="true"]')
    .first()
    .boundingBox();
  expect(smallIllustrationBounds?.width).toBe(32);
  expect(smallIllustrationBounds?.height).toBe(32);
  const smallIllustrationSvgBounds = await smallEmpty
    .locator('[aria-hidden="true"] svg')
    .boundingBox();
  expect(smallIllustrationSvgBounds?.width).toBe(19);
  expect(smallIllustrationSvgBounds?.height).toBe(19);
  await expect(demo.getByText('没有匹配的采购单', { exact: true })).toBeVisible();
  await expect(demo.getByRole('button', { name: '清除筛选', exact: true })).toBeVisible();
  await expect(status).toHaveText('共 1 张采购单，匹配 0 张');

  await demo.getByRole('button', { name: '清除筛选', exact: true }).click();
  await expect(search).toBeFocused();
  await expect(demo.getByText('PO-2024-1881', { exact: true })).toBeVisible();
  await expect(status).toHaveText('共 1 张采购单，匹配 1 张');

  await clearOrders.click();
  await expect(defaultEmpty).toBeVisible();
  await expect(create).toBeVisible();
  await expect(clearOrders).toBeDisabled();
  await expect(search).toBeFocused();
  await expect(status).toHaveText('共 0 张采购单，匹配 0 张');

  for (const viewport of viewports) {
    await expectNoRootHorizontalOverflow(page, viewport);
    await expectInsideViewport(create, viewport.width);
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Skeleton 加载、失败重试与键盘焦点在主题及窄屏下可恢复', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/components/data-display/skeleton');

  await expect(page.locator('h1')).toHaveText('Skeleton 骨架屏');
  await expect(page).toHaveTitle('Skeleton 骨架屏');

  const demoContent = page.getByTestId('skeleton-demo');
  const demo = page.locator('[data-lx-mode]').filter({ has: demoContent });
  const skeleton = demo.locator('[aria-label="采购单明细加载中"]');
  const message = demo.getByText('采购单明细加载中', { exact: true });
  const ready = demo.getByRole('button', { name: '完成加载', exact: true });

  await expect(demo).toHaveCount(1);
  await expect(skeleton).toHaveAttribute('role', 'status');
  await expect(skeleton).toHaveAttribute('aria-busy', 'true');
  await expect(message).toBeVisible();
  expect((await ready.boundingBox())?.height).toBe(40);
  await expectSkeletonShimmerUsesTheme(skeleton, demo);
  await expectSkeletonAnimation(skeleton, true);
  await applyDarkCompactTheme(demo);
  await expectSkeletonShimmerUsesTheme(skeleton, demo);
  await expectSkeletonAnimation(skeleton, true);

  await ready.focus();
  await expect(ready).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(demo.getByText('PO-2024-1881 · 智能制造设备采购', { exact: true })).toBeVisible();
  await expect(
    demo.getByText('供应商：上海深蓝光电高新材料有限公司', { exact: true }),
  ).toBeVisible();
  await expect(skeleton).toHaveCount(0);
  await expect(demo.locator('[aria-busy="true"]')).toHaveCount(0);
  await expect(demo.getByText('采购单明细已加载', { exact: true })).toBeVisible();

  for (const viewport of viewports) {
    await expectNoRootHorizontalOverflow(page, viewport);
  }

  const failed = demo.getByRole('button', { name: '模拟失败', exact: true });
  await failed.focus();
  await page.keyboard.press('Enter');
  const failureText = demo.getByText('采购单明细加载失败', { exact: true });
  await expect(failureText).toHaveCount(2);
  await expect(failureText.first()).toBeVisible();
  await expect(demo.getByRole('status')).toHaveText('采购单明细加载失败');

  const retry = demo.getByRole('button', { name: '重试', exact: true });
  for (const viewport of viewports) {
    await expectNoRootHorizontalOverflow(page, viewport);
    await expectInsideViewport(retry, viewport.width);
  }

  await retry.click();
  await expect(ready).toBeFocused();
  await expect(demo.getByText('采购单明细已加载', { exact: true })).toBeVisible();
  await expect(demo.getByText('PO-2024-1881 · 智能制造设备采购', { exact: true })).toBeVisible();

  const showLoading = demo.getByRole('button', { name: '显示加载', exact: true });
  await showLoading.focus();
  await page.keyboard.press('Enter');
  await expect(skeleton).toHaveAttribute('role', 'status');
  await expect(skeleton).toHaveAttribute('aria-busy', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expectReducedMotion(skeleton);
  await expectSkeletonStaticColorUsesTheme(skeleton, demo);

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Skeleton 导航前启用 reduced motion 时首次挂载不启动扫光', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    document.addEventListener(
      'animationstart',
      (event) => {
        const target = event.target;
        if (target instanceof Element && target.closest('[aria-label="采购单明细加载中"]')) {
          document.documentElement.dataset.lxSkeletonAnimationStarted = 'true';
        }
      },
      true,
    );
  });
  await page.goto('/components/data-display/skeleton');

  const skeleton = page.locator('[aria-label="采购单明细加载中"]');
  await expect(skeleton).toBeVisible();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await expect.poll(() => readMotionFailures(skeleton)).toEqual([]);
  await expect(page.locator('html')).not.toHaveAttribute('data-lx-skeleton-animation-started');
});

test('Empty 与 Skeleton API 表可在 320px 窄屏键盘横向浏览', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const tables = [
    {
      route: '/components/data-display/empty',
      name: 'Empty 参数表',
      hint: 'empty-docs-table-hint',
    },
    {
      route: '/components/data-display/skeleton',
      name: 'Skeleton 参数表',
      hint: 'skeleton-docs-table-hint',
    },
  ];

  for (const table of tables) {
    await page.goto(table.route);
    // Dumi 启动时会内联 docs-shell.css；这里显式加载工作树样式，避免复用旧服务时测到陈旧规则。
    await page.addStyleTag({ path: resolve(process.cwd(), 'docs/docs-shell.css') });
    const region = page.getByRole('region', { name: table.name, exact: true });
    await expect(region).toHaveAttribute('tabindex', '0');
    await expect(region).toHaveAttribute('aria-describedby', table.hint);
    await expect(page.locator(`#${table.hint}`)).toBeVisible();
    const metrics = await region.evaluate((element) => {
      const firstColumn = element.querySelector('th:first-child');
      if (!firstColumn) throw new Error('API 表缺少属性列标题');
      return {
        regionWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        tableWidth: element.querySelector('table')?.getBoundingClientRect().width ?? 0,
        firstColumnWidth: firstColumn.getBoundingClientRect().width,
        firstColumnPosition: getComputedStyle(firstColumn).position,
      };
    });
    expect(metrics.tableWidth).toBeGreaterThan(metrics.regionWidth);
    expect(metrics.scrollWidth).toBeGreaterThan(metrics.regionWidth);
    expect(metrics.firstColumnWidth).toBeGreaterThanOrEqual(144);
    expect(metrics.firstColumnPosition).toBe('sticky');

    await region.focus();
    await expect(region).toBeFocused();
    await region.evaluate((element) => {
      element.scrollLeft = 0;
    });
    const leftAtStartPrevented = await region.evaluate((element) => {
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowLeft',
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(event);
      return event.defaultPrevented;
    });
    expect(leftAtStartPrevented).toBe(false);

    await page.keyboard.press('ArrowRight');
    await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    const routeName = table.route.endsWith('/empty') ? 'empty' : 'skeleton';
    await page.screenshot({
      path: resolve(
        process.cwd(),
        '.codex',
        'test-results',
        `${evidenceRunId}-${test.info().project.name}-${routeName}-api-keyboard.png`,
      ),
    });

    const rightAtEndPrevented = await region.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(event);
      return event.defaultPrevented;
    });
    expect(rightAtEndPrevented).toBe(false);

    const scrollAtEnd = await region.evaluate((element) => element.scrollLeft);
    await page.keyboard.press('ArrowLeft');
    await expect
      .poll(() => region.evaluate((element) => element.scrollLeft))
      .toBeLessThan(scrollAtEnd);
    await expectNoRootHorizontalOverflow(page, { width: 320, height: 740 });
  }
});

async function expectThemeSettingsTouchTargets(page: Page, demo: Locator): Promise<void> {
  const themeSettings = demo.locator('details').filter({ hasText: '主题设置' });
  await expect(themeSettings).toHaveCount(1);
  const summary = themeSettings.locator('summary');
  await summary.scrollIntoViewIfNeeded();
  const summaryBounds = await summary.boundingBox();
  expect(summaryBounds).not.toBeNull();
  expect(summaryBounds!.width).toBeGreaterThanOrEqual(44);
  expect(summaryBounds!.height).toBeGreaterThanOrEqual(44);
  await page.touchscreen.tap(summaryBounds!.x + 2, summaryBounds!.y + summaryBounds!.height - 2);
  await expect(themeSettings).toHaveAttribute('open', '');

  const appearance = themeSettings.locator('[aria-label="外观"]');
  const appearanceOptions = appearance.locator('label');
  await expect(appearanceOptions).toHaveCount(3);
  for (let index = 0; index < (await appearanceOptions.count()); index += 1) {
    const option = appearanceOptions.nth(index);
    await option.scrollIntoViewIfNeeded();
    const bounds = await option.boundingBox();
    expect(bounds, `外观选项 ${index + 1} 应能测量`).not.toBeNull();
    expect(bounds!.width, `外观选项 ${index + 1} 宽度`).toBeGreaterThanOrEqual(44);
    expect(bounds!.height, `外观选项 ${index + 1} 高度`).toBeGreaterThanOrEqual(44);
  }

  const softAppearance = appearanceOptions.filter({ hasText: '轻盈' });
  const softBounds = await softAppearance.boundingBox();
  expect(softBounds).not.toBeNull();
  await page.touchscreen.tap(
    softBounds!.x + softBounds!.width / 2,
    softBounds!.y + softBounds!.height - 2,
  );
  await expect(themeSettings.getByRole('radio', { name: '轻盈', exact: true })).toBeChecked();

  for (const testId of ['theme-color-select', 'theme-palette-select']) {
    const select = themeSettings.getByTestId(testId);
    await select.scrollIntoViewIfNeeded();
    const bounds = await select.boundingBox();
    expect(bounds, `${testId} 应能测量`).not.toBeNull();
    expect(bounds!.width, `${testId} 宽度`).toBeGreaterThanOrEqual(44);
    expect(bounds!.height, `${testId} 高度`).toBeGreaterThanOrEqual(44);
  }

  const colorSelect = themeSettings.getByTestId('theme-color-select');
  const colorBounds = await colorSelect.boundingBox();
  expect(colorBounds).not.toBeNull();
  await page.touchscreen.tap(
    colorBounds!.x + colorBounds!.width / 2,
    colorBounds!.y + colorBounds!.height - 2,
  );
  const colorSelectCombobox = themeSettings.getByRole('combobox', {
    name: '品牌色',
    exact: true,
  });
  await expect(colorSelectCombobox).toHaveAttribute('aria-expanded', 'true');
  const colorOption = page.getByText('活力橙', { exact: true });
  await expect(colorOption).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(colorSelectCombobox).toHaveAttribute('aria-expanded', 'false');
  await expect(colorOption).toBeHidden();
  const demoName =
    (await demo.locator('[data-testid]').first().getAttribute('data-testid')) ??
    'data-display-demo';
  await page.screenshot({
    path: resolve(
      process.cwd(),
      '.codex',
      'test-results',
      `${evidenceRunId}-${test.info().project.name}-${demoName}-theme-touch.png`,
    ),
  });
}

test('Empty 与 Skeleton demo 在粗指针设备下所有可见操作目标至少为 44px', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 320, height: 844 },
  });
  const page = await context.newPage();
  const browserHealth = collectBrowserErrors(page);

  try {
    if (!baseURL) throw new Error('Playwright baseURL 未配置');
    await page.goto(new URL('/components/data-display/empty', baseURL).toString());
    await expect
      .poll(() => page.evaluate(() => matchMedia('(any-pointer: coarse)').matches))
      .toBe(true);

    const emptyContent = page.getByTestId('empty-demo');
    const emptyDemo = page.locator('[data-lx-mode]').filter({ has: emptyContent });
    await expect(emptyDemo).toHaveCount(1);
    const themeSettings = emptyDemo.locator('details').filter({ hasText: '主题设置' });
    await expect(themeSettings).toHaveCount(1);
    await expectThemeSettingsTouchTargets(page, emptyDemo);
    for (const name of ['暗色模式', '紧凑密度']) {
      const themeSwitch = themeSettings.getByRole('switch', { name, exact: true });
      await expect(themeSwitch).toBeVisible();
      const themeSwitchBounds = await themeSwitch.boundingBox();
      expect(themeSwitchBounds).not.toBeNull();
      const hitArea = await themeSwitch.evaluate((element) => {
        const style = getComputedStyle(element, '::before');
        return {
          width: Number.parseFloat(style.width),
          height: Number.parseFloat(style.height),
          pointerEvents: style.pointerEvents,
        };
      });
      expect(hitArea.width).toBeGreaterThanOrEqual(44);
      expect(hitArea.height).toBeGreaterThanOrEqual(44);
      expect(hitArea.pointerEvents).toBe('auto');
      const initialThemeState = await themeSwitch.getAttribute('aria-checked');
      await page.touchscreen.tap(
        themeSwitchBounds!.x + themeSwitchBounds!.width / 2,
        themeSwitchBounds!.y - 4,
      );
      await expect.poll(() => themeSwitch.getAttribute('aria-checked')).not.toBe(initialThemeState);
    }

    const emptyCreate = page.getByRole('button', { name: '立即新建采购单', exact: true });
    await expect(emptyCreate).toBeVisible();
    await expectTouchSizedButtons(emptyDemo);
    await emptyDemo.getByRole('button', { name: '立即新建采购单', exact: true }).click();
    await emptyDemo.getByRole('textbox', { name: '采购单筛选', exact: true }).fill('no-match');
    await expectTouchSizedButtons(emptyDemo);

    await page.goto(new URL('/components/data-display/skeleton', baseURL).toString());
    const showLoading = page.getByRole('button', { name: '显示加载', exact: true });
    await expect(showLoading).toBeVisible();
    const skeletonContent = page.getByTestId('skeleton-demo');
    const skeletonDemo = page.locator('[data-lx-mode]').filter({ has: skeletonContent });
    await expect(skeletonDemo).toHaveCount(1);
    await expectThemeSettingsTouchTargets(page, skeletonDemo);
    await expectTouchSizedButtons(skeletonDemo);
    await skeletonDemo.getByRole('button', { name: '模拟失败', exact: true }).click();
    await expect(skeletonDemo.getByRole('button', { name: '重试', exact: true })).toBeVisible();
    await expectTouchSizedButtons(skeletonDemo);

    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  } finally {
    await context.close();
  }
});
