import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

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

async function expectReducedMotion(root: Locator): Promise<void> {
  const failures = await root.evaluate((element) =>
    [element, ...element.querySelectorAll<HTMLElement>('*')]
      .map((element) => {
        const style = window.getComputedStyle(element);
        const transitionDurations = style.transitionDuration
          .split(',')
          .map((duration) => Number.parseFloat(duration) || 0);
        const transitionDelays = style.transitionDelay
          .split(',')
          .map((delay) => Number.parseFloat(delay) || 0);
        const animationNames = style.animationName.split(',').map((name) => name.trim());
        const animationDurations = style.animationDuration
          .split(',')
          .map((duration) => Number.parseFloat(duration) || 0);
        const animationDelays = style.animationDelay
          .split(',')
          .map((delay) => Number.parseFloat(delay) || 0);
        return {
          element: `${element.tagName.toLowerCase()}${element.className ? `.${String(element.className).replace(/\s+/g, '.')}` : ''}`,
          animationNames,
          animationDurations,
          animationDelays,
          transitionDurations,
          transitionDelays,
          valid:
            animationNames.every((name) => name === 'none') &&
            animationDurations.every((duration) => duration === 0) &&
            animationDelays.every((delay) => delay === 0) &&
            transitionDurations.every((duration) => duration === 0) &&
            transitionDelays.every((delay) => delay === 0),
        };
      })
      .filter((entry) => !entry.valid)
      .slice(0, 20),
  );
  expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
}

