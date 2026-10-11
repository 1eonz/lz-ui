import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const appearances = [
  { label: '商务', value: 'business' },
  { label: '轻盈', value: 'soft' },
  { label: '玻璃', value: 'glass' },
] as const;

const brandColors = [
  { label: '海洋蓝', value: 'blue' },
  { label: '活力橙', value: 'orange' },
  { label: '翡翠绿', value: 'green' },
  { label: '智慧紫', value: 'purple' },
  { label: '清透青', value: 'cyan' },
  { label: '品牌玫红', value: 'rose' },
] as const;

const paletteColors = [
  { label: '青瓷桂影', value: 'celadon-laurel' },
  { label: '暮桃微光', value: 'twilight-peach' },
  { label: '石榴杏仁', value: 'garnet-almond' },
  { label: '松针琥珀', value: 'pine-amber' },
  { label: '雾色燕麦', value: 'misty-oatmeal' },
  { label: '豆沙墨色', value: 'bean-sand-ink' },
  { label: '奶酪远青', value: 'cheese-distant-cyan' },
] as const;

const combinedThemes = [
  {
    mode: 'light',
    appearance: appearances[0],
    density: 'comfortable',
    color: brandColors[0],
    palette: paletteColors[0],
  },
  {
    mode: 'light',
    appearance: appearances[1],
    density: 'compact',
    color: brandColors[1],
    palette: { label: '使用品牌色', value: 'brand' },
  },
  {
    mode: 'dark',
    appearance: appearances[1],
    density: 'comfortable',
    color: brandColors[2],
    palette: paletteColors[3],
  },
  {
    mode: 'dark',
    appearance: appearances[2],
    density: 'compact',
    color: brandColors[5],
    palette: paletteColors[5],
  },
] as const;

type RGB = [number, number, number];

function parseCssColor(value: string): RGB {
  const hex = value.match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
  if (hex) {
    const expanded = hex.length === 3 ? [...hex].map((part) => `${part}${part}`).join('') : hex;
    return [0, 2, 4].map((offset) =>
      Number.parseInt(expanded.slice(offset, offset + 2), 16),
    ) as RGB;
  }

  const channels = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (channels) return [Number(channels[1]), Number(channels[2]), Number(channels[3])];
  throw new Error(`无法解析颜色值：${value}`);
}

function relativeLuminance(value: string): number {
  return parseCssColor(value)
    .map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrastRatio(first: string, second: string): number {
  const [high, low] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a);
  return (high + 0.05) / (low + 0.05);
}

async function openThemeSettings(frame: Locator): Promise<void> {
  const summary = frame.getByText('主题设置', { exact: true });
  const details = summary.locator('xpath=..');
  if ((await details.getAttribute('open')) === null) await summary.click();
  await expect(summary).toBeVisible();
}

async function setMode(frame: Locator, mode: 'light' | 'dark'): Promise<void> {
  const toggle = frame.getByRole('switch', { name: '暗色模式', exact: true });
  const shouldBeChecked = mode === 'dark';
  if ((await toggle.getAttribute('aria-checked')) !== String(shouldBeChecked)) await toggle.click();
  await expect(frame).toHaveAttribute('data-lx-mode', mode);
  await expect(toggle).toHaveAttribute('aria-checked', String(shouldBeChecked));
}

async function setDensity(frame: Locator, density: 'comfortable' | 'compact'): Promise<void> {
  const toggle = frame.getByRole('switch', { name: '紧凑密度', exact: true });
  const shouldBeChecked = density === 'compact';
  if ((await toggle.getAttribute('aria-checked')) !== String(shouldBeChecked)) await toggle.click();
  await expect(frame).toHaveAttribute('data-lx-density', density);
  await expect(toggle).toHaveAttribute('aria-checked', String(shouldBeChecked));
}

async function chooseAppearance(
  frame: Locator,
  appearance: (typeof appearances)[number],
): Promise<void> {
  const radio = frame.getByRole('radio', { name: appearance.label, exact: true });
  await frame.getByText(appearance.label, { exact: true }).click();
  await expect(radio).toBeChecked();
  await expect(frame).toHaveAttribute('data-lx-appearance', appearance.value);
}

