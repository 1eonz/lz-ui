import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const placements = [
  'topLeft',
  'top',
  'topRight',
  'rightTop',
  'right',
  'rightBottom',
  'bottomLeft',
  'bottom',
  'bottomRight',
  'leftTop',
  'left',
  'leftBottom',
] as const;

type GeometryRect = NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>;

function rectanglesOverlap(first: GeometryRect, second: GeometryRect): boolean {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

function getAdjacentAxisGap(triggerRect: GeometryRect, tooltipRect: GeometryRect): number {
  const triggerRight = triggerRect.x + triggerRect.width;
  const tooltipRight = tooltipRect.x + tooltipRect.width;
  const triggerBottom = triggerRect.y + triggerRect.height;
  const tooltipBottom = tooltipRect.y + tooltipRect.height;
  const horizontalOverlap =
    Math.min(triggerRight, tooltipRight) - Math.max(triggerRect.x, tooltipRect.x);
  const verticalOverlap =
    Math.min(triggerBottom, tooltipBottom) - Math.max(triggerRect.y, tooltipRect.y);
  const horizontalGap = Math.max(0, triggerRect.x - tooltipRight, tooltipRect.x - triggerRight);
  const verticalGap = Math.max(0, triggerRect.y - tooltipBottom, tooltipRect.y - triggerBottom);

  if (horizontalOverlap > 0 && verticalOverlap > 0) return Number.POSITIVE_INFINITY;
  if (horizontalOverlap > 0) return verticalGap;
  if (verticalOverlap > 0) return horizontalGap;
  return Number.POSITIVE_INFINITY;
}

async function finishBrowserCheck(
  page: Page,
  browserHealth: ReturnType<typeof collectBrowserErrors>,
) {
  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
}

async function getAssociatedTooltip(page: Page, trigger: Locator, name: string): Promise<Locator> {
  await expect(trigger).toHaveAttribute('aria-describedby', /\S+/);
  const describedBy = await trigger.getAttribute('aria-describedby');
  expect(describedBy).toBeTruthy();
  const tooltipId = describedBy?.trim().split(/\s+/).at(-1);
  expect(tooltipId).toBeTruthy();
  return page.getByRole('tooltip', { name, exact: true }).and(page.locator(`[id="${tooltipId}"]`));
}

async function centerReceivesPointer(target: Locator): Promise<boolean> {
  return target.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return hit === element || (hit instanceof Node && element.contains(hit));
  });
}

async function waitForStableTooltipGeometry(tooltip: Locator): Promise<void> {
  await tooltip.evaluate(async (element) => {
    const readRect = () => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    };
    const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    let previous = readRect();
    let stableFrames = 0;

    for (let frame = 0; frame < 120; frame += 1) {
      await nextFrame();
      const current = readRect();
      const unchanged = Object.keys(current).every((key) => {
        const dimension = key as keyof typeof current;
        return Math.abs(current[dimension] - previous[dimension]) < 0.1;
      });
      stableFrames = unchanged ? stableFrames + 1 : 0;
      if (stableFrames >= 4) return;
      previous = current;
    }

    throw new Error('Tooltip 弹层矩形在连续 120 帧内未稳定');
  });
}

