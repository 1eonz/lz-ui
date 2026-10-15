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

async function insetHitPointsReceivePointer(target: Locator): Promise<boolean> {
  return target.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const insetX = Math.min(4, rect.width / 4);
    const insetY = Math.min(4, rect.height / 4);
    const points: [number, number][] = [
      [rect.x + rect.width / 2, rect.y + rect.height / 2],
      [rect.x + insetX, rect.y + insetY],
      [rect.right - insetX, rect.y + insetY],
      [rect.x + insetX, rect.bottom - insetY],
      [rect.right - insetX, rect.bottom - insetY],
    ];

    return points.every(([x, y]) => {
      const hit = document.elementFromPoint(x, y);
      return hit === element || (hit instanceof Node && element.contains(hit));
    });
  });
}

async function waitForStableTooltipGeometry(
  tooltip: Locator,
  trigger: Locator,
  context = 'Tooltip',
): Promise<void> {
  const tooltipId = await tooltip.getAttribute('id');
  if (!tooltipId) throw new Error(`${context} 缺少可用于测量的 tooltip id`);

  await trigger.evaluate(
    (triggerElement, { context, tooltipId, requiredStableFrames, timeoutMs }) =>
      new Promise<void>((resolve, reject) => {
        let previous: GeometryRect | null = null;
        let stableFrames = 0;
        const startedAt = performance.now();
        const recentSamples: { elapsed: number; rect: GeometryRect }[] = [];
        const rejectTimeout = () =>
          reject(
            new Error(
              `${context} 矩形未在 ${timeoutMs}ms 内连续稳定 ${requiredStableFrames} 帧；最近采样=${JSON.stringify(recentSamples)}；scrollY=${window.scrollY}`,
            ),
          );

        const sample = () => {
          const tooltipElement = document.getElementById(tooltipId);
          if (!triggerElement.isConnected || !tooltipElement?.isConnected) {
            reject(new Error(`${context} 或触发元素在几何稳定前已从文档中移除`));
            return;
          }

          const triggerRect = triggerElement.getBoundingClientRect();
          const tooltipRect = tooltipElement.getBoundingClientRect();
          const current = {
            x: tooltipRect.x - triggerRect.x,
            y: tooltipRect.y - triggerRect.y,
            width: tooltipRect.width,
            height: tooltipRect.height,
          };
          if (
            triggerRect.width <= 0 ||
            triggerRect.height <= 0 ||
            current.width <= 0 ||
            current.height <= 0
          ) {
            if (performance.now() - startedAt >= timeoutMs) {
              rejectTimeout();
              return;
            }
            previous = null;
            stableFrames = 0;
            requestAnimationFrame(sample);
            return;
          }

          recentSamples.push({ elapsed: Math.round(performance.now() - startedAt), rect: current });
          if (recentSamples.length > 6) recentSamples.shift();

          const unchanged =
            previous !== null &&
            Math.abs(current.x - previous.x) < 0.1 &&
            Math.abs(current.y - previous.y) < 0.1 &&
            Math.abs(current.width - previous.width) < 0.1 &&
            Math.abs(current.height - previous.height) < 0.1;
          stableFrames = unchanged ? stableFrames + 1 : 0;

          if (stableFrames >= requiredStableFrames) {
            resolve();
            return;
          }
          if (performance.now() - startedAt >= timeoutMs) {
            rejectTimeout();
            return;
          }

          previous = current;
          requestAnimationFrame(sample);
        };

        requestAnimationFrame(sample);
      }),
    { context, tooltipId, requiredStableFrames: 4, timeoutMs: 1_200 },
  );
}

async function expectPosition(
  placement: string,
  trigger: Locator,
  tooltip: Locator,
): Promise<void> {
  await waitForStableTooltipGeometry(tooltip, trigger, placement);
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

test('Tooltip 无障碍示例在打开、切换和关闭时更新描述观察值', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/tooltip');

  const statusTrigger = page.getByRole('button', { name: '客户同步状态说明', exact: true });
  const scheduleTrigger = page.getByRole('button', { name: '查看下次同步说明', exact: true });
  const statusObservation = page.getByTestId('tooltip-a11y-describedby-status');
  const scheduleObservation = page.getByTestId('tooltip-a11y-describedby-schedule');
  const statusTooltip = page.getByRole('tooltip', {
    name: '最近一次同步于 14:32 完成',
    exact: true,
  });
  const scheduleTooltip = page.getByRole('tooltip', {
    name: '客户资料已同步 下次同步：今天 22:00',
    exact: true,
  });

  await expect(statusObservation).toHaveText('sync-field-description sync-form-description');
  await expect(scheduleObservation).toHaveText('sync-time-description sync-window-description');

  await statusTrigger.focus();
  await expect(statusTooltip).toBeVisible();
  await expect(statusTooltip).toHaveAttribute('id', 'sync-status-a11y-tooltip');
  await expect(statusTrigger).toHaveAttribute(
    'aria-describedby',
    'sync-field-description sync-form-description sync-status-a11y-tooltip',
  );
  await expect(statusObservation).toHaveText(
    'sync-field-description sync-form-description sync-status-a11y-tooltip',
  );

  await page.keyboard.press('Tab');
  await expect(scheduleTrigger).toBeFocused();
  await expect(statusTooltip).not.toBeVisible();
  await expect(scheduleTooltip).toBeVisible();
  await expect(statusTrigger).toHaveAttribute(
    'aria-describedby',
    'sync-field-description sync-form-description',
  );
  await expect(statusObservation).toHaveText('sync-field-description sync-form-description');
  await expect(scheduleTrigger).toHaveAttribute(
    'aria-describedby',
    'sync-time-description sync-window-description sync-schedule-a11y-tooltip',
  );
  await expect(scheduleObservation).toHaveText(
    'sync-time-description sync-window-description sync-schedule-a11y-tooltip',
  );

  await page.keyboard.press('Tab');
  await expect(scheduleTrigger).not.toBeFocused();
  await expect(scheduleTooltip).not.toBeVisible();
  await expect(scheduleTrigger).toHaveAttribute(
    'aria-describedby',
    'sync-time-description sync-window-description',
  );
  await expect(scheduleObservation).toHaveText('sync-time-description sync-window-description');
  await finishBrowserCheck(page, browserHealth);
});

