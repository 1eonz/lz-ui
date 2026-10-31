import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const viewports = [
  { width: 1280, height: 800 },
  { width: 930, height: 720 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

const semanticAlerts = [
  { tone: 'info', message: '客户同步将在今晚 22:00 开始' },
  { tone: 'success', message: '28 位客户已同步' },
  { tone: 'warning', message: '3 位客户缺少联系电话' },
  { tone: 'error', message: '连接失败，请检查网络后重试' },
] as const;

// 四组代表组合覆盖两种模式、三种外观、两种密度及标准/东方配色，不代表完整笛卡尔积。
const renderedThemes = [
  {
    mode: 'light',
    appearance: '商务',
    density: 'comfortable',
    palette: '使用品牌色',
    color: 'blue',
  },
  { mode: 'dark', appearance: '轻盈', density: 'compact', palette: '使用品牌色', color: 'blue' },
  {
    mode: 'light',
    appearance: '玻璃',
    density: 'compact',
    palette: '青瓷桂影',
    color: 'celadon-laurel',
  },
  {
    mode: 'dark',
    appearance: '玻璃',
    density: 'comfortable',
    palette: '豆沙墨色',
    color: 'bean-sand-ink',
  },
] as const;

async function readRenderedAlertColors(message: Locator, tone: string) {
  return message.evaluate((element, semanticTone) => {
    const alert = element.closest('[role="note"]');
    if (!alert) throw new Error('四态示例缺少公开 note 语义。');
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('无法创建颜色解析画布。');
    const rgba = (value: string): number[] => {
      // canvas 遇到非法颜色会沿用上次 fillStyle，必须先拒绝空值和无效 token，防止假阳性。
      if (!value.trim() || !CSS.supports('color', value))
        throw new Error(`无法解析实际颜色：${value}`);
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data].map((value, index) =>
        index === 3 ? value / 255 : value,
      );
    };
    const composite = (foreground: number[], background: number[]): number[] =>
      foreground
        .slice(0, 3)
        .map((channel, index) => channel * foreground[3] + background[index] * (1 - foreground[3]));
    const luminance = (channels: number[]): number =>
      channels
        .map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
        })
        .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
    const layers: number[][] = [];
    const images: string[] = [];
    const opacities: string[] = [];
    for (let node: Element | null = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      layers.push(rgba(style.backgroundColor));
      images.push(style.backgroundImage);
      opacities.push(style.opacity);
    }
    // 从页面画布向正文逐层合成透明表面，再合成文字自身 alpha，避免把 rgba 当实色高估对比度。
    let background = [255, 255, 255];
    for (const layer of [...layers].reverse()) background = composite(layer, background);
    const text = getComputedStyle(element).color;
    const foreground = composite(rgba(text), background);
    const [high, low] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    const style = getComputedStyle(alert);
    return {
      background: rgba(style.backgroundColor),
      expectedBackground: rgba(style.getPropertyValue(`--lx-color-${semanticTone}-bg`).trim()),
      border: rgba(style.borderTopColor),
      expectedBorder: rgba(style.getPropertyValue(`--lx-color-${semanticTone}`).trim()),
      borderWidth: Number.parseFloat(style.borderTopWidth),
      text: rgba(text),
      expectedText: rgba(style.getPropertyValue('--lx-color-text').trim()),
      contrast: (high + 0.05) / (low + 0.05),
      hasOpaqueBackground: layers.some((layer) => layer[3] === 1),
      images,
      opacities,
    };
  }, tone);
}