async function expectPosition(
  placement: string,
  trigger: Locator,
  tooltip: Locator,
): Promise<void> {
  await waitForStableTooltipGeometry(tooltip);
  const [triggerBox, tooltipBox] = await Promise.all([
    trigger.boundingBox(),
    tooltip.boundingBox(),
  ]);
  expect(triggerBox).not.toBeNull();
  expect(tooltipBox).not.toBeNull();

  const triggerRect = triggerBox!;
  const tooltipRect = tooltipBox!;
  const center = (start: number, size: number) => start + size / 2;
  const tolerance = 6;

  if (placement.startsWith('top')) {
    expect(tooltipRect.y + tooltipRect.height).toBeLessThanOrEqual(triggerRect.y + 1);
    if (placement === 'top') {
      expect(
        Math.abs(
          center(tooltipRect.x, tooltipRect.width) - center(triggerRect.x, triggerRect.width),
        ),
      ).toBeLessThanOrEqual(tolerance);
    } else if (placement === 'topLeft') {
      expect(Math.abs(tooltipRect.x - triggerRect.x)).toBeLessThanOrEqual(tolerance);
    } else {
      expect(
        Math.abs(tooltipRect.x + tooltipRect.width - (triggerRect.x + triggerRect.width)),
      ).toBeLessThanOrEqual(tolerance);
    }
    return;
  }

  if (placement.startsWith('bottom')) {
    expect(
      tooltipRect.y,
      `${placement} 提示应显示在触发按钮下方；触点=${JSON.stringify(triggerRect)}，提示=${JSON.stringify(tooltipRect)}`,
    ).toBeGreaterThanOrEqual(triggerRect.y + triggerRect.height - 1);
    if (placement === 'bottom') {
      expect(
        Math.abs(
          center(tooltipRect.x, tooltipRect.width) - center(triggerRect.x, triggerRect.width),
        ),
      ).toBeLessThanOrEqual(tolerance);
    } else if (placement === 'bottomLeft') {
      expect(Math.abs(tooltipRect.x - triggerRect.x)).toBeLessThanOrEqual(tolerance);
    } else {
      expect(
        Math.abs(tooltipRect.x + tooltipRect.width - (triggerRect.x + triggerRect.width)),
      ).toBeLessThanOrEqual(tolerance);
    }
    return;
  }

  if (placement.startsWith('left')) {
    expect(tooltipRect.x + tooltipRect.width).toBeLessThanOrEqual(triggerRect.x + 1);
    const gap = triggerRect.x - (tooltipRect.x + tooltipRect.width);
    // AntD 的公开方位包含箭头和约 8px 定位间距；32px 上限为边框阴影与亚像素误差留余量，同时能识别明显脱锚。
    expect(gap).toBeGreaterThanOrEqual(-1);
    expect(gap).toBeLessThanOrEqual(32);
    if (placement === 'left') {
      expect(
        Math.abs(
          center(tooltipRect.y, tooltipRect.height) - center(triggerRect.y, triggerRect.height),
        ),
      ).toBeLessThanOrEqual(tolerance);
    } else if (placement === 'leftTop') {
      expect(Math.abs(tooltipRect.y - triggerRect.y)).toBeLessThanOrEqual(tolerance);
    } else {
      expect(
        Math.abs(tooltipRect.y + tooltipRect.height - (triggerRect.y + triggerRect.height)),
      ).toBeLessThanOrEqual(tolerance);
    }
    return;
  }

  expect(placement.startsWith('right')).toBe(true);
  expect(tooltipRect.x).toBeGreaterThanOrEqual(triggerRect.x + triggerRect.width - 1);
  const gap = tooltipRect.x - (triggerRect.x + triggerRect.width);
  expect(gap).toBeGreaterThanOrEqual(-1);
  expect(gap).toBeLessThanOrEqual(32);
  if (placement === 'right') {
    expect(
      Math.abs(
        center(tooltipRect.y, tooltipRect.height) - center(triggerRect.y, triggerRect.height),
      ),
    ).toBeLessThanOrEqual(tolerance);
  } else if (placement === 'rightTop') {
    expect(Math.abs(tooltipRect.y - triggerRect.y)).toBeLessThanOrEqual(tolerance);
  } else {
    expect(
      Math.abs(tooltipRect.y + tooltipRect.height - (triggerRect.y + triggerRect.height)),
    ).toBeLessThanOrEqual(tolerance);
  }
}

test('Tooltip 焦点打开时合并描述，移焦后恢复宿主描述', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/tooltip');

  const trigger = page.getByRole('button', { name: '客户同步状态', exact: true });
  await trigger.focus();
  const tooltip = page.getByRole('tooltip', { name: '最近一次同步于 14:32 完成', exact: true });
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveAttribute('id', 'sync-status-tooltip');
  await expect(trigger).toHaveAttribute(
    'aria-describedby',
    'sync-field-description sync-form-description sync-status-tooltip',
  );

  await page.keyboard.press('Tab');
  await expect(trigger).not.toBeFocused();
  await expect(tooltip).not.toBeVisible();
  await expect(trigger).toHaveAttribute(
    'aria-describedby',
    'sync-field-description sync-form-description',
  );
  await finishBrowserCheck(page, browserHealth);
});

