import { expect, test, type Locator, type Page } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const inputRoute = '/components/form/input/';

const viewports = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
  { width: 930, height: 720 },
  { width: 1280, height: 720 },
] as const;

async function readInputColor(input: Locator): Promise<string> {
  return input.evaluate((element) => window.getComputedStyle(element).color);
}

async function readToken(input: Locator, name: string): Promise<string> {
  return input.evaluate(
    (element, tokenName) => window.getComputedStyle(element).getPropertyValue(tokenName).trim(),
    name,
  );
}

async function expectNoRootHorizontalOverflow(page: Page): Promise<void> {
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
      { message: '当前 CSS 视口下 Input 文档根节点发生横向溢出', timeout: 2_000 },
    )
    .toBeLessThanOrEqual(0);
}

test('Input 受控值更新后可鼠标清除，也可用键盘全选清空', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto(inputRoute);

  const customerName = page.getByRole('textbox', { name: '客户名称', exact: true });
  const currentValue = page.getByRole('status').filter({ hasText: '当前值：' });
  await expect(customerName).toHaveValue('杭州云栖科技');

  await customerName.fill('华东供应链');
  await expect(currentValue).toHaveText('当前值：华东供应链');
  await customerName.hover();
  const clearButton = page.getByRole('button', { name: '清除客户名称', exact: true });
  await expect(clearButton).toBeVisible();
  await clearButton.click();
  await expect(customerName).toHaveValue('');
  await expect(currentValue).toHaveText('当前值：未填写');

  await customerName.fill('杭州制造');
  await customerName.focus();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('Backspace');
  await expect(customerName).toHaveValue('');
  await expect(currentValue).toHaveText('当前值：未填写');

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('allowClear 命中区在细指针和粗指针下达到最小尺寸', async ({ page, browser }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto(inputRoute);

  const customerName = page.getByRole('textbox', { name: '客户名称', exact: true });
  await customerName.fill('验证清除命中区');
  const clearButton = page.getByRole('button', { name: '清除客户名称', exact: true });
  const finePointer = await page.evaluate(() => ({
    fine: window.matchMedia('(pointer: fine)').matches,
    coarse: window.matchMedia('(any-pointer: coarse)').matches,
  }));
  expect(finePointer).toEqual({ fine: true, coarse: false });

  const fineTarget = await clearButton.boundingBox();
  expect(fineTarget?.width).toBeGreaterThanOrEqual(24);
  expect(fineTarget?.height).toBeGreaterThanOrEqual(24);

  const touchContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    screen: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  try {
    const touchPage = await touchContext.newPage();
    const touchBrowserHealth = collectBrowserErrors(touchPage);
    await touchPage.goto(page.url());

    const touchInput = touchPage.getByRole('textbox', { name: '客户名称', exact: true });
    await touchInput.fill('验证触控清除');
    const touchClearButton = touchPage.getByRole('button', {
      name: '清除客户名称',
      exact: true,
    });
    const coarsePointer = await touchPage.evaluate(() => ({
      maxTouchPoints: navigator.maxTouchPoints,
      coarse: window.matchMedia('(any-pointer: coarse)').matches,
      targetToken: getComputedStyle(document.documentElement)
        .getPropertyValue('--lx-control-target-touch-min')
        .trim(),
    }));
    expect(coarsePointer.maxTouchPoints).toBeGreaterThan(0);
    expect(coarsePointer.coarse).toBe(true);

    const minimumTarget = Number.parseFloat(coarsePointer.targetToken);
    expect(minimumTarget).toBe(44);
    const touchTarget = await touchClearButton.boundingBox();
    expect(touchTarget?.width).toBeGreaterThanOrEqual(minimumTarget);
    expect(touchTarget?.height).toBeGreaterThanOrEqual(minimumTarget);

    await touchClearButton.tap();
    await expect(touchInput).toHaveValue('');

    await waitForBrowserQuiescence(touchPage, touchBrowserHealth);
    expect(touchBrowserHealth.errors, touchBrowserHealth.errors.join('\n')).toEqual([]);
  } finally {
    await touchContext.close();
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Input 错误说明与邮箱字段关联，修正后清除错误状态', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto(inputRoute);

  const email = page.getByRole('textbox', { name: '联系邮箱（必填）', exact: true });
  await email.fill('not-an-email');
  await email.press('Tab');

  await expect(email).toHaveAttribute('aria-invalid', 'true');
  const error = page.getByRole('alert');
  await expect(error).toHaveText('请填写完整邮箱，例如 name@example.com。');
  const errorId = await error.getAttribute('id');
  expect(errorId).not.toBeNull();
  await expect(email).toHaveAttribute('aria-describedby', errorId!);

  await email.fill('ops@example.com');
  await expect(email).toHaveValue('ops@example.com');
  await expect(email).toHaveAttribute('aria-invalid', 'false');
  await expect(error).toHaveCount(0);

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('TextArea 键盘清空更新字数，且最大长度阻止额外输入', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto(inputRoute);

  const notes = page.getByRole('textbox', { name: '采购备注', exact: true });
  const keyboardHint = page.getByText(/键盘清空时聚焦文本框/);
  const status = page.getByRole('status').filter({ hasText: '已填写' });
  const count = page.getByText(/^\d+ \/ 200$/);
  const keyboardHintId = await keyboardHint.getAttribute('id');
  expect(keyboardHintId).not.toBeNull();
  await expect(notes).toHaveAttribute('aria-describedby', keyboardHintId!);
  const initialValue = await notes.inputValue();
  await expect(status).toHaveText(`已填写 ${initialValue.length} 字`);
  await expect(count).toHaveText(`${initialValue.length} / 200`);
  await expect(count).toBeVisible();
  const statusStyle = await status.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      position: style.position,
      width: style.width,
      height: style.height,
      overflow: style.overflow,
      clip: style.clip,
      clipPath: style.clipPath,
    };
  });
  expect(statusStyle).toEqual({
    position: 'absolute',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    clip: 'rect(0px, 0px, 0px, 0px)',
    clipPath: 'inset(50%)',
  });

  await notes.focus();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.press('Delete');
  await expect(notes).toHaveValue('');
  await expect(status).toHaveText('已填写 0 字');
  await expect(count).toHaveText('0 / 200');

  const maximumValue = '字'.repeat(200);
  await notes.fill(maximumValue);
  await expect(notes).toHaveValue(maximumValue);
  await expect(status).toHaveText('已填写 200 字');
  await expect(count).toHaveText('200 / 200');
  await notes.press('End');
  await notes.press('x');
  await expect(notes).toHaveValue(maximumValue);
  await expect(status).toHaveText('已填写 200 字');
  await expect(count).toHaveText('200 / 200');

  await notes.fill(initialValue);
  await page.setViewportSize({ width: 320, height: 740 });
  await notes.scrollIntoViewIfNeeded();
  const countBounds = await count.boundingBox();
  expect(countBounds).not.toBeNull();
  const hintTextBounds = await keyboardHint.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return Array.from(range.getClientRects()).map((rect) => ({
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
    }));
  });
  expect(hintTextBounds.length).toBeGreaterThan(0);
  for (const textBounds of hintTextBounds) {
    const overlapsCount =
      textBounds.left < countBounds!.x + countBounds!.width &&
      textBounds.right > countBounds!.x &&
      textBounds.top < countBounds!.y + countBounds!.height &&
      textBounds.bottom > countBounds!.y;
    expect(overlapsCount).toBe(false);
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Input 文档在窄屏和桌面 CSS 视口均无横向溢出', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto(inputRoute);
  await expect(page.getByRole('textbox', { name: '客户名称', exact: true })).toBeVisible();

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await expectNoRootHorizontalOverflow(page);
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Input 窄屏 API 表可通过方向键滚动，代码标识符保持完整', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.goto(inputRoute);
  await page.setViewportSize({ width: 320, height: 740 });

  const tableRegion = page.getByRole('region', { name: 'Input 常用参数表', exact: true });
  await expect(tableRegion).toBeVisible();
  await expect(tableRegion).toHaveAttribute('tabindex', '0');
  await expect(page.getByText(/窄屏下可左右滑动参数表/)).toBeVisible();
  const tableJumpLink = page.getByRole('link', {
    name: '跳转到 Input 参数表起始位置',
    exact: true,
  });
  const tableJumpHash = await tableJumpLink.evaluate((link) => {
    if (!(link instanceof HTMLAnchorElement)) {
      throw new Error('跳转控件不是原生链接');
    }

    return new URL(link.href, window.location.href).hash;
  });
  expect(tableJumpHash).toBe('#input-main-api-table');
  await expect(tableJumpLink).toHaveCSS('position', 'absolute');
  await expect(tableJumpLink).toHaveCSS('clip-path', 'inset(50%)');

  const expectTableStartVisible = async () => {
    const metrics = await tableRegion.evaluate((region) => {
      const table = region.querySelector('table');
      const heading = table?.tHead?.rows[0];
      const firstRow = table?.tBodies[0]?.rows[0];
      const headerBar = document.querySelector('.dumi-default-header');
      const mobileMenuBar = document.querySelector('.dumi-default-sidebar-btn');
      if (!heading || !firstRow) {
        throw new Error('未找到 Input 参数表表头或首行');
      }

      return {
        headerTop: heading.getBoundingClientRect().top,
        headerBottom: heading.getBoundingClientRect().bottom,
        firstRowTop: firstRow.getBoundingClientRect().top,
        firstRowBottom: firstRow.getBoundingClientRect().bottom,
        navigationBottom: Math.max(
          headerBar?.getBoundingClientRect().bottom ?? 0,
          mobileMenuBar?.getBoundingClientRect().bottom ?? 0,
        ),
        viewportHeight: window.innerHeight,
      };
    });

    expect(metrics.headerTop).toBeGreaterThanOrEqual(metrics.navigationBottom);
    expect(metrics.firstRowTop).toBeGreaterThanOrEqual(metrics.headerBottom);
    expect(metrics.firstRowBottom).toBeLessThanOrEqual(metrics.viewportHeight);
  };

  let tableJumpTabCount = 0;
  while (
    tableJumpTabCount < 120 &&
    !(await tableJumpLink.evaluate((link) => document.activeElement === link))
  ) {
    await page.keyboard.press('Tab');
    tableJumpTabCount += 1;
  }
  expect(tableJumpTabCount).toBeLessThan(120);
  await expect(tableJumpLink).toBeFocused();
  await expect(tableJumpLink).toBeVisible();
  await expect(tableJumpLink).toHaveCSS('position', 'relative');
  await expect(tableJumpLink).toHaveCSS('outline-style', 'solid');
  await expect(tableJumpLink).toHaveCSS('outline-width', '2px');
  const tableJumpBounds = await tableJumpLink.boundingBox();
  expect(tableJumpBounds?.width).toBeGreaterThan(120);
  await expectTableStartVisible();

  await page.keyboard.press('Tab');
  await expect(tableRegion).toBeFocused();
  await expectTableStartVisible();

  await page.keyboard.press('Shift+Tab');
  await expect(tableJumpLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#input-main-api-table$/);
  await expectTableStartVisible();

  const showCountRow = tableRegion.getByRole('row').filter({ hasText: 'showCount' });
  await expect(showCountRow.getByRole('cell').nth(1)).toContainText(
    'formatter: (args: { value: string; count: number; maxLength?: number }) => ReactNode',
  );
  const compoundParameterCell = tableRegion
    .getByRole('row')
    .filter({ hasText: 'addonBefore / addonAfter' })
    .getByRole('cell')
    .first();
  const compoundParameterBounds = await compoundParameterCell.boundingBox();
  expect(compoundParameterBounds?.width).toBe(176);
  const compoundIdentifierLines = await compoundParameterCell.locator('code').evaluate((code) => {
    const textNode = code.firstChild;
    if (textNode?.nodeType !== Node.TEXT_NODE || !textNode.textContent) {
      throw new Error('未找到 addonBefore / addonAfter 的 API 标识符文本');
    }

    return ['addonBefore', 'addonAfter'].map((identifier) => {
      const start = textNode.textContent!.indexOf(identifier);
      const range = document.createRange();
      range.setStart(textNode, start);
      range.setEnd(textNode, start + identifier.length);
      return range.getClientRects().length;
    });
  });
  expect(compoundIdentifierLines).toEqual([1, 1]);

  const tableMetrics = await tableRegion.evaluate((region) => {
    const table = region.querySelector('table');
    const firstType = table?.querySelector('tbody tr td:nth-child(2) code');
    const textNode = Array.from(firstType?.childNodes ?? []).find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.includes('string[]'),
    );
    if (!table || !firstType || !textNode?.textContent) {
      throw new Error('未找到包含 string[] 的 Input API 类型单元格');
    }

    const token = 'string[]';
    const start = textNode.textContent.indexOf(token);
    const range = document.createRange();
    range.setStart(textNode, start);
    range.setEnd(textNode, start + token.length);

    return {
      regionWidth: region.clientWidth,
      regionScrollWidth: region.scrollWidth,
      tableWidth: table.getBoundingClientRect().width,
      identifierLineCount: range.getClientRects().length,
    };
  });
  expect(tableMetrics.tableWidth).toBeGreaterThan(tableMetrics.regionWidth);
  expect(tableMetrics.tableWidth).toBeLessThanOrEqual(1000);
  expect(tableMetrics.regionScrollWidth).toBeGreaterThan(tableMetrics.regionWidth);
  expect(tableMetrics.identifierLineCount).toBe(1);

  const ariaDescribedby = tableRegion
    .getByRole('row')
    .filter({ hasText: 'aria-describedby' })
    .getByRole('cell')
    .first()
    .locator('code')
    .filter({ hasText: 'aria-describedby' });
  await expect(ariaDescribedby).toBeVisible();
  await expect(ariaDescribedby).toHaveCSS('white-space', 'nowrap');
  const ariaDescribedbyLineCount = await ariaDescribedby.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getClientRects().length;
  });
  expect(ariaDescribedbyLineCount).toBe(1);

  await tableRegion.focus();
  await tableRegion.evaluate((region) => {
    region.scrollLeft = 0;
  });
  await expect.poll(() => tableRegion.evaluate((region) => region.scrollLeft)).toBe(0);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => tableRegion.evaluate((region) => region.scrollLeft)).toBeGreaterThan(0);

  const parameterCell = showCountRow.getByRole('cell').first();
  await expect(parameterCell).toHaveCSS('position', 'sticky');
  const regionBounds = await tableRegion.boundingBox();
  const regionClientLeft = await tableRegion.evaluate((region) => region.clientLeft);
  await expect
    .poll(async () => {
      const cellBounds = await parameterCell.boundingBox();
      return cellBounds && regionBounds
        ? Math.abs(cellBounds.x - regionBounds.x - regionClientLeft)
        : Number.POSITIVE_INFINITY;
    })
    .toBeLessThanOrEqual(1);

  const textareaDescription = page
    .locator('.markdown > p')
    .filter({ hasText: 'TextArea 独立导出' });
  await expect(textareaDescription).toHaveCSS('text-align', 'start');
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(textareaDescription).toHaveCSS('text-align', 'start');
  await expectNoRootHorizontalOverflow(page);

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Input 在暗色、紧凑密度与 reduced-motion 下保持可操作', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(inputRoute);

  const customerName = page.getByRole('textbox', { name: '客户名称', exact: true });
  await expect(customerName).toBeVisible();
  const themeSettings = page.getByText('主题设置', { exact: true }).first();
  await themeSettings.click();

  const darkMode = page.getByRole('switch', { name: '暗色模式', exact: true }).first();
  if (await darkMode.isChecked()) await darkMode.click();
  const lightTextColor = await readInputColor(customerName);
  await darkMode.click();
  await expect(darkMode).toBeChecked();
  await expect
    .poll(() => readInputColor(customerName), { message: '暗色模式没有更新 Input 文本颜色' })
    .not.toBe(lightTextColor);

  const compactDensity = page.getByRole('switch', { name: '紧凑密度', exact: true }).first();
  if (await compactDensity.isChecked()) await compactDensity.click();
  await compactDensity.click();
  await expect(compactDensity).toBeChecked();
  await expect.poll(() => readToken(customerName, '--lx-control-height')).toBe('32px');

  await customerName.fill('动效降级后仍可编辑');
  await expect(customerName).toHaveValue('动效降级后仍可编辑');
  await expect.poll(() => readToken(customerName, '--lx-motion-duration')).toBe('0ms');
  await customerName.hover();
  const clearButton = page.getByRole('button', { name: '清除客户名称', exact: true });
  await expect(clearButton).toHaveCSS('transition-duration', '0s');
  await clearButton.click();
  await expect(customerName).toHaveValue('');

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});
