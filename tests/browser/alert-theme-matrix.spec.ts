import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const viewports = [
  { width: 930, height: 720 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

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