test('Tooltip 受控示例根据外部按钮同步打开和关闭', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/tooltip');
  await waitForBrowserQuiescence(page, browserHealth);

  for (const width of [320, 390]) {
    await page.mouse.move(0, 0);
    await page.setViewportSize({ width, height: 800 });
    await expect(page.getByRole('status').filter({ hasText: '当前为关闭状态。' })).toBeVisible();
    await page.getByRole('button', { name: '打开固定提示', exact: true }).click();
    await expect(page.getByRole('button', { name: '关闭固定提示', exact: true })).toBeVisible();
    await expect(
      page.getByRole('status').filter({ hasText: '提示已打开，可由按钮或触发器关闭。' }),
    ).toBeVisible();

    const toggle = page.getByRole('button', { name: '关闭固定提示', exact: true });
    const trigger = page.getByRole('button', { name: '查看主题提示', exact: true });
    const tooltip = await getAssociatedTooltip(page, trigger, '局部主题变量');
    await expect(tooltip).toBeVisible();
    await waitForStableTooltipGeometry(tooltip);
    const [tooltipBox, toggleBox, clientWidth] = await Promise.all([
      tooltip.boundingBox(),
      toggle.boundingBox(),
      page.evaluate(() => document.documentElement.clientWidth),
    ]);

    expect(tooltipBox).not.toBeNull();
    expect(toggleBox).not.toBeNull();
    expect(tooltipBox!.x).toBeGreaterThanOrEqual(0);
    expect(tooltipBox!.x + tooltipBox!.width).toBeLessThanOrEqual(clientWidth);
    expect(
      rectanglesOverlap(tooltipBox!, toggleBox!),
      `${width}px 视口下受控 Tooltip 不应覆盖开关按钮`,
    ).toBe(false);

    await toggle.click();
    await expect(page.getByRole('button', { name: '打开固定提示', exact: true })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: '当前为关闭状态。' })).toBeVisible();
    await expect(tooltip).not.toBeVisible();
  }
  await finishBrowserCheck(page, browserHealth);
});

test('Tooltip 12 个公开位置均相对触发按钮锚定', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/tooltip');

  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 320, height: 800 },
    { width: 390, height: 800 },
  ]) {
    await page.setViewportSize(viewport);

    for (const placement of placements) {
      const groupName = placement.startsWith('right')
        ? '右侧提示位置'
        : placement.startsWith('left')
          ? '左侧提示位置'
          : placement.startsWith('top')
            ? '上方提示位置'
            : '下方提示位置';
      const trigger = page.getByRole('group', { name: groupName }).getByRole('button', {
        name: placement,
        exact: true,
      });
      await trigger.evaluate((element) =>
        element.scrollIntoView({ block: 'center', inline: 'center' }),
      );
      await trigger.focus();
      const tooltip = await getAssociatedTooltip(page, trigger, '位置说明');
      await expect(tooltip).toBeVisible();

      if (viewport.width === 1280) {
        await expectPosition(placement, trigger, tooltip);
      } else {
        await waitForStableTooltipGeometry(tooltip);
        const [triggerBox, tooltipBox, widths] = await Promise.all([
          trigger.boundingBox(),
          tooltip.boundingBox(),
          page.evaluate(() => ({
            viewport: document.documentElement.clientWidth,
            document: document.documentElement.scrollWidth,
            body: document.body.scrollWidth,
          })),
        ]);

        expect(triggerBox).not.toBeNull();
        expect(tooltipBox).not.toBeNull();
        expect(rectanglesOverlap(triggerBox!, tooltipBox!)).toBe(false);
        expect(tooltipBox!.x).toBeGreaterThanOrEqual(0);
        expect(tooltipBox!.x + tooltipBox!.width).toBeLessThanOrEqual(widths.viewport);
        expect(widths).toEqual({
          viewport: viewport.width,
          document: viewport.width,
          body: viewport.width,
        });
        const adjacentGap = getAdjacentAxisGap(triggerBox!, tooltipBox!);
        expect(
          adjacentGap,
          `${placement} 窄屏提示需与触点至少有一个轴向投影重叠，另一轴间距不超过 32px，实际为 ${adjacentGap}px`,
        ).toBeLessThanOrEqual(32);
      }
    }
  }

  await finishBrowserCheck(page, browserHealth);
});

