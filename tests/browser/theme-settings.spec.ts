import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';
import { browserComponentRoutes } from './routes';

const rootOverflowViewports = [
  { width: 930, height: 720 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

const appearances = [
  { label: '商务', value: 'business', panelRadius: '4px' },
  { label: '轻盈', value: 'soft', panelRadius: '8px' },
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

// DynamicForm 使用自己的“显示选项”协议，品牌色和东方配色留在专门的表单验收中。
const themeMatrixRoutes = browserComponentRoutes.filter(({ name }) => name !== 'DynamicForm');

function componentTitlePattern(value: string): RegExp {
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escapedValue}$`);
}

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
        message: `${viewport.width}×${viewport.height} 视口下文档根节点发生横向溢出`,
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
      { message: '主题 frame 没有保持可见内容' },
    )
    .toBe(true);
}

async function openThemeSettings(frame: Locator): Promise<void> {
  const summary = frame.getByText('主题设置', { exact: true });
  const details = summary.locator('xpath=..');
  if ((await details.getAttribute('open')) === null) await summary.click();
  await expect(summary).toBeVisible();
}

async function chooseRadio(frame: Locator, label: string): Promise<void> {
  const radio = frame.getByRole('radio', { name: label, exact: true });
  await expect(radio).toHaveCount(1);
  await frame.getByText(label, { exact: true }).click();
  await expect(radio).toBeChecked();
}

async function chooseSelectOption(
  page: Page,
  frame: Locator,
  name: string,
  label: string,
  options: readonly string[],
  selectedIndexes: Map<string, number>,
): Promise<void> {
  const optionIndex = options.indexOf(label);
  expect(optionIndex, `未找到 ${name} 选项“${label}”`).toBeGreaterThanOrEqual(0);
  const currentIndex = selectedIndexes.get(name);
  expect(currentIndex, `没有记录 ${name} 当前选项索引`).toBeDefined();
  const select = frame.getByRole('combobox', { name, exact: true });
  await expect(select).toHaveCount(1);
  await select.evaluate((element) =>
    element.scrollIntoView({ block: 'center', inline: 'nearest' }),
  );
  await select.press('Enter');
  const listbox = page.getByRole('listbox');
  await expect(listbox).toHaveCount(1);
  await expect(select).toHaveAttribute('aria-expanded', 'true');
  if (optionIndex === 0 && name === '东方配色') {
    await select.press('Home');
    await select.press('Enter');
    await expect(select).toHaveAttribute('aria-expanded', 'false');
    selectedIndexes.set(name, optionIndex);
    return;
  } else {
    const distance = Math.abs(optionIndex - currentIndex!);
    const direction = optionIndex >= currentIndex! ? 'ArrowDown' : 'ArrowUp';
    for (let index = 0; index < distance; index += 1) await select.press(direction);
  }
  const option = listbox.getByRole('option', { name: label, exact: true });
  await expect(option).toHaveCount(1);
  const optionId = await option.getAttribute('id');
  expect(optionId).not.toBeNull();
  await expect(select).toHaveAttribute('aria-activedescendant', optionId!);
  await select.press('Enter');
  await expect(select).toHaveAttribute('aria-expanded', 'false');
  selectedIndexes.set(name, optionIndex);
}

async function assertThemeControls(frame: Locator, componentName: string): Promise<void> {
  await openThemeSettings(frame);
  await expect(frame.getByText('主题设置', { exact: true })).toHaveCount(1);
  await expect(frame.getByRole('switch', { name: '暗色模式', exact: true })).toHaveCount(1);
  const densitySwitch = frame.getByRole('switch', { name: '紧凑密度', exact: true });
  if ((await densitySwitch.count()) === 0) {
    // Table 为了避免重复设置，把密度单选控件放在表格标题区域而不是 details 内。
    await expect(componentName).toBe('Table');
    await expect(frame.getByText('紧凑 · 36px 基础', { exact: true })).toBeVisible();
  } else {
    await expect(densitySwitch).toHaveCount(1);
  }
  for (const appearance of appearances) {
    await expect(frame.getByRole('radio', { name: appearance.label, exact: true })).toHaveCount(1);
  }
  await expect(frame.getByRole('combobox', { name: '品牌色', exact: true })).toHaveCount(1);
  await expect(frame.getByRole('combobox', { name: '东方配色', exact: true })).toHaveCount(1);
}

async function runThemeMatrix(page: Page, frame: Locator): Promise<void> {
  await openThemeSettings(frame);
  const darkSwitch = frame.getByRole('switch', { name: '暗色模式', exact: true });
  const densitySwitch = frame.getByRole('switch', { name: '紧凑密度', exact: true });

  // 明暗切换使用当前状态反转两次，避免依赖文档站默认色彩偏好。
  const initialMode = await frame.getAttribute('data-lx-mode');
  const initialBackground = await readCssVariable(frame, '--lx-color-bg-base');
  expect(initialBackground).not.toBe('');
  await darkSwitch.click();
  await expect(frame).toHaveAttribute('data-lx-mode', initialMode === 'dark' ? 'light' : 'dark');
  await expect
    .poll(() => readCssVariable(frame, '--lx-color-bg-base'), {
      message: '明暗模式切换没有更新背景色 token',
    })
    .not.toBe(initialBackground);
  await darkSwitch.click();
  await expect(frame).toHaveAttribute('data-lx-mode', initialMode ?? 'light');
  await expect
    .poll(() => readCssVariable(frame, '--lx-color-bg-base'), {
      message: '明暗模式恢复后没有回到初始背景色 token',
    })
    .toBe(initialBackground);

  for (const appearance of appearances) {
    await chooseRadio(frame, appearance.label);
    await expect(frame).toHaveAttribute('data-lx-appearance', appearance.value);
    await expect(frame).toHaveCSS('--lx-radius-panel', appearance.panelRadius);
  }

  if ((await densitySwitch.count()) > 0) {
    await densitySwitch.click();
    await expect(frame).toHaveAttribute('data-lx-density', 'compact');
    await expect(frame).toHaveCSS('--lx-control-height', '32px');
    await densitySwitch.click();
    await expect(frame).toHaveAttribute('data-lx-density', 'comfortable');
    await expect(frame).toHaveCSS('--lx-control-height', '40px');
  } else {
    await chooseRadio(frame, '紧凑 · 36px 基础');
    await expect(frame).toHaveAttribute('data-lx-density', 'compact');
    await expect(frame).toHaveCSS('--lx-control-height', '32px');
    await chooseRadio(frame, '舒适 · 48px 基础');
    await expect(frame).toHaveAttribute('data-lx-density', 'comfortable');
    await expect(frame).toHaveCSS('--lx-control-height', '40px');
  }

  const brandLabels = brandColors.map(({ label }) => label);
  const paletteLabels = ['使用品牌色', ...paletteColors.map(({ label }) => label)];
  const selectedIndexes = new Map<string, number>([
    ['品牌色', 0],
    ['东方配色', 0],
  ]);
  const initialPrimary = await readCssVariable(frame, '--lx-color-primary');
  expect(initialPrimary).not.toBe('');
  let previousPrimary = initialPrimary;

  for (const color of brandColors.slice(1)) {
    await chooseSelectOption(page, frame, '品牌色', color.label, brandLabels, selectedIndexes);
    await expect(frame).toHaveAttribute('data-lx-color', color.value);
    await expect
      .poll(() => readCssVariable(frame, '--lx-color-primary'), {
        message: `${color.label} 没有更新主题主色 token`,
      })
      .not.toBe(previousPrimary);
    previousPrimary = await readCssVariable(frame, '--lx-color-primary');
  }

  for (const palette of paletteColors) {
    await chooseSelectOption(
      page,
      frame,
      '东方配色',
      palette.label,
      paletteLabels,
      selectedIndexes,
    );
    await expect(frame).toHaveAttribute('data-lx-color', palette.value);
    await expect
      .poll(() => readCssVariable(frame, '--lx-color-primary'), {
        message: `${palette.label} 没有更新主题主色 token`,
      })
      .not.toBe(previousPrimary);
    previousPrimary = await readCssVariable(frame, '--lx-color-primary');
  }

  // 先恢复一个明确的品牌色，再验证清除东方配色会回到当前品牌色，而不是假设初始值。
  await chooseSelectOption(page, frame, '品牌色', '海洋蓝', brandLabels, selectedIndexes);
  await expect(frame).toHaveAttribute('data-lx-color', 'blue');
  await expect
    .poll(() => readCssVariable(frame, '--lx-color-primary'), {
      message: '恢复品牌蓝后没有回到初始主色 token',
    })
    .toBe(initialPrimary);
  await chooseSelectOption(page, frame, '东方配色', '使用品牌色', paletteLabels, selectedIndexes);
  await expect(frame).toHaveAttribute('data-lx-color', 'blue');
  await expect
    .poll(() => readCssVariable(frame, '--lx-color-primary'), {
      message: '清除东方配色后没有恢复品牌蓝主色 token',
    })
    .toBe(initialPrimary);
  await expect(frame).toHaveAttribute('data-lx-mode', initialMode ?? 'light');
  await expect(frame).toHaveAttribute('data-lx-appearance', 'glass');
  await expect(frame).toHaveAttribute('data-lx-density', 'comfortable');
  await expectVisibleFrame(frame);
}

test.describe('DataDisplayDemoFrame 公开路由主题矩阵', () => {
  test.setTimeout(180_000);

  for (const component of themeMatrixRoutes) {
    test(`${component.name}：主题设置、可见内容、根溢出与浏览器错误`, async ({ page }) => {
      const browserHealth = collectBrowserErrors(page);
      await page.goto(`${component.path}/`);

      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
      await expect(heading).toHaveText(componentTitlePattern(component.expectedHeading));
      await expect(page).toHaveTitle(componentTitlePattern(component.expectedTitle));

      const frames = page.locator('[data-lx-mode]');
      await expect
        .poll(() => frames.count(), {
          message: `${component.name} 没有渲染 DataDisplayDemoFrame 主题作用域`,
        })
        .toBeGreaterThan(0);
      await expect
        .poll(() => page.locator('.dumi-default-previewer-demo').count(), {
          message: `${component.name} 没有渲染公开 demo 容器`,
        })
        .toBeGreaterThan(0);

      // 每个公开页面的全部独立 frame 都必须提供同一套可访问主题设置入口。
      const frameCount = await frames.count();
      for (let index = 0; index < frameCount; index += 1) {
        const frame = frames.nth(index);
        await assertThemeControls(frame, component.name);
        await expectVisibleFrame(frame);
      }

      // 每条路由只在首个 frame 执行完整矩阵，避免同页重复 demo 造成成倍浏览器成本。
      const primaryFrame = frames.first();
      await runThemeMatrix(page, primaryFrame);
      for (const viewport of rootOverflowViewports) {
        await expectNoRootHorizontalOverflow(page, viewport);
        await expectVisibleFrame(primaryFrame);
      }

      await waitForBrowserQuiescence(page, browserHealth);
      expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
    });
  }
});