test('Tooltip 常用属性表在 320px 和 390px 以卡片呈现并保留表格语义和键盘入口', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/components/feedback/tooltip');

    const hint = page.locator('#tooltip-main-api-hint');
    const region = page.getByRole('region', { name: 'Tooltip 常用属性参数表' });
    const table = region.getByRole('table', { name: 'Tooltip 常用属性' });
    const rows = table.getByRole('row');

    await expect(hint).toHaveText(
      '内容区域较窄时，常用属性表会切换为卡片布局，每项仍保留类型、默认值和说明标签及原生表格语义；可通过页首跳转链接聚焦表格区域。',
    );
    await expect(region).toHaveAttribute('aria-describedby', 'tooltip-main-api-hint');
    await expect(region).toHaveAttribute('tabindex', '0');
    await expect(table).toBeVisible();
    await expect(rows).toHaveCount(14);
    await expect(table.getByRole('columnheader')).toHaveCount(4);
    await expect(table.getByRole('rowheader')).toHaveCount(13);
    await expect(table.getByRole('cell')).toHaveCount(39);

    for (const name of ['参数', '类型', '默认值', '说明']) {
      await expect(table.getByRole('columnheader', { name, exact: true })).toHaveCount(1);
    }

    for (const [rowIndex, property] of [
      [3, 'trigger'],
      [9, 'color'],
      [10, 'classNames'],
      [11, 'styles'],
    ] as const) {
      const typeCode = rows.nth(rowIndex).getByRole('cell').nth(0).locator('code');
      await expect(typeCode).toHaveText(`TooltipProps['${property}']`);
      const typeLineCount = await typeCode.evaluate((code) => {
        const range = document.createRange();
        range.selectNodeContents(code);
        const lineTops = new Set(
          Array.from(range.getClientRects()).map((rect) => Math.round(rect.top)),
        );
        return lineTops.size;
      });
      expect(
        typeLineCount,
        `${width}px 下 Tooltip ${property} 类型只能在 TooltipProps 与属性名之间换行`,
      ).toBeLessThanOrEqual(2);
    }

    const placementRow = rows.nth(4);
    await expect(placementRow.getByRole('rowheader')).toHaveText('placement');
    const placementGroups = placementRow
      .getByRole('cell')
      .nth(2)
      .locator('.lx-tooltip-placement-group');
    await expect(placementGroups).toHaveText([
      '上方：top、topLeft、topRight',
      '下方：bottom、bottomLeft、bottomRight',
      '左方：left、leftTop、leftBottom',
      '右方：right、rightTop、rightBottom',
    ]);

    for (let rowIndex = 1; rowIndex < 14; rowIndex += 1) {
      const cells = rows.nth(rowIndex).getByRole('cell');
      await expect(cells).toHaveCount(3);
      for (const [cellIndex, label] of ['类型', '默认值', '说明'].entries()) {
        await expect(cells.nth(cellIndex).locator('.lx-tooltip-api-label')).toHaveText(label);
        await expect(cells.nth(cellIndex).locator('.lx-tooltip-api-label')).toBeVisible();
      }
    }

    const layout = await region.evaluate((element) => {
      const tableElement = element.querySelector('table');
      if (!tableElement) throw new Error('缺少 Tooltip 常用属性表');
      const regionRect = element.getBoundingClientRect();
      const cells = Array.from(tableElement.querySelectorAll('tbody th, tbody td'));
      const triggerDefaultCell = tableElement
        .querySelectorAll('tbody tr')[2]
        ?.querySelectorAll('td')[1];
      const triggerDefaultValue = triggerDefaultCell?.querySelector('.lx-tooltip-api-value');
      if (
        !(triggerDefaultCell instanceof HTMLElement) ||
        !(triggerDefaultValue instanceof HTMLElement)
      ) {
        throw new Error('缺少 Tooltip 触发方式默认值单元格');
      }
      return {
        regionClientWidth: element.clientWidth,
        regionScrollWidth: element.scrollWidth,
        tableClientWidth: tableElement.clientWidth,
        tableScrollWidth: tableElement.scrollWidth,
        triggerDefaultCellWidth: triggerDefaultCell.getBoundingClientRect().width,
        triggerDefaultValueWidth: triggerDefaultValue.getBoundingClientRect().width,
        cellsWithinRegion: cells.every((cell) => {
          const rect = cell.getBoundingClientRect();
          return rect.left >= regionRect.left && rect.right <= regionRect.right;
        }),
        cellsWithoutHorizontalOverflow: cells.every(
          (cell) => cell.scrollWidth <= cell.clientWidth + 1,
        ),
        viewport: window.innerWidth,
        documentClientWidth: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
      };
    });
    expect(layout.regionScrollWidth, `${width}px 下参数表区域不能横向溢出`).toBe(
      layout.regionClientWidth,
    );
    expect(layout.tableClientWidth, `${width}px 下参数表不能超出区域`).toBeLessThanOrEqual(
      layout.regionClientWidth,
    );
    expect(layout.tableScrollWidth, `${width}px 下参数表内容不能超出区域`).toBeLessThanOrEqual(
      layout.regionClientWidth,
    );
    expect(layout.cellsWithinRegion, `${width}px 下表格单元格必须位于区域内`).toBe(true);
    expect(layout.cellsWithoutHorizontalOverflow, `${width}px 下单元格内容不能横向溢出`).toBe(true);
    expect(
      layout.triggerDefaultValueWidth,
      `${width}px 下默认值栏应使用卡片剩余宽度：${JSON.stringify(layout)}`,
    ).toBeGreaterThan(layout.triggerDefaultCellWidth * 0.5);
    expect(layout.viewport).toBe(width);
    expect(layout.documentWidth).toBeLessThanOrEqual(layout.documentClientWidth);
    expect(layout.bodyWidth).toBeLessThanOrEqual(layout.documentClientWidth);

    await region.focus();
    await expect(region).toBeFocused();
    const focusLayout = await region.evaluate((element) => {
      const tableElement = element.querySelector('table');
      const firstRow = tableElement?.querySelector('tbody tr');
      if (!(tableElement instanceof HTMLTableElement) || !(firstRow instanceof HTMLElement)) {
        throw new Error('缺少 Tooltip 卡片表格或首行');
      }
      const regionRect = element.getBoundingClientRect();
      const tableRect = tableElement.getBoundingClientRect();
      const firstRowRect = firstRow.getBoundingClientRect();
      const focusRingProbe = document.createElement('span');
      focusRingProbe.style.color = 'var(--lx-focus-ring, #146ce8)';
      document.body.append(focusRingProbe);
      const themeFocusColor = getComputedStyle(focusRingProbe).color;
      focusRingProbe.remove();
      const focusStyle = getComputedStyle(element);
      return {
        regionLeft: regionRect.left,
        regionRight: regionRect.right,
        tableLeft: tableRect.left,
        tableRight: tableRect.right,
        firstRowLeft: firstRowRect.left,
        firstRowRight: firstRowRect.right,
        borderSpacing: getComputedStyle(tableElement).borderSpacing,
        outlineColor: focusStyle.outlineColor,
        outlineOffset: focusStyle.outlineOffset,
        themeFocusColor,
      };
    });
    expect(
      focusLayout.borderSpacing.split(' ').every((spacing) => Number.parseFloat(spacing) === 0),
    ).toBe(true);
    expect(focusLayout.outlineOffset).toBe('0px');
    expect(focusLayout.outlineColor).toBe(focusLayout.themeFocusColor);
    expect(Math.abs(focusLayout.regionLeft - focusLayout.tableLeft)).toBeLessThanOrEqual(1);
    expect(Math.abs(focusLayout.regionRight - focusLayout.tableRight)).toBeLessThanOrEqual(1);
    expect(Math.abs(focusLayout.tableLeft - focusLayout.firstRowLeft)).toBeLessThanOrEqual(1);
    expect(Math.abs(focusLayout.tableRight - focusLayout.firstRowRight)).toBeLessThanOrEqual(1);

    await region.screenshot({
      path: `.codex/tooltip-api-table-${width}-${test.info().project.name}.png`,
    });

    const measureToolbarOverlap = async (bodyRowIndex: number) =>
      page.evaluate((targetBodyRowIndex) => {
        const toolbarElements = [
          document.querySelector('.dumi-default-header'),
          document.querySelector('.dumi-default-doc-layout-mobile-bar'),
        ].filter((element): element is HTMLElement => element instanceof HTMLElement);
        const toolbars = toolbarElements
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              name: element.className.toString(),
              position: getComputedStyle(element).position,
              top: rect.top,
              bottom: rect.bottom,
              left: rect.left,
              right: rect.right,
            };
          })
          .filter(
            (rect) =>
              (rect.position === 'fixed' || rect.position === 'sticky') &&
              rect.bottom > 0 &&
              rect.top < window.innerHeight,
          );
        const topInset = toolbars
          .filter((toolbar) => toolbar.top <= window.innerHeight / 2)
          .reduce((inset, toolbar) => Math.max(inset, toolbar.bottom), 0);
        const targetRow = document.querySelectorAll('.lx-tooltip-api-table tbody tr')[
          targetBodyRowIndex
        ];
        if (!(targetRow instanceof HTMLElement)) {
          throw new Error('缺少需要检查导航遮挡的 Tooltip 属性行');
        }
        const visibleCells = Array.from(targetRow.querySelectorAll('th, td')).filter((cell) => {
          const rect = cell.getBoundingClientRect();
          return rect.bottom > 0 && rect.top < window.innerHeight;
        });
        const overlaps = visibleCells.flatMap((cell) => {
          const cellRect = cell.getBoundingClientRect();
          return toolbars
            .filter(
              (toolbar) =>
                cellRect.left < toolbar.right &&
                cellRect.right > toolbar.left &&
                cellRect.top < toolbar.bottom &&
                cellRect.bottom > toolbar.top,
            )
            .map((toolbar) => ({
              cell: cell.textContent?.trim().slice(0, 32),
              toolbar: toolbar.name,
            }));
        });
        return {
          scrollY: window.scrollY,
          viewportHeight: window.innerHeight,
          topInset,
          toolbars,
          visibleCellCount: visibleCells.length,
          overlaps,
        };
      }, bodyRowIndex);

    await rows.nth(7).evaluate((row) => {
      document.documentElement.style.scrollBehavior = 'auto';
      const rect = row.getBoundingClientRect();
      const topInset = [
        document.querySelector('.dumi-default-header'),
        document.querySelector('.dumi-default-doc-layout-mobile-bar'),
      ]
        .filter((element): element is HTMLElement => element instanceof HTMLElement)
        .map((element) => {
          const bounds = element.getBoundingClientRect();
          const position = getComputedStyle(element).position;
          return {
            position,
            top: bounds.top,
            bottom: bounds.bottom,
          };
        })
        .filter(
          (toolbar) =>
            (toolbar.position === 'fixed' || toolbar.position === 'sticky') &&
            toolbar.bottom > 0 &&
            toolbar.top < window.innerHeight &&
            toolbar.top <= window.innerHeight / 2,
        )
        .reduce((inset, toolbar) => Math.max(inset, toolbar.bottom), 0);
      const targetCenter = topInset + (window.innerHeight - topInset) / 2;
      window.scrollTo(0, window.scrollY + rect.top + rect.height / 2 - targetCenter);
    });
    await page.waitForTimeout(50);
    const scrolledOverlap = await measureToolbarOverlap(6);
    console.log(`${width}px API row viewport: ${JSON.stringify(scrolledOverlap)}`);
    const scrolledRow = await rows.nth(7).boundingBox();
    expect(scrolledRow).not.toBeNull();
    expect(
      scrolledRow!.y,
      `${width}px 下滚动目标行应位于顶部吸顶导航下方：${JSON.stringify(scrolledOverlap)}`,
    ).toBeGreaterThanOrEqual(scrolledOverlap.topInset);
    expect(
      scrolledRow!.y + scrolledRow!.height,
      `${width}px 下滚动目标行应留在视口内：${JSON.stringify(scrolledOverlap)}`,
    ).toBeLessThanOrEqual(scrolledOverlap.viewportHeight);
    expect(scrolledOverlap.visibleCellCount, `${width}px 下应有可见参数单元格`).toBeGreaterThan(0);
    expect(scrolledOverlap.overlaps, `${width}px 下滚动后的参数表内容不能被固定导航遮挡`).toEqual(
      [],
    );
    await page.screenshot({
      path: `.codex/tooltip-api-viewport-${width}-${test.info().project.name}.png`,
    });

    await page.goto('/components/feedback/tooltip');
    const skipLink = page.getByRole('link', { name: '跳至正文，跳转到主要内容', exact: true });
    const tableJumpLink = page.getByRole('link', {
      name: '跳转到 Tooltip 常用属性参数表起始位置',
      exact: true,
    });
    const jumpTarget = await tableJumpLink.evaluate((link) => {
      const target = new URL((link as HTMLAnchorElement).href);
      return { pathname: target.pathname, hash: target.hash };
    });
    expect(jumpTarget).toEqual({
      pathname: new URL(page.url()).pathname,
      hash: '#tooltip-main-api-table',
    });
    await expect(tableJumpLink).toHaveCSS('position', 'absolute');
    await expect(tableJumpLink).toHaveCSS('clip-path', 'inset(50%)');

    const historyIndexBeforeSkip = await page.evaluate(() => {
      const state = window.history.state as { idx?: unknown } | null;
      return typeof state?.idx === 'number' ? state.idx : null;
    });
    expect(historyIndexBeforeSkip, 'Umi 初始化后应维护浏览器历史索引').not.toBeNull();
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#lx-docs-main-content$/);
    await expect(page.locator('main article#lx-docs-main-content')).toBeFocused();
    const historyIndexAfterSkip = await page.evaluate(() => {
      const state = window.history.state as { idx?: unknown } | null;
      return typeof state?.idx === 'number' ? state.idx : null;
    });
    expect(historyIndexAfterSkip).toBe(historyIndexBeforeSkip! + 1);
    await page.keyboard.press('Tab');
    await expect(tableJumpLink).toBeFocused();
    await expect(tableJumpLink).toBeVisible();
    await expect(tableJumpLink).toHaveCSS('position', 'relative');
    await expect(tableJumpLink).toHaveCSS('clip-path', 'none');
    await tableJumpLink.evaluate((link) => {
      const parent = link.parentElement;
      const article = link.closest('article');
      if (!(parent instanceof HTMLElement) || !(article instanceof HTMLElement)) {
        throw new Error('Tooltip 锚点链接缺少可用于冒泡验证的正文祖先');
      }

      link.addEventListener('click', (event) => {
        link.dataset.jumpLinkClick = String(event.defaultPrevented);
      });
      parent.addEventListener('click', (event) => {
        parent.dataset.jumpParentClick = String(event.defaultPrevented);
      });
      article.addEventListener('click', (event) => {
        article.dataset.jumpArticleClick = String(event.defaultPrevented);
      });
    });
    const historyLengthBeforeJump = await page.evaluate(() => window.history.length);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(
      (url) => url.pathname === jumpTarget.pathname && url.hash === jumpTarget.hash,
    );
    await expect(region).toBeFocused();
    const propagatedClickState = await tableJumpLink.evaluate((link) => ({
      link: link.dataset.jumpLinkClick,
      parent: link.parentElement?.getAttribute('data-jump-parent-click'),
      article: link.closest('article')?.getAttribute('data-jump-article-click'),
    }));
    expect(propagatedClickState).toEqual({ link: 'true', parent: 'true', article: 'true' });
    expect(await page.evaluate(() => window.history.length)).toBe(historyLengthBeforeJump + 1);
    const historyIndexAfterJump = await page.evaluate(() => {
      const state = window.history.state as { idx?: unknown } | null;
      return typeof state?.idx === 'number' ? state.idx : null;
    });
    expect(historyIndexAfterJump).toBe(historyIndexAfterSkip! + 1);
    const readAnchorPosition = () =>
      page.evaluate(() => {
        const regionElement = document.querySelector('.lx-tooltip-api-table');
        const firstRow = regionElement?.querySelector('tbody tr');
        if (!(regionElement instanceof HTMLElement) || !(firstRow instanceof HTMLElement)) {
          return null;
        }

        const regionRect = regionElement.getBoundingClientRect();
        const firstRowRect = firstRow.getBoundingClientRect();
        const topInset = [
          document.querySelector('.dumi-default-header'),
          document.querySelector('.dumi-default-doc-layout-mobile-bar'),
        ]
          .filter((element): element is HTMLElement => element instanceof HTMLElement)
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const position = getComputedStyle(element).position;
            return { position, top: rect.top, bottom: rect.bottom };
          })
          .filter(
            (toolbar) =>
              (toolbar.position === 'fixed' || toolbar.position === 'sticky') &&
              toolbar.bottom > 0 &&
              toolbar.top < window.innerHeight &&
              toolbar.top <= window.innerHeight / 2,
          )
          .reduce((inset, toolbar) => Math.max(inset, toolbar.bottom), 0);
        const targetDocumentTop = regionRect.top + window.scrollY;
        const scrollMarginTop =
          Number.parseFloat(getComputedStyle(regionElement).scrollMarginBlockStart) || 0;
        const maxScrollY = Math.max(
          0,
          (document.scrollingElement?.scrollHeight ?? document.documentElement.scrollHeight) -
            window.innerHeight,
        );
        const targetScrollY = Math.min(
          maxScrollY,
          Math.max(0, targetDocumentTop - scrollMarginTop),
        );
        const expectedTop = targetDocumentTop - targetScrollY;

        return {
          aligned: Math.abs(regionRect.top - expectedTop) <= 2,
          expectedTop,
          actualTop: regionRect.top,
          scrollY: window.scrollY,
          targetScrollY,
          maxScrollY,
          scrollMarginTop,
          topInset,
          firstRowTop: firstRowRect.top,
          firstRowBottom: firstRowRect.bottom,
          viewportHeight: window.innerHeight,
        };
      });
    await expect
      .poll(
        async () => {
          const position = await readAnchorPosition();
          if (position && !position.aligned) {
            console.log(`${width}px WebKit anchor sample: ${JSON.stringify(position)}`);
          }
          return position?.aligned ?? false;
        },
        { intervals: [50, 100, 200], timeout: 2_000 },
      )
      .toBe(true);
    const anchorPosition = await readAnchorPosition();
    expect(anchorPosition).not.toBeNull();

    expect(
      Math.abs(anchorPosition!.actualTop - anchorPosition!.expectedTop),
      `${width}px 下锚点应停在滚动夹限后的预期位置：${JSON.stringify(anchorPosition)}`,
    ).toBeLessThanOrEqual(2);
    expect(anchorPosition!.scrollY).toBeLessThanOrEqual(anchorPosition!.maxScrollY);
    expect(Math.abs(anchorPosition!.scrollY - anchorPosition!.targetScrollY)).toBeLessThanOrEqual(
      2,
    );
    expect(anchorPosition!.actualTop).toBeGreaterThanOrEqual(anchorPosition!.topInset);
    expect(anchorPosition!.firstRowTop).toBeGreaterThanOrEqual(anchorPosition!.topInset);
    expect(anchorPosition!.firstRowBottom).toBeLessThanOrEqual(anchorPosition!.viewportHeight);

    await page.goBack();
    await expect(page).toHaveURL(/#lx-docs-main-content$/);
    await page.goForward();
    await expect(page).toHaveURL(/#tooltip-main-api-table$/);

    const focusPosition = await page.evaluate(() => {
      const regionElement = document.querySelector('.lx-tooltip-api-table');
      const firstRow = regionElement?.querySelector('tbody tr');
      if (!(regionElement instanceof HTMLElement) || !(firstRow instanceof HTMLElement)) {
        throw new Error('缺少 Tooltip 参数表区域或首行');
      }
      const topInset = [
        document.querySelector('.dumi-default-header'),
        document.querySelector('.dumi-default-doc-layout-mobile-bar'),
      ]
        .filter((element): element is HTMLElement => element instanceof HTMLElement)
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const position = getComputedStyle(element).position;
          return { position, top: rect.top, bottom: rect.bottom };
        })
        .filter(
          (toolbar) =>
            (toolbar.position === 'fixed' || toolbar.position === 'sticky') &&
            toolbar.bottom > 0 &&
            toolbar.top < window.innerHeight &&
            toolbar.top <= window.innerHeight / 2,
        )
        .reduce((inset, toolbar) => Math.max(inset, toolbar.bottom), 0);
      return {
        regionTop: regionElement.getBoundingClientRect().top,
        firstRowTop: firstRow.getBoundingClientRect().top,
        firstRowBottom: firstRow.getBoundingClientRect().bottom,
        topInset,
        viewportHeight: window.innerHeight,
      };
    });
    expect(
      focusPosition.regionTop,
      `${width}px 下参数表焦点入口应避开固定导航：${JSON.stringify(focusPosition)}`,
    ).toBeGreaterThanOrEqual(focusPosition.topInset);
    expect(
      focusPosition.firstRowTop,
      `${width}px 下参数首行应显示在固定导航下方：${JSON.stringify(focusPosition)}`,
    ).toBeGreaterThanOrEqual(focusPosition.topInset);
    expect(focusPosition.firstRowBottom).toBeLessThanOrEqual(focusPosition.viewportHeight);
    const focusedOverlap = await measureToolbarOverlap(0);
    console.log(`${width}px API keyboard viewport: ${JSON.stringify(focusedOverlap)}`);
    expect(focusedOverlap.overlaps, `${width}px 下键盘入口不能被导航遮挡`).toEqual([]);
    await page.screenshot({
      path: `.codex/tooltip-api-focus-${width}-${test.info().project.name}.png`,
    });
    await page.keyboard.press('Tab');
    await expect(region).not.toBeFocused();

    const alertLink = page.getByRole('link', { name: 'Alert', exact: true });
    const indexBeforeRouteNavigation = await page.evaluate(() => {
      const state = window.history.state as { idx?: unknown } | null;
      return typeof state?.idx === 'number' ? state.idx : null;
    });
    const sidebarButton = page.getByRole('button', { name: '侧边菜单', exact: true });
    await sidebarButton.click();
    await expect(page.locator('.dumi-default-doc-layout')).toHaveAttribute(
      'data-mobile-sidebar-active',
      'true',
    );
    await alertLink.click();
    await expect(page).toHaveURL(/\/components\/feedback\/alert\/?$/);
    await expect(page.locator('main article h1').first()).toContainText('Alert');
    const indexAfterRouteNavigation = await page.evaluate(() => {
      const state = window.history.state as { idx?: unknown } | null;
      return typeof state?.idx === 'number' ? state.idx : null;
    });
    expect(indexAfterRouteNavigation).toBe(indexBeforeRouteNavigation! + 1);

    await page.goBack();
    await expect(page).toHaveURL(/#tooltip-main-api-table$/);
    await expect(region).toBeFocused();
    await page.goBack();
    await expect(page).toHaveURL(/#lx-docs-main-content$/);
    await expect(page.locator('main article#lx-docs-main-content')).toBeFocused();
    await page.goBack();
    await expect(page).toHaveURL((url) => url.pathname === jumpTarget.pathname && !url.hash);

    await page.goForward();
    await expect(page).toHaveURL(/#lx-docs-main-content$/);
    await expect(page.locator('main article#lx-docs-main-content')).toBeFocused();
    await page.goForward();
    await expect(page).toHaveURL(/#tooltip-main-api-table$/);
    await expect(region).toBeFocused();
    await page.goForward();
    await expect(page).toHaveURL(/\/components\/feedback\/alert\/?$/);
  }

  await finishBrowserCheck(page, browserHealth);
});

test('Tooltip 锚点跳转在既有结构化 history state 中保留 Date 与 Map', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.addInitScript(() => {
    if (window.location.protocol === 'about:') return;
    window.history.replaceState(
      {
        usr: new Map([['同步时间', new Date('2026-10-14T08:30:00.000Z')]]),
        key: 'tooltip-rich-state-entry',
        idx: 0,
      },
      '',
      window.location.href,
    );
  });
  await page.goto('/components/feedback/tooltip');

  const region = page.getByRole('region', { name: 'Tooltip 常用属性参数表' });
  const tableJumpLink = page.getByRole('link', {
    name: '跳转到 Tooltip 常用属性参数表起始位置',
    exact: true,
  });
  await expect(tableJumpLink).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => typeof (window as unknown as Record<string, unknown>).__LX_DOCS_NAVIGATE__,
      ),
    )
    .toBe('function');

  await tableJumpLink.evaluate((link) => (link as HTMLAnchorElement).click());
  await expect(page).toHaveURL(/#tooltip-main-api-table$/);
  await expect(region).toBeFocused();

  const targetEntryState = await page.evaluate(() => {
    const state = window.history.state as { usr?: unknown } | null;
    const userState = state?.usr;
    return {
      hasPrivateAnchorMarker:
        userState !== null && typeof userState === 'object' && '__lxDocsAnchorJump' in userState,
      hasUserPayload: Boolean(userState),
    };
  });
  expect(targetEntryState).toEqual({ hasPrivateAnchorMarker: false, hasUserPayload: false });

  await page.goBack();
  await expect(page).toHaveURL((url) => url.pathname.endsWith('/components/feedback/tooltip'));
  const restoredState = await page.evaluate(() => {
    const state = window.history.state as { usr?: unknown } | null;
    const payload = state?.usr;
    if (!(payload instanceof Map)) return null;
    const timestamp = payload.get('同步时间');
    return {
      isMap: true,
      isDate: timestamp instanceof Date,
      timestamp: timestamp instanceof Date ? timestamp.toISOString() : null,
    };
  });
  expect(restoredState).toEqual({
    isMap: true,
    isDate: true,
    timestamp: '2026-10-14T08:30:00.000Z',
  });

  await page.goForward();
  await expect(page).toHaveURL(/#tooltip-main-api-table$/);
  await expect(region).toBeFocused();
  await finishBrowserCheck(page, browserHealth);
});

