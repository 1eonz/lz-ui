import { expect, test, type Locator } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const route = '/components/form/dynamic-form/';
const touchTargetClassName = 'lx-docs-dynamic-form-touch-target';

// 通过宿主公开 className 查找控件根节点，不依赖第三方内部标签结构。
function getPublicTouchTarget(control: Locator): Locator {
  return control.locator(
    `xpath=ancestor-or-self::*[contains(concat(" ", normalize-space(@class), " "), " ${touchTargetClassName} ")][1]`,
  );
}

async function expectTouchTarget(control: Locator, name: string): Promise<void> {
  await control.scrollIntoViewIfNeeded();
  const target = getPublicTouchTarget(control);
  await expect(target, `${name} 应通过公开 className 定位到控件根节点`).toHaveCount(1);
  await expect(target).toBeVisible();
  const bounds = await target.boundingBox();
  expect(bounds?.width, `${name} 的触控宽度应至少为 44px`).toBeGreaterThanOrEqual(44);
  expect(bounds?.height, `${name} 的触控高度应至少为 44px`).toBeGreaterThanOrEqual(44);
}

async function expectTouchBounds(target: Locator, name: string): Promise<void> {
  await target.scrollIntoViewIfNeeded();
  await expect(target).toBeVisible();
  const bounds = await target.boundingBox();
  expect(bounds?.width, `${name} 的触控宽度应至少为 44px`).toBeGreaterThanOrEqual(44);
  expect(bounds?.height, `${name} 的触控高度应至少为 44px`).toBeGreaterThanOrEqual(44);
}