const appearances = [
  { label: '商务', value: 'business', radius: '4px' },
  { label: '轻盈', value: 'soft', radius: '8px' },
  { label: '玻璃', value: 'glass', radius: '12px' },
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

async function chooseSelectOption(
  page: Page,
  frame: Locator,
  name: string,
  label: string,
  options: readonly string[],
  current: { index: number },
): Promise<void> {
  const index = options.indexOf(label);
  expect(index, `${name} 缺少选项“${label}”`).toBeGreaterThanOrEqual(0);
  const select = frame.getByRole('combobox', { name, exact: true });
  await expect(select).toHaveCount(1);
  await select.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await select.press('Enter');
  await expect(select).toHaveAttribute('aria-expanded', 'true');
  const listbox = page.getByRole('listbox');
  await expect(listbox).toHaveCount(1);
  const distance = Math.abs(index - current.index);
  const direction = index >= current.index ? 'ArrowDown' : 'ArrowUp';
  for (let step = 0; step < distance; step += 1) await select.press(direction);
  const option = listbox.getByRole('option', { name: label, exact: true });
  await expect(option).toHaveCount(1);
  await select.press('Enter');
  await expect(select).toHaveAttribute('aria-expanded', 'false');
  current.index = index;
}

async function expectNoRootOverflow(page: Page, viewport: (typeof viewports)[number]) {
  await page.setViewportSize(viewport);
  await expect
    .poll(() =>
      page.evaluate(() =>
        Math.max(
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
          document.body.scrollWidth - document.documentElement.clientWidth,
        ),
      ),
    )
    .toBeLessThanOrEqual(0);
}

test.describe('Alert 主题、外观、密度与窄屏矩阵', () => {
  for (const theme of renderedThemes) {
    test(`四态实际颜色：${theme.mode}/${theme.appearance}/${theme.density}/${theme.color}`, async ({
      page,
    }, testInfo) => {
      const browserHealth = collectBrowserErrors(page);
      await page.goto('/components/feedback/alert/');
      const frame = page
        .locator('[data-lx-mode]')
        .filter({
          has: page.getByText(semanticAlerts[0].message, { exact: true }),
        })
        .first();
      await expect(frame.getByRole('note')).toHaveCount(4);
      await frame.getByText('主题设置', { exact: true }).click();
      const dark = frame.getByRole('switch', { name: '暗色模式', exact: true });
      if ((await dark.getAttribute('aria-checked')) !== String(theme.mode === 'dark'))
        await dark.click();
      await expect(frame).toHaveAttribute('data-lx-mode', theme.mode);
      await frame.getByText(theme.appearance, { exact: true }).click();
      await expect(frame.getByRole('radio', { name: theme.appearance, exact: true })).toBeChecked();
      const density = frame.getByRole('switch', { name: '紧凑密度', exact: true });
      if ((await density.getAttribute('aria-checked')) !== String(theme.density === 'compact'))
        await density.click();
      await expect(frame).toHaveAttribute('data-lx-density', theme.density);
      await chooseSelectOption(
        page,
        frame,
        '东方配色',
        theme.palette,
        ['使用品牌色', ...paletteColors.map(({ label }) => label)],
        { index: 0 },
      );
      await expect(frame).toHaveAttribute('data-lx-color', theme.color);
      await frame.getByText('主题设置', { exact: true }).click();
      const evidence = [];
      for (const { tone, message } of semanticAlerts) {
        const text = frame.getByText(message, { exact: true });
        await expect(text).toBeVisible();
        const colors = await readRenderedAlertColors(text, tone);
        expect(colors.background, `${tone} 实际背景`).toEqual(colors.expectedBackground);
        expect(colors.border, `${tone} 实际语义边框`).toEqual(colors.expectedBorder);
        expect(colors.borderWidth).toBeGreaterThan(0);
        expect(colors.text, `${tone} 实际正文颜色`).toEqual(colors.expectedText);
        // 本算法限定真实纯色叠层；遇到图片或组透明度时必须另行取样，不能静默宣称通过。
        expect(colors.hasOpaqueBackground).toBe(true);
        expect(colors.images.every((image) => image === 'none')).toBe(true);
        expect(colors.opacities.every((opacity) => opacity === '1')).toBe(true);
        expect(colors.contrast, `${tone} 正文/实际合成背景`).toBeGreaterThanOrEqual(4.5);
        evidence.push({ tone, message, ...colors });
      }
      await testInfo.attach('rendered-semantic-colors', {
        body: JSON.stringify({ theme, evidence }, null, 2),
        contentType: 'application/json',
      });
      await frame.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: testInfo.outputPath('alert-semantic-colors.png'),
        fullPage: true,
      });
      await waitForBrowserQuiescence(page, browserHealth);
      expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
    });
  }

  test('在公开 demo 中覆盖全部主题选项并保持可见与无根溢出', async ({ page }) => {
    const browserHealth = collectBrowserErrors(page);
    await page.goto('/components/feedback/alert/');
    // Alert 页面包含多个基础示例；主题矩阵锁定带有关闭/恢复交互的真实 demo。
    const frame = page
      .locator('[data-lx-mode]')
      .filter({ has: page.getByRole('button', { name: '重置失败演示', exact: true }) })
      .first();
    await expect(frame).toBeVisible();
    await expect(frame.getByRole('alert')).toBeVisible();
    const summary = frame.getByText('主题设置', { exact: true });
    if ((await summary.locator('xpath=..').getAttribute('open')) === null) await summary.click();

    const darkSwitch = frame.getByRole('switch', { name: '暗色模式', exact: true });
    const initialMode = await frame.getAttribute('data-lx-mode');
    const initialBackground = await frame.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--lx-color-bg-base').trim(),
    );
    await darkSwitch.click();
    await expect(frame).toHaveAttribute('data-lx-mode', initialMode === 'dark' ? 'light' : 'dark');
    await expect
      .poll(() =>
        frame.evaluate((element) =>
          getComputedStyle(element).getPropertyValue('--lx-color-bg-base').trim(),
        ),
      )
      .not.toBe(initialBackground);
    await darkSwitch.click();
    await expect(frame).toHaveAttribute('data-lx-mode', initialMode ?? 'light');

    for (const appearance of appearances) {
      // Ant Design 的 radio input 为视觉隐藏元素，点击公开按钮文字保留真实用户路径。
      await frame.getByText(appearance.label, { exact: true }).click();
      await expect(frame.getByRole('radio', { name: appearance.label, exact: true })).toBeChecked();
      await expect(frame).toHaveAttribute('data-lx-appearance', appearance.value);
      await expect(frame).toHaveCSS('--lx-radius-panel', appearance.radius);
    }

    const density = frame.getByRole('switch', { name: '紧凑密度', exact: true });
    await density.click();
    await expect(frame).toHaveAttribute('data-lx-density', 'compact');
    await expect(frame).toHaveCSS('--lx-control-height', '32px');
    const compactResetBox = await frame
      .getByRole('button', { name: '重置失败演示', exact: true })
      .boundingBox();
    expect(compactResetBox).not.toBeNull();
    // 紧凑桌面仍沿用 32px 控件高度，触控放大由 coarse media 单独处理。
    expect(compactResetBox!.height).toBeGreaterThanOrEqual(32);
    expect(compactResetBox!.height).toBeLessThan(44);
    await density.click();
    await expect(frame).toHaveAttribute('data-lx-density', 'comfortable');

    const brandOptions = brandColors.map(({ label }) => label);
    const paletteOptions = ['使用品牌色', ...paletteColors.map(({ label }) => label)];
    const brandIndex = { index: 0 };
    const paletteIndex = { index: 0 };
    let previousPrimary = await frame.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--lx-color-primary').trim(),
    );
    expect(previousPrimary).not.toBe('');
    for (const [index, color] of brandColors.entries()) {
      await chooseSelectOption(page, frame, '品牌色', color.label, brandOptions, brandIndex);
      await expect(frame).toHaveAttribute('data-lx-color', color.value);
      const primary = await frame.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--lx-color-primary').trim(),
      );
      expect(primary, `${color.label} 没有生成主色 token`).not.toBe('');
      // 第一次选择保持当前品牌蓝，后续每个品牌色都必须改变实际 token。
      if (index > 0) expect(primary, `${color.label} 未更新主色 token`).not.toBe(previousPrimary);
      previousPrimary = primary;
    }
    for (const color of paletteColors) {
      await chooseSelectOption(page, frame, '东方配色', color.label, paletteOptions, paletteIndex);
      await expect(frame).toHaveAttribute('data-lx-color', color.value);
      const primary = await frame.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--lx-color-primary').trim(),
      );
      expect(primary, `${color.label} 没有生成主色 token`).not.toBe('');
      expect(primary, `${color.label} 未更新主色 token`).not.toBe(previousPrimary);
      previousPrimary = primary;
    }
    await chooseSelectOption(page, frame, '东方配色', '使用品牌色', paletteOptions, paletteIndex);
    await expect(frame).toHaveAttribute('data-lx-color', 'rose');
    const restoredPrimary = await frame.evaluate((element) =>
      getComputedStyle(element).getPropertyValue('--lx-color-primary').trim(),
    );
    expect(restoredPrimary).not.toBe('');

    for (const viewport of viewports) {
      await expectNoRootOverflow(page, viewport);
      await expect(frame.getByRole('alert')).toBeVisible();
    }
    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  });
});
