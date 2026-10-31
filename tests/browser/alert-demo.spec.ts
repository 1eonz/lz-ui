import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

async function getAlertDemo(page: Page): Promise<Locator> {
  // Dumi 当前将示例内联渲染，用唯一恢复按钮的公开名称锁定对应预览区。
  const previewer = page.locator('.dumi-default-previewer').filter({
    has: page.getByRole('button', { name: '重置失败演示', exact: true }),
  });
  await expect(previewer).toHaveCount(1);
  await expect(previewer.getByRole('button', { name: '重置失败演示', exact: true })).toHaveCount(1);
  return previewer;
}

async function tabTo(page: Page, target: Locator): Promise<void> {
  for (let index = 0; index < 120; index += 1) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }

  throw new Error('真实 Tab 顺序未到达预期的 Alert 控件。');
}

async function expectNoRootOverflow(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
          document.documentElement.clientWidth,
      ),
    )
    .toBeLessThanOrEqual(0);
}

async function tapTouchTarget(page: Page, control: Locator): Promise<void> {
  expect(await page.evaluate(() => matchMedia('(any-pointer: coarse)').matches)).toBe(true);
  await control.scrollIntoViewIfNeeded();
  const box = await control.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  // 检查中心和四个内缩角点，避免只有中心可用或相邻按钮遮挡放大的触控区。
  const points = [
    { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 },
    { x: box!.x + 2, y: box!.y + 2 },
    { x: box!.x + box!.width - 2, y: box!.y + 2 },
    { x: box!.x + 2, y: box!.y + box!.height - 2 },
    { x: box!.x + box!.width - 2, y: box!.y + box!.height - 2 },
  ];
  for (const point of points) {
    expect(
      await control.evaluate((element, position) => {
        const hit = document.elementFromPoint(position.x, position.y);
        return hit !== null && element.contains(hit);
      }, point),
    ).toBe(true);
  }
  // 在右下内缩角实际发触摸事件；后续状态断言证明命中的是可执行控件。
  await page.touchscreen.tap(points[4].x, points[4].y);
}

test('Alert 键盘关闭立即恢复焦点并在退出动效后移除', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/components/feedback/alert');
  const demo = await getAlertDemo(page);
  const failure = demo.getByRole('alert');
  const restore = demo.getByRole('button', { name: '重置失败演示', exact: true });
  const retry = demo.getByRole('button', { name: '重试同步', exact: true });
  const close = demo.getByRole('button', { name: '关闭', exact: true });

  await expect(failure).toContainText('同步失败，数据已保留');
  const restoreBox = await restore.boundingBox();
  expect(restoreBox).not.toBeNull();
  // 细指针桌面保留组件自身尺寸，44px 仅属于粗指针触控命中区。
  expect(restoreBox!.height).toBeLessThan(44);
  const closeBox = await close.boundingBox();
  expect(closeBox).not.toBeNull();
  expect(closeBox!.width).toBeGreaterThanOrEqual(24);
  expect(closeBox!.height).toBeGreaterThanOrEqual(24);
  const transitionDurations = await failure.evaluate((element) =>
    window
      .getComputedStyle(element)
      .transitionDuration.split(',')
      .map((duration) => {
        const value = Number.parseFloat(duration);
        return duration.trim().endsWith('ms') ? value : value * 1_000;
      }),
  );
  expect(transitionDurations.some((duration) => duration > 0)).toBe(true);

  await tabTo(page, restore);
  await expect(restore).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(retry).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Space');

  await expect(restore).toBeFocused();
  await expect(failure).toHaveCount(0);
  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Alert 在减少动效下可重新显示并通过 status 播报重试成功', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/feedback/alert');
  const demo = await getAlertDemo(page);
  const failure = demo.getByRole('alert');
  const restore = demo.getByRole('button', { name: '重置失败演示', exact: true });
  const retry = demo.getByRole('button', { name: '重试同步', exact: true });
  const close = demo.getByRole('button', { name: '关闭', exact: true });

  await expect(failure).toContainText('同步失败，数据已保留');
  await expect(failure).toHaveCSS('transition-duration', '0s');
  await tabTo(page, restore);
  await expect(restore).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(retry).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(restore).toBeFocused();
  await expect(failure).toHaveCount(0);

  await restore.click();
  await demo.getByRole('button', { name: '重试同步', exact: true }).click();

  await expect(demo.getByRole('status')).toContainText('客户同步已恢复');
  await expect(
    demo.getByText('28 位客户已更新，原有备注和地区筛选已保留。', { exact: true }),
  ).toBeVisible();
  await demo.getByRole('button', { name: '收起结果', exact: true }).click();
  await expect(
    demo.getByText('28 位客户已更新，原有备注和地区筛选已保留。', { exact: true }),
  ).toHaveCount(0);
  await demo.getByRole('button', { name: '查看结果', exact: true }).click();
  await expect(
    demo.getByText('28 位客户已更新，原有备注和地区筛选已保留。', { exact: true }),
  ).toBeVisible();
  await restore.click();
  await expect(failure).toContainText('同步失败，数据已保留');
  await expect(demo.getByRole('button', { name: '重试同步', exact: true })).toBeVisible();
  await expect(demo.getByText('客户同步已恢复', { exact: true })).toHaveCount(0);
  await expect(
    demo.getByText('28 位客户已更新，原有备注和地区筛选已保留。', { exact: true }),
  ).toHaveCount(0);
  await expect(demo.getByRole('status')).toHaveText(
    '演示已重置为同步失败状态，现有客户数据仍保留。',
  );
  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