test('Tooltip 锚点跳转保留 target、download 与 base target 的浏览器语义', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/tooltip');

  const outcomes = await page.evaluate(() => {
    const createLink = (target?: string, download = false) => {
      const link = document.createElement('a');
      link.className = 'lx-docs-table-jump';
      link.href = `${window.location.pathname}${window.location.search}#tooltip-main-api-table`;
      if (target !== undefined) link.target = target;
      if (download) link.setAttribute('download', 'tooltip.html');
      document.body.append(link);
      return link;
    };

    const clickWithoutDefaultNavigation = (link: HTMLAnchorElement) => {
      let wasAlreadyPrevented = false;
      link.addEventListener(
        'click',
        (event) => {
          wasAlreadyPrevented = event.defaultPrevented;
          event.preventDefault();
        },
        { once: true },
      );
      link.click();
      link.remove();
      return wasAlreadyPrevented;
    };

    const blankTarget = clickWithoutDefaultNavigation(createLink('_blank'));
    const namedTarget = clickWithoutDefaultNavigation(createLink('reports-window'));
    const download = clickWithoutDefaultNavigation(createLink(undefined, true));

    const base = document.createElement('base');
    base.target = '_blank';
    document.head.prepend(base);
    const inheritedBaseTarget = clickWithoutDefaultNavigation(createLink());
    base.remove();

    return { blankTarget, namedTarget, download, inheritedBaseTarget };
  });

  expect(outcomes).toEqual({
    blankTarget: false,
    namedTarget: false,
    download: false,
    inheritedBaseTarget: false,
  });
  await expect(page).not.toHaveURL(/#tooltip-main-api-table$/);
  await finishBrowserCheck(page, browserHealth);
});

