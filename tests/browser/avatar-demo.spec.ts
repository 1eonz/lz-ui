import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test';
import { collectBrowserErrors, waitForBrowserQuiescence } from './browser-health';

const viewports = [
  { width: 1280, height: 720 },
  { width: 930, height: 720 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
] as const;

async function openAvatarDemo(page: Page): Promise<Locator> {
  await page.goto('/components/data-display/avatar/');
  await expect(page.getByRole('heading', { name: 'Avatar 头像', level: 1 })).toBeVisible();

  const demo = page.getByTestId('avatar-demo');
  await expect(demo).toHaveCount(1);
  const status = demo.getByRole('status');
  const portrait = demo.getByRole('img', { name: '审批负责人', exact: true }).locator('img');
  await expect(
    demo.getByRole('img', { name: '审批负责人', exact: true }),
  ).toHaveAccessibleDescription('在线');
  await expect(demo.getByText('在线', { exact: true }).first()).toBeVisible();
  await expect(portrait).toBeVisible();
  await expect
    .poll(() =>
      portrait.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  await expect(status).toHaveText('审批负责人头像图片已加载。 共 8 位审批人协办。');
  const approverCount = demo.getByText('共 8 位审批人协办', { exact: true });
  await expect(approverCount).toBeVisible();
  await expect(approverCount).toHaveCSS('white-space', 'nowrap');
  return demo;
}

async function setSwitch(root: Page | Locator, name: string, checked: boolean): Promise<void> {
  const control = root.getByRole('switch', { name, exact: true });
  if ((await control.getAttribute('aria-checked')) !== String(checked)) await control.click();
  await expect(control).toHaveAttribute('aria-checked', String(checked));
}

async function getAvatarBackgroundColor(avatar: Locator): Promise<string> {
  return avatar.evaluate((element) => getComputedStyle(element).backgroundColor);
}

async function expectNoRootHorizontalOverflow(page: Page, width: number): Promise<void> {
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
  expect(await page.evaluate(() => document.documentElement.clientWidth)).toBe(width);
}

async function expectAvatarSizes(demo: Locator): Promise<void> {
  const expected = [
    ['周晓轩', 48],
    ['张莉', 36],
    ['赵明', 24],
  ] as const;

  for (const [name, size] of expected) {
    const avatar = demo.getByRole('img', { name, exact: true }).first();
    await expect(avatar).toBeVisible();
    const bounds = await avatar.boundingBox();
    expect(bounds, `${name} 头像缺少布局边界`).not.toBeNull();
    expect(bounds?.width).toBe(size);
    expect(bounds?.height).toBe(size);
  }
}

async function saveViewportEvidence(page: Page, testInfo: TestInfo, width: number): Promise<void> {
  // 完整页面从文档顶部截图，避免元素截图自动滚动时把 Dumi 粘性导航裁进 demo。
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
  });
  await page.screenshot({ path: testInfo.outputPath(`avatar-${width}.png`), fullPage: true });
}