for (const width of [320, 390]) {
  test(`Alert 在 ${width}px 粗指针下实际触点命中并完成恢复流程`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    try {
      const page = await context.newPage();
      const browserHealth = collectBrowserErrors(page);
      await page.goto('/components/feedback/alert');
      const demo = await getAlertDemo(page);
      const failure = demo.getByRole('alert');
      const reset = demo.getByRole('button', { name: '重置失败演示', exact: true });
      const coarsePointer = await page.evaluate(() => matchMedia('(any-pointer: coarse)').matches);
      expect(coarsePointer).toBe(true);

      await tapTouchTarget(page, reset);
      await expect(demo.getByRole('status')).toHaveText(
        '演示已重置为同步失败状态，现有客户数据仍保留。',
      );

      const lines = await demo
        .getByText('同步失败，数据已保留', { exact: true })
        .evaluate((element) => {
          const range = element.ownerDocument.createRange();
          range.selectNodeContents(element);
          return [...range.getClientRects()].filter((rect) => rect.height > 0).length;
        });
      expect(lines, '窄屏失败提示应保持在两行以内，避免挤占操作区域').toBeLessThanOrEqual(2);

      const alertBox = await failure.boundingBox();
      const demoBox = await demo.boundingBox();
      expect(alertBox).not.toBeNull();
      expect(demoBox).not.toBeNull();
      expect(alertBox!.width).toBeLessThanOrEqual(demoBox!.width);

      await expectNoRootOverflow(page);
      await page.screenshot({
        path: testInfo.outputPath(`alert-touch-${width}.png`),
        // Chromium 的整页截图会改写触控仿真；视口截图保留真实 coarse 命中条件。
        fullPage: false,
      });
      expect(await page.evaluate(() => matchMedia('(any-pointer: coarse)').matches)).toBe(true);
      await tapTouchTarget(page, demo.getByRole('button', { name: '重试同步', exact: true }));
      await expect(demo.getByRole('status')).toContainText('客户同步已恢复');
      const detail = demo.getByText('28 位客户已更新，原有备注和地区筛选已保留。', { exact: true });
      await expect(detail).toBeVisible();
      await tapTouchTarget(page, demo.getByRole('button', { name: '收起结果', exact: true }));
      await expect(detail).toHaveCount(0);
      await tapTouchTarget(page, demo.getByRole('button', { name: '查看结果', exact: true }));
      await expect(detail).toBeVisible();
      await tapTouchTarget(page, reset);
      await expect(failure).toContainText('同步失败，数据已保留');
      await expect(detail).toHaveCount(0);
      await tapTouchTarget(page, demo.getByRole('button', { name: '关闭', exact: true }));
      await expect(demo.getByRole('button', { name: '重置失败演示', exact: true })).toBeFocused();
      await expect(demo.getByRole('alert')).toHaveCount(0);
      await waitForBrowserQuiescence(page, browserHealth);
      expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
    } finally {
      await context.close();
    }
  });
}