test('Pagination 受控页码、页大小、空状态与恢复保持公开键盘语义', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/data-display/pagination/');

  const demo = page.getByTestId('pagination-controlled-demo');
  const pagination = demo.getByRole('list', { name: '订单分页' });
  const status = demo.getByRole('status');
  const paginationFrame = demo.getByRole('region', { name: '订单分页控件' });
  await expect(pagination).toBeVisible();
  await expect(paginationFrame).toHaveAttribute('tabindex', '0');
  await expect(status).toHaveText('第 3 页，每页 10 条');
  await expect(demo.getByText('共 248 条', { exact: true })).toBeVisible();

  const pageFour = pagination.getByRole('listitem', { name: '4', exact: true });
  await pageFour.focus();
  await expect(pageFour).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(status).toHaveText('第 4 页，每页 10 条');
  await expect(demo.getByText('采购单 PO-2024-0031', { exact: true })).toBeVisible();

  const pageSizeInput = demo.getByRole('combobox', { name: '每页', exact: true });
  const pageSize = demo.locator('[aria-label=每页]').first();
  await expect(pageSizeInput).toBeVisible();
  await pageSize.click();
  const pageSizeOption = page.getByText('20 条/页', { exact: true }).filter({ visible: true });
  await expect(pageSizeOption).toBeVisible();
  await pageSizeOption.click();
  await expect(status).toHaveText('第 1 页，每页 20 条');
  await expect(demo.getByText('采购单 PO-2024-0020', { exact: true })).toBeVisible();

  const pageJump = demo.getByRole('textbox', { name: '页', exact: true });
  await pageJump.fill('6');
  await demo.getByRole('button', { name: '确定', exact: true }).click();
  await expect(status).toHaveText('第 6 页，每页 20 条');
  await expect(demo.getByText('采购单 PO-2024-0101', { exact: true })).toBeVisible();

  await demo.getByRole('button', { name: '清空订单', exact: true }).click();
  await expect(status).toHaveText('暂无订单；第 1 页，每页 20 条');
  await expect(demo.getByText('暂无订单', { exact: true })).toBeVisible();
  await expect(pagination.getByRole('listitem', { name: '上一页', exact: true })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await expect(pagination.getByRole('listitem', { name: '下一页', exact: true })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await expect(pageSizeInput).toBeDisabled();
  await expect(demo.getByText('采购单 PO-2024-0020', { exact: true })).toHaveCount(0);

  await demo.getByRole('button', { name: '恢复订单', exact: true }).click();
  await expect(pagination.getByRole('listitem', { name: '上一页', exact: true })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await expect(pagination.getByRole('listitem', { name: '下一页', exact: true })).toHaveAttribute(
    'aria-disabled',
    'false',
  );
  await expect(demo.getByText('采购单 PO-2024-0001', { exact: true })).toBeVisible();
  await expectReducedMotion(pagination);

  for (const viewport of viewports) {
    await expectNoRootHorizontalOverflow(page, viewport);
  }

  await page.setViewportSize(viewports[2]);
  const totalSummary = demo.getByText('共 248 条', { exact: true });
  await expect(totalSummary).toHaveCSS('white-space', 'nowrap');
  const summaryHeight = await totalSummary.evaluate(
    (element) => element.getBoundingClientRect().height,
  );
  expect(summaryHeight).toBeLessThan(32);

  await expect
    .poll(() => paginationFrame.evaluate((element) => element.scrollWidth - element.clientWidth))
    .toBeGreaterThan(0);
  await paginationFrame.focus();
  await expect(paginationFrame).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect
    .poll(() => paginationFrame.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  await expectNoRootHorizontalOverflow(page, viewports[2]);

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Tree 受控展开、选择、勾选与键盘状态在主题和窄屏下可恢复', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/data-display/tree/');

  const demo = page.getByTestId('tree-controlled-demo');
  const themeRoot = page.locator('[data-lx-mode]').filter({ has: demo });
  const tree = demo.getByRole('tree', { name: '组织与权限' });
  const treeRoot = demo.locator('.organization-tree-root');
  const status = demo.getByRole('status');
  const treeViewport = demo.getByRole('region', { name: '组织树内容' });
  await expect(tree).toBeVisible();
  await expect(treeViewport).toHaveAttribute('tabindex', '0');
  await expect(treeViewport).toHaveCSS('overflow-x', 'auto');
  await expect(tree.getByRole('treeitem')).toHaveCount(5);
  await expect(tree.getByRole('checkbox', { name: /全球财务共享中心/ })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await expect(status).toHaveText(
    '选中节点：数据安全与信息审计实验室（集团核心生产环境权限）；已勾选：基础架构与内核研发中心',
  );

  await demo.getByRole('button', { name: '全部收起', exact: true }).click();
  await expect(tree.getByRole('treeitem')).toHaveCount(1);
  const headquarters = tree.getByRole('treeitem', { name: '集团控股总部' });
  await expect(headquarters).toHaveAttribute('aria-expanded', 'false');
  await headquarters.click();
  await expect(headquarters).toHaveAttribute('aria-expanded', 'true');
  const businessGroup = tree.getByRole('treeitem', { name: '智能云与产业数字化事业群' });
  await expect(businessGroup).toHaveAttribute('aria-expanded', 'false');
  await businessGroup.click();
  await expect(businessGroup).toHaveAttribute('aria-expanded', 'true');
  await expect(tree.getByRole('treeitem')).toHaveCount(5);

  await tree.getByRole('treeitem', { name: '基础架构与内核研发中心' }).click();
  await expect(status).toHaveText(
    '选中节点：基础架构与内核研发中心；已勾选：基础架构与内核研发中心',
  );
  await tree.getByRole('checkbox', { name: /基础架构与内核研发中心/ }).click();
  await expect(status).toHaveText('选中节点：基础架构与内核研发中心；已勾选：无');

  await page.setViewportSize(viewports[2]);
  await treeViewport.focus();
  await expect(treeViewport).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect
    .poll(() => treeViewport.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);

  // 保持浏览器管理 Tree 的键盘焦点，不依赖实现内部的焦点代理节点。
  await demo.getByRole('button', { name: '清空选择', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(treeViewport).toBeFocused();
  await page.keyboard.press('Tab');
  await expect
    .poll(() => treeRoot.evaluate((element) => element.contains(document.activeElement)))
    .toBe(true);
  await expect(treeRoot).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');
  await expect(status).toContainText('集团控股总部');
  expect(await status.textContent()).not.toMatch(/\b(?:security|rd|hq)\b/);

  await demo.getByText('主题设置', { exact: true }).click();
  await demo.getByRole('switch', { name: '暗色模式', exact: true }).click();
  await demo.getByRole('switch', { name: '紧凑密度', exact: true }).click();
  await expect(themeRoot).toHaveAttribute('data-lx-mode', 'dark');
  await expect(themeRoot).toHaveAttribute('data-lx-density', 'compact');
  await expectReducedMotion(tree);

  for (const viewport of viewports) {
    await expectNoRootHorizontalOverflow(page, viewport);
  }

  const deepNode = tree.getByRole('treeitem', { name: /数据安全与信息审计实验室/ });
  const deepTitle = tree.getByText('数据安全与信息审计实验室（集团核心生产环境权限）', {
    exact: true,
  });
  await expect
    .poll(() => treeViewport.evaluate((element) => element.scrollWidth - element.clientWidth))
    .toBeGreaterThan(0);
  await expect.poll(async () => (await deepNode.boundingBox())?.width ?? 0).toBeGreaterThan(400);
  for (const viewport of viewports.slice(1)) {
    await page.setViewportSize(viewport);
    await treeViewport.focus();
    for (let step = 0; step < 20; step += 1) {
      await page.keyboard.press('ArrowLeft');
    }
    await expect.poll(() => treeViewport.evaluate((element) => element.scrollLeft)).toBe(0);
    const viewportBounds = await treeViewport.boundingBox();
    if (!viewportBounds) throw new Error('未能测量组织树键盘滚动区');
    const measureTitleEdge = (edge: 'start' | 'end') =>
      deepTitle.evaluate((element, edge) => {
        const textNode = element.firstChild;
        const textLength = textNode?.textContent?.length ?? 0;
        if (!textNode || textNode.nodeType !== Node.TEXT_NODE || textLength === 0) return null;
        const range = document.createRange();
        const offset = edge === 'start' ? 0 : textLength - 1;
        range.setStart(textNode, offset);
        range.setEnd(textNode, offset + 1);
        const bounds = range.getBoundingClientRect();
        return { left: bounds.left, right: bounds.right };
      }, edge);

    // 标题宽于窄屏时分两端核验，确保键盘滚动能逐段读完。
    await expect(deepTitle).toHaveText('数据安全与信息审计实验室（集团核心生产环境权限）');
    await expect
      .poll(async () => {
        const firstCharacter = await measureTitleEdge('start');
        return Boolean(
          firstCharacter &&
          firstCharacter.left >= viewportBounds.x &&
          firstCharacter.right <= viewportBounds.x + viewportBounds.width,
        );
      })
      .toBe(true);

    const startingScroll = await treeViewport.evaluate((element) => element.scrollLeft);
    for (let step = 0; step < 20; step += 1) {
      await page.keyboard.press('ArrowRight');
    }
    await expect
      .poll(() => treeViewport.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(startingScroll);
    await expect
      .poll(async () => {
        const lastCharacter = await measureTitleEdge('end');
        return Boolean(
          lastCharacter &&
          lastCharacter.left >= viewportBounds.x &&
          lastCharacter.right <= viewportBounds.x + viewportBounds.width,
        );
      })
      .toBe(true);
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Pagination 与 Tree 在粗指针下公开操作目标不小于 44px', async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 930, height: 720 },
  });
  const page = await context.newPage();
  const browserHealth = collectBrowserErrors(page);

  try {
    await page.goto('/components/data-display/pagination/');
    const paginationDemo = page.getByTestId('pagination-controlled-demo');
    const pagination = paginationDemo.getByRole('list', {
      name: '订单分页',
    });
    await expect(pagination).toBeVisible();
    test.skip(
      !(await page.evaluate(() => window.matchMedia('(any-pointer: coarse)').matches)),
      '当前浏览器模拟未暴露 coarse pointer，跳过触控尺寸验收',
    );

    for (const viewport of viewports.slice(1)) {
      await page.setViewportSize(viewport);
      await expectNoRootHorizontalOverflow(page, viewport);

      const paginationTargets: [string, Locator][] = [
        ['上一页', pagination.getByTitle('上一页', { exact: true })],
        ['下一页', pagination.getByTitle('下一页', { exact: true })],
        ['清空订单', paginationDemo.getByRole('button', { name: '清空订单', exact: true })],
        ['每页数量选择器', paginationDemo.getByRole('combobox', { name: '每页' })],
        ['跳转页码输入', paginationDemo.getByRole('textbox', { name: '页', exact: true })],
        ['跳转确认按钮', paginationDemo.getByRole('button', { name: '确定', exact: true })],
      ];
      for (const [name, target] of paginationTargets) {
        await expect(target).toBeVisible();
        await expect
          .poll(async () => (await target.boundingBox())?.width ?? 0, {
            message: `${name} 宽度应至少为 44px`,
          })
          .toBeGreaterThanOrEqual(44);
        await expect
          .poll(async () => (await target.boundingBox())?.height ?? 0, {
            message: `${name} 高度应至少为 44px`,
          })
          .toBeGreaterThanOrEqual(44);
      }

      await paginationDemo.getByRole('button', { name: '清空订单', exact: true }).click();
      const restoreOrders = paginationDemo.getByRole('button', { name: '恢复订单', exact: true });
      await expect(restoreOrders).toBeVisible();
      await expect
        .poll(async () => (await restoreOrders.boundingBox())?.height ?? 0)
        .toBeGreaterThanOrEqual(44);
      await restoreOrders.click();
    }

    await page.goto('/components/data-display/tree/');
    const treeDemo = page.getByTestId('tree-controlled-demo');
    const tree = treeDemo.getByRole('tree', { name: '组织与权限' });
    const treeItem = tree.getByRole('treeitem', { name: '集团控股总部' });
    const checkbox = tree.getByRole('checkbox', { name: /集团控股总部/ });

    for (const viewport of viewports.slice(1)) {
      await page.setViewportSize(viewport);
      await expectNoRootHorizontalOverflow(page, viewport);

      const treeActions: [string, Locator][] = [
        ['全部展开', treeDemo.getByRole('button', { name: '全部展开', exact: true })],
        ['全部收起', treeDemo.getByRole('button', { name: '全部收起', exact: true })],
        ['清空选择', treeDemo.getByRole('button', { name: '清空选择', exact: true })],
      ];
      for (const [name, target] of treeActions) {
        await expect(target).toBeVisible();
        await expect
          .poll(async () => (await target.boundingBox())?.width ?? 0, {
            message: `${name}宽度应至少为 44px`,
          })
          .toBeGreaterThanOrEqual(44);
        await expect
          .poll(async () => (await target.boundingBox())?.height ?? 0, {
            message: `${name}高度应至少为 44px`,
          })
          .toBeGreaterThanOrEqual(44);
      }
      await expect(treeItem).toBeVisible();
      await expect(checkbox).toBeVisible();
      await expect
        .poll(async () => (await treeItem.boundingBox())?.width ?? 0)
        .toBeGreaterThanOrEqual(44);
      await expect
        .poll(async () => (await treeItem.boundingBox())?.height ?? 0)
        .toBeGreaterThanOrEqual(44);
      await expect
        .poll(async () => (await checkbox.boundingBox())?.width ?? 0)
        .toBeGreaterThanOrEqual(44);
      await expect
        .poll(async () => (await checkbox.boundingBox())?.height ?? 0)
        .toBeGreaterThanOrEqual(44);
      await expect(treeItem).toHaveAttribute('aria-expanded', 'true');
    }

    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  } finally {
    await context.close();
  }
});