test('Tooltip 跳过链接在正文异步挂载后将焦点交给 article', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/tooltip');
  await expect(page.locator('main article h1')).toBeVisible();

  const skipLink = page.getByRole('link', { name: '跳至正文，跳转到主要内容', exact: true });
  await skipLink.focus();
  await skipLink.evaluate((link) => {
    link.addEventListener(
      'click',
      (event) => {
        link.setAttribute('data-default-prevented', String(event.defaultPrevented));
      },
      { once: true },
    );
  });
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!(main instanceof HTMLElement)) throw new Error('缺少初始正文区域');
    main.remove();
  });

  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#lx-docs-main-content$/);
  await expect(skipLink).toHaveAttribute('data-default-prevented', 'false');

  await page.evaluate(() => {
    const main = document.createElement('main');
    const article = document.createElement('article');
    const heading = document.createElement('h1');
    heading.textContent = '异步加载的 Tooltip 文档';
    article.append(heading);
    main.append(article);
    document.body.append(main);
  });

  await expect(page.locator('main article#lx-docs-main-content')).toBeFocused();
  await finishBrowserCheck(page, browserHealth);
});

test('Tooltip 桌面 API 表键盘跳转避开固定导航并停在最终锚点位置', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  for (const width of [767, 768, 1280]) {
    await page.setViewportSize({ width, height: 640 });
    await page.goto('/components/feedback/tooltip');

    const region = page.getByRole('region', { name: 'Tooltip 常用属性参数表' });
    const skipLink = page.getByRole('link', { name: '跳至正文，跳转到主要内容', exact: true });
    const tableJumpLink = page.getByRole('link', {
      name: '跳转到 Tooltip 常用属性参数表起始位置',
      exact: true,
    });
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#lx-docs-main-content$/);
    await expect(page.locator('main article#lx-docs-main-content')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(tableJumpLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#tooltip-main-api-table$/);
    await expect(region).toBeFocused();
    await expect(region).toHaveCSS('outline-style', 'solid');
    await expect(region).toHaveCSS('outline-width', '2px');

    const readAnchorPosition = () =>
      page.evaluate(() => {
        const regionElement = document.querySelector('.lx-tooltip-api-table');
        const scrollContent = regionElement?.querySelector(':scope > .dumi-default-table');
        const tableElement = regionElement?.querySelector('table');
        const firstRow = regionElement?.querySelector('tbody tr');
        const heading = Array.from(document.querySelectorAll('.markdown h3')).find(
          (candidate) => candidate.textContent?.trim() === '常用属性',
        );
        if (
          !(regionElement instanceof HTMLElement) ||
          !(scrollContent instanceof HTMLElement) ||
          !(tableElement instanceof HTMLTableElement) ||
          !(firstRow instanceof HTMLElement) ||
          !(heading instanceof HTMLElement)
        ) {
          return null;
        }

        const regionRect = regionElement.getBoundingClientRect();
        const contentRect = scrollContent.getBoundingClientRect();
        const contentStyle = getComputedStyle(scrollContent);
        const tableRect = tableElement.getBoundingClientRect();
        const tableStyle = getComputedStyle(tableElement);
        const firstRowRect = firstRow.getBoundingClientRect();
        const headingRect = heading.getBoundingClientRect();
        const topInset = [
          document.querySelector('.dumi-default-header'),
          document.querySelector('.dumi-default-doc-layout-mobile-bar'),
        ]
          .filter((element): element is HTMLElement => element instanceof HTMLElement)
          .map((element) => {
            const rect = element.getBoundingClientRect();
            const position = getComputedStyle(element).position;
            return { position, top: rect.top, bottom: rect.bottom };
          })
          .filter(
            (toolbar) =>
              (toolbar.position === 'fixed' || toolbar.position === 'sticky') &&
              toolbar.bottom > 0 &&
              toolbar.top < window.innerHeight &&
              toolbar.top <= window.innerHeight / 2,
          )
          .reduce((inset, toolbar) => Math.max(inset, toolbar.bottom), 0);
        const targetDocumentTop = regionRect.top + window.scrollY;
        const scrollMarginTop =
          Number.parseFloat(getComputedStyle(regionElement).scrollMarginBlockStart) || 0;
        const maxScrollY = Math.max(
          0,
          (document.scrollingElement?.scrollHeight ?? document.documentElement.scrollHeight) -
            window.innerHeight,
        );
        const targetScrollY = Math.min(
          maxScrollY,
          Math.max(0, targetDocumentTop - scrollMarginTop),
        );

        return {
          aligned: Math.abs(regionRect.top - (targetDocumentTop - targetScrollY)) <= 2,
          regionTop: regionRect.top,
          regionBottom: regionRect.bottom,
          regionLeft: regionRect.left,
          regionRight: regionRect.right,
          contentTop: contentRect.top,
          contentBottom: contentRect.bottom,
          contentLeft: contentRect.left,
          contentRight: contentRect.right,
          contentMarginBlockStart: contentStyle.marginBlockStart,
          contentMarginBlockEnd: contentStyle.marginBlockEnd,
          tableTop: tableRect.top,
          tableBottom: tableRect.bottom,
          tableLeft: tableRect.left,
          tableRight: tableRect.right,
          tableMarginBlockStart: tableStyle.marginBlockStart,
          tableMarginBlockEnd: tableStyle.marginBlockEnd,
          headingTop: headingRect.top,
          headingBottom: headingRect.bottom,
          firstRowTop: firstRowRect.top,
          firstRowBottom: firstRowRect.bottom,
          scrollY: window.scrollY,
          targetScrollY,
          maxScrollY,
          topInset,
          viewportHeight: window.innerHeight,
        };
      });
    let position: Awaited<ReturnType<typeof readAnchorPosition>> = null;
    try {
      await expect
        .poll(
          async () => {
            position = await readAnchorPosition();
            return position?.aligned ?? false;
          },
          { intervals: [50, 100, 200], timeout: 5_000 },
        )
        .toBe(true);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(
        `${width}px 下 API 表锚点位置未稳定：${JSON.stringify(position)}；原因=${reason}`,
      );
    }
    expect(position).not.toBeNull();
    expect(position!.scrollY).toBeLessThanOrEqual(position!.maxScrollY);
    expect(Math.abs(position!.scrollY - position!.targetScrollY)).toBeLessThanOrEqual(2);
    expect(
      Math.abs(position!.regionTop - position!.contentTop),
      `${width}px 下焦点滚动区域应从表格滚动内容边界开始：${JSON.stringify(position)}`,
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(position!.regionBottom - position!.contentBottom),
      `${width}px 下焦点滚动区域应在表格滚动内容边界结束：${JSON.stringify(position)}`,
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(position!.regionLeft - position!.contentLeft),
      `${width}px 下焦点滚动区域应与滚动内容左边界对齐：${JSON.stringify(position)}`,
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(position!.regionRight - position!.contentRight),
      `${width}px 下焦点滚动区域应与滚动内容右边界对齐：${JSON.stringify(position)}`,
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(position!.regionTop - position!.tableTop),
      `${width}px 下焦点滚动区域应与表格上边界对齐：${JSON.stringify(position)}`,
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(position!.regionBottom - position!.tableBottom),
      `${width}px 下焦点滚动区域应与表格下边界对齐：${JSON.stringify(position)}`,
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(position!.regionLeft - position!.tableLeft),
      `${width}px 下焦点滚动区域应与表格左边界对齐：${JSON.stringify(position)}`,
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(position!.regionRight - position!.tableRight),
      `${width}px 下焦点滚动区域应与表格右边界对齐：${JSON.stringify(position)}`,
    ).toBeLessThanOrEqual(1);
    expect(position!.contentMarginBlockStart).toBe('0px');
    expect(position!.contentMarginBlockEnd).toBe('0px');
    expect(position!.tableMarginBlockStart).toBe('0px');
    expect(position!.tableMarginBlockEnd).toBe('0px');
    expect(
      position!.regionTop,
      `${width}px 下参数表入口应避开固定导航：${JSON.stringify(position)}`,
    ).toBeGreaterThanOrEqual(position!.topInset);
    expect(
      position!.headingTop,
      `${width}px 下“常用属性”标题顶部应避开固定导航：${JSON.stringify(position)}`,
    ).toBeGreaterThanOrEqual(position!.topInset);
    expect(
      position!.headingBottom,
      `${width}px 下“常用属性”标题应完整显示在视口内：${JSON.stringify(position)}`,
    ).toBeLessThanOrEqual(position!.viewportHeight);
    expect(
      position!.firstRowTop,
      `${width}px 下首行应避开固定导航：${JSON.stringify(position)}`,
    ).toBeGreaterThanOrEqual(position!.topInset);
    expect(position!.firstRowBottom).toBeLessThanOrEqual(position!.viewportHeight);
    await page.screenshot({
      path: `.codex/tooltip-api-focus-${width}-${test.info().project.name}-desktop.png`,
    });
    await page.screenshot({
      path: `.codex/tooltip-api-heading-focus-${width}-${test.info().project.name}.png`,
    });
  }
  await finishBrowserCheck(page, browserHealth);
});

test('Tooltip 固定页眉在明暗主题使用不透明表面且移动菜单仍可开合', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.setViewportSize({ width: 1280, height: 840 });
  await page.goto('/components/feedback/tooltip');

  const themeSelect = page.locator('.dumi-default-color-switch select');
  const header = page.locator('.dumi-default-header:not([data-static])');
  const readHeaderSurface = () =>
    header.evaluate((element) => {
      const style = getComputedStyle(element);
      const colorParts = style.backgroundColor.match(/[\d.]+/g) ?? [];
      return {
        alpha: colorParts.length === 4 ? Number(colorParts[3]) : 1,
        backdropFilter: style.backdropFilter || style.getPropertyValue('-webkit-backdrop-filter'),
      };
    });
  const mobileBar = page.locator('.dumi-default-doc-layout-mobile-bar');
  const readMobileBarSurface = () =>
    mobileBar.evaluate((element) => {
      const style = getComputedStyle(element);
      const colorParts = style.backgroundColor.match(/[\d.]+/g) ?? [];
      return {
        alpha: colorParts.length === 4 ? Number(colorParts[3]) : 1,
        backdropFilter: style.backdropFilter || style.getPropertyValue('-webkit-backdrop-filter'),
      };
    });

  for (const color of ['light', 'dark'] as const) {
    await themeSelect.selectOption(color);
    await expect(page.locator('html')).toHaveAttribute('data-prefers-color', color);
    const surface = await readHeaderSurface();
    expect(surface.alpha, `${color} 主题页眉应完全不透明`).toBe(1);
    expect(surface.backdropFilter, `${color} 主题页眉不应使用背景模糊`).toBe('none');
  }

  for (const width of [320, 767]) {
    await page.setViewportSize({ width, height: 844 });
    for (const color of ['light', 'dark'] as const) {
      await page.evaluate((theme) => {
        document.documentElement.setAttribute('data-prefers-color', theme);
      }, color);
      await expect(page.locator('html')).toHaveAttribute('data-prefers-color', color);
      const surface = await readMobileBarSurface();
      expect(surface.alpha, `${width}px ${color} 主题移动导航应完全不透明`).toBe(1);
      expect(surface.backdropFilter, `${width}px ${color} 主题移动导航不应使用背景模糊`).toBe(
        'none',
      );
    }
  }

  await page.setViewportSize({ width: 390, height: 844 });
  const menuButton = page.getByRole('button', { name: '导航菜单', exact: true });
  for (const color of ['light', 'dark'] as const) {
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(header).toHaveAttribute('data-mobile-active', 'true');
    await themeSelect.selectOption(color);
    await expect(page.locator('html')).toHaveAttribute('data-prefers-color', color);

    const openSurface = await readHeaderSurface();
    expect(openSurface.alpha, `${color} 主题移动菜单页眉应完全不透明`).toBe(1);
    expect(openSurface.backdropFilter).toBe('none');

    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(header).not.toHaveAttribute('data-mobile-active');
    const closedSurface = await readHeaderSurface();
    expect(closedSurface.alpha, `${color} 主题收起菜单页眉应完全不透明`).toBe(1);
    expect(closedSurface.backdropFilter).toBe('none');
  }

  await finishBrowserCheck(page, browserHealth);
});

