import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  collectBrowserErrors,
  waitForBrowserQuiescence,
  type BrowserHealth,
} from './browser-health';

const generalRoutes = {
  button: '/components/general/button/',
  icon: '/components/general/icon/',
  typography: '/components/general/typography/',
  space: '/components/general/space/',
  divider: '/components/general/divider/',
} as const;

const viewports = [
  { width: 930, height: 720 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

const apiTablePages = [
  {
    route: generalRoutes.button,
    title: 'Button 按钮',
    hintId: 'button-docs-table-hint',
    tables: ['Button 参数表', 'Button 事件表', 'Button Ref 成员表'],
  },
  {
    route: generalRoutes.icon,
    title: 'Icon 图标',
    hintId: 'icon-docs-table-hint',
    tables: ['Icon 参数表', 'Icon Ref 成员表'],
  },
  {
    route: generalRoutes.typography,
    title: 'Typography 排版',
    hintId: 'typography-docs-table-hint',
    tables: [
      'Typography 共享参数表',
      'Typography Title 与 Link 参数表',
      'Typography CopyableOptions 参数表',
      'Typography 事件与 Ref 类型表',
      'Typography Ref 方法表',
    ],
  },
  {
    route: generalRoutes.space,
    title: 'Space 间距',
    hintId: 'space-docs-table-hint',
    tables: ['Space 参数表', 'Space Ref 成员表'],
  },
  {
    route: generalRoutes.divider,
    title: 'Divider 分割线',
    hintId: 'divider-docs-table-hint',
    tables: ['Divider 参数表', 'Divider Ref 成员表'],
  },
] as const;

async function expectGeneralPage(
  page: Page,
  title: string,
  demoIds: readonly string[],
): Promise<void> {
  await expect(page.locator('h1').first()).toHaveText(title);
  const viewport = page.locator('meta[name="viewport"]');
  await expect(viewport).toHaveCount(1);
  await expect(viewport).toHaveAttribute('content', 'width=device-width, initial-scale=1.0');
  for (const demoId of demoIds) await expect(page.getByTestId(demoId)).toBeVisible();
}

function themeScope(frame: Locator): Locator {
  return frame.locator('xpath=..');
}

async function expectNoRootHorizontalOverflow(page: Page): Promise<void> {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const root = document.documentElement;
          const body = document.body;
          return Math.max(root.scrollWidth - root.clientWidth, body.scrollWidth - body.clientWidth);
        }),
      { message: `${page.url()} 在当前 CSS 视口发生页面级横向溢出`, timeout: 2_000 },
    )
    .toBeLessThanOrEqual(0);
}

async function expectViewportMatrix(page: Page): Promise<void> {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await expectNoRootHorizontalOverflow(page);
  }
}

async function tabTo(page: Page, target: Locator): Promise<void> {
  for (let index = 0; index < 120; index += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  throw new Error('120 次 Tab 后仍未到达目标控件');
}

async function expectDarkCompact(frame: Locator): Promise<void> {
  const summary = frame.getByText('主题设置', { exact: true });
  const details = summary.locator('xpath=..');
  if ((await details.getAttribute('open')) === null) await summary.click();

  const scope = themeScope(frame);
  const darkMode = frame.getByRole('switch', { name: '暗色模式', exact: true });
  const density = frame.getByRole('switch', { name: '紧凑密度', exact: true });
  if (await darkMode.isChecked()) await darkMode.click();
  await expect(scope).toHaveAttribute('data-lx-mode', 'light');
  const lightColors = await frame.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      foreground: style.color,
      surfaceToken: style.getPropertyValue('--lx-color-bg-base').trim(),
      textToken: style.getPropertyValue('--lx-color-text').trim(),
    };
  });

  await darkMode.click();
  await expect(scope).toHaveAttribute('data-lx-mode', 'dark');
  const darkColors = await frame.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      foreground: style.color,
      surfaceToken: style.getPropertyValue('--lx-color-bg-base').trim(),
      textToken: style.getPropertyValue('--lx-color-text').trim(),
    };
  });
  expect(darkColors.background).not.toBe(lightColors.background);
  expect(darkColors.foreground).not.toBe(lightColors.foreground);
  expect(darkColors.surfaceToken).not.toBe(lightColors.surfaceToken);
  expect(darkColors.textToken).not.toBe(lightColors.textToken);

  if (await density.isChecked()) await density.click();
  await expect(scope).toHaveAttribute('data-lx-density', 'comfortable');
  const comfortableHeight = await frame.evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--lx-control-height').trim(),
  );
  await density.click();
  await expect(scope).toHaveAttribute('data-lx-density', 'compact');
  await expect(frame).toHaveCSS('--lx-control-height', '32px');
  const compactHeight = await frame.evaluate((element) =>
    getComputedStyle(element).getPropertyValue('--lx-control-height').trim(),
  );
  expect(comfortableHeight).toBe('40px');
  expect(compactHeight).toBe('32px');
  expect(compactHeight).not.toBe(comfortableHeight);
}

