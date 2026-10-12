import { expect, test } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const viewports = [
  { width: 1280, height: 800 },
  { width: 930, height: 720 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

test('Badge 按设计稿展示附着计数、状态尺寸与动态降级', async ({ page, browser }, testInfo) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/data-display/badge/');
  await expect(page.getByRole('heading', { name: 'Badge 徽标', exact: true })).toBeVisible();

  const basicDemo = page.getByTestId('badge-basic');
  const interactiveDemo = page.getByTestId('badge-interactive');
  await expect(basicDemo.getByRole('img', { name: '通知', exact: true })).toBeVisible();
  const notificationButton = interactiveDemo.getByRole('button', { name: '打开通知摘要' });
  await expect(notificationButton).toBeVisible();
  await expect(notificationButton).toHaveAccessibleName('打开通知摘要');
  await expect(basicDemo.getByText('99+', { exact: true })).toHaveCount(2);
  await expect(basicDemo.getByText('999+', { exact: true })).toBeVisible();
  await expect(basicDemo.getByText('同步中', { exact: true })).toBeVisible();
  await expect(basicDemo.getByText('预设蓝色', { exact: true })).toBeVisible();
  await expect(basicDemo.getByText('主题色', { exact: true })).toBeVisible();
  await expect(basicDemo.getByText('渐变背景覆盖', { exact: true })).toBeVisible();
  await expect(basicDemo.getByText('无背景填充', { exact: true })).toBeVisible();
  await expect(basicDemo.getByText('SLA VIP 认证', { exact: true })).toBeVisible();
  await expect(basicDemo.getByText('起始位置', { exact: true })).toBeVisible();
  const ribbon = basicDemo.locator('.lx-demo-badge-ribbon');
  await expect
    .poll(() => ribbon.evaluate((element) => getComputedStyle(element).backgroundImage))
    .toContain('linear-gradient');
  const ribbonGeometry = await ribbon.evaluate((element) => {
    const style = getComputedStyle(element);
    const matrix = new DOMMatrixReadOnly(style.transform);
    return {
      angle: Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI),
      width: element.getBoundingClientRect().width,
      height: element.getBoundingClientRect().height,
    };
  });
  expect(ribbonGeometry.angle).toBe(45);
  expect(ribbonGeometry.width).toBeGreaterThan(80);
  expect(ribbonGeometry.width).toBeLessThan(90);
  expect(ribbonGeometry.height).toBeGreaterThan(80);
  expect(ribbonGeometry.height).toBeLessThan(90);
  const ribbonCard = basicDemo.getByTestId('badge-ribbon-card');
  const ribbonWrapper = basicDemo.locator('.lx-demo-badge-ribbon-wrapper');
  const startRibbon = basicDemo.locator('.lx-demo-badge-ribbon-start');
  const startRibbonCard = basicDemo.getByTestId('badge-ribbon-start-card');
  await expect
    .poll(() => startRibbon.evaluate((element) => getComputedStyle(element).backgroundImage))
    .toContain('linear-gradient');
  await expect
    .poll(() => ribbonWrapper.evaluate((element) => getComputedStyle(element).overflow))
    .toBe('visible');
  const expectRibbonInsideCard = async (ribbonElement = ribbon, cardElement = ribbonCard) => {
    const [ribbonBounds, cardBounds] = await Promise.all([
      ribbonElement.boundingBox(),
      cardElement.boundingBox(),
    ]);
    expect(ribbonBounds).not.toBeNull();
    expect(cardBounds).not.toBeNull();
    expect(ribbonBounds!.x).toBeGreaterThanOrEqual(cardBounds!.x - 1);
    expect(ribbonBounds!.y).toBeGreaterThanOrEqual(cardBounds!.y - 1);
    expect(ribbonBounds!.x + ribbonBounds!.width).toBeLessThanOrEqual(
      cardBounds!.x + cardBounds!.width + 1,
    );
    expect(ribbonBounds!.y + ribbonBounds!.height).toBeLessThanOrEqual(
      cardBounds!.y + cardBounds!.height + 1,
    );
  };
  const expectRibbonOnEdge = async (
    ribbonElement: typeof ribbon,
    cardElement: typeof ribbonCard,
    edge: 'left' | 'right',
  ) => {
    const [ribbonBounds, cardBounds] = await Promise.all([
      ribbonElement.boundingBox(),
      cardElement.boundingBox(),
    ]);
    expect(ribbonBounds).not.toBeNull();
    expect(cardBounds).not.toBeNull();
    if (edge === 'left') {
      expect(ribbonBounds!.x).toBeLessThanOrEqual(cardBounds!.x + 4);
    } else {
      expect(ribbonBounds!.x + ribbonBounds!.width).toBeGreaterThanOrEqual(
        cardBounds!.x + cardBounds!.width - 4,
      );
    }
  };
  await expectRibbonInsideCard();
  await expectRibbonInsideCard(startRibbon, startRibbonCard);
  await expectRibbonOnEdge(ribbon, ribbonCard, 'right');
  await expectRibbonOnEdge(startRibbon, startRibbonCard, 'left');
  const getRibbonAngle = (ribbonElement: typeof ribbon) =>
    ribbonElement.evaluate((element) => {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI);
    });
  await expect.poll(() => getRibbonAngle(startRibbon)).toBe(-45);
  await basicDemo.evaluate((element) => element.setAttribute('dir', 'rtl'));
  await expect
    .poll(() =>
      ribbon.evaluate((element) => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
        return Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI);
      }),
    )
    .toBe(-45);
  await expect.poll(() => getRibbonAngle(startRibbon)).toBe(45);
  await expectRibbonInsideCard();
  await expectRibbonInsideCard(startRibbon, startRibbonCard);
  await expectRibbonOnEdge(ribbon, ribbonCard, 'left');
  await expectRibbonOnEdge(startRibbon, startRibbonCard, 'right');
  await basicDemo.evaluate((element) => element.removeAttribute('dir'));
  await expect
    .poll(() =>
      ribbon.evaluate((element) => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
        return Math.round((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI);
      }),
    )
    .toBe(45);
  await expect.poll(() => getRibbonAngle(startRibbon)).toBe(-45);
  await expect
    .poll(async () => {
      const [ribbonBounds, cardBounds] = await Promise.all([
        ribbon.boundingBox(),
        ribbonCard.boundingBox(),
      ]);
      return Boolean(
        ribbonBounds &&
        cardBounds &&
        ribbonBounds.x + ribbonBounds.width >= cardBounds.x + cardBounds.width - 4 &&
        ribbonBounds.y <= cardBounds.y + 24,
      );
    })
    .toBe(true);
  await expect(interactiveDemo.getByText('同步中', { exact: true })).toBeVisible();
  await expect(basicDemo.getByText('已同步', { exact: true })).toBeVisible();
  await expect(interactiveDemo.getByText('已同步', { exact: true })).toBeVisible();
  await expect(basicDemo.getByText('等待确认', { exact: true })).toBeVisible();
  await expect(interactiveDemo.getByText('等待确认', { exact: true })).toBeVisible();
  await expect(basicDemo.getByText('同步失败', { exact: true })).toBeVisible();
  await expect(interactiveDemo.getByText('同步失败', { exact: true })).toBeVisible();

  const presetColorIndicator = basicDemo.locator('.badge-preset-indicator');
  await expect
    .poll(() =>
      presetColorIndicator.evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .toBe('rgb(22, 119, 255)');

  const themedColorIndicator = basicDemo.locator('.badge-themed-indicator');
  await expect
    .poll(async () =>
      themedColorIndicator.evaluate((element) => {
        const computed = getComputedStyle(element);
        return computed.color === computed.backgroundColor;
      }),
    )
    .toBe(true);

  const readBackgroundOverride = async (selector: string) =>
    basicDemo.locator(selector).evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        backgroundColorIsTransparent:
          style.backgroundColor === 'transparent' || style.backgroundColor.endsWith(', 0)'),
        backgroundImage: style.backgroundImage,
      };
    });
  await expect
    .poll(() => readBackgroundOverride('.badge-gradient-background-indicator'))
    .toMatchObject({ backgroundColorIsTransparent: true });
  await expect
    .poll(() =>
      basicDemo
        .locator('.badge-gradient-background-indicator')
        .evaluate((element) => getComputedStyle(element).backgroundImage),
    )
    .toContain('gradient');
  await expect
    .poll(() => readBackgroundOverride('.badge-no-background-indicator'))
    .toEqual({ backgroundColorIsTransparent: true, backgroundImage: 'none' });

  const initialThemedColor = await themedColorIndicator.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  await basicDemo.getByText('主题设置', { exact: true }).click();
  const brandColor = basicDemo.getByRole('combobox', { name: '品牌色', exact: true });
  await brandColor.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(brandColor).toHaveAttribute('aria-expanded', 'false');
  await expect(basicDemo.getByTitle('活力橙', { exact: true })).toBeVisible();
  await expect
    .poll(() =>
      themedColorIndicator.evaluate((element) => getComputedStyle(element).backgroundColor),
    )
    .not.toBe(initialThemedColor);

  const darkMode = basicDemo.getByRole('switch', { name: '暗色模式', exact: true });
  const compactDensity = basicDemo.getByRole('switch', { name: '紧凑密度', exact: true });
  if (!(await darkMode.isChecked())) await darkMode.click();
  if (!(await compactDensity.isChecked())) await compactDensity.click();
  await expect
    .poll(() =>
      basicDemo.evaluate((element) => {
        const scope = element.closest('[data-lx-mode]');
        return [scope?.getAttribute('data-lx-mode'), scope?.getAttribute('data-lx-density')];
      }),
    )
    .toEqual(['dark', 'compact']);

  const processingIndicator = interactiveDemo.locator('.badge-interactive-processing-indicator');
  const readProcessingMotion = () =>
    processingIndicator.evaluate((element) => {
      const animation = window.getComputedStyle(element, '::before');
      const bounds = element.getBoundingClientRect();
      return {
        width: bounds.width,
        height: bounds.height,
        name: animation.animationName,
        duration: animation.animationDuration,
      };
    });

  await expect
    .poll(async () => {
      const motion = await readProcessingMotion();
      return (
        motion.width === 10 &&
        motion.height === 10 &&
        motion.name !== 'none' &&
        motion.duration === '1.5s'
      );
    })
    .toBe(true);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(async () => (await readProcessingMotion()).name).toBe('none');

  await expect(notificationButton).toHaveAttribute('aria-expanded', 'false');
  await notificationButton.click();
  await expect(notificationButton).toHaveAttribute('aria-expanded', 'true');
  await expect(interactiveDemo.getByText('通知摘要已展开，当前有 12 条未读消息。')).toBeVisible();
  await notificationButton.click();
  await expect(notificationButton).toHaveAttribute('aria-expanded', 'false');

  const unreadStatus = interactiveDemo.getByText(/^未读消息：/);
  await expect(unreadStatus).toHaveText('未读消息：12');
  await page.getByRole('button', { name: '新增 100 条', exact: true }).click();
  await expect(unreadStatus).toHaveText('未读消息：112');
  await page.getByRole('button', { name: '全部已读', exact: true }).click();
  await expect(unreadStatus).toHaveText('未读消息：0');
  await page.getByRole('button', { name: '恢复消息', exact: true }).click();
  await expect(unreadStatus).toHaveText('未读消息：12');

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    if (viewport.width <= 390) {
      await page.evaluate(() => window.scrollTo(0, 0));
      const demoTop = await basicDemo.evaluate(
        (element) => element.getBoundingClientRect().top + window.scrollY,
      );
      expect(demoTop).toBeLessThan(520);
      await expectRibbonInsideCard();
    }
    await expect
      .poll(() =>
        page.evaluate(() => {
          const root = document.documentElement;
          return Math.max(root.scrollWidth, document.body.scrollWidth) - root.clientWidth;
        }),
      )
      .toBeLessThanOrEqual(0);

    if (viewport.width === 1280 || viewport.width === 320) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: testInfo.outputPath(`badge-${viewport.width}.png`),
        fullPage: true,
      });
    }
  }

  const apiTable = page.getByRole('region', { name: 'Badge 属性参数表' });
  await expect(apiTable).toHaveAttribute('tabindex', '0');
  const previousFocusable = page.getByRole('link', {
    name: 'Ant Design 5 公开契约',
    exact: true,
  });
  await previousFocusable.focus();
  await page.keyboard.press('Tab');
  await expect(apiTable).toBeFocused();
  const tableGeometry = await apiTable.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(tableGeometry.scrollWidth).toBeGreaterThan(tableGeometry.clientWidth);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => apiTable.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  await expect
    .poll(() =>
      page.evaluate(() =>
        Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      ),
    )
    .toBeLessThanOrEqual(320);

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);

  const touchPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const touchBrowserHealth = collectBrowserErrors(touchPage);
  await touchPage.goto('/components/data-display/badge/');
  const touchDemo = touchPage.getByTestId('badge-basic');
  await touchDemo.getByText('主题设置', { exact: true }).click();
  const touchSwitches = [
    touchDemo.getByRole('switch', { name: '暗色模式', exact: true }),
    touchDemo.getByRole('switch', { name: '紧凑密度', exact: true }),
  ];
  for (const touchSwitch of touchSwitches) {
    const geometry = await touchSwitch.boundingBox();
    expect(geometry).not.toBeNull();
    expect(geometry!.width).toBeGreaterThanOrEqual(50);
    expect(geometry!.width).toBeLessThanOrEqual(64);
    expect(geometry!.height).toBeGreaterThanOrEqual(20);
    expect(geometry!.height).toBeLessThanOrEqual(26);
    const targetGeometry = await touchSwitch.evaluate((element) => {
      const style = getComputedStyle(element, '::before');
      return { width: style.width, height: style.height };
    });
    expect(targetGeometry).toEqual({ width: '44px', height: '44px' });
    const wasChecked = await touchSwitch.isChecked();
    await touchPage.touchscreen.tap(geometry!.x + geometry!.width / 2, geometry!.y - 8);
    await expect(touchSwitch).toBeChecked({ checked: !wasChecked });
  }
  const touchDarkMode = touchSwitches[0];
  await touchDarkMode.focus();
  await expect
    .poll(() => touchDarkMode.evaluate((element) => document.activeElement === element))
    .toBe(true);
  const wasDarkAfterTouch = await touchDarkMode.isChecked();
  await touchPage.keyboard.press('Space');
  await expect(touchDarkMode).toBeChecked({ checked: !wasDarkAfterTouch });
  await waitForBrowserQuiescence(touchPage, touchBrowserHealth);
  expect(touchBrowserHealth.errors, touchBrowserHealth.errors.join('\n')).toEqual([]);
  await touchPage.close();
});