test('Tooltip 页面末端锚点在滚动夹限后保持可见并正确聚焦', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.setViewportSize({ width: 768, height: 640 });
  await page.goto('/components/feedback/tooltip');
  await page.getByRole('heading', { name: 'Tooltip', exact: true }).waitFor();

  const initialPosition = await page.evaluate(() => {
    const link = document.createElement('a');
    link.className = 'lx-docs-table-jump';
    link.href = '#tooltip-scroll-clamp-target';
    link.textContent = '跳至文档末端';

    const spacer = document.createElement('div');
    spacer.style.blockSize = '400px';

    const target = document.createElement('div');
    target.id = 'tooltip-scroll-clamp-target';
    target.tabIndex = 0;
    target.setAttribute('role', 'region');
    target.setAttribute('aria-label', '测试末端锚点');
    target.style.cssText =
      'box-sizing: border-box; block-size: 48px; scroll-margin-block-start: 128px;';

    document.body.append(link, spacer, target);

    const scrollRoot = document.scrollingElement ?? document.documentElement;
    const targetDocumentTop = target.getBoundingClientRect().top + window.scrollY;
    const scrollMarginTop = Number.parseFloat(getComputedStyle(target).scrollMarginBlockStart) || 0;
    const maxScrollY = Math.max(0, scrollRoot.scrollHeight - window.innerHeight);

    return {
      requestedScrollY: targetDocumentTop - scrollMarginTop,
      maxScrollY,
    };
  });
  expect(initialPosition.requestedScrollY).toBeGreaterThan(initialPosition.maxScrollY);

  await page.evaluate(() => {
    const scrollRoot = document.documentElement as HTMLElement & {
      __tooltipScrollToTops?: number[];
    };
    scrollRoot.__tooltipScrollToTops = [];
    const nativeScrollTo = window.scrollTo.bind(window);
    window.scrollTo = ((first?: number | ScrollToOptions, second?: number) => {
      const top = typeof first === 'number' ? second : first?.top;
      if (typeof top === 'number') scrollRoot.__tooltipScrollToTops?.push(top);
      if (typeof first === 'number') {
        nativeScrollTo(first, second ?? 0);
      } else if (first) {
        nativeScrollTo(first);
      } else {
        nativeScrollTo();
      }
    }) as typeof window.scrollTo;
  });

  const jumpLink = page.getByRole('link', { name: '跳至文档末端', exact: true });
  const target = page.getByRole('region', { name: '测试末端锚点', exact: true });
  await jumpLink.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#tooltip-scroll-clamp-target$/);
  await expect(target).toBeFocused();

  const finalPosition = await page.evaluate(() => {
    const targetElement = document.getElementById('tooltip-scroll-clamp-target');
    const scrollRoot = document.scrollingElement ?? document.documentElement;
    const scrollRootElement = document.documentElement as HTMLElement & {
      __tooltipScrollToTops?: number[];
    };
    const targetRect = targetElement?.getBoundingClientRect();
    const topInset = [
      document.querySelector('.dumi-default-header'),
      document.querySelector('.dumi-default-doc-layout-mobile-bar'),
    ]
      .filter((element): element is HTMLElement => element instanceof HTMLElement)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const position = getComputedStyle(element).position;
        return { position, top: rect.top, bottom: rect.bottom };
      })
      .filter(
        (toolbar) =>
          (toolbar.position === 'fixed' || toolbar.position === 'sticky') &&
          toolbar.bottom > 0 &&
          toolbar.top < window.innerHeight &&
          toolbar.top <= window.innerHeight / 2,
      )
      .reduce((inset, toolbar) => Math.max(inset, toolbar.bottom), 0);

    return {
      scrollY: window.scrollY,
      maxScrollY: Math.max(0, scrollRoot.scrollHeight - window.innerHeight),
      scrollToTops: scrollRootElement.__tooltipScrollToTops ?? [],
      targetTop: targetRect?.top ?? Number.NaN,
      targetBottom: targetRect?.bottom ?? Number.NaN,
      topInset,
      viewportHeight: window.innerHeight,
    };
  });
  expect(Math.abs(finalPosition.scrollY - finalPosition.maxScrollY)).toBeLessThanOrEqual(2);
  expect(finalPosition.scrollToTops).toContain(initialPosition.maxScrollY);
  expect(finalPosition.scrollToTops.every((top) => top <= initialPosition.maxScrollY)).toBe(true);
  expect(finalPosition.targetTop).toBeGreaterThanOrEqual(finalPosition.topInset);
  // 不同浏览器对末端布局的子像素取整可能相差不足 1 CSS px。
  expect(finalPosition.targetBottom).toBeLessThanOrEqual(finalPosition.viewportHeight + 1);

  await finishBrowserCheck(page, browserHealth);
});