async function chooseSelectOption(
  page: Page,
  frame: Locator,
  name: '品牌色' | '东方配色',
  label: string,
  options: readonly string[],
  selectedIndexes: Map<'品牌色' | '东方配色', number>,
): Promise<void> {
  const optionIndex = options.indexOf(label);
  expect(optionIndex, `${name} 缺少选项“${label}”`).toBeGreaterThanOrEqual(0);
  const currentIndex = selectedIndexes.get(name);
  expect(currentIndex, `没有记录 ${name} 当前选项索引`).toBeDefined();
  const select = frame.getByRole('combobox', { name, exact: true });
  await select.evaluate((element) =>
    element.scrollIntoView({ block: 'center', inline: 'nearest' }),
  );
  // 滚动后将指针移离下拉区域，避免上一次 Tooltip 点击残留的坐标触发候选 hover。
  await page.mouse.move(0, 0);
  await select.press('Enter');
  await expect(select).toHaveAttribute('aria-expanded', 'true');

  const distance = Math.abs(optionIndex - currentIndex!);
  const direction = optionIndex >= currentIndex! ? 'ArrowDown' : 'ArrowUp';
  for (let index = 0; index < distance; index += 1) await select.press(direction);

  const optionId = await select.getAttribute('aria-activedescendant');
  expect(optionId, `${name} 未通过 aria-activedescendant 指向活动选项`).toBeTruthy();
  const activeOption = await page.evaluate((id) => {
    const option = id ? document.getElementById(id) : null;
    return {
      role: option?.getAttribute('role') ?? null,
      label: option?.getAttribute('aria-label') ?? null,
    };
  }, optionId);
  expect(activeOption, `${name} 的活动选项与键盘目标不一致`).toEqual({
    role: 'option',
    label,
  });

  await select.press('Enter');
  await expect(select).toHaveAttribute('aria-expanded', 'false');
  await expect(frame.getByTitle(label, { exact: true })).toBeVisible();
  selectedIndexes.set(name, optionIndex);
}

async function getAssociatedTooltip(page: Page, trigger: Locator, name: string): Promise<Locator> {
  const description = await trigger.getAttribute('aria-describedby');
  expect(description).toMatch(/\S+/);
  const tooltip = page.getByRole('tooltip', { name, exact: true });
  await expect(tooltip).toBeVisible();
  const tooltipId = await tooltip.getAttribute('id');
  expect(tooltipId).toBeTruthy();
  expect(description?.trim().split(/\s+/)).toContain(tooltipId);
  return tooltip;
}

async function expectPopupInViewport(page: Page, tooltip: Locator): Promise<void> {
  await expect
    .poll(async () => {
      const box = await tooltip.boundingBox();
      return box !== null && box.width > 0 && box.height > 0;
    })
    .toBe(true);
  const box = await tooltip.boundingBox();
  const viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(0);
  expect(box!.height).toBeGreaterThan(0);
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
}

async function waitForStableElementGeometry(target: Locator): Promise<void> {
  await target.evaluate(async (element) => {
    const readRect = () => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    };
    const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    let previous = readRect();
    let stableFrames = 0;

    for (let frame = 0; frame < 60; frame += 1) {
      await nextFrame();
      const current = readRect();
      const unchanged = Object.keys(current).every((key) => {
        const dimension = key as keyof typeof current;
        return Math.abs(current[dimension] - previous[dimension]) < 0.1;
      });
      stableFrames = unchanged ? stableFrames + 1 : 0;
      if (stableFrames >= 2) return;
      previous = current;
    }

    throw new Error('Tooltip 触发器矩形未能稳定');
  });
}

async function readTooltipColors(
  tooltip: Locator,
): Promise<{ background: string; text: string; border: string }> {
  return tooltip.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      text: style.color,
      border: style.borderTopColor,
    };
  });
}

async function readToken(frame: Locator, name: string): Promise<string> {
  return frame.evaluate(
    (element, property) => getComputedStyle(element).getPropertyValue(property).trim(),
    name,
  );
}