async function expectButtonSizeHeights(
  frame: Locator,
  expected: { default: number; large: number; middle: number; small: number },
): Promise<void> {
  const buttons = {
    default: frame.getByRole('button', { name: '默认尺寸', exact: true }),
    small: frame.getByRole('button', { name: '添加备注', exact: true }),
    middle: frame.getByRole('button', { name: '保存资料', exact: true }),
    large: frame.getByRole('button').filter({ hasText: '创建合同' }),
  };
  for (const size of ['default', 'large', 'middle', 'small'] as const) {
    await expect
      .poll(() => buttons[size].evaluate((element) => element.getBoundingClientRect().height))
      .toBe(expected[size]);
  }
}

async function setCompactDensity(frame: Locator, compact: boolean): Promise<void> {
  const summary = frame.getByText('主题设置', { exact: true });
  const details = summary.locator('xpath=..');
  if ((await details.getAttribute('open')) === null) await summary.click();

  const density = frame.getByRole('switch', { name: '紧凑密度', exact: true });
  if ((await density.isChecked()) !== compact) await density.click();
  await expect(themeScope(frame)).toHaveAttribute(
    'data-lx-density',
    compact ? 'compact' : 'comfortable',
  );
}

async function expectBrowserHealthy(page: Page, health: BrowserHealth): Promise<void> {
  await waitForBrowserQuiescence(page, health);
  expect(health.errors, health.errors.join('\n')).toEqual([]);
}

function statusMessage(frame: Locator): Locator {
  return frame.getByRole('status').filter({ hasText: /\S/ });
}

