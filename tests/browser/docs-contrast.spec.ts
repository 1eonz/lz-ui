import { expect, test, type Locator } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

/**
 * 检查实际绘制文字的 sRGB 对比度，透明背景逐层合成到浏览器白色画布。
 * 当前采样区域应为实色、不带祖先透明度；遇到图片或整体透明合成时显式失败，
 * 避免把不能用简单背景合成计算的结果误记为通过。placeholder 单独计入自身透明度。
 */
async function expectTextContrast(target: Locator, label: string, placeholder = false) {
  await target.scrollIntoViewIfNeeded();
  await expect(target, `${label} 必须为实际可见元素`).toBeVisible();
  const sample = await target.evaluate((element, isPlaceholder) => {
    type RGBA = [number, number, number, number];
    const parse = (value: string): RGBA => {
      const channels = value.match(/[\d.]+/g)?.map(Number);
      if (!channels || channels.length < 3) throw new Error(`无法解析计算颜色：${value}`);
      return [channels[0], channels[1], channels[2], channels[3] ?? 1];
    };
    const over = (front: RGBA, back: RGBA): RGBA => {
      const alpha = front[3] + back[3] * (1 - front[3]);
      const channel = (index: number) =>
        (front[index] * front[3] + back[index] * back[3] * (1 - front[3])) / alpha;
      return [channel(0), channel(1), channel(2), alpha];
    };
    const luminance = (color: RGBA) =>
      color.slice(0, 3).reduce((sum, channel, index) => {
        const normalized = channel / 255;
        const linear =
          normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
        return sum + linear * [0.2126, 0.7152, 0.0722][index];
      }, 0);

    const chain: Element[] = [];
    for (let current: Element | null = element; current; current = current.parentElement) {
      chain.unshift(current);
    }
    let background: RGBA = [255, 255, 255, 1];
    for (const ancestor of chain) {
      const style = getComputedStyle(ancestor);
      if (style.backgroundImage !== 'none' || Number(style.opacity) !== 1) {
        throw new Error('采样区域含图片或整体透明度，需单独检查实际合成结果');
      }
      if (ancestor.matches('[hidden], [aria-hidden="true"], [aria-busy="true"]')) {
        throw new Error('不能用隐藏或加载中的文字作为对比度通过证据');
      }
      background = over(parse(style.backgroundColor), background);
    }
    const style = getComputedStyle(element, isPlaceholder ? '::placeholder' : null);
    const foreground = parse(style.color);
    if (isPlaceholder) foreground[3] *= Number(style.opacity);
    const effectiveForeground = over(foreground, background);
    const [high, low] = [luminance(effectiveForeground), luminance(background)].sort(
      (first, second) => second - first,
    );
    const bounds = element.getBoundingClientRect();
    return {
      text: isPlaceholder ? element.getAttribute('placeholder') : element.textContent?.trim(),
      foreground: style.color,
      background,
      ratio: (high + 0.05) / (low + 0.05),
      intersectsViewport:
        bounds.right > 0 &&
        bounds.left < innerWidth &&
        bounds.bottom > 0 &&
        bounds.top < innerHeight,
    };
  }, placeholder);
  expect(sample.text, `${label} 不能只检查没有文字的容器`).toBeTruthy();
  expect(sample.intersectsViewport, `${label} 应滚动到可见视口`).toBe(true);
  expect(sample.ratio, `${label}：${JSON.stringify(sample)}`).toBeGreaterThanOrEqual(4.5);
  return sample.foreground;
}