test('Avatar 图片失败回退、成员截断展开、可访问名称与键盘状态播报', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  const demo = await openAvatarDemo(page);
  const status = demo.getByRole('status');
  const group = demo.getByRole('group', { name: '审批协作人员', exact: true });
  const fallback = demo.getByRole('img', { name: '审批负责人', exact: true });
  const expandButton = demo.getByRole('button', { name: '显示全部审批人', exact: true });
  const groupId = (await group.getAttribute('id')) ?? '';

  expect(groupId).not.toBe('');
  await expect(expandButton).toHaveAttribute('aria-expanded', 'false');
  await expect(expandButton).toHaveAttribute('aria-controls', groupId);
  await expect(demo.getByRole('img', { name: '周晓轩', exact: true }).first()).toBeVisible();
  await expect(demo.getByRole('img', { name: '张莉', exact: true }).first()).toBeVisible();
  await expect(demo.getByRole('img', { name: '赵明', exact: true }).first()).toBeVisible();
  await expect(fallback).toBeVisible();
  const groupZhou = group.getByRole('img', { name: '周晓轩', exact: true });
  const rowZhou = demo.getByRole('img', { name: '周晓轩', exact: true }).first();
  await expect(groupZhou).toBeVisible();
  await expect(group.getByRole('img', { name: '张莉', exact: true })).toBeVisible();
  await expect(group.getByRole('img', { name: '赵明', exact: true })).toBeVisible();
  expect(await getAvatarBackgroundColor(rowZhou)).toBe(await getAvatarBackgroundColor(groupZhou));
  expect(await getAvatarBackgroundColor(rowZhou)).not.toBe(
    await getAvatarBackgroundColor(demo.getByRole('img', { name: '张莉', exact: true }).first()),
  );
  await expect(group.getByRole('img', { name: '孙鹏', exact: true })).toHaveCount(0);
  const overflow = group.getByText('+4', { exact: true });
  await expect(overflow).toBeVisible();
  const firstMember = group.getByRole('img', { name: '周晓轩', exact: true });
  const secondMember = group.getByRole('img', { name: '张莉', exact: true });
  const thirdMember = group.getByRole('img', { name: '赵明', exact: true });
  const fourthMember = group.getByRole('img', { name: '刘倩', exact: true });
  const overflowAvatar = overflow.locator('xpath=..');
  const firstMemberBeforeHover = await firstMember.boundingBox();
  const secondMemberBeforeHover = await secondMember.boundingBox();
  const thirdMemberBeforeHover = await thirdMember.boundingBox();
  const fourthMemberBeforeHover = await fourthMember.boundingBox();
  const overflowBeforeHover = await overflowAvatar.boundingBox();
  expect(firstMemberBeforeHover).not.toBeNull();
  expect(secondMemberBeforeHover).not.toBeNull();
  expect(thirdMemberBeforeHover).not.toBeNull();
  expect(fourthMemberBeforeHover).not.toBeNull();
  expect(overflowBeforeHover).not.toBeNull();
  await overflow.hover();
  await expect
    .poll(async () => {
      const [
        firstAfterHover,
        secondAfterHover,
        thirdAfterHover,
        fourthAfterHover,
        overflowAfterHover,
      ] = await Promise.all([
        firstMember.boundingBox(),
        secondMember.boundingBox(),
        thirdMember.boundingBox(),
        fourthMember.boundingBox(),
        overflowAvatar.boundingBox(),
      ]);
      if (
        !firstMemberBeforeHover ||
        !secondMemberBeforeHover ||
        !thirdMemberBeforeHover ||
        !fourthMemberBeforeHover ||
        !overflowBeforeHover ||
        !firstAfterHover ||
        !secondAfterHover ||
        !thirdAfterHover ||
        !fourthAfterHover ||
        !overflowAfterHover
      ) {
        return false;
      }
      return (
        Math.abs(secondAfterHover.x - secondMemberBeforeHover.x - 12) < 1 &&
        Math.abs(thirdAfterHover.x - thirdMemberBeforeHover.x - 24) < 1 &&
        Math.abs(fourthAfterHover.x - fourthMemberBeforeHover.x - 36) < 1 &&
        Math.abs(overflowAfterHover.x - overflowBeforeHover.x - 48) < 1 &&
        Math.abs(secondAfterHover.x - firstAfterHover.x - 40) < 1 &&
        Math.abs(thirdAfterHover.x - secondAfterHover.x - 40) < 1 &&
        Math.abs(fourthAfterHover.x - thirdAfterHover.x - 40) < 1 &&
        overflowAfterHover.x >= fourthAfterHover.x + fourthAfterHover.width - 1
      );
    })
    .toBe(true);
  const [lastMemberAfterHover, overflowAfterHover, demoBounds] = await Promise.all([
    fourthMember.boundingBox(),
    overflowAvatar.boundingBox(),
    demo.boundingBox(),
  ]);
  expect(lastMemberAfterHover).not.toBeNull();
  expect(overflowAfterHover).not.toBeNull();
  expect(demoBounds).not.toBeNull();
  expect(overflowAfterHover!.x).toBeGreaterThanOrEqual(
    lastMemberAfterHover!.x + lastMemberAfterHover!.width,
  );
  expect(overflowAfterHover!.x + overflowAfterHover!.width).toBeLessThanOrEqual(
    demoBounds!.x + demoBounds!.width,
  );
  await expect(group.getByRole('img', { name: '孙鹏', exact: true })).toHaveCount(0);

  const failureButton = demo.getByRole('button', { name: '模拟图片失败', exact: true });
  await failureButton.focus();
  await page.keyboard.press('Enter');
  await expect(demo.getByRole('button', { name: '恢复头像图片', exact: true })).toBeFocused();
  await expect(status).toContainText('审批负责人头像加载失败，已显示回退内容 LX。');
  await expect(fallback).toContainText('LX');

  await page.keyboard.press('Enter');
  await expect(demo.getByRole('button', { name: '模拟图片失败', exact: true })).toBeFocused();
  await expect(status).toHaveText('审批负责人头像图片已加载。 共 8 位审批人协办。');
  const restoredPortrait = fallback.locator('img');
  await expect
    .poll(() =>
      restoredPortrait.evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
      ),
    )
    .toBe(true);

  await expandButton.focus();
  await page.keyboard.press('Enter');
  const collapseButton = demo.getByRole('button', { name: '收起审批人', exact: true });
  await expect(collapseButton).toBeFocused();
  await expect(collapseButton).toHaveAttribute('aria-expanded', 'true');
  await expect(collapseButton).toHaveAttribute('aria-controls', groupId);
  await expect(group.getByText('+4', { exact: true })).toHaveCount(0);
  const expandedList = group.getByRole('list', { name: '全部审批人', exact: true });
  await expect(expandedList).toBeVisible();
  const expandedMembers = expandedList.getByRole('listitem');
  await expect(expandedMembers).toHaveCount(8);
  for (const [index, name] of [
    '周晓轩',
    '张莉',
    '赵明',
    '刘倩',
    '孙鹏',
    '吴宁',
    '王磊',
    '李悦',
  ].entries()) {
    await expect(expandedMembers.nth(index).getByText(name, { exact: true })).toBeVisible();
  }

  await collapseButton.focus();
  await page.keyboard.press('Enter');
  const collapsedButton = demo.getByRole('button', { name: '显示全部审批人', exact: true });
  await expect(collapsedButton).toBeFocused();
  await expect(collapsedButton).toHaveAttribute('aria-expanded', 'false');
  await expect(group.getByText('+4', { exact: true })).toBeVisible();
  await expect(group.getByRole('img', { name: '孙鹏', exact: true })).toHaveCount(0);

  await waitForBrowserQuiescence(page, browserHealth);
  const unexpectedErrors = browserHealth.errors.filter(
    (error) => !error.includes('data:image/png;base64,invalid'),
  );
  expect(unexpectedErrors, unexpectedErrors.join('\n')).toEqual([]);
});

