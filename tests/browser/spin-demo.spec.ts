import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

async function getRegionDemo(page: Page) {
  const demo = page.locator('.dumi-default-previewer').filter({
    has: page.getByRole('textbox', { name: '同步地区', exact: true }),
  });
  await expect(demo).toHaveCount(1);
  return demo;
}

async function expectNoRootOverflow(page: Page, viewportWidth: number) {
  const widths = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(widths).toEqual({
    viewport: viewportWidth,
    document: viewportWidth,
    body: viewportWidth,
  });
}

async function expectHeadingBelowStickyBars(page: Page, heading: Locator) {
  const id = await heading.getAttribute('id');
  expect(id).toBeTruthy();
  await page.evaluate((targetId) => {
    window.location.hash = encodeURIComponent(targetId!);
  }, id);
  await expect
    .poll(() =>
      heading.evaluate((element) => {
        const box = element.getBoundingClientRect();
        const margin = Number.parseFloat(getComputedStyle(element).scrollMarginBlockStart);
        return Math.abs(box.top - margin);
      }),
    )
    .toBeLessThan(2);
  const position = await heading.evaluate((element) => {
    const headingBox = element.getBoundingClientRect();
    const stickyBars = Array.from(
      document.querySelectorAll('.dumi-default-header, .dumi-default-doc-layout-mobile-bar'),
    )
      .map((bar) => ({
        style: getComputedStyle(bar),
        box: bar.getBoundingClientRect(),
      }))
      .filter(
        ({ style, box }) =>
          (style.position === 'fixed' || style.position === 'sticky') &&
          box.height > 0 &&
          box.top < window.innerHeight &&
          box.bottom > 0,
      );
    return {
      top: headingBox.top,
      bottom: headingBox.bottom,
      stickyBottom: Math.max(0, ...stickyBars.map(({ box }) => box.bottom)),
      stickyBarCount: stickyBars.length,
      viewportHeight: window.innerHeight,
    };
  });
  expect(position.stickyBarCount).toBe(page.viewportSize()!.width <= 767 ? 2 : 1);
  expect(position.top).toBeGreaterThanOrEqual(position.stickyBottom + 12);
  expect(position.bottom).toBeGreaterThan(0);
  expect(position.bottom).toBeLessThan(position.viewportHeight);
}