test.describe('DynamicForm 客户工作流', () => {
  test('折叠标题保持靠近箭头，窄屏状态换行时不撑高无状态折叠头', async ({ page }) => {
    for (const width of [1280, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);

      for (const label of ['显示选项', '提交演示']) {
        const summary = page.locator('summary').filter({ hasText: label });
        const title = summary.getByText(label, { exact: true });
        await expect(summary).toBeVisible();
        const geometry = await summary.evaluate((element, titleText) => {
          const heading = Array.from(element.children).find(
            (child) => child.textContent === titleText,
          );
          if (!heading) throw new Error('折叠标题缺少独立文本节点');
          const summaryBounds = element.getBoundingClientRect();
          const headingBounds = heading.getBoundingClientRect();
          return {
            titleInset: headingBounds.left - summaryBounds.left,
            titleTop: headingBounds.top - summaryBounds.top,
            height: summaryBounds.height,
          };
        }, label);
        expect(geometry.titleInset, `${width}px 下“${label}”应紧邻起始箭头`).toBeLessThan(32);
        expect(geometry.titleTop, `${width}px 下“${label}”应留在首行`).toBeLessThan(24);
        expect(geometry.height, `${width}px 下“${label}”不应因箭头单独成行而增高`).toBeLessThan(
          label === '提交演示' ? 64 : 100,
        );
        if (width <= 480) {
          await expectTouchBounds(summary, `${width}px 下“${label}”`);
        }
        await title.click();
        await expect(summary.locator('..')).toHaveAttribute('open', '');
        await summary.press('Enter');
        await expect(summary.locator('..')).not.toHaveAttribute('open');
      }
    }
  });

  test('粗指针平板上各 DynamicForm 示例保持触控目标尺寸', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 600, height: 900 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const browserHealth = collectBrowserErrors(page);

    try {
      await page.goto(route);
      const hasCoarsePointer = await page.evaluate(
        () => window.matchMedia('(any-pointer: coarse)').matches,
      );
      expect(hasCoarsePointer, 'DynamicForm 粗指针验收必须启用粗指针媒体特征').toBe(true);

      const displaySummary = page.locator('summary').filter({ hasText: '显示选项' });
      const submitSummary = page.locator('summary').filter({ hasText: '提交演示' });
      await displaySummary.click();
      await page.getByRole('combobox', { name: '密度' }).selectOption('compact');

      for (const [label, summary] of [
        ['显示选项', displaySummary],
        ['提交演示', submitSummary],
      ] as const) {
        await expectTouchBounds(summary, `600px 粗指针下“${label}”`);
      }
      await submitSummary.click();

      const getFormAfterHeading = (name: string) =>
        page.getByRole('heading', { name, exact: true }).locator('xpath=following::form[1]');

      const basicForm = getFormAfterHeading('最小字段与提交、重置');
      await expectTouchTarget(
        basicForm.getByRole('textbox', { name: '客户名称' }),
        '最小字段客户名称',
      );
      await expectTouchTarget(
        basicForm.getByRole('switch', { name: '启用客户' }),
        '最小字段启用客户',
      );
      await expectTouchTarget(
        basicForm.getByRole('button', { name: '保存客户', exact: true }),
        '最小字段保存',
      );
      await expectTouchTarget(
        basicForm.getByRole('button', { name: '重置', exact: true }),
        '最小字段重置',
      );

      const customHeading = page.getByRole('heading', {
        name: '局部注册表与自定义字段',
        exact: true,
      });
      await customHeading.scrollIntoViewIfNeeded();
      const customForm = getFormAfterHeading('局部注册表与自定义字段');
      const customerCode = customForm.getByRole('textbox', {
        name: /客户编号/,
      });
      await expectTouchTarget(customerCode, '自定义客户编号');
      const saveCode = customForm.getByRole('button', { name: '保存编号', exact: true });
      await expectTouchTarget(saveCode, '自定义保存编号');

      await saveCode.click();
      const validationError = customForm.getByText('客户编号为必填项', { exact: true });
      await expect(validationError).toBeVisible();
      await expect(customerCode).toBeFocused();
      await expect(customerCode).toHaveAttribute('aria-invalid', 'true');
      const errorIsDescribed = await customerCode.evaluate((input, errorText) => {
        const describedBy = input.getAttribute('aria-describedby')?.split(/\s+/) ?? [];
        return describedBy.some((id) =>
          document.getElementById(id)?.textContent?.includes(errorText),
        );
      }, '客户编号为必填项');
      expect(errorIsDescribed).toBe(true);

      await customerCode.fill('触控客户编号');
      const customerCodeTarget = getPublicTouchTarget(customerCode);
      for (const edge of ['top', 'bottom'] as const) {
        await saveCode.focus();
        await expect(saveCode).toBeFocused();
        const customerCodeBounds = await customerCodeTarget.boundingBox();
        if (!customerCodeBounds) throw new Error('自定义客户编号的触控外框未渲染');
        const customerCodeTapX = customerCodeBounds.x + Math.min(20, customerCodeBounds.width / 2);
        const tapY =
          edge === 'top'
            ? customerCodeBounds.y + 1
            : customerCodeBounds.y + customerCodeBounds.height - 1;
        await page.touchscreen.tap(customerCodeTapX, tapY);
        await expect(customerCode).toBeFocused();
      }
      const saveCodeBounds = await getPublicTouchTarget(saveCode).boundingBox();
      if (!saveCodeBounds) throw new Error('自定义保存编号的触控外框未渲染');
      await page.touchscreen.tap(
        saveCodeBounds.x + saveCodeBounds.width / 2,
        saveCodeBounds.y + saveCodeBounds.height - 1,
      );
      await expect(
        page.getByRole('status').filter({ hasText: '已保存编号：KH-触控客户编号' }),
      ).toHaveText('已保存编号：KH-触控客户编号');

      const controlledForm = getFormAfterHeading('受控值与嵌套路径回填');
      await expectTouchTarget(
        controlledForm.getByRole('textbox', { name: '客户名称' }),
        '受控客户名称',
      );
      await expectTouchTarget(
        controlledForm.getByRole('spinbutton', { name: '授信额度' }),
        '受控授信额度',
      );
      const refillCustomer = page.getByRole('button', {
        name: '回填另一位客户',
        exact: true,
      });
      await expectTouchTarget(refillCustomer, '回填另一位客户');

      const creditLimit = controlledForm.getByRole('spinbutton', { name: '授信额度' });
      const creditLimitTarget = getPublicTouchTarget(creditLimit);
      await creditLimitTarget.scrollIntoViewIfNeeded();
      for (const edge of ['top', 'bottom'] as const) {
        await refillCustomer.focus();
        await expect(refillCustomer).toBeFocused();
        const creditLimitBounds = await creditLimitTarget.boundingBox();
        if (!creditLimitBounds) throw new Error('受控授信额度的触控外框未渲染');
        const tapX = creditLimitBounds.x + Math.min(20, creditLimitBounds.width / 2);
        const tapY =
          edge === 'top'
            ? creditLimitBounds.y + 1
            : creditLimitBounds.y + creditLimitBounds.height - 1;
        await page.touchscreen.tap(tapX, tapY);
        await expect(creditLimit).toBeFocused();
      }

      const conditionalForm = getFormAfterHeading('条件字段与提交过滤');
      const conditionalLevel = conditionalForm.getByRole('combobox', { name: /客户等级/ });
      await expectTouchTarget(conditionalLevel, '条件客户等级');
      await conditionalLevel.focus();
      await conditionalLevel.press('ArrowDown');
      await conditionalLevel.press('ArrowDown');
      await conditionalLevel.press('Enter');
      const conditionalOwner = conditionalForm.getByRole('textbox', { name: /专属负责人/ });
      await expect(conditionalOwner).toBeVisible();
      await expectTouchTarget(conditionalOwner, '条件专属负责人');
      await expectTouchTarget(
        conditionalForm.getByRole('button', { name: '确认客户等级', exact: true }),
        '确认客户等级',
      );

      const cascadeForm = getFormAfterHeading('多级异步字段级联');
      await expectTouchTarget(cascadeForm.getByRole('combobox', { name: /区域/ }), '级联区域');
      await expectTouchTarget(
        cascadeForm.getByRole('combobox', { name: '城市', exact: true }),
        '级联城市',
      );
      await expectTouchTarget(
        cascadeForm.getByRole('combobox', { name: '区县', exact: true }),
        '级联区县',
      );
      await expectTouchTarget(
        cascadeForm.getByRole('button', { name: '提交', exact: true }),
        '级联提交',
      );
      await expectTouchTarget(
        cascadeForm.getByRole('button', { name: '重置', exact: true }),
        '级联重置',
      );

      const optionsHeading = page.getByRole('heading', {
        name: '异步选项与失败重试',
        exact: true,
      });
      await optionsHeading.scrollIntoViewIfNeeded();
      const optionsForm = optionsHeading.locator('xpath=following::form[1]');
      await expectTouchTarget(
        optionsForm.getByRole('combobox', { name: /供应商/ }),
        '异步供应商选择',
      );
      await expectTouchTarget(
        optionsForm.getByRole('button', { name: '确认供应商', exact: true }),
        '确认供应商',
      );

      const asyncSubmitHeading = page.getByRole('heading', {
        name: '异步提交与失败恢复',
        exact: true,
      });
      await asyncSubmitHeading.scrollIntoViewIfNeeded();
      const asyncSubmitForm = asyncSubmitHeading.locator('xpath=following::form[1]');
      const asyncCustomerName = asyncSubmitForm.getByRole('textbox', {
        name: /客户名称/,
      });
      const asyncSave = asyncSubmitForm.getByRole('button', {
        name: '保存客户',
        exact: true,
      });
      await expectTouchTarget(asyncCustomerName, '异步提交客户名称');
      await expectTouchTarget(asyncSave, '异步提交保存');
      await asyncCustomerName.fill('触控尺寸客户');
      await asyncSave.click();
      await expect(asyncSubmitForm.getByRole('alert')).toHaveText('保存失败，请重试。');
      await expectTouchTarget(
        asyncSubmitForm.getByRole('button', { name: '重试保存', exact: true }),
        '异步提交重试',
      );

      const form = page
        .getByRole('heading', { name: '完整客户录入', exact: true })
        .locator('xpath=following::form[1]');
      await expectTouchTarget(form.getByRole('textbox', { name: /客户名称/ }), '完整客户名称');
      await expectTouchTarget(form.getByRole('textbox', { name: /联系邮箱/ }), '完整客户邮箱');
      const customerLevel = form.getByRole('combobox', { name: /客户等级/ });
      await expectTouchTarget(customerLevel, '完整客户等级');
      await customerLevel.scrollIntoViewIfNeeded();
      const customerLevelTarget = getPublicTouchTarget(customerLevel);
      const targetBounds = await customerLevelTarget.boundingBox();

      if (!targetBounds) throw new Error('客户等级 Select 的可点击外框未渲染');
      const tapX = targetBounds.x + Math.min(20, targetBounds.width / 2);
      for (const tapY of [targetBounds.y + 1, targetBounds.y + targetBounds.height - 1]) {
        await page.touchscreen.tap(tapX, tapY);
        await expect(customerLevel).toHaveAttribute('aria-expanded', 'true');
        await page.keyboard.press('Escape');
        await expect(customerLevel).toHaveAttribute('aria-expanded', 'false');
      }

      for (const action of [
        form.getByRole('button', { name: '保存客户', exact: true }),
        form.getByRole('button', { name: '重置', exact: true }),
      ]) {
        await expectTouchTarget(action, '完整客户表单操作');
      }

      const failureToggle = page
        .getByRole('checkbox', { name: '模拟保存失败（用于演示恢复）', exact: true })
        .locator('xpath=ancestor::label[1]');
      await expectTouchBounds(failureToggle, '模拟保存失败');

      await waitForBrowserQuiescence(page, browserHealth);
      expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
    } finally {
      await context.close();
    }
  });

  test('窄屏可从交互示例开头直达自定义字段与完整客户录入', async ({ page }) => {
    const browserHealth = collectBrowserErrors(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);

    const jumpLinks = page.locator('p').filter({ hasText: '快速跳转到' });
    for (const headingName of ['局部注册表与自定义字段', '完整客户录入']) {
      const jumpLink = jumpLinks.getByRole('link', { name: headingName, exact: true });
      const heading = page.getByRole('heading', { name: headingName, exact: true });
      await expect(jumpLink).toBeVisible();
      await jumpLink.click();
      await expect(heading).toBeInViewport();
      const targetId = await heading.getAttribute('id');
      expect(targetId).toBeTruthy();
      expect(decodeURIComponent(new URL(page.url()).hash.slice(1))).toBe(targetId);

      const geometry = await heading.evaluate((element) => {
        const header = document.querySelector<HTMLElement>('.dumi-default-header');
        if (!header) throw new Error('Dumi 吸顶栏未渲染');

        return {
          headingTop: element.getBoundingClientRect().top,
          headerBottom: header.getBoundingClientRect().bottom,
        };
      });
      expect(geometry.headingTop).toBeGreaterThanOrEqual(geometry.headerBottom);
    }

    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  });

  test('校验后首字段标签显示在吸顶栏下方', async ({ page }) => {
    const browserHealth = collectBrowserErrors(page);
    const viewports = [
      { width: 1280, height: 720 },
      { width: 390, height: 844 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(route);

      const heading = page.getByRole('heading', { name: '完整客户录入', exact: true });
      const form = heading.locator('xpath=following::form[1]');
      const save = form.getByRole('button', { name: '保存客户', exact: true });
      const customerName = form.getByRole('textbox', { name: /客户名称/ });
      const customerNameLabel = form.locator('label').filter({ hasText: '客户名称' });

      await save.focus();
      await page.keyboard.press('Enter');
      await expect(form.getByText('客户名称为必填项', { exact: true })).toBeVisible();
      await expect(customerName).toBeFocused();

      const geometry = await customerNameLabel.evaluate((label) => {
        const header = document.querySelector<HTMLElement>('.dumi-default-header');
        if (!header) throw new Error('Dumi 吸顶栏未渲染');

        const labelRect = label.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();
        return {
          labelTop: labelRect.top,
          labelBottom: labelRect.bottom,
          headerBottom: headerRect.bottom,
          viewportHeight: window.innerHeight,
        };
      });

      expect(
        geometry.labelTop,
        `${viewport.width}px 下首字段标签必须完整位于吸顶栏下方：${JSON.stringify(geometry)}`,
      ).toBeGreaterThanOrEqual(geometry.headerBottom);
      expect(geometry.labelBottom).toBeLessThanOrEqual(geometry.viewportHeight);
    }

    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  });

  test('完整客户录入校验、失败恢复、查看客户与继续新增', async ({ page }) => {
    const browserHealth = collectBrowserErrors(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);

    const completeEntryHeading = page.getByRole('heading', {
      name: '完整客户录入',
      exact: true,
    });
    const form = completeEntryHeading.locator('xpath=following::form[1]');
    await expect(form).toHaveCount(1);
    const save = form.getByRole('button', { name: '保存客户', exact: true });
    await expect(save).toHaveCount(1);
    const customerName = form.getByRole('textbox', { name: /客户名称/ });
    const email = form.getByRole('textbox', { name: /联系邮箱/ });
    const reset = form.getByRole('button', { name: '重置', exact: true });
    await expect(customerName).toBeVisible();
    await expect(email).toBeVisible();
    for (const action of [save, reset]) {
      const bounds = await action.boundingBox();
      expect(bounds?.height, '390px 下表单主操作应有至少 44px 的触控高度').toBeGreaterThanOrEqual(
        44,
      );
    }

    await save.focus();
    await page.keyboard.press('Enter');
    await expect(form.getByText('客户名称为必填项', { exact: true })).toBeVisible();
    await expect(form.getByText('联系邮箱为必填项', { exact: true })).toBeVisible();
    await expect(customerName).toBeFocused();

    await customerName.fill('杭州云栖科技');
    await email.fill('invalid-email');
    await save.click();
    await expect(form.getByText('请输入有效的邮箱地址', { exact: true })).toBeVisible();

    await email.fill('ops@yunqi.example');
    const customerLevel = form.getByRole('combobox', { name: /客户等级/ });
    await customerLevel.focus();
    await customerLevel.press('ArrowDown');
    await customerLevel.press('ArrowDown');
    await customerLevel.press('Enter');

    const owner = form.getByRole('textbox', { name: /专属负责人/ });
    await expect(owner).toBeVisible();
    await expectTouchTarget(owner, '完整客户专属负责人');
    await owner.fill('李明');

    await page.getByText('提交演示', { exact: true }).click();
    await page.getByRole('checkbox', { name: '模拟保存失败（用于演示恢复）', exact: true }).check();

    await save.focus();
    await page.keyboard.press('Enter');
    const failure = page
      .getByRole('alert')
      .filter({ hasText: '保存失败，已保留当前填写内容；重试保存即可完成。' });
    await expect(failure).toHaveText('保存失败，已保留当前填写内容；重试保存即可完成。');
    await expect(customerName).toHaveValue('杭州云栖科技');
    await expect(email).toHaveValue('ops@yunqi.example');
    await expect(owner).toHaveValue('李明');

    const retry = page.getByRole('button', { name: '重试保存', exact: true });
    await expectTouchTarget(retry, '失败恢复重试');
    await expect(retry).toBeFocused();
    await retry.focus();
    await page.keyboard.press('Enter');

    const saved = page.getByRole('status').filter({ hasText: '已保存客户：杭州云栖科技' });
    await expect(saved).toContainText('已保存客户：杭州云栖科技');
    const viewCustomer = saved.getByRole('button', { name: '查看客户', exact: true });
    await expectTouchTarget(viewCustomer, '查看客户操作');
    await expect(viewCustomer).toBeFocused();
    for (const action of [
      viewCustomer,
      saved.getByRole('button', { name: '继续新增', exact: true }),
    ]) {
      const bounds = await action.boundingBox();
      expect(bounds?.height, '390px 下成功操作应有至少 44px 的触控高度').toBeGreaterThanOrEqual(44);
    }
    await page.keyboard.press('Enter');
    await expect(saved).toContainText('已打开客户详情（演示）');

    const continueAdding = saved.getByRole('button', { name: '继续新增', exact: true });
    await expectTouchTarget(continueAdding, '继续新增操作');
    await continueAdding.focus();
    await page.keyboard.press('Enter');
    await expect(customerName).toHaveValue('');
    await expect(email).toHaveValue('');
    await expect(form.getByRole('textbox', { name: /专属负责人/ })).toBeHidden();
    await expect(customerName).toBeFocused();

    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  });

  test('更换区域后清空城市和区县并禁用区县选择', async ({ page }) => {
    const browserHealth = collectBrowserErrors(page);
    await page.goto(route);

    const region = page.getByRole('combobox', { name: /区域/ });
    const city = page.getByRole('combobox', { name: '城市', exact: true });
    const district = page.getByRole('combobox', { name: '区县', exact: true });
    const currentValues = page.getByRole('figure', { name: '当前表单值' });
    await expect(region).toBeVisible();
    await expect(city).toBeVisible();
    await expect(district).toBeDisabled();

    // 级联选择通过键盘操作，避免页面内容和吸顶导航拦截弹层的鼠标命中。
    await city.focus();
    await city.press('Enter');
    await expect(city).toHaveAttribute('aria-expanded', 'true');
    await city.fill('市');
    await expect(city).toHaveAttribute('aria-busy', 'true');
    await expect(city).not.toHaveAttribute('aria-busy', 'true');
    await city.press('Enter');
    await expect(city).toHaveAttribute('aria-expanded', 'false');
    await expect(district).toBeEnabled();
    await expect(currentValues).toContainText('"city": "hangzhou"');

    await district.focus();
    await district.press('Enter');
    await expect(district).toHaveAttribute('aria-expanded', 'true');
    await district.fill('区');
    await expect(district).toHaveAttribute('aria-busy', 'true');
    await expect(district).not.toHaveAttribute('aria-busy', 'true');
    await district.press('Enter');
    await expect(district).toHaveAttribute('aria-expanded', 'false');
    await expect(currentValues).toContainText('"district": "xihu"');

    await region.focus();
    await region.press('Enter');
    await expect(region).toHaveAttribute('aria-expanded', 'true');
    await region.press('ArrowDown');
    await region.press('Enter');
    await expect(region).toHaveAttribute('aria-expanded', 'false');

    await expect(page.getByText('区域已更改，已清除城市和区县。', { exact: true })).toBeVisible();
    await expect(currentValues).toContainText('"region": "south"');
    await expect(currentValues).not.toContainText('"city":');
    await expect(currentValues).not.toContainText('"district":');
    await expect(district).toBeDisabled();

    await city.focus();
    await city.press('Enter');
    await expect(city).toHaveAttribute('aria-expanded', 'true');
    await city.fill('市');
    await expect(city).toHaveAttribute('aria-busy', 'true');
    await expect(city).not.toHaveAttribute('aria-busy', 'true');
    await city.press('Enter');
    await expect(city).toHaveAttribute('aria-expanded', 'false');
    await expect(currentValues).toContainText('"city": "shenzhen"');
    await expect(currentValues).not.toContainText('"city": "hangzhou"');

    await waitForBrowserQuiescence(page, browserHealth);
    expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
  });
});
