import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const viewports = [
  { width: 930, height: 720 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

const routes = {
  inputNumber: '/components/form/input-number/',
  select: '/components/form/select/',
  datePicker: '/components/form/date-picker/',
  checkbox: '/components/form/checkbox/',
  switch: '/components/form/switch/',
  radio: '/components/form/radio/',
} as const;

async function expectNoRootOverflow(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const root = document.documentElement;
        return Math.max(
          root.scrollWidth - root.clientWidth,
          document.body.scrollWidth - root.clientWidth,
        );
      }),
    )
    .toBeLessThanOrEqual(0);
}

async function expectFormPage(page: Page, title: string, route: string): Promise<Locator> {
  await page.goto(route);
  await expect(page.locator('h1').first()).toHaveText(title);
  const frame = page
    .locator('[data-lx-mode]')
    .filter({ has: page.getByText('主题设置', { exact: true }) })
    .first();
  await expect(frame).toBeVisible();
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await expectNoRootOverflow(page);
  }
  return frame;
}

async function expectHealthy(page: Page, errors: ReturnType<typeof collectBrowserErrors>) {
  await waitForBrowserQuiescence(page, errors);
  expect(errors.errors, errors.errors.join('\n')).toEqual([]);
}

test.describe('Form 基础控件浏览器验收', () => {
  test('InputNumber 支持键盘步进、清空与禁用状态', async ({ page }) => {
    const errors = collectBrowserErrors(page);
    const frame = await expectFormPage(page, 'InputNumber 数值输入', routes.inputNumber);
    const input = frame.getByRole('spinbutton', { name: 'small数量', exact: true });
    await input.focus();
    await input.press('ArrowUp');
    await expect(input).toHaveValue('11');
    await input.press('ControlOrMeta+A');
    await input.press('Backspace');
    await expect(input).toHaveValue('');
    await expect(frame.getByRole('spinbutton', { name: '锁定数量', exact: true })).toBeDisabled();
    await expectHealthy(page, errors);
  });

  test('Select 支持键盘选择、禁用选项与关闭弹层', async ({ page }) => {
    const errors = collectBrowserErrors(page);
    const frame = await expectFormPage(page, 'Select 选择器', routes.select);
    const select = frame.getByRole('combobox', { name: '小尺寸地区', exact: true });
    await select.focus();
    await select.press('Enter');
    await expect(select).toHaveAttribute('aria-expanded', 'true');
    // AntD 会把禁用选项从可访问选项集合中排除；用公开文字确认它仍可见，再验证方向键跳过它。
    await expect(page.getByText('西南', { exact: true })).toBeVisible();
    await expect(page.getByText('华北', { exact: true }).last()).toBeVisible();
    await select.press('ArrowDown');
    await select.press('Enter');
    await expect(select).toHaveAttribute('aria-expanded', 'false');
    await expect(frame.getByText('华北', { exact: true }).last()).toBeVisible();
    await select.press('Enter');
    await expect(select).toHaveAttribute('aria-expanded', 'true');
    await select.press('Escape');
    await expect(select).toHaveAttribute('aria-expanded', 'false');
    await expect(frame.getByRole('combobox', { name: '固定地区', exact: true })).toBeDisabled();
    await expectHealthy(page, errors);
  });

  test('DatePicker 支持打开日历、Escape 关闭与禁用输入', async ({ page }) => {
    const errors = collectBrowserErrors(page);
    const frame = await expectFormPage(
      page,
      'DatePicker / DateRangePicker 日期',
      routes.datePicker,
    );
    // AntD 的日期输入公开为带 placeholder 的原生输入，示例 label 关联的是宿主容器。
    const date = frame.getByPlaceholder('Select date').first();
    await date.click();
    await expect(page.getByText('Today', { exact: true })).toBeVisible();
    await date.press('Escape');
    await expect(page.getByText('Today', { exact: true })).toBeHidden();
    await expect(frame.getByPlaceholder('Select date').nth(3)).toBeDisabled();
    await expectHealthy(page, errors);
  });

  test('Checkbox 支持 Space 切换并保持禁用值', async ({ page }) => {
    const errors = collectBrowserErrors(page);
    const frame = await expectFormPage(page, 'Checkbox 复选框', routes.checkbox);
    const checkbox = frame.getByRole('checkbox', { name: '包含已归档客户', exact: true });
    await checkbox.focus();
    await expect(checkbox).toBeChecked();
    await checkbox.press('Space');
    await expect(checkbox).not.toBeChecked();
    const disabled = frame.getByRole('checkbox', { name: '锁定的权限', exact: true });
    await expect(disabled).toBeDisabled();
    await expectHealthy(page, errors);
  });

  test('Switch 支持键盘切换并阻止加载和禁用状态操作', async ({ page }) => {
    const errors = collectBrowserErrors(page);
    const frame = await expectFormPage(page, 'Switch 开关', routes.switch);
    const regular = frame.getByRole('switch', { name: '邮件通知', exact: true });
    await regular.focus();
    await expect(regular).toBeChecked();
    await regular.press('Space');
    await expect(regular).not.toBeChecked();
    await expect(frame.getByRole('switch', { name: '固定策略', exact: true })).toBeDisabled();
    await expect(frame.getByRole('switch', { name: '保存中', exact: true })).toBeDisabled();
    await expectHealthy(page, errors);
  });

  test('Radio 支持方向键移动选择并跳过禁用选项', async ({ page }) => {
    const errors = collectBrowserErrors(page);
    const frame = await expectFormPage(page, 'Radio 单选', routes.radio);
    // RadioGroup 的 AntD 5 公共输出没有 radiogroup role，使用公开原生 value/checked 语义。
    const standard = page.locator('input[type="radio"][value="standard"]');
    const express = page.locator('input[type="radio"][value="express"]');
    const paused = page.locator('input[type="radio"][value="paused"]');
    await expect(standard).toBeChecked();
    await standard.focus();
    await standard.press('ArrowRight');
    await expect(express).toBeChecked();
    await expect(paused).toBeDisabled();
    await expectHealthy(page, errors);
  });
});