async function expectSpotlightColors(tooltip: Locator): Promise<void> {
  const colors = await readTooltipColors(tooltip);
  expect(parseCssColor(colors.background)).toEqual(parseCssColor('#1f2937'));
  expect(parseCssColor(colors.text)).toEqual(parseCssColor('#ffffff'));
  expect(contrastRatio(colors.text, colors.background)).toBeGreaterThanOrEqual(4.5);
}

async function expectTokenColors(
  frame: Locator,
  tooltip: Locator,
  themeLabel: string,
): Promise<void> {
  const [colors, backgroundToken, textToken, borderToken] = await Promise.all([
    readTooltipColors(tooltip),
    readToken(frame, '--lx-color-bg-elevated'),
    readToken(frame, '--lx-color-text'),
    readToken(frame, '--lx-color-border'),
  ]);

  expect(parseCssColor(colors.background), `${themeLabel} 弹层表面未跟随提升层 token`).toEqual(
    parseCssColor(backgroundToken),
  );
  expect(parseCssColor(colors.text), `${themeLabel} 弹层文字未跟随文本 token`).toEqual(
    parseCssColor(textToken),
  );
  expect(parseCssColor(colors.border), `${themeLabel} 弹层边框未跟随边框 token`).toEqual(
    parseCssColor(borderToken),
  );
  expect(
    contrastRatio(colors.text, colors.background),
    `${themeLabel} 弹层正文与表面需满足 WCAG AA 4.5:1`,
  ).toBeGreaterThanOrEqual(4.5);
}

async function openTokenTooltip(page: Page, frame: Locator, themeLabel: string): Promise<void> {
  const openButton = frame.getByRole('button', { name: '打开固定提示', exact: true });
  const trigger = frame.getByRole('button', { name: '查看主题提示', exact: true });
  await trigger.scrollIntoViewIfNeeded();
  await expect(trigger).toBeInViewport();
  await waitForStableElementGeometry(trigger);
  await expect(openButton).toBeVisible();
  await openButton.focus();
  await expect(openButton).toBeFocused();
  await openButton.press('Enter');

  const closeButton = frame.getByRole('button', { name: '关闭固定提示', exact: true });
  const status = frame.getByRole('status');
  await expect(status).toHaveText('提示已打开，可由按钮或触发器关闭。');
  await expect(closeButton).toBeVisible();
  await expect(openButton).toHaveCount(0);

  const tooltip = await getAssociatedTooltip(page, trigger, '局部主题变量');
  await expect(
    trigger.locator('xpath=..').getByRole('tooltip', { name: '局部主题变量' }),
  ).toHaveCount(1);
  await expectTokenColors(frame, tooltip, themeLabel);
  await expectPopupInViewport(page, tooltip);

  await closeButton.focus();
  await expect(closeButton).toBeFocused();
  await closeButton.press('Enter');
  await expect(status).toHaveText('当前为关闭状态。');
  await expect(closeButton).toHaveCount(0);
  await expect(openButton).toBeVisible();
  await expect(tooltip).not.toBeVisible();
}

async function expectCombinedTheme(
  frame: Locator,
  combination: (typeof combinedThemes)[number],
): Promise<void> {
  const expectedColor =
    combination.palette.value === 'brand' ? combination.color.value : combination.palette.value;

  await expect(frame).toHaveAttribute('data-lx-mode', combination.mode);
  await expect(frame).toHaveAttribute('data-lx-appearance', combination.appearance.value);
  await expect(frame).toHaveAttribute('data-lx-density', combination.density);
  await expect(frame).toHaveAttribute('data-lx-color', expectedColor);
}