test('AvatarGroup RTL 悬停位移镜像且溢出头像完整可见', async ({ page }) => {
  const demo = await openAvatarDemo(page);
  const group = demo.getByRole('group', { name: '审批协作人员', exact: true });
  await demo.evaluate((element) => {
    const host = element.parentElement;
    if (!host) throw new Error('Avatar demo 缺少宿主父级');
    host.setAttribute('dir', 'rtl');
  });
  await expect(group).not.toHaveAttribute('dir');
  await expect(group).toHaveCSS('direction', 'rtl');

  const secondMember = group.getByRole('img', { name: '张莉', exact: true });
  const thirdMember = group.getByRole('img', { name: '赵明', exact: true });
  const fourthMember = group.getByRole('img', { name: '刘倩', exact: true });
  const overflow = group.getByText('+4', { exact: true });
  const overflowAvatar = overflow.locator('xpath=..');
  const secondBeforeHover = await secondMember.boundingBox();
  const thirdBeforeHover = await thirdMember.boundingBox();
  const fourthBeforeHover = await fourthMember.boundingBox();
  const overflowBeforeHover = await overflowAvatar.boundingBox();
  expect(secondBeforeHover).not.toBeNull();
  expect(thirdBeforeHover).not.toBeNull();
  expect(fourthBeforeHover).not.toBeNull();
  expect(overflowBeforeHover).not.toBeNull();

  await overflow.hover();
  await expect
    .poll(async () => {
      const [secondAfterHover, thirdAfterHover, fourthAfterHover, overflowAfterHover] =
        await Promise.all([
          secondMember.boundingBox(),
          thirdMember.boundingBox(),
          fourthMember.boundingBox(),
          overflowAvatar.boundingBox(),
        ]);
      if (
        !secondBeforeHover ||
        !thirdBeforeHover ||
        !fourthBeforeHover ||
        !overflowBeforeHover ||
        !secondAfterHover ||
        !thirdAfterHover ||
        !fourthAfterHover ||
        !overflowAfterHover
      ) {
        return false;
      }
      return (
        Math.abs(secondAfterHover.x - secondBeforeHover.x + 12) < 1 &&
        Math.abs(thirdAfterHover.x - thirdBeforeHover.x + 24) < 1 &&
        Math.abs(fourthAfterHover.x - fourthBeforeHover.x + 36) < 1 &&
        Math.abs(overflowAfterHover.x - overflowBeforeHover.x + 48) < 1 &&
        overflowAfterHover.x + overflowAfterHover.width <= fourthAfterHover.x + 1
      );
    })
    .toBe(true);

  const [lastMemberAfterHover, overflowAfterHover, demoBounds] = await Promise.all([
    fourthMember.boundingBox(),
    overflowAvatar.boundingBox(),
    demo.boundingBox(),
  ]);
  expect(lastMemberAfterHover).not.toBeNull();
  expect(overflowAfterHover).not.toBeNull();
  expect(demoBounds).not.toBeNull();
  expect(overflowAfterHover!.x).toBeGreaterThanOrEqual(demoBounds!.x);
  expect(overflowAfterHover!.x + overflowAfterHover!.width).toBeLessThanOrEqual(
    demoBounds!.x + demoBounds!.width,
  );
});