test('Tooltip 同路径不同查询参数的链接保留原生路由跳转', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto('/components/feedback/tooltip');
  await page.getByRole('heading', { name: 'Tooltip', exact: true }).waitFor();

  const targetUrl = new URL(page.url());
  targetUrl.searchParams.set('view', 'alternate');
  targetUrl.hash = 'tooltip-main-api-table';
  await page.evaluate((href) => {
    const link = document.createElement('a');
    link.className = 'lx-docs-table-jump';
    link.href = href;
    link.textContent = '跳转到不同查询路由';
    const referenceLink = document.querySelector('a.lx-docs-table-jump');
    if (!(referenceLink instanceof HTMLAnchorElement)) {
      throw new Error('Tooltip 文档中缺少可用于查询参数回归的跳转链接');
    }
    referenceLink.after(link);
  }, targetUrl.href);

  const queryRouteLink = page.getByRole('link', { name: '跳转到不同查询路由', exact: true });
  await queryRouteLink.focus();
  await expect(queryRouteLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\?view=alternate#tooltip-main-api-table$/);

  await finishBrowserCheck(page, browserHealth);
});

test('Tooltip 高级与兼容参数表关联准确的横向滚动提示', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  const tableHints = [
    {
      summary: '查看高级定位与渲染参数',
      region: 'Tooltip 高级定位与渲染参数表',
      hintId: 'tooltip-advanced-api-hint',
      hintText:
        '小屏或侧栏压缩可用宽度时，此表保持列式布局并在当前区域内横向滚动；聚焦表格区域后可用左右方向键浏览。',
    },
    {
      summary: '查看弃用属性和版本迁移说明',
      region: 'Tooltip 兼容与弃用属性表',
      hintId: 'tooltip-compat-api-hint',
      hintText:
        '小屏或侧栏压缩可用宽度时，此表保持列式布局并在当前区域内横向滚动；聚焦表格区域后可用左右方向键浏览。',
    },
  ] as const;

  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/components/feedback/tooltip');

    for (const tableHint of tableHints) {
      await page.getByText(tableHint.summary, { exact: true }).click();
      const region = page.getByRole('region', { name: tableHint.region });
      const hint = page.locator(`#${tableHint.hintId}`);

      await expect(hint).toHaveText(tableHint.hintText);
      await expect(region).toHaveAttribute('aria-describedby', tableHint.hintId);
      await expect(region).toHaveAttribute('tabindex', '0');
      await expect(region.getByRole('table')).toBeVisible();

      const dimensions = await region.evaluate((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));
      expect(
        dimensions.scrollWidth,
        `${width}px 下 ${tableHint.region} 应能在自身区域横向滚动`,
      ).toBeGreaterThan(dimensions.clientWidth);

      await region.focus();
      await page.keyboard.press('ArrowRight');
      await expect
        .poll(() => region.evaluate((element) => element.scrollLeft), {
          intervals: [50, 100, 200],
          timeout: 1_000,
        })
        .toBeGreaterThan(0);

      const pageWidths = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
        viewport: document.documentElement.clientWidth,
      }));
      expect(pageWidths.document).toBeLessThanOrEqual(pageWidths.viewport);
      expect(pageWidths.body).toBeLessThanOrEqual(pageWidths.viewport);
    }
  }

  await finishBrowserCheck(page, browserHealth);
});