test.describe('Tooltip 实际弹层主题矩阵', () => {
  test.setTimeout(240_000);

  test('受控 Tooltip 在全部公开主题选项下跟随 token 且保持对比度', async ({ page }) => {
    const browserHealth = collectBrowserErrors(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/components/feedback/tooltip/');

    const frame = page
      .locator('[data-lx-mode]')
      .filter({ has: page.getByRole('button', { name: '查看主题提示', exact: true }) })
      .first();
    await expect(frame).toBeVisible();
    await openThemeSettings(frame);

    const brandOptions = brandColors.map(({ label }) => label);
    const paletteOptions = ['使用品牌色', ...paletteColors.map(({ label }) => label)];
    const selectedIndexes = new Map<'品牌色' | '东方配色', number>([
      ['品牌色', 0],
      ['东方配色', 0],
    ]);

    for (const mode of ['light', 'dark'] as const) {
      await setMode(frame, mode);
      await openTokenTooltip(page, frame, `明暗模式 ${mode}`);

      for (const appearance of appearances) {
        await chooseAppearance(frame, appearance);
        await openTokenTooltip(page, frame, `${mode} ${appearance.label}`);
      }

      for (const density of ['comfortable', 'compact'] as const) {
        await setDensity(frame, density);
        await openTokenTooltip(page, frame, `${mode} ${density}`);
      }

      for (const color of brandColors) {
        await chooseSelectOption(page, frame, '品牌色', color.label, brandOptions, selectedIndexes);
        selectedIndexes.set('东方配色', 0);
        await expect(frame).toHaveAttribute('data-lx-color', color.value);
        await openTokenTooltip(page, frame, `${mode} 品牌色 ${color.label}`);
      }
      for (const palette of paletteColors) {
        await chooseSelectOption(
          page,
          frame,
          '东方配色',
          palette.label,
          paletteOptions,
          selectedIndexes,
        );
        await expect(frame).toHaveAttribute('data-lx-color', palette.value);
        await openTokenTooltip(page, frame, `${mode} 东方配色 ${palette.label}`);
      }
    }

    for (const combination of combinedThemes) {
      await setMode(frame, combination.mode);
      await chooseAppearance(frame, combination.appearance);
      await setDensity(frame, combination.density);
      await chooseSelectOption(
        page,
        frame,
        '品牌色',
        combination.color.label,
        brandOptions,
        selectedIndexes,
      );
      selectedIndexes.set('东方配色', 0);
      await chooseSelectOption(
        page,
        frame,
        '东方配色',
        combination.palette.label,
        paletteOptions,
        selectedIndexes,
      );

      await expectCombinedTheme(frame, combination);
      await openTokenTooltip(
        page,
        frame,
        `${combination.mode} ${combination.appearance.label} ${combination.density} ${combination.color.label} ${combination.palette.label}`,
      );
      await expectCombinedTheme(frame, combination);
    }

    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  });

  test('默认 Spotlight 在基线和复合压力主题下固定为深色高对比样式', async ({ page }) => {
    const browserHealth = collectBrowserErrors(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/components/feedback/tooltip/');

    const frame = page
      .locator('[data-lx-mode]')
      .filter({ has: page.getByRole('button', { name: '客户同步状态', exact: true }) })
      .first();
    const trigger = frame.getByRole('button', { name: '客户同步状态', exact: true });
    await trigger.focus();
    let tooltip = await getAssociatedTooltip(page, trigger, '最近一次同步于 14:32 完成');
    await expectSpotlightColors(tooltip);
    await expectPopupInViewport(page, tooltip);

    await page.mouse.move(0, 0);
    await trigger.evaluate((element) => (element as HTMLElement).blur());
    await expect(tooltip).not.toBeVisible();
    await openThemeSettings(frame);
    await setMode(frame, 'dark');
    await chooseAppearance(frame, appearances[2]);
    await setDensity(frame, 'compact');
    const selectedIndexes = new Map<'品牌色' | '东方配色', number>([
      ['品牌色', 0],
      ['东方配色', 0],
    ]);
    await chooseSelectOption(
      page,
      frame,
      '品牌色',
      brandColors[5].label,
      brandColors.map(({ label }) => label),
      selectedIndexes,
    );
    selectedIndexes.set('东方配色', 0);
    await chooseSelectOption(
      page,
      frame,
      '东方配色',
      paletteColors[5].label,
      ['使用品牌色', ...paletteColors.map(({ label }) => label)],
      selectedIndexes,
    );

    await trigger.focus();
    tooltip = await getAssociatedTooltip(page, trigger, '最近一次同步于 14:32 完成');
    await expectSpotlightColors(tooltip);
    await expectPopupInViewport(page, tooltip);
    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  });
});