async function chooseOption(
  page: Page,
  control: Locator,
  optionNames: readonly string[],
  currentName: string,
  targetName: string,
): Promise<void> {
  const currentIndex = optionNames.indexOf(currentName);
  const targetIndex = optionNames.indexOf(targetName);
  expect(currentIndex).toBeGreaterThanOrEqual(0);
  expect(targetIndex).toBeGreaterThanOrEqual(0);
  await control.evaluate((element) =>
    element.scrollIntoView({ block: 'center', inline: 'nearest' }),
  );
  await control.press('Enter');
  const listbox = page.getByRole('listbox');
  await expect(listbox).toHaveCount(1);
  await expect(control).toHaveAttribute('aria-expanded', 'true');
  await expect(listbox.getByRole('option', { name: currentName, exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  const direction = targetIndex >= currentIndex ? 'ArrowDown' : 'ArrowUp';
  for (let index = 0; index < Math.abs(targetIndex - currentIndex); index += 1) {
    await control.press(direction);
  }
  const target = listbox.getByRole('option', { name: targetName, exact: true });
  const targetId = await target.getAttribute('id');
  expect(targetId).not.toBeNull();
  await expect(control).toHaveAttribute('aria-activedescendant', targetId!);
  await control.press('Enter');
  await expect(control).toHaveAttribute('aria-expanded', 'false');
}

async function measureSpaceLayout(spaceRoot: Locator) {
  return spaceRoot.evaluate((element) => {
    const children = Array.from(element.children, (child) => {
      const range = document.createRange();
      range.selectNodeContents(child);
      const textRects = Array.from(range.getClientRects(), ({ top, height }) => ({ top, height }));
      const lineBaselines = textRects
        .filter((rect) => rect.height > 2)
        .reduce<number[]>((baselines, rect) => {
          const baseline = rect.top + rect.height;
          if (!baselines.some((previous) => Math.abs(previous - baseline) <= 1)) {
            baselines.push(baseline);
          }
          return baselines;
        }, []);
      return {
        left: child.getBoundingClientRect().left,
        width: child.getBoundingClientRect().width,
        textLines: lineBaselines.length,
        textRects,
      };
    });
    const lefts = children.map((child) => child.left);
    const rows = lefts.reduce(
      (count, left, index) => count + (index > 0 && left < lefts[index - 1] - 1 ? 1 : 0),
      1,
    );
    return {
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      rows,
      children,
    };
  });
}

test('Button 变体、禁用、键盘动作与异步 loading 恢复', async ({ page }) => {
  const health = collectBrowserErrors(page);
  await page.goto(generalRoutes.button);
  await expectGeneralPage(page, 'Button 按钮', ['button-basic', 'button-variants', 'button-async']);
  const basic = page.getByTestId('button-basic');

  const create = basic.getByRole('button', { name: '新建客户', exact: true });
  await expect
    .poll(() => create.evaluate((element) => element.getBoundingClientRect().height))
    .toBe(40);
  await tabTo(page, create);
  await expect(create).toBeFocused();
  await expect(create).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(statusMessage(basic)).toHaveText('已创建客户草稿');

  await basic.getByRole('button', { name: '保存筛选', exact: true }).click();
  await expect(statusMessage(basic)).toHaveText('已保存当前筛选条件');
  await basic.getByRole('button', { name: '添加条件', exact: true }).click();
  await expect(statusMessage(basic)).toHaveText('已追加一条筛选条件');
  await basic.getByRole('button', { name: '重置', exact: true }).click();
  await expect(statusMessage(basic)).toHaveText('已清空筛选条件');
  await basic.getByRole('button', { name: '操作记录', exact: true }).click();
  await expect(statusMessage(basic)).toHaveText('已展开操作记录');

  const variants = page.getByTestId('button-variants');
  await expectButtonSizeHeights(variants, { default: 40, large: 40, middle: 32, small: 24 });
  const hostSizeScope = variants.getByTestId('button-host-size-scope');
  const defaultUnderHostSmall = hostSizeScope.getByTestId('button-default-under-host-small');
  const defaultUnderHostLarge = hostSizeScope.getByTestId('button-default-under-host-large');
  for (const button of [defaultUnderHostSmall, defaultUnderHostLarge]) {
    await expect
      .poll(() => button.evaluate((element) => element.getBoundingClientRect().height))
      .toBe(40);
  }
  const disabled = variants.getByRole('button', { name: '权限不足', exact: true });
  await expect(disabled).toBeDisabled();
  await variants.getByRole('button', { name: '搜索客户', exact: true }).click();
  await expect(statusMessage(variants)).toHaveText('已打开客户搜索');
  const archive = variants.getByRole('button', { name: '归档客户', exact: true });
  await archive.click();
  await expect(statusMessage(variants)).toHaveText('客户已归档');
  await variants.getByRole('button', { name: '恢复客户', exact: true }).click();
  await expect(statusMessage(variants)).toHaveText('客户已恢复');
  await setCompactDensity(variants, true);
  await expectButtonSizeHeights(variants, { default: 32, large: 40, middle: 32, small: 24 });
  for (const button of [defaultUnderHostSmall, defaultUnderHostLarge]) {
    await expect
      .poll(() => button.evaluate((element) => element.getBoundingClientRect().height))
      .toBe(32);
  }

  const asyncDemo = page.getByTestId('button-async');
  const customerName = asyncDemo.getByRole('textbox', { name: '客户名称', exact: true });
  const customerNameValue = '宁波海曙供应链';
  await customerName.fill(customerNameValue);
  const save = asyncDemo.getByRole('button', { name: '保存客户', exact: true });
  await expect(save).toHaveAccessibleName('保存客户');
  await expect(save.locator('[aria-hidden="true"]').first()).toBeAttached();
  await save.click();
  await expect(asyncDemo.locator('form')).toHaveAttribute('aria-busy', 'true');
  await expect(statusMessage(asyncDemo)).toContainText('正在保存客户资料');
  await asyncDemo.locator('form').getByRole('button').first().click();
  await expect(asyncDemo.locator('form')).toHaveAttribute('aria-busy', 'true');
  await expect(statusMessage(asyncDemo)).toContainText('正在保存客户资料');
  await expect(statusMessage(asyncDemo)).toHaveText('保存失败，客户名称已保留。', {
    timeout: 5_000,
  });
  await expect(customerName).toHaveValue(customerNameValue);
  const retry = asyncDemo.getByRole('button', { name: '重试保存', exact: true });
  await expect(retry).toBeEnabled();
  await expect(retry).toHaveAccessibleName('重试保存');
  await expect(retry.locator('[aria-hidden="true"]').first()).toBeAttached();
  await asyncDemo.getByRole('button', { name: '恢复服务', exact: true }).click();
  await asyncDemo.getByRole('button', { name: '保存客户', exact: true }).click();
  await expect(statusMessage(asyncDemo)).toHaveText(`已保存：${customerNameValue}`, {
    timeout: 5_000,
  });
  await expect(customerName).toHaveValue(customerNameValue);

  await expectViewportMatrix(page);
  await expectDarkCompact(basic);
  await expect
    .poll(() => create.evaluate((element) => element.getBoundingClientRect().height))
    .toBe(32);
  await expectBrowserHealthy(page, health);
});

test('Icon 操作图标有名称、键盘焦点与可用边界', async ({ page }) => {
  const health = collectBrowserErrors(page);
  await page.goto(generalRoutes.icon);
  await expectGeneralPage(page, 'Icon 图标', ['icon-basic', 'icon-variants', 'icon-actions']);

  const samples = page.getByTestId('icon-basic');
  await expect(samples.getByRole('img', { name: '合同文件', exact: true })).toBeVisible();
  await expect(samples.getByRole('img')).toHaveCount(1);

  const actions = page.getByTestId('icon-actions');
  const group = actions.getByRole('group', { name: '合同查看操作', exact: true });
  const favorite = group.getByRole('button', { name: '收藏合同', exact: true });
  await tabTo(page, favorite);
  await expect(favorite).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(group.getByRole('button', { name: '取消收藏合同', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(statusMessage(actions)).toContainText('已收藏');

  await group.getByRole('button', { name: '放大合同', exact: true }).click();
  await expect(actions.getByText('125%', { exact: true })).toBeVisible();
  await group.getByRole('button', { name: '恢复原始缩放', exact: true }).click();
  await expect(actions.getByText('100%', { exact: true })).toBeVisible();

  await expectViewportMatrix(page);
  await expectDarkCompact(actions);
  await expectBrowserHealthy(page, health);
});

test('Typography 标题语义、复制与链接禁用行为', async ({ page, context }) => {
  const health = collectBrowserErrors(page);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(generalRoutes.typography);
  await expectGeneralPage(page, 'Typography 排版', [
    'typography-basic',
    'typography-variants',
    'typography-copy',
  ]);

  const basic = page.getByTestId('typography-basic');
  for (const [level, name] of [
    [1, '客户管理'],
    [2, '华东区域'],
    [3, '重点客户'],
    [4, '杭州云栖科技'],
    [5, '近期跟进'],
  ] as const) {
    await expect(basic.getByRole('heading', { level, name, exact: true })).toBeVisible();
  }
  await expect(
    basic.getByText('客户已完成合同确认，当前进入交付准备阶段。负责人将于周五确认实施排期。'),
  ).toBeVisible();

  const copyDemo = page.getByTestId('typography-copy');
  const code = copyDemo.getByRole('textbox', { name: '客户编号', exact: true });
  await code.fill('KH-7731');
  await copyDemo.getByRole('button', { name: '复制KH-7731', exact: true }).click();
  await expect(copyDemo.getByRole('status').filter({ hasText: '客户编号' })).toHaveText(
    '已复制客户编号：KH-7731',
  );
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe('KH-7731');

  const link = copyDemo.locator('a').filter({ hasText: '合同记录' });
  await expect(link).toHaveAttribute('href', /#.*-contract$/);
  await copyDemo.getByRole('switch', { name: '允许查看合同', exact: true }).click();
  await expect(link).toHaveAttribute('aria-disabled', 'true');
  await expect(link).toHaveAttribute('tabindex', '-1');
  await expect(link).not.toHaveAttribute('href');
  await copyDemo.getByRole('switch', { name: '允许查看合同', exact: true }).click();
  await copyDemo.getByRole('button', { name: '聚焦合同链接', exact: true }).click();
  await expect(link).toBeFocused();

  await expectViewportMatrix(page);
  await expectDarkCompact(basic);
  await expectBrowserHealthy(page, health);
});

test('Space 控件逐项生效并在 320px 验证换行布局', async ({ page }) => {
  const health = collectBrowserErrors(page);
  await page.goto(generalRoutes.space);
  await expectGeneralPage(page, 'Space 间距', ['space-basic', 'space-options', 'space-filters']);
  const options = page.getByTestId('space-options');
  const spaceRoot = options.getByTestId('space-options-preview');

  const gap = options.getByRole('spinbutton', { name: '间距', exact: true });
  await gap.fill('24');
  await gap.press('Tab');
  await expect(spaceRoot).toHaveCSS('column-gap', '24px');
  await expect(spaceRoot).toHaveCSS('row-gap', '24px');

  const width = options.getByRole('spinbutton', { name: '容器宽度', exact: true });
  await width.fill('180');
  await width.press('Tab');
  await expect.poll(() => spaceRoot.evaluate((element) => element.clientWidth)).toBe(180);

  const direction = options.getByRole('combobox', { name: '排列方向', exact: true });
  await chooseOption(page, direction, ['水平', '垂直'], '水平', '垂直');
  await expect(spaceRoot).toHaveCSS('flex-direction', 'column');
  const align = options.getByRole('combobox', { name: '交叉轴对齐', exact: true });
  await chooseOption(page, align, ['居中', '起点', '基线', '拉伸'], '居中', '拉伸');
  await expect(spaceRoot).toHaveCSS('align-items', 'stretch');

  await chooseOption(page, direction, ['水平', '垂直'], '垂直', '水平');
  await expect(spaceRoot).toHaveCSS('flex-direction', 'row');
  await chooseOption(page, align, ['居中', '起点', '基线', '拉伸'], '拉伸', '居中');
  await expect(spaceRoot).toHaveCSS('align-items', 'center');
  await page.setViewportSize({ width: 320, height: 740 });
  await gap.fill('40');
  await gap.press('Tab');
  await expect(spaceRoot).toHaveCSS('column-gap', '40px');
  await expect(spaceRoot).toHaveCSS('row-gap', '40px');
  const wrap = options.getByRole('switch', { name: '允许换行', exact: true });
  await expect(wrap).toBeChecked();
  await wrap.click();
  await expect(spaceRoot).toHaveCSS('flex-wrap', 'nowrap');
  await expectNoRootHorizontalOverflow(page);
  const noWrapLayout = await measureSpaceLayout(spaceRoot);
  expect(noWrapLayout.rows).toBe(1);
  expect(noWrapLayout.scrollWidth).toBeGreaterThan(noWrapLayout.clientWidth);
  expect(noWrapLayout.children).toHaveLength(4);
  expect(
    noWrapLayout.children.every((child) => child.width > 0 && child.textLines === 1),
    JSON.stringify(noWrapLayout.children),
  ).toBe(true);

  const previewRegion = options.getByRole('region', { name: 'Space 排列预览', exact: true });
  await previewRegion.focus();
  await expect(previewRegion).toBeFocused();
  await previewRegion.evaluate((element) => {
    element.scrollLeft = 0;
  });
  const maxPreviewScroll = await previewRegion.evaluate(
    (element) => element.scrollWidth - element.clientWidth,
  );
  expect(maxPreviewScroll).toBeGreaterThan(0);
  await page.keyboard.press('ArrowRight');
  await expect
    .poll(() => previewRegion.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  const previewScroll = await previewRegion.evaluate((element) => element.scrollLeft);
  expect(previewScroll).toBeLessThanOrEqual(maxPreviewScroll);
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => previewRegion.evaluate((element) => element.scrollLeft)).toBe(0);
  await previewRegion.hover();
  await page.mouse.wheel(80, 0);
  await expect
    .poll(() => previewRegion.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0);
  const mouseScroll = await previewRegion.evaluate((element) => element.scrollLeft);
  expect(mouseScroll).toBeLessThanOrEqual(maxPreviewScroll);
  await page.mouse.wheel(-80, 0);
  await expect.poll(() => previewRegion.evaluate((element) => element.scrollLeft)).toBe(0);

  await wrap.click();
  await expect(wrap).toBeChecked();
  await expect(spaceRoot).toHaveCSS('flex-wrap', 'wrap');
  const wrapLayout = await measureSpaceLayout(spaceRoot);
  expect(wrapLayout.rows).toBeGreaterThan(1);
  expect(wrapLayout.rows).toBeGreaterThan(noWrapLayout.rows);
  expect(wrapLayout.scrollWidth).toBeLessThanOrEqual(wrapLayout.clientWidth);
  expect(
    wrapLayout.children.every((child) => child.width > 0 && child.textLines === 1),
    JSON.stringify(wrapLayout.children),
  ).toBe(true);
  await expectNoRootHorizontalOverflow(page);

  await expectViewportMatrix(page);
  await expectDarkCompact(options);
  await expectBrowserHealthy(page, health);
});

test('Divider 变体与原生/命名 separator 语义', async ({ page }) => {
  const health = collectBrowserErrors(page);
  await page.goto(generalRoutes.divider);
  await expectGeneralPage(page, 'Divider 分割线', [
    'divider-basic',
    'divider-variants',
    'divider-sections',
  ]);

  const basic = page.getByTestId('divider-basic');
  await expect(basic.locator('hr')).toHaveCount(1);
  const customerSeparator = basic.getByRole('separator', { name: '客户资料', exact: true });
  await expect(customerSeparator).toHaveAttribute('aria-orientation', 'horizontal');
  const customerLabelId = await customerSeparator.getAttribute('aria-labelledby');
  expect(customerLabelId).not.toBeNull();
  await expect(basic.locator(`#${customerLabelId}`)).toHaveText('客户资料');
  await expect(basic.locator('[role="separator"][aria-orientation="vertical"]')).toHaveCount(1);

  const variants = page.getByTestId('divider-variants');
  const titled = variants.getByRole('separator', { name: '安全策略审计', exact: true });
  await expect(titled).toHaveAttribute('aria-labelledby', /.+/);
  const verticalDivider = variants
    .locator('[role="separator"][aria-orientation="vertical"]')
    .first();
  const verticalLineStyle = () =>
    verticalDivider.evaluate((element) => getComputedStyle(element).borderInlineStartStyle);
  await expect.poll(verticalLineStyle).toBe('dashed');
  const variant = variants.getByRole('combobox', { name: '线型', exact: true });
  await chooseOption(page, variant, ['实线', '虚线', '点线'], '虚线', '点线');
  await expect.poll(verticalLineStyle).toBe('dotted');

  await expectViewportMatrix(page);
  await expectDarkCompact(variants);
  await expectBrowserHealthy(page, health);
});

test('General API、事件与 Ref 表在 320px 可读并支持键盘横向滚动', async ({ page }) => {
  const health = collectBrowserErrors(page);
  await page.setViewportSize({ width: 320, height: 740 });

  for (const component of apiTablePages) {
    await page.goto(component.route);
    await expect(page.locator('h1').first()).toHaveText(component.title);
    await expect(
      page.getByText(
        "import { handleDocsTableKeyDown } from '../../../../docs/demos/docs-table-keydown';",
        { exact: true },
      ),
    ).toHaveCount(0);
    await expectNoRootHorizontalOverflow(page);

    for (const tableName of component.tables) {
      const region = page.getByRole('region', { name: tableName, exact: true });
      await expect(region).toBeVisible();
      await expect(region).toHaveAttribute('tabindex', '0');
      await expect(region).toHaveAttribute('aria-describedby', component.hintId);
      const metrics = await region.evaluate((element) => {
        const table = element.querySelector('table');
        const headers = Array.from(table?.querySelectorAll('thead th') ?? []);
        return {
          regionWidth: element.clientWidth,
          regionScrollWidth: element.scrollWidth,
          tableWidth: table?.getBoundingClientRect().width ?? 0,
          columnWidths: headers.map((header) => header.getBoundingClientRect().width),
        };
      });
      expect(metrics.tableWidth).toBeGreaterThan(metrics.regionWidth);
      expect(metrics.regionScrollWidth).toBeGreaterThan(metrics.regionWidth);
      expect(metrics.columnWidths.length).toBeGreaterThan(1);
      expect(Math.min(...metrics.columnWidths)).toBeGreaterThanOrEqual(52);
    }

    const region = page.getByRole('region', { name: component.tables[0], exact: true });
    await region.focus();
    await expect(region).toBeFocused();
    await region.evaluate((element) => {
      element.scrollLeft = 0;
    });
    const maxScroll = await region.evaluate((element) => element.scrollWidth - element.clientWidth);
    const initialScroll = await region.evaluate((element) => element.scrollLeft);
    expect(maxScroll).toBeGreaterThan(0);
    expect(initialScroll).toBe(0);
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => region.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(initialScroll);
    const scrollAfterRight = await region.evaluate((element) => element.scrollLeft);
    expect(scrollAfterRight).toBeLessThanOrEqual(maxScroll);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBe(initialScroll);
    await expectNoRootHorizontalOverflow(page);
  }

  await expectBrowserHealthy(page, health);
});