test('Tooltip 常用属性在窄中屏完整展示，并在内容宽度边界切换卡片和表格', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  const observedLayouts: string[] = [];
  for (const { viewportWidth: width, regionWidth } of [
    { viewportWidth: 600 },
    { viewportWidth: 601 },
    { viewportWidth: 808 },
    { viewportWidth: 809 },
    { viewportWidth: 1280 },
    { viewportWidth: 1600 },
    { viewportWidth: 1280, regionWidth: 760 },
    { viewportWidth: 1280, regionWidth: 761 },
  ]) {
    await page.setViewportSize({ width, height: 840 });
    await page.goto('/components/feedback/tooltip');

    const region = page.getByRole('region', { name: 'Tooltip 常用属性参数表' });
    const table = region.getByRole('table', { name: 'Tooltip 常用属性' });
    if (regionWidth !== undefined) {
      await region.evaluate((element, exactWidth) => {
        element.style.inlineSize = `${exactWidth}px`;
        element.style.maxInlineSize = '100%';
      }, regionWidth);
    }
    const layout = await region.evaluate((element) => {
      const tableElement = element.querySelector('table');
      const descriptionHeader = tableElement?.querySelector('thead th:last-child');
      if (
        !(tableElement instanceof HTMLTableElement) ||
        !(descriptionHeader instanceof HTMLElement)
      ) {
        throw new Error('缺少 Tooltip 常用属性表或说明列标题');
      }

      const regionRect = element.getBoundingClientRect();
      const descriptionRect = descriptionHeader.getBoundingClientRect();
      return {
        regionWidth: element.clientWidth,
        regionScrollWidth: element.scrollWidth,
        tableWidth: tableElement.clientWidth,
        tableScrollWidth: tableElement.scrollWidth,
        tableDisplay: getComputedStyle(tableElement).display,
        bodyDisplay: getComputedStyle(tableElement.tBodies[0]).display,
        descriptionVisible: descriptionRect.width > 0,
        descriptionFitsRegion:
          descriptionRect.left >= regionRect.left && descriptionRect.right <= regionRect.right,
        viewport: window.innerWidth,
        documentClientWidth: document.documentElement.clientWidth,
        documentWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
      };
    });
    const isCardLayout = (regionWidth ?? layout.regionWidth) <= 760;
    observedLayouts.push(isCardLayout ? 'card' : 'table');

    await expect(table).toHaveCSS('display', isCardLayout ? 'block' : 'table');
    await expect(table.locator('tbody')).toHaveCSS(
      'display',
      isCardLayout ? 'grid' : 'table-row-group',
    );
    await expect(region.locator('.lx-tooltip-api-label').first()).toHaveCSS(
      'display',
      isCardLayout ? 'block' : 'none',
    );

    if (isCardLayout) {
      await expect(region.locator('.lx-tooltip-api-label')).toHaveCount(39);
      await expect(region.locator('.lx-tooltip-api-label:visible')).toHaveCount(39);
    } else {
      expect(layout.descriptionVisible, `${width}px 下说明列标题应可见`).toBe(true);
      expect(
        layout.descriptionFitsRegion,
        `${width}px 下说明列应完整位于可视区域：${JSON.stringify(layout)}`,
      ).toBe(true);
      expect(layout.tableWidth).toBeLessThanOrEqual(layout.regionWidth);
      expect(layout.tableScrollWidth).toBeLessThanOrEqual(layout.regionWidth);
    }

    expect(layout.viewport).toBe(width);
    if (regionWidth !== undefined) {
      expect(layout.regionWidth).toBe(regionWidth);
    }
    expect(layout.documentWidth).toBeLessThanOrEqual(layout.documentClientWidth);
    expect(layout.bodyWidth).toBeLessThanOrEqual(layout.documentClientWidth);
    expect(layout.regionScrollWidth).toBe(layout.regionWidth);
    if (width === 601 || width === 1280) {
      await region.evaluate((element) => {
        const topInset = [
          document.querySelector('.dumi-default-header'),
          document.querySelector('.dumi-default-doc-layout-mobile-bar'),
        ]
          .filter((toolbar): toolbar is HTMLElement => toolbar instanceof HTMLElement)
          .map((toolbar) => {
            const rect = toolbar.getBoundingClientRect();
            const position = getComputedStyle(toolbar).position;
            return {
              position,
              top: rect.top,
              bottom: rect.bottom,
            };
          })
          .filter(
            (toolbar) =>
              (toolbar.position === 'fixed' || toolbar.position === 'sticky') &&
              toolbar.bottom > 0 &&
              toolbar.top < window.innerHeight &&
              toolbar.top <= window.innerHeight / 2,
          )
          .reduce((inset, toolbar) => Math.max(inset, toolbar.bottom), 0);
        const top = window.scrollY + element.getBoundingClientRect().top - topInset - 8;
        window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
      });
      await page.waitForTimeout(50);
      const screenshotWidth =
        regionWidth === undefined ? `${width}` : `${width}-container-${regionWidth}`;
      await page.screenshot({
        path: `.codex/tooltip-api-breakpoint-${screenshotWidth}-${test.info().project.name}.png`,
      });
    }
  }
  expect(observedLayouts).toContain('card');
  expect(observedLayouts).toContain('table');
  await finishBrowserCheck(page, browserHealth);
});

test('Tooltip 窄屏键盘焦点提示不覆盖相邻触发按钮或越过视口', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  for (const width of [320, 390, 930, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/components/feedback/tooltip');

    const trigger = page.getByRole('button', { name: '同步计划', exact: true });
    const adjacentTrigger = page.getByRole('button', { name: '客户同步状态', exact: true });
    await trigger.focus();
    const tooltip = await getAssociatedTooltip(
      page,
      trigger,
      '客户资料已同步 下次同步：今天 22:00',
    );
    await expect(trigger).toBeFocused();
    await expect(tooltip).toBeVisible();
    await waitForStableTooltipGeometry(tooltip, trigger);

    const [tooltipBox, adjacentTriggerBox, triggerBox, widths] = await Promise.all([
      tooltip.boundingBox(),
      adjacentTrigger.boundingBox(),
      trigger.boundingBox(),
      page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      })),
    ]);
    expect(tooltipBox).not.toBeNull();
    expect(adjacentTriggerBox).not.toBeNull();
    expect(triggerBox).not.toBeNull();
    expect(
      Math.abs(triggerBox!.y - adjacentTriggerBox!.y),
      `${width}px 视口下两个提示按钮应保持在同一行`,
    ).toBeLessThanOrEqual(1);
    expect(tooltipBox!.x, `${width}px 视口下 Tooltip 左边界不能越界`).toBeGreaterThanOrEqual(0);
    expect(
      tooltipBox!.x + tooltipBox!.width,
      `${width}px 视口下 Tooltip 右边界不能越界`,
    ).toBeLessThanOrEqual(widths.viewport);
    expect(widths).toEqual({ viewport: width, document: width, body: width });
    expect(
      rectanglesOverlap(tooltipBox!, adjacentTriggerBox!),
      `${width}px 视口下键盘打开的同步计划提示不应覆盖客户同步状态按钮`,
    ).toBe(false);
  }

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
    await waitForStableTooltipGeometry(tooltip, trigger);
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
        await waitForStableTooltipGeometry(tooltip, trigger, `${viewport.width}px ${placement}`);
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
      await waitForStableTooltipGeometry(openedTooltip, openedTrigger);
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
        await insetHitPointsReceivePointer(target),
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
      await waitForStableTooltipGeometry(tooltip, trigger);
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