test('Alert 在 320px 粗指针布局中将操作移到正文之后', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 740 },
    isMobile: true,
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    const browserHealth = collectBrowserErrors(page);
    await page.goto('/components/feedback/alert');
    const demo = await getAlertDemo(page);
    const failure = demo.getByRole('alert');
    const retry = demo.getByRole('button', { name: '重试同步', exact: true });
    const alertBox = await failure.boundingBox();
    const retryBox = await retry.boundingBox();
    expect(alertBox).not.toBeNull();
    expect(retryBox).not.toBeNull();
    expect(retryBox!.y).toBeGreaterThanOrEqual(alertBox!.y + alertBox!.height);

    const messageWidth = await demo
      .getByText('同步失败，数据已保留', { exact: true })
      .evaluate((element) => element.getBoundingClientRect().width);
    expect(messageWidth).toBeGreaterThanOrEqual(64);

    const pageWidths = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(pageWidths.document).toBeLessThanOrEqual(pageWidths.viewport);
    expect(pageWidths.body).toBeLessThanOrEqual(pageWidths.viewport);

    await retry.tap();
    await expect(demo.getByRole('status')).toContainText('客户同步已恢复');
    const collapse = demo.getByRole('button', { name: '收起结果', exact: true });
    await expect(collapse).toBeVisible();
    await collapse.tap();
    await expect(demo.getByRole('button', { name: '查看结果', exact: true })).toBeVisible();
    await expect(
      demo.getByText('28 位客户已更新，原有备注和地区筛选已保留。', { exact: true }),
    ).toHaveCount(0);
    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  } finally {
    await context.close();
  }
});

test('Alert 在 360/361px 重排边界及桌面和中间视口保持正文与操作分离', async ({
  page,
}, testInfo) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/alert');
  const demo = await getAlertDemo(page);
  const failure = demo.getByRole('alert');
  const message = demo.getByText('同步失败，数据已保留', { exact: true });
  const retry = demo.getByRole('button', { name: '重试同步', exact: true });
  const close = demo.getByRole('button', { name: '关闭', exact: true });
  for (const width of [1280, 930, 390, 361, 360, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(failure).toBeVisible();
    await expect(retry).toBeVisible();
    await failure.scrollIntoViewIfNeeded();
    await expectNoRootOverflow(page);
    const [alertBox, messageBox, retryBox, closeBox] = await Promise.all(
      [failure, message, retry, close].map((locator) => locator.boundingBox()),
    );
    expect(alertBox).not.toBeNull();
    expect(messageBox).not.toBeNull();
    expect(retryBox).not.toBeNull();
    expect(closeBox).not.toBeNull();
    expect(messageBox!.x + messageBox!.width).toBeLessThanOrEqual(closeBox!.x);
    if (width <= 360) {
      // 断点属于视口：360px 仍应把唯一可见主操作放到完整提示之后。
      expect(retryBox!.y).toBeGreaterThanOrEqual(alertBox!.y + alertBox!.height);
    } else {
      expect(retryBox!.y).toBeGreaterThanOrEqual(alertBox!.y);
      expect(retryBox!.y + retryBox!.height).toBeLessThanOrEqual(alertBox!.y + alertBox!.height);
      expect(messageBox!.x + messageBox!.width).toBeLessThanOrEqual(retryBox!.x);
      expect(retryBox!.x + retryBox!.width).toBeLessThanOrEqual(closeBox!.x);
    }
    await page.screenshot({
      path: testInfo.outputPath(`alert-layout-${width}.png`),
      fullPage: true,
    });
  }
  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});