test('Avatar 390px 及以下收起时保持堆叠，展开后显示可读网格', async ({ page }) => {
  const demo = await openAvatarDemo(page);
  const group = demo.getByRole('group', { name: '审批协作人员', exact: true });
  const expandButton = demo.getByRole('button', { name: '显示全部审批人', exact: true });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(expandButton).toHaveAttribute('aria-expanded', 'false');

    const firstCollapsedMember = group.getByRole('img', { name: '周晓轩', exact: true });
    const secondCollapsedMember = group.getByRole('img', { name: '张莉', exact: true });
    const [firstCollapsedBounds, secondCollapsedBounds] = await Promise.all([
      firstCollapsedMember.boundingBox(),
      secondCollapsedMember.boundingBox(),
    ]);
    expect(firstCollapsedBounds).not.toBeNull();
    expect(secondCollapsedBounds).not.toBeNull();
    expect(secondCollapsedBounds!.x).toBeLessThan(
      firstCollapsedBounds!.x + firstCollapsedBounds!.width,
    );

    await expandButton.click();
    const collapseButton = demo.getByRole('button', { name: '收起审批人', exact: true });
    await expect(collapseButton).toHaveAttribute('aria-expanded', 'true');
    await expect(group.getByRole('list', { name: '全部审批人', exact: true })).toBeVisible();
    const memberItems = group.getByRole('listitem');
    await expect(memberItems).toHaveCount(8);
    const approverNames = ['周晓轩', '张莉', '赵明', '刘倩', '孙鹏', '吴宁', '王磊', '李悦'];
    for (const [index, name] of approverNames.entries()) {
      await expect(memberItems.nth(index).getByText(name, { exact: true })).toBeVisible();
    }

    const members = await memberItems.evaluateAll(
      (elements, names) =>
        elements.map((element) => {
          const bounds = element.getBoundingClientRect();
          const textContent = element.textContent ?? '';
          return {
            text: names.find((name) => textContent.includes(name)) ?? '',
            left: bounds.left,
            right: bounds.right,
            top: bounds.top,
            bottom: bounds.bottom,
            clientWidth: element.clientWidth,
            scrollWidth: element.scrollWidth,
          };
        }),
      approverNames,
    );
    expect(members.map(({ text }) => text)).toEqual(approverNames);
    expect(members.every(({ scrollWidth, clientWidth }) => scrollWidth <= clientWidth)).toBe(true);
    for (let firstIndex = 0; firstIndex < members.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < members.length; secondIndex += 1) {
        const first = members[firstIndex];
        const second = members[secondIndex];
        const overlapsHorizontally = first.left < second.right && first.right > second.left;
        const overlapsVertically = first.top < second.bottom && first.bottom > second.top;
        expect(
          overlapsHorizontally && overlapsVertically,
          `视口 ${viewport.width}px 的第 ${firstIndex + 1}、${secondIndex + 1} 个审批人条目重叠`,
        ).toBe(false);
      }
    }

    await collapseButton.click();
    await expect(demo.getByRole('button', { name: '显示全部审批人', exact: true })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expect(group.getByRole('img')).toHaveCount(4);
  }
});