test.describe('Tooltip 粗指针触点', () => {
  test.use({ isMobile: true, hasTouch: true });

  test('触屏 API 快捷入口可见可点，且使用方法代码块不横向溢出', async ({ page }) => {
    const browserHealth = collectBrowserErrors(page);
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/components/feedback/tooltip');

    const tableJumpLink = page.getByRole('link', {
      name: '跳转到 Tooltip 常用属性参数表起始位置',
      exact: true,
    });
    await expect(tableJumpLink).toBeVisible();
    await expect(tableJumpLink).toHaveCSS('position', 'relative');
    const linkBounds = await tableJumpLink.boundingBox();
    expect(linkBounds).not.toBeNull();
    expect(linkBounds!.width).toBeGreaterThanOrEqual(44);
    expect(linkBounds!.height).toBeGreaterThanOrEqual(44);
    expect(linkBounds!.x).toBeGreaterThanOrEqual(0);
    expect(linkBounds!.x + linkBounds!.width).toBeLessThanOrEqual(320);

    const quickStart = page
      .locator('.markdown pre')
      .filter({ hasText: '<Tooltip title="保存成功">' })
      .first();
    await expect(quickStart).toBeVisible();
    await expect(quickStart).toHaveCSS('white-space', 'pre-wrap');
    const laterExample = page.locator('.markdown pre').nth(1);
    await expect(laterExample).toHaveCSS('white-space', 'pre');

    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 800 });
      const codeGeometry = await quickStart.evaluate((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        right: element.getBoundingClientRect().right,
        viewport: document.documentElement.clientWidth,
      }));
      expect(codeGeometry.scrollWidth).toBeLessThanOrEqual(codeGeometry.clientWidth + 1);
      expect(codeGeometry.right).toBeLessThanOrEqual(codeGeometry.viewport + 1);
      await quickStart.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `.codex/tooltip-quickstart-${width}-${test.info().project.name}.png`,
      });
    }

    await page.setViewportSize({ width: 320, height: 800 });
    await tableJumpLink.tap();
    await expect(page).toHaveURL(/#tooltip-main-api-table$/);
    await expect(page.getByRole('region', { name: 'Tooltip 常用属性参数表' })).toBeFocused();

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.setViewportSize({ width: 767, height: 800 });
    await expect(tableJumpLink).toBeVisible();
    await page.setViewportSize({ width: 768, height: 800 });
    await expect(tableJumpLink).toHaveCSS('position', 'absolute');
    await expect(tableJumpLink).toHaveCSS('clip-path', 'inset(50%)');
    const clippedLinkBounds = await tableJumpLink.boundingBox();
    expect(clippedLinkBounds).not.toBeNull();
    expect(clippedLinkBounds!.width).toBeLessThanOrEqual(1);
    expect(clippedLinkBounds!.height).toBeLessThanOrEqual(1);
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/components/form/input');
    const inputQuickStart = page.locator(
      ".markdown h2[id='使用方法'] + .dumi-default-source-code > pre.prism-code",
    );
    await expect(inputQuickStart.first()).toHaveCSS('white-space', 'pre');
    await finishBrowserCheck(page, browserHealth);
  });

  test('每个 Tooltip 触发器均达到 44×44px 且中心和四个内缩角点可命中', async ({ page }) => {
    const browserHealth = collectBrowserErrors(page);
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/components/feedback/tooltip');

      const hasCoarsePointer = await page.evaluate(
        () => window.matchMedia('(any-pointer: coarse)').matches,
      );
      expect(hasCoarsePointer, '移动触控上下文必须暴露粗指针媒体能力').toBe(true);

      const triggers = page.getByTestId('tooltip-demo-trigger');
      await expect(triggers).toHaveCount(18);

      for (let index = 0; index < 18; index += 1) {
        const trigger = triggers.nth(index);
        await trigger.scrollIntoViewIfNeeded();
        const bounds = await trigger.boundingBox();
        expect(
          bounds,
          `${width}px 下第 ${index + 1} 个 Tooltip 触发按钮应有可见几何`,
        ).not.toBeNull();
        expect(bounds!.width, `${width}px 下第 ${index + 1} 个触发按钮宽度`).toBeGreaterThanOrEqual(
          44,
        );
        expect(
          bounds!.height,
          `${width}px 下第 ${index + 1} 个触发按钮高度`,
        ).toBeGreaterThanOrEqual(44);
        expect(
          await insetHitPointsReceivePointer(trigger),
          `${width}px 下第 ${index + 1} 个触发按钮的中心及内缩角点应由按钮本身接收输入`,
        ).toBe(true);
      }

      const accessibilityTriggers = page.getByTestId('tooltip-a11y-trigger');
      await expect(accessibilityTriggers).toHaveCount(2);
      for (let index = 0; index < 2; index += 1) {
        const trigger = accessibilityTriggers.nth(index);
        await trigger.scrollIntoViewIfNeeded();
        const bounds = await trigger.boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.width, `${width}px 下无障碍示例触发器宽度`).toBeGreaterThanOrEqual(44);
        expect(bounds!.height, `${width}px 下无障碍示例触发器高度`).toBeGreaterThanOrEqual(44);
        expect(await insetHitPointsReceivePointer(trigger)).toBe(true);
      }

      const pageWidths = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      expect(pageWidths).toEqual({ viewport: width, document: width, body: width });
    }

    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/components/feedback/tooltip');

      const firstTrigger = page.getByRole('button', { name: '客户同步状态说明', exact: true });
      const secondTrigger = page.getByRole('button', { name: '查看下次同步说明', exact: true });
      const firstObservation = page.getByTestId('tooltip-a11y-describedby-status');
      const secondObservation = page.getByTestId('tooltip-a11y-describedby-schedule');
      const firstTooltip = page.getByRole('tooltip', {
        name: '最近一次同步于 14:32 完成',
        exact: true,
      });
      const firstOriginalDescription = await firstTrigger.getAttribute('aria-describedby');
      const firstDescriptionTokens = firstOriginalDescription?.split(/\s+/).filter(Boolean) ?? [];
      expect(firstDescriptionTokens.length).toBeGreaterThan(0);

      const secondTooltip = page.getByRole('tooltip', {
        name: '客户资料已同步 下次同步：今天 22:00',
        exact: true,
      });
      const originalDescription = await secondTrigger.getAttribute('aria-describedby');

      await firstTrigger.tap();
      await expect(firstTooltip).toBeVisible();
      const firstTooltipId = await firstTooltip.getAttribute('id');
      expect(firstTooltipId).toBeTruthy();
      await expect
        .poll(
          async () => {
            const describedBy = (await firstTrigger.getAttribute('aria-describedby'))
              ?.split(/\s+/)
              .filter(Boolean);
            return Boolean(
              firstTooltipId &&
              describedBy?.includes(firstTooltipId) &&
              firstDescriptionTokens.every((token) => describedBy.includes(token)),
            );
          },
          { intervals: [50, 100, 200], timeout: 2_000 },
        )
        .toBe(true);
      await expect(firstObservation).toHaveText(
        'sync-field-description sync-form-description sync-status-a11y-tooltip',
      );

      await secondTrigger.tap();
      await expect(firstTooltip).not.toBeVisible();
      await expect
        .poll(() => firstTrigger.getAttribute('aria-describedby'), {
          intervals: [50, 100, 200],
          timeout: 2_000,
        })
        .toBe(firstOriginalDescription);
      await expect(firstObservation).toHaveText(firstOriginalDescription!);
      await expect(secondTooltip).toBeVisible();

      const secondTooltipId = await secondTooltip.getAttribute('id');
      expect(secondTooltipId).toBeTruthy();
      await expect
        .poll(
          async () => {
            const describedBy = (await secondTrigger.getAttribute('aria-describedby'))
              ?.split(/\s+/)
              .filter(Boolean);
            return Boolean(secondTooltipId && describedBy?.includes(secondTooltipId));
          },
          { intervals: [50, 100, 200], timeout: 2_000 },
        )
        .toBe(true);
      await expect(secondObservation).toHaveText(
        'sync-time-description sync-window-description sync-schedule-a11y-tooltip',
      );

      await page.locator('#tooltip-main-api-hint').tap();
      await expect(secondTooltip).not.toBeVisible();
      await expect
        .poll(() => secondTrigger.getAttribute('aria-describedby'), {
          intervals: [50, 100, 200],
          timeout: 2_000,
        })
        .toBe(originalDescription);
      await expect(secondObservation).toHaveText(originalDescription!);
    }

    await page.getByText('主题设置', { exact: true }).first().click();
    await page.getByRole('switch', { name: '紧凑密度' }).first().click();
    const triggers = page.getByTestId('tooltip-demo-trigger');
    for (let index = 0; index < 18; index += 1) {
      const trigger = triggers.nth(index);
      await trigger.scrollIntoViewIfNeeded();
      const bounds = await trigger.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.width, `紧凑密度下第 ${index + 1} 个触发器宽度`).toBeGreaterThanOrEqual(44);
      expect(bounds!.height, `紧凑密度下第 ${index + 1} 个触发器高度`).toBeGreaterThanOrEqual(44);
    }

    await finishBrowserCheck(page, browserHealth);
  });
});