/** 新 context 不访问链接目标，分别采样普通、悬停和键盘焦点，避免把 hover 当默认色。 */
async function expectLinkStates(target: Locator, label: string, scriptFocusStyleOnly: boolean) {
  const page = target.page();
  await page.mouse.move(0, 0);
  await expectTextContrast(target, `${label} 普通状态`);
  await target.hover();
  await expectTextContrast(target, `${label} hover`);
  await page.mouse.move(0, 0);
  if (scriptFocusStyleOnly) {
    // Windows WebKit 的原生 Tab 偏好跳过链接，裸 HTML 也可复现。
    // 此分支仅采样脚本聚焦的键盘输入模态样式，不代表 Tab 可达性验收。
    await page.keyboard.press('Tab');
    await target.focus();
  } else {
    await target.focus();
    await target.press('Tab');
    await page.keyboard.press('Shift+Tab');
  }
  await expect(target).toBeFocused();
  await expect(target).toHaveJSProperty('tabIndex', 0);
  expect(await target.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expectTextContrast(
    target,
    `${label} ${scriptFocusStyleOnly ? '脚本聚焦的键盘输入模态样式' : '键盘焦点'}`,
  );
  await target.evaluate((element) => (element as HTMLElement).blur());
}

for (const mode of ['light', 'dark'] as const) {
  test(`文档壳 ${mode}：DynamicForm 与 Input 的可见文字对比度`, async ({
    browser,
    baseURL,
  }, testInfo) => {
    // 每项覆盖两路由、两视口及逐 token 滚动采样，为较慢引擎和 context 清理保留有界预算。
    test.setTimeout(120_000);
    const scriptFocusStyleOnly =
      process.platform === 'win32' && browser.browserType().name() === 'webkit';
    if (scriptFocusStyleOnly) {
      testInfo.annotations.push({
        type: '键盘验收边界',
        description:
          'Windows WebKit 原生 Tab 偏好跳过链接；链接焦点仅验收脚本聚焦的键盘输入模态及 :focus-visible 对比度，不代表 Tab 可达性通过。',
      });
    }
    // 独立 context 使用真实持久化主题偏好，并等待 Dumi 设置 root，禁止直接改属性伪造主题。
    const context = await browser.newContext({
      baseURL,
      colorScheme: mode,
      viewport: { width: 1440, height: 1000 },
    });
    await context.addInitScript((value) => localStorage.setItem('dumi:prefers-color', value), mode);
    const page = await context.newPage();
    const health = collectBrowserErrors(page);
    try {
      for (const component of ['dynamic-form', 'input']) {
        await page.goto(`/components/form/${component}/`);
        await expect(page.locator('html')).toHaveAttribute('data-prefers-color', mode);
        await waitForBrowserQuiescence(page, health);

        for (const width of [1440, 390]) {
          await page.setViewportSize({ width, height: 1000 });
          const placeholder = page.locator('.dumi-default-header .dumi-default-search-bar-input');
          await expect(placeholder).toHaveValue('');
          await expectTextContrast(placeholder, `${component}/${width} 搜索 placeholder`, true);

          if (width === 1440) {
            await expectLinkStates(
              page.locator('.dumi-default-sidebar .dumi-default-sidebar-group > dd > a.active'),
              `${component} 侧栏选中链接`,
              scriptFocusStyleOnly,
            );
          }
          // Input 的正文链接在参数表后的审查说明中；避免误采样隐藏的标题锚点或 demo 内链接。
          await expectLinkStates(
            page.locator('.markdown > :is(p, ul, ol) a').first(),
            `${component}/${width} 正文链接`,
            scriptFocusStyleOnly,
          );

          const source = page.locator('.markdown > .dumi-default-source-code').first();
          const tokens = source.locator('pre.prism-code .token');
          const representatives = await tokens.evaluateAll((elements) => {
            const seen = new Set<string>();
            return elements.flatMap((element, index) => {
              if (!element.textContent?.trim() || seen.has(element.className)) return [];
              seen.add(element.className);
              return [{ index, name: element.className }];
            });
          });
          expect(representatives.length, `${component} 应有实际语法高亮`).toBeGreaterThanOrEqual(3);
          const colors = new Set<string>();
          for (const token of representatives) {
            colors.add(
              await expectTextContrast(
                tokens.nth(token.index),
                `${component}/${width} ${token.name}`,
              ),
            );
          }
          expect(
            colors.size,
            '语法高亮保持多色，不能通过全部变为单色规避对比度问题',
          ).toBeGreaterThanOrEqual(3);
          // 行内代码沿用已验收的颜色，源码 token 覆盖不得扩散到普通 code。
          const inlineCode = page
            .locator('.markdown code:not(pre code):not(.dumi-default-source-code code)')
            .first();
          await expect(inlineCode).toHaveCSS(
            'color',
            mode === 'light' ? 'rgb(143, 48, 48)' : 'rgb(213, 97, 97)',
          );
          // 真实 demo 输入保留组件主题的文字色，而不是继承文档链接或语法色。
          const demoInput = page
            .locator('.dumi-default-previewer-demo [data-lx-mode]')
            .getByRole('textbox')
            .first();
          await expect(demoInput).toBeVisible();
          const demoColors = await demoInput.evaluate((element) => {
            const actual = getComputedStyle(element).color;
            const probe = document.createElement('span');
            probe.style.color = 'var(--lx-color-text)';
            element.parentElement?.append(probe);
            const expected = getComputedStyle(probe).color;
            probe.remove();
            return { actual, expected };
          });
          expect(demoColors.actual, 'demo 继续消费组件主题文字色').toBe(demoColors.expected);
          await expectTextContrast(
            source.locator('.dumi-default-source-code-language'),
            `${component}/${width} 语言标签`,
          );
          await source.scrollIntoViewIfNeeded();
          await page.screenshot({ path: testInfo.outputPath(`${component}-${width}-syntax.png`) });

          const updatedLabel = page.locator(
            '.dumi-default-content-footer > dl > dd > span.dumi-default-mobile-hidden',
          );
          if (width === 1440) {
            await expectTextContrast(updatedLabel, `${component}/${width} 最后更新时间标签`);
          } else {
            await expect(updatedLabel).toBeHidden();
          }
          await expectTextContrast(
            page.locator('.dumi-default-content-footer time'),
            `${component}/${width} 更新时间`,
          );

          const footer = page.locator('.dumi-default-footer > a');
          await expectLinkStates(
            footer,
            `${component}/${width} 页尾 dumi 链接`,
            scriptFocusStyleOnly,
          );
          await page.screenshot({ path: testInfo.outputPath(`${component}-${width}-footer.png`) });
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({ path: testInfo.outputPath(`${component}-${width}-shell.png`) });
        }
      }
      await waitForBrowserQuiescence(page, health);
      expect(health.errors).toEqual([]);
    } finally {
      await context.close();
    }
  });
}