test('Avatar 宽屏展开后利用可用宽度横向排列成员', async ({ page }) => {
  const demo = await openAvatarDemo(page);
  const group = demo.getByRole('group', { name: '审批协作人员', exact: true });

  await demo.getByRole('button', { name: '显示全部审批人', exact: true }).click();
  const getMemberRows = () =>
    group
      .getByRole('listitem')
      .evaluateAll(
        (elements) =>
          new Set(elements.map((element) => Math.round(element.getBoundingClientRect().top))).size,
      );
  const wideRows = await getMemberRows();
  await page.setViewportSize({ width: 390, height: 844 });
  const narrowRows = await getMemberRows();

  expect(wideRows).toBeLessThan(narrowRows);
});

test('Avatar light/dark 与舒适/紧凑主题保持可读尺寸和成员状态', async ({ page }) => {
  const browserHealth = collectBrowserErrors(page);
  const demo = await openAvatarDemo(page);
  const themeRoot = demo.locator('xpath=ancestor-or-self::*[@data-lx-mode][1]');
  const status = demo.getByRole('status');
  const group = demo.getByRole('group', { name: '审批协作人员', exact: true });
  const rowZhou = demo.getByRole('img', { name: '周晓轩', exact: true }).first();
  const identityColor = await getAvatarBackgroundColor(rowZhou);
  const squareAvatar = demo.getByRole('img', { name: 'ERP 应用', exact: true });

  await expect(themeRoot).toHaveAttribute('data-lx-mode', 'light');
  await expect(themeRoot).toHaveAttribute('data-lx-density', 'comfortable');
  await expect(squareAvatar).toHaveCSS('border-radius', '8px');
  const lightBackground = await demo.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  const statusDot = demo.locator('.lx-avatar-demo-status-indicator');
  await expect(statusDot).toHaveCSS('border-top-color', lightBackground);

  await demo.getByRole('button', { name: '模拟图片失败', exact: true }).click();
  await demo.getByRole('button', { name: '显示全部审批人', exact: true }).click();
  await expect(status).toContainText('审批负责人头像加载失败，已显示回退内容 LX。');
  await expect(group.getByText('李悦', { exact: true })).toBeVisible();
  const expandedGroupZhou = group.getByRole('listitem').first().locator('[aria-hidden="true"]');

  const settingsTrigger = page.getByText('主题设置', { exact: true }).last();
  const settings = settingsTrigger.locator('xpath=..');
  if ((await settings.getAttribute('open')) === null) await settingsTrigger.click();
  await setSwitch(page, '暗色模式', true);
  await expect(themeRoot).toHaveAttribute('data-lx-mode', 'dark');
  const darkBackground = await demo.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  expect(darkBackground).not.toBe(lightBackground);
  await expect(statusDot).toHaveCSS('border-top-color', darkBackground);
  await expect.poll(async () => getAvatarBackgroundColor(rowZhou)).toBe(identityColor);
  expect(await getAvatarBackgroundColor(expandedGroupZhou)).toBe(identityColor);

  await setSwitch(page, '紧凑密度', true);
  await expect(themeRoot).toHaveAttribute('data-lx-density', 'compact');
  await expectAvatarSizes(demo);
  await expect(group.getByText('李悦', { exact: true })).toBeVisible();
  await expect(status).toContainText('审批负责人头像加载失败，已显示回退内容 LX。');

  await setSwitch(page, '暗色模式', false);
  await setSwitch(page, '紧凑密度', false);
  await expect(themeRoot).toHaveAttribute('data-lx-mode', 'light');
  await expect(themeRoot).toHaveAttribute('data-lx-density', 'comfortable');
  await expectAvatarSizes(demo);
  expect(await getAvatarBackgroundColor(rowZhou)).toBe(identityColor);
  expect(await getAvatarBackgroundColor(expandedGroupZhou)).toBe(identityColor);

  await waitForBrowserQuiescence(page, browserHealth);
  const unexpectedErrors = browserHealth.errors.filter(
    (error) => !error.includes('data:image/png;base64,invalid'),
  );
  expect(unexpectedErrors, unexpectedErrors.join('\n')).toEqual([]);
});