test('Tooltip 侧向提示不会遮挡同组相邻按钮的鼠标命中区域', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);

  const adjacentTargets = [
    { group: '右侧提示位置', opened: 'rightTop', target: 'right' },
    { group: '左侧提示位置', opened: 'left', target: 'leftTop' },
  ];

  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 930, height: 800 },
    { width: 390, height: 800 },
    { width: 320, height: 800 },
  ]) {
    await page.setViewportSize(viewport);

    for (const { group, opened, target: targetName } of adjacentTargets) {
      await page.goto('/components/feedback/tooltip');
      await waitForBrowserQuiescence(page, browserHealth);

      const controls = page.getByRole('group', { name: group });
      const openedTrigger = controls.getByRole('button', { name: opened, exact: true });
      const target = controls.getByRole('button', { name: targetName, exact: true });
      const visibleTooltips = page.getByRole('tooltip', { name: '位置说明', exact: true });

      await openedTrigger.hover();
      await expect(visibleTooltips).toBeVisible();
      const openedTooltip = await getAssociatedTooltip(page, openedTrigger, '位置说明');
      await waitForStableTooltipGeometry(openedTooltip);
      const [tooltipBox, targetBox] = await Promise.all([
        openedTooltip.boundingBox(),
        target.boundingBox(),
      ]);
      expect(tooltipBox).not.toBeNull();
      expect(targetBox).not.toBeNull();
      expect(
        rectanglesOverlap(tooltipBox!, targetBox!),
        `${viewport.width}px 视口下 ${opened} 的提示矩形不应覆盖 ${targetName}`,
      ).toBe(false);
      expect(
        await centerReceivesPointer(target),
        `${viewport.width}px 视口下 ${opened} 的提示不应覆盖 ${targetName} 的鼠标命中区域`,
      ).toBe(true);

      await target.hover();
      expect(await target.evaluate((element) => element.matches(':hover'))).toBe(true);
      await expect(await getAssociatedTooltip(page, target, '位置说明')).toBeVisible();
    }
  }

  await finishBrowserCheck(page, browserHealth);
});

test('Tooltip 在 320px 和 390px 窄视口把两侧边缘提示翻转到可用空间', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/tooltip');

  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 800 });
    for (const triggerName of ['左侧触点', '右侧触点']) {
      const trigger = page.getByRole('button', { name: triggerName, exact: true });
      await trigger.focus();
      const tooltip = await getAssociatedTooltip(page, trigger, '自动翻转');
      await expect(tooltip).toBeVisible();
      await waitForStableTooltipGeometry(tooltip);
      const [triggerBox, tooltipBox, widths] = await Promise.all([
        trigger.boundingBox(),
        tooltip.boundingBox(),
        page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
        })),
      ]);

      expect(triggerBox).not.toBeNull();
      expect(tooltipBox).not.toBeNull();
      expect(widths).toEqual({ viewport: width, document: width, body: width });
      expect(tooltipBox!.x).toBeGreaterThanOrEqual(0);
      expect(tooltipBox!.x + tooltipBox!.width).toBeLessThanOrEqual(widths.viewport);
      if (triggerName === '左侧触点') {
        expect(tooltipBox!.x, '左侧触点的 left 提示应翻转到按钮右侧').toBeGreaterThanOrEqual(
          triggerBox!.x + triggerBox!.width - 1,
        );
      } else {
        expect(
          tooltipBox!.x + tooltipBox!.width,
          '右侧触点的 right 提示应翻转到按钮左侧',
        ).toBeLessThanOrEqual(triggerBox!.x + 1);
      }
    }
  }

  await finishBrowserCheck(page, browserHealth);
});

test('Tooltip 在系统 reduced-motion 下仍可打开且弹层不运行动画', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/feedback/tooltip');

  const trigger = page.getByRole('button', { name: '客户同步状态', exact: true });
  await trigger.focus();
  const tooltip = page.getByRole('tooltip', { name: '最近一次同步于 14:32 完成', exact: true });
  await expect(tooltip).toBeVisible();
  const motion = await tooltip.evaluate((element) => {
    const style = getComputedStyle(element);
    const relatedAnimations = document.getAnimations().filter((animation) => {
      const effect = animation.effect;
      const target = effect instanceof KeyframeEffect ? effect.target : null;
      return (
        target instanceof Element &&
        (target === element || element.contains(target) || target.contains(element))
      );
    });
    const activeAnimations = relatedAnimations.filter(
      (animation) => animation.playState === 'running',
    ).length;
    return {
      transitionDuration: style.transitionDuration,
      animationDuration: style.animationDuration,
      animationName: style.animationName,
      activeAnimations,
    };
  });

  const transitionDurations = motion.transitionDuration
    .split(',')
    .map((duration) => Number.parseFloat(duration.trim()));
  const animationDurations = motion.animationDuration
    .split(',')
    .map((duration) => Number.parseFloat(duration.trim()));
  const animationNames = motion.animationName.split(',').map((name) => name.trim());

  expect(transitionDurations.every((duration) => duration === 0)).toBe(true);
  expect(animationDurations.every((duration) => duration === 0)).toBe(true);
  expect(animationNames.every((name) => name === 'none')).toBe(true);
  expect(motion.activeAnimations).toBe(0);
  await finishBrowserCheck(page, browserHealth);
});