test('Spin 重复激活保留失败重试，并尊重用户焦点', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/components/feedback/spin');
  const demo = await getRegionDemo(page);
  // 页面水合完成后再冻结时间，避免计时器控制影响文档交互初始化。
  await page.clock.pauseAt(new Date('2024-01-01T00:00:00Z'));
  const filter = demo.getByRole('textbox', { name: '同步地区', exact: true });
  const region = demo.getByRole('region', { name: '客户数据', exact: true });
  const status = demo.getByRole('status');
  await expect(region).toHaveCount(1);

  await filter.fill('华南');
  await filter.focus();
  await page.keyboard.press('Tab');
  const start = demo.getByRole('button', { name: '同步客户', exact: true });
  await expect(start).toBeFocused();
  await page.keyboard.press('Enter');

  const loading = demo.getByRole('button', { name: '同步客户', exact: true });
  await expect(loading).toHaveAttribute('aria-disabled', 'true');
  await expect(loading).toHaveText('同步客户');
  await expect(loading).toBeFocused();
  // 先同步派发鼠标激活，再按 Enter，确保两次操作都发生在首次请求完成前。
  await loading.evaluate((button) => (button as HTMLButtonElement).click());
  await page.keyboard.press('Enter');
  await expect(status).toHaveText('正在同步“华南”的本地示例。');
  const expectDisabledColors = async () => {
    const styles = await loading.evaluate((element) => {
      const style = getComputedStyle(element);
      const resolveToken = (property: string, token: string) => {
        const probe = document.createElement('span');
        probe.style.setProperty(property, `var(${token})`);
        element.append(probe);
        const value = getComputedStyle(probe).getPropertyValue(property);
        probe.remove();
        return value;
      };
      return {
        color: style.color,
        colorToken: resolveToken('color', '--lx-color-text-disabled'),
        background: style.backgroundColor,
        backgroundToken: resolveToken('background-color', '--lx-color-item-hover-bg'),
        border: style.borderColor,
        borderToken: resolveToken('border-color', '--lx-color-border'),
        outline: style.outlineStyle,
      };
    });
    expect(styles.color).toBe(styles.colorToken);
    expect(styles.background).toBe(styles.backgroundToken);
    expect(styles.border).toBe(styles.borderToken);
    return styles;
  };
  const loadingStyles = await expectDisabledColors();
  expect(loadingStyles.outline).not.toBe('none');
  await loading.hover();
  await expectDisabledColors();
  await page.mouse.down();
  await expectDisabledColors();
  await page.mouse.up();
  await expect(loading).toHaveAttribute('aria-disabled', 'true');
  await expect(status).toHaveText('正在同步“华南”的本地示例。');
  await expect(region).toHaveAttribute('aria-busy', 'true');
  await page.clock.fastForward(350);
  const loadingTip = demo.getByText('正在同步“华南”的本地示例…', { exact: true });
  await expect(loadingTip).toBeVisible();
  await expect(loadingTip).toHaveAttribute('aria-hidden', 'true');
  const [filterBox, tipBox] = await Promise.all([filter.boundingBox(), loadingTip.boundingBox()]);
  expect(filterBox).not.toBeNull();
  expect(tipBox).not.toBeNull();
  expect(
    tipBox!.x + tipBox!.width <= filterBox!.x ||
      tipBox!.x >= filterBox!.x + filterBox!.width ||
      tipBox!.y + tipBox!.height <= filterBox!.y ||
      tipBox!.y >= filterBox!.y + filterBox!.height,
  ).toBe(true);
  await filter.fill('华东');
  await expect(filter).toHaveValue('华东');
  await expect(loadingTip).toHaveText('正在同步“华南”的本地示例…');
  await expect(region).toContainText('上海星辰贸易');
  await expect(region).toContainText('最近同步：09:30');
  await loading.focus();
  const sandbox = demo.getByRole('button', { name: '在 CodeSandbox 中打开', exact: true });
  await page.keyboard.press('Tab');
  await expect(sandbox).toBeFocused();
  await page.clock.fastForward(550);
  await expect(status).toHaveText(
    '同步“华南”失败：模拟服务暂不可用。当前示例内容和更新时间已保留，请重试。',
  );
  await expect(demo.getByTestId('spin-request-message')).toHaveText(
    '同步“华南”失败：模拟服务暂不可用。当前示例内容和更新时间已保留，请重试。',
  );
  await expect(sandbox).toBeFocused();

  const retry = demo.getByRole('button', { name: '重试同步', exact: true });
  await expect(region).toHaveAttribute('aria-busy', 'false');
  await expect(filter).toHaveValue('华东');
  await expect(retry).toHaveAttribute('aria-disabled', 'false');
  await filter.fill('华南');
  await retry.focus();
  await expect(retry).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(loading).toHaveAttribute('aria-disabled', 'true');
  await expect(loading).toBeFocused();
  await expect(region).toHaveAttribute('aria-busy', 'true');
  await expect(status).toHaveText('正在同步“华南”的本地示例。');
  await page.clock.fastForward(900);
  await expect(status).toHaveText('“华南”的本地示例记录已更新，最近同步时间：刚刚。');
  await expect(region).toContainText('华南 · 本地示例记录');
  await expect(region).toContainText('深圳海风科技');
  await expect(region).toContainText('最近同步：刚刚');
  await expect(region).not.toContainText('上海星辰贸易');
  const restart = demo.getByRole('button', { name: '同步客户', exact: true });
  await expect(restart).toBeFocused();

  await filter.fill('华东');
  await restart.focus();
  await page.keyboard.press('Enter');
  await expect(loading).toHaveAttribute('aria-disabled', 'true');
  await expect(status).toHaveText('正在同步“华东”的本地示例。');
  await page.clock.fastForward(350);
  const nextLoadingTip = demo.getByText('正在同步“华东”的本地示例…', { exact: true });
  await expect(nextLoadingTip).toBeVisible();
  await filter.fill('未配置地区');
  await expect(nextLoadingTip).toHaveText('正在同步“华东”的本地示例…');
  await page.clock.fastForward(550);
  await expect(status).toHaveText('“华东”的本地示例记录已更新，最近同步时间：刚刚。');
  await expect(filter).toBeFocused();
  await expect(region).toHaveAttribute('aria-busy', 'false');
  await expect(filter).toHaveValue('未配置地区');
  await expect(region).toContainText('华东 · 本地示例记录');
  await expect(region).toContainText('上海星辰贸易');
  await expect(region).not.toContainText('没有配置本地演示样例');

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Spin 实时时钟下的鼠标点击和 Enter 不会重置首次请求', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/spin');
  const demo = await getRegionDemo(page);
  const start = demo.getByRole('button', { name: '同步客户', exact: true });
  const status = demo.getByRole('status');

  await start.focus();
  await page.keyboard.press('Enter');
  const loading = demo.getByRole('button', { name: '同步客户', exact: true });
  await expect(loading).toHaveAttribute('aria-disabled', 'true');
  await expect(loading).toHaveText('同步客户');
  const loadingBox = await loading.boundingBox();
  expect(loadingBox).not.toBeNull();
  const mouseStartedAt = Date.now();
  await page.mouse.click(
    loadingBox!.x + loadingBox!.width / 2,
    loadingBox!.y + loadingBox!.height / 2,
  );
  expect(Date.now() - mouseStartedAt).toBeLessThan(500);
  await page.keyboard.press('Enter');

  await expect(status).toHaveText(
    '同步“华东”失败：模拟服务暂不可用。当前示例内容和更新时间已保留，请重试。',
    {
      timeout: 2_000,
    },
  );
  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Spin loading 中连续按 Enter 只提交一次，并可在首次失败后重试成功', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/spin');
  await page.clock.install();

  const demo = await getRegionDemo(page);
  const start = demo.getByRole('button', { name: '同步客户', exact: true });
  const status = demo.getByRole('status');

  await start.focus();
  await page.keyboard.press('Enter');

  const loading = demo.getByRole('button', { name: '同步客户', exact: true });
  await expect(loading).toHaveAttribute('aria-disabled', 'true');
  await expect(loading).toHaveText('同步客户');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(status).toHaveText('正在同步“华东”的本地示例。');

  await page.clock.fastForward(900);
  await expect(status).toHaveText(
    '同步“华东”失败：模拟服务暂不可用。当前示例内容和更新时间已保留，请重试。',
  );

  const retry = demo.getByRole('button', { name: '重试同步', exact: true });
  await retry.focus();
  await page.keyboard.press('Enter');
  await expect(status).toHaveText('正在同步“华东”的本地示例。');
  await page.clock.fastForward(900);
  await expect(status).toHaveText('“华东”的本地示例记录已更新，最近同步时间：刚刚。');

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Spin 未配置地区重试后显示无演示样例空态，不声称实际客户为零', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/spin');
  await page.clock.install();

  const demo = await getRegionDemo(page);
  const filter = demo.getByRole('textbox', { name: '同步地区', exact: true });
  const region = demo.getByRole('region', { name: '客户数据', exact: true });
  const status = demo.getByRole('status');
  const start = demo.getByRole('button', { name: '同步客户', exact: true });

  await filter.fill('未配置地区');
  await start.focus();
  await page.keyboard.press('Enter');
  await page.clock.fastForward(900);
  await expect(status).toHaveText(
    '同步“未配置地区”失败：模拟服务暂不可用。当前示例内容和更新时间已保留，请重试。',
  );
  await expect(filter).toHaveValue('未配置地区');
  await expect(region).toContainText('上海星辰贸易');
  await expect(region).toContainText('最近同步：09:30');

  const retry = demo.getByRole('button', { name: '重试同步', exact: true });
  await retry.focus();
  await page.keyboard.press('Enter');
  await expect(status).toHaveText('正在同步“未配置地区”的本地示例。');
  await page.clock.fastForward(900);

  await expect(status).toHaveText('“未配置地区”没有配置本地演示样例。');
  await expect(region).toHaveText('“未配置地区”没有配置本地演示样例。');
  await expect(region).not.toContainText('上海星辰贸易');
  await expect(region).not.toContainText('最近同步');
  await expect(region).not.toContainText(/客户.*0/);

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Spin __proto__ 地区重试显示空态且页面仍可操作', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/spin');
  await page.clock.install();

  const demo = await getRegionDemo(page);
  const filter = demo.getByRole('textbox', { name: '同步地区', exact: true });
  const region = demo.getByRole('region', { name: '客户数据', exact: true });
  const status = demo.getByRole('status');
  const start = demo.getByRole('button', { name: '同步客户', exact: true });

  await start.focus();
  await page.keyboard.press('Enter');
  await page.clock.fastForward(900);
  await expect(status).toHaveText(
    '同步“华东”失败：模拟服务暂不可用。当前示例内容和更新时间已保留，请重试。',
  );

  await filter.fill('__proto__');
  const retry = demo.getByRole('button', { name: '重试同步', exact: true });
  await retry.focus();
  await page.keyboard.press('Enter');
  await expect(status).toHaveText('正在同步“__proto__”的本地示例。');
  await page.clock.fastForward(900);

  await expect(status).toHaveText('“__proto__”没有配置本地演示样例。');
  await expect(region).toHaveText('“__proto__”没有配置本地演示样例。');
  await expect(region).not.toContainText('最近同步');
  await expect(region).not.toContainText('刚刚');
  await expect(status).not.toContainText('最近同步时间');

  await filter.fill('华南');
  await expect(filter).toHaveValue('华南');
  const nextSync = demo.getByRole('button', { name: '同步客户', exact: true });
  await expect(nextSync).toHaveAttribute('aria-disabled', 'false');
  await nextSync.click();
  await expect(status).toHaveText('正在同步“华南”的本地示例。');
  await page.clock.fastForward(900);
  await expect(status).toHaveText('“华南”的本地示例记录已更新，最近同步时间：刚刚。');
  await expect(region).toContainText('深圳海风科技');

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Spin 320/390px 粗指针目标达标且预览工具不重叠或溢出', async ({ browser, page }) => {
  await page.goto('/components/feedback/spin');
  await expect(page.getByRole('heading', { name: '尺寸与显示延迟', level: 3 })).toBeVisible();
  await expect(page.getByRole('heading', { level: 5 })).toHaveCount(0);
  const desktopRegionHeading = page.getByRole('heading', {
    name: '区域加载、失败和重试',
    level: 3,
  });
  await expectHeadingBelowStickyBars(page, desktopRegionHeading);
  await expectNoRootOverflow(page, 1280);

  const desktopButton = page
    .getByRole('button', { name: '在 CodeSandbox 中打开', exact: true })
    .first();
  const desktopBox = await desktopButton.boundingBox();
  expect(desktopBox).not.toBeNull();
  expect(desktopBox!.width).toBe(24);
  expect(desktopBox!.height).toBe(24);
  const desktopDemo = await getRegionDemo(page);
  const desktopDemoBox = await desktopDemo.boundingBox();
  const desktopSyncBox = await desktopDemo
    .getByRole('button', { name: '同步客户', exact: true })
    .boundingBox();
  expect(desktopDemoBox).not.toBeNull();
  expect(desktopSyncBox).not.toBeNull();
  expect(desktopSyncBox!.height).toBeLessThan(44);
  expect(desktopSyncBox!.width).toBeLessThan(desktopDemoBox!.width / 2);

  const configuredBaseUrl = test.info().project.use.baseURL;
  if (typeof configuredBaseUrl !== 'string') throw new Error('Playwright baseURL 未配置。');

  for (const viewport of [320, 390]) {
    const context = await browser.newContext({
      baseURL: configuredBaseUrl,
      viewport: { width: viewport, height: viewport === 320 ? 740 : 844 },
      isMobile: true,
      hasTouch: true,
    });
    const touchPage = await context.newPage();
    const browserHealth = collectBrowserErrors(touchPage);
    await touchPage.goto('/components/feedback/spin');
    const regionHeading = touchPage.getByRole('heading', {
      name: '区域加载、失败和重试',
      level: 3,
    });
    await expectHeadingBelowStickyBars(touchPage, regionHeading);
    await expect(regionHeading).toBeVisible();
    const coarsePointers = await touchPage.evaluate(() => ({
      primary: matchMedia('(pointer: coarse)').matches,
      any: matchMedia('(any-pointer: coarse)').matches,
    }));
    expect(coarsePointers.primary).toBe(true);
    expect(coarsePointers.any).toBe(true);

    const demo = await getRegionDemo(touchPage);
    const syncButton = demo.getByRole('button', { name: '同步客户', exact: true });
    const syncBox = await syncButton.boundingBox();
    const demoBox = await demo.boundingBox();
    expect(demoBox).not.toBeNull();
    expect(syncBox).not.toBeNull();
    expect(syncBox!.height).toBeGreaterThanOrEqual(44);
    expect(syncBox!.width).toBeLessThan(demoBox!.width);
    expect(syncBox!.y + syncBox!.height).toBeLessThanOrEqual(
      (await touchPage.evaluate(() => window.innerHeight)) + 1,
    );

    const sandbox = touchPage.getByRole('button', {
      name: '在 CodeSandbox 中打开',
      exact: true,
    });
    const stackBlitz = touchPage.getByRole('button', {
      name: '在 StackBlitz 中打开',
      exact: true,
    });
    const count = await sandbox.count();
    expect(count).toBeGreaterThan(0);
    expect(await stackBlitz.count()).toBe(count);

    for (let index = 0; index < count; index += 1) {
      const sandboxButton = sandbox.nth(index);
      const stackBlitzButton = stackBlitz.nth(index);
      await expect(sandboxButton).toBeVisible();
      await expect(stackBlitzButton).toBeVisible();
      const sandboxBox = await sandboxButton.boundingBox();
      const stackBlitzBox = await stackBlitzButton.boundingBox();
      expect(sandboxBox).not.toBeNull();
      expect(stackBlitzBox).not.toBeNull();
      expect(sandboxBox!.width).toBeGreaterThanOrEqual(44);
      expect(sandboxBox!.height).toBeGreaterThanOrEqual(44);
      expect(stackBlitzBox!.width).toBeGreaterThanOrEqual(44);
      expect(stackBlitzBox!.height).toBeGreaterThanOrEqual(44);
      expect(stackBlitzBox!.x).toBeGreaterThanOrEqual(sandboxBox!.x + sandboxBox!.width - 1);
    }

    const heading = touchPage.getByRole('heading', { name: '尺寸与显示延迟', level: 3 });
    await heading.scrollIntoViewIfNeeded();
    const headingBox = await heading.boundingBox();
    const firstSandboxBox = await sandbox.first().boundingBox();
    expect(headingBox).not.toBeNull();
    expect(firstSandboxBox).not.toBeNull();
    expect(firstSandboxBox!.y).toBeGreaterThanOrEqual(headingBox!.y + headingBox!.height);
    await expectNoRootOverflow(touchPage, viewport);
    await waitForBrowserQuiescence(touchPage, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
    await context.close();
  }
});