test('Avatar reduced motion 和四档 CSS 视口下无溢出', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const browserHealth = collectBrowserErrors(page);
  const demo = await openAvatarDemo(page);
  await expect
    .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    .toBe(true);

  await demo.getByRole('button', { name: '显示全部审批人', exact: true }).focus();
  await page.keyboard.press('Enter');
  const group = demo.getByRole('group', { name: '审批协作人员', exact: true });
  await expect(group.getByText('李悦', { exact: true })).toBeVisible();
  await expect(group.getByRole('list')).toHaveCSS('animation-name', 'none');
  const secondMember = group.getByRole('listitem').nth(1).locator('[aria-hidden="true"]');
  await expect(secondMember).toHaveCSS('transition-duration', '0s');
  const runningAnimations = await group.evaluate((root) =>
    [root, ...root.querySelectorAll<HTMLElement>('*')].flatMap((element) =>
      element.getAnimations().map((animation) => ({
        element: element.tagName.toLowerCase(),
        playState: animation.playState,
      })),
    ),
  );
  expect(runningAnimations).toEqual([]);

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await expectNoRootHorizontalOverflow(page, viewport.width);
    await expect(demo).toBeVisible();

    const [demoBounds, groupBounds] = await Promise.all([demo.boundingBox(), group.boundingBox()]);
    if (!demoBounds || !groupBounds) throw new Error('Avatar demo 或头像组缺少可测量的边界');
    expect(groupBounds.x).toBeGreaterThanOrEqual(demoBounds.x - 1);
    expect(groupBounds.x + groupBounds.width).toBeLessThanOrEqual(
      demoBounds.x + demoBounds.width + 1,
    );
    const memberBounds = await group.getByRole('listitem').evaluateAll((members) =>
      members.map((member) => {
        const bounds = member.getBoundingClientRect();
        return { left: bounds.left, right: bounds.right, top: bounds.top };
      }),
    );
    const overflowingMembers = memberBounds.filter(
      (bounds) =>
        bounds.left < demoBounds.x - 1 || bounds.right > demoBounds.x + demoBounds.width + 1,
    );
    expect(
      overflowingMembers,
      `头像超出 demo 边界：${JSON.stringify({ viewport, demoBounds, groupBounds, overflowingMembers })}`,
    ).toEqual([]);
    await saveViewportEvidence(page, testInfo, viewport.width);
  }

  await waitForBrowserQuiescence(page, browserHealth);
  expect(browserHealth.errors, browserHealth.errors.join('\n')).toEqual([]);
});

test('Avatar 粗指针操作按钮达到 44px 且状态点与设计稿对齐', async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  try {
    await page.goto('/components/data-display/avatar/');
    const demo = await openAvatarDemo(page);
    await expect
      .poll(() => page.evaluate(() => matchMedia('(any-pointer: coarse)').matches))
      .toBe(true);

    for (const label of ['模拟图片失败', '显示全部审批人']) {
      const button = demo.getByRole('button', { name: label, exact: true });
      const bounds = await button.boundingBox();
      expect(bounds?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    const statusDot = demo.locator('.lx-avatar-demo-status-indicator');
    await expect(statusDot).toHaveCount(1);
    const dotBounds = await statusDot.boundingBox();
    expect(dotBounds?.width ?? 0).toBe(12);
    expect(dotBounds?.height ?? 0).toBe(12);
    await expect(statusDot).toHaveCSS('border-width', '2px');

    const portrait = demo.getByRole('img', { name: '审批负责人', exact: true });
    const portraitBounds = await portrait.boundingBox();
    if (!portraitBounds || !dotBounds) throw new Error('头像或状态点缺少可测量的边界');
    expect(dotBounds.x + dotBounds.width).toBeCloseTo(portraitBounds.x + portraitBounds.width, 0);
    expect(dotBounds.y + dotBounds.height).toBeCloseTo(portraitBounds.y + portraitBounds.height, 0);
  } finally {
    await context.close();
  }
});
