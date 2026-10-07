import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const route = '/components/form/dynamic-form/';

const rootOverflowViewports = [
  { width: 930, height: 720 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

const appearances = [
  { label: '商务', value: 'business', panelRadius: '4px' },
  { label: '柔和', value: 'soft', panelRadius: '8px' },
  { label: '玻璃', value: 'glass', panelRadius: '12px' },
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

async function readCssVariable(frame: Locator, property: string): Promise<string> {
  return frame.evaluate(
    (element, cssProperty) => window.getComputedStyle(element).getPropertyValue(cssProperty).trim(),
    property,
  );
}

async function expectNoRootHorizontalOverflow(
  page: Page,
  viewport: (typeof rootOverflowViewports)[number],
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
      {
        message: `${viewport.width}×${viewport.height} 视口下 DynamicForm 文档根节点发生横向溢出`,
        timeout: 2_000,
      },
    )
    .toBeLessThanOrEqual(0);
}

async function expectVisibleFrame(frame: Locator): Promise<void> {
  await expect
    .poll(
      () =>
        frame.evaluate((element) => {
          const frameBox = element.getBoundingClientRect();
          const visibleDescendant = Array.from(element.querySelectorAll('*')).some((node) => {
            const box = node.getBoundingClientRect();
            const style = window.getComputedStyle(node);
            return (
              box.width > 0 &&
              box.height > 0 &&
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              style.opacity !== '0' &&
              node.getAttribute('aria-hidden') !== 'true'
            );
          });
          return frameBox.width > 0 && frameBox.height > 0 && visibleDescendant;
        }),
      { message: 'DynamicForm 完整客户 demo 没有保持可见内容' },
    )
    .toBe(true);
}

async function getDynamicFormFrame(page: Page): Promise<{ frame: Locator; details: Locator }> {
  const summary = page.locator('summary').filter({ hasText: '显示选项' });
  await expect(summary).toHaveCount(1);
  const details = summary.locator('xpath=..');
  const frame = summary.locator('xpath=ancestor::*[@data-lx-mode][1]');
  await expect(frame).toHaveCount(1);
  return { frame, details };
}

async function openDisplayOptions(details: Locator): Promise<void> {
  const summary = details.locator('summary');
  await expect(summary).toHaveText(/^显示选项/);
  expect(await details.getAttribute('open')).toBeNull();
  await summary.click();
  await expect(details).toHaveAttribute('open', '');
}

async function expectColorSummary(frame: Locator, label: string, type: string): Promise<void> {
  await expect(frame.locator('summary').filter({ hasText: label })).toBeVisible();
  const colorPreview = frame
    .locator('[aria-live="polite"]')
    .filter({ hasText: `当前配色：${label}（${type}）` });
  await expect(colorPreview).toHaveCount(1);
  await expect(
    colorPreview.getByText(`当前配色：${label}（${type}）`, { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      colorPreview.locator('[aria-hidden="true"]').evaluate((element) => {
        const background = window.getComputedStyle(element).backgroundColor;
        return background !== '' && background !== 'rgba(0, 0, 0, 0)';
      }),
    )
    .toBe(true);
}

async function runThemeMatrix(frame: Locator, details: Locator): Promise<void> {
  await openDisplayOptions(details);

  const appearance = frame.getByRole('combobox', { name: '外观', exact: true });
  const mode = frame.getByRole('combobox', { name: '主题', exact: true });
  const density = frame.getByRole('combobox', { name: '密度', exact: true });
  const brand = frame.getByRole('combobox', { name: '品牌色', exact: true });
  const palette = frame.getByRole('combobox', { name: '东方配色', exact: true });
  await expect(appearance).toHaveCount(1);
  await expect(mode).toHaveCount(1);
  await expect(density).toHaveCount(1);
  await expect(brand).toHaveCount(1);
  await expect(palette).toHaveCount(1);
  await expect(brand.locator('option')).toHaveCount(brandColors.length);
  await expect(palette.locator('option')).toHaveCount(paletteColors.length + 1);

  const initialMode = await frame.getAttribute('data-lx-mode');
  expect(initialMode === 'light' || initialMode === 'dark').toBe(true);
  const initialBackground = await readCssVariable(frame, '--lx-color-bg-base');
  expect(initialBackground).not.toBe('');
  await mode.selectOption('dark');
  await expect(frame).toHaveAttribute('data-lx-mode', 'dark');
  const darkBackground = await readCssVariable(frame, '--lx-color-bg-base');
  await expect
    .poll(() => readCssVariable(frame, '--lx-color-bg-base'), {
      message: 'DynamicForm 深色模式没有更新背景色 token',
    })
    .not.toBe(initialBackground);
  await mode.selectOption('light');
  await expect(frame).toHaveAttribute('data-lx-mode', 'light');
  await expect
    .poll(() => readCssVariable(frame, '--lx-color-bg-base'), {
      message: 'DynamicForm 浅色模式没有与深色模式区分背景色 token',
    })
    .not.toBe(darkBackground);
  await mode.selectOption(initialMode!);
  await expect
    .poll(() => readCssVariable(frame, '--lx-color-bg-base'), {
      message: 'DynamicForm 明暗模式恢复后没有回到初始背景色 token',
    })
    .toBe(initialBackground);

  for (const option of appearances) {
    await appearance.selectOption(option.value);
    await expect(frame).toHaveAttribute('data-lx-appearance', option.value);
    await expect(frame).toHaveCSS('--lx-radius-panel', option.panelRadius);
  }

  await density.selectOption('compact');
  await expect(frame).toHaveAttribute('data-lx-density', 'compact');
  await expect(frame).toHaveCSS('--lx-control-height', '32px');
  await density.selectOption('comfortable');
  await expect(frame).toHaveAttribute('data-lx-density', 'comfortable');
  await expect(frame).toHaveCSS('--lx-control-height', '40px');

  await palette.selectOption('brand');
  await brand.selectOption('blue');
  await expect(frame).toHaveAttribute('data-lx-color', 'blue');
  await expectColorSummary(frame, '海洋蓝', '品牌色');
  const initialPrimary = await readCssVariable(frame, '--lx-color-primary');
  expect(initialPrimary).not.toBe('');
  let previousPrimary = initialPrimary;

  for (const color of brandColors.slice(1)) {
    await brand.selectOption(color.value);
    await expect(frame).toHaveAttribute('data-lx-color', color.value);
    await expect
      .poll(() => readCssVariable(frame, '--lx-color-primary'), {
        message: `${color.label} 没有更新 DynamicForm 主色 token`,
      })
      .not.toBe(previousPrimary);
    previousPrimary = await readCssVariable(frame, '--lx-color-primary');
  }

  for (const paletteColor of paletteColors) {
    await palette.selectOption(paletteColor.value);
    await expect(frame).toHaveAttribute('data-lx-color', paletteColor.value);
    await expectColorSummary(frame, paletteColor.label, '东方配色');
    await expect
      .poll(() => readCssVariable(frame, '--lx-color-primary'), {
        message: `${paletteColor.label} 没有更新 DynamicForm 主色 token`,
      })
      .not.toBe(previousPrimary);
    previousPrimary = await readCssVariable(frame, '--lx-color-primary');
  }

  await brand.selectOption('blue');
  await palette.selectOption('brand');
  await expect(frame).toHaveAttribute('data-lx-color', 'blue');
  await expectColorSummary(frame, '海洋蓝', '品牌色');
  await expect
    .poll(() => readCssVariable(frame, '--lx-color-primary'), {
      message: '清除东方配色后没有恢复品牌蓝主色 token',
    })
    .toBe(initialPrimary);
  await mode.selectOption(initialMode!);
  await appearance.selectOption('business');
  await density.selectOption('comfortable');
  await expectVisibleFrame(frame);
}

test.describe('DynamicForm 文档路由独立主题矩阵', () => {
  test.setTimeout(120_000);

  test('显示选项协议覆盖主题、色板、密度、窄屏根溢出与浏览器错误', async ({ page }) => {
    const browserHealth = collectBrowserErrors(page);
    await page.goto(route);

    await expect(page.locator('h1').first()).toHaveText(/^DynamicForm 动态表单$/);
    await expect(page).toHaveTitle(/^DynamicForm 动态表单$/);
    const { frame, details } = await getDynamicFormFrame(page);
    await runThemeMatrix(frame, details);

    await expect(frame.getByRole('textbox', { name: /客户名称/ })).toBeVisible();
    await expect(frame.getByRole('textbox', { name: /联系邮箱/ })).toBeVisible();
    const customerLevel = frame.getByRole('combobox', { name: /客户等级/ });
    await expect(customerLevel).toBeVisible();
    await expect(frame.getByRole('button', { name: '保存客户', exact: true })).toBeVisible();
    await customerLevel.focus();
    await customerLevel.press('ArrowDown');
    const listbox = page.getByRole('listbox');
    await expect(listbox).toHaveCount(1);
    await customerLevel.press('ArrowDown');
    await customerLevel.press('Enter');
    await expect(frame.getByRole('textbox', { name: /专属负责人/ })).toBeVisible();
    await frame.getByRole('button', { name: '重置', exact: true }).click();
    await expect(frame.getByRole('textbox', { name: /专属负责人/ })).toBeHidden();

    for (const viewport of rootOverflowViewports) {
      await expectNoRootHorizontalOverflow(page, viewport);
      await expectVisibleFrame(frame);
    }

    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  });
});