test('Spin 系统减少动态效果时默认和自定义指示器停止且 status 可读', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/feedback/spin');
  const demo = await getRegionDemo(page);
  const loadingSurface = demo.getByTestId('spin-loading-surface');
  const region = demo.getByRole('region', { name: '客户数据', exact: true });
  const start = demo.getByRole('button', { name: '同步客户', exact: true });
  const status = demo.getByRole('status');

  await start.focus();
  await page.keyboard.press('Enter');
  await expect(status).toHaveText('正在同步“华东”的本地示例。');
  await expect(region).toHaveAttribute('aria-busy', 'true');
  await expect(region).toHaveCount(1);
  const tip = loadingSurface.getByText('正在同步“华东”的本地示例…', { exact: true });
  await expect(tip).toBeVisible();
  await expect(tip).toHaveAttribute('aria-hidden', 'true');
  await expect(status).toHaveCount(1);
  await page.waitForTimeout(350);
  const defaultIndicator = loadingSurface.locator('[aria-hidden="true"]:empty');
  await expect(defaultIndicator).toHaveCount(1);
  await expect(defaultIndicator).toBeVisible();
  const defaultIndicatorMotion = await defaultIndicator.evaluate((element) => ({
    animationName: getComputedStyle(element).animationName,
    activeAnimations: element.getAnimations().length,
  }));
  expect(defaultIndicatorMotion).toEqual({ animationName: 'none', activeAnimations: 0 });
  await expect(status).toBeVisible();

  await page.goto('/~demos/components/feedback/spin-demo-feedback-spin-indicator/');
  const customStatus = page.getByRole('status');
  const customIndicator = page.getByTestId('spin-custom-indicator');
  await expect(customStatus).toHaveText('正在读取附件');
  await expect(customStatus).toBeVisible();
  await expect(customIndicator).toBeVisible();
  await expect(customIndicator).toHaveCSS('animation-name', 'none');
  const customAnimations = await customIndicator.evaluate(
    (element) => element.getAnimations().length,
  );
  expect(customAnimations).toBe(0);

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});
