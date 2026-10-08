import { expect, test, type Locator, type Page } from '@playwright/test';

async function selectFileWithKeyboard(
  page: Page,
  button: Locator,
  file: { name: string; mimeType: string; buffer: Buffer },
) {
  const fileInput = page
    .getByRole('region', { name: 'Upload 宿主网络传输示例' })
    .locator('input[type="file"]');
  await expect(fileInput).toHaveCount(1);

  // 无头 Chromium 中 Playwright 的 filechooser 事件可能漏报，因此取消弹窗默认动作并观察原生点击。
  await fileInput.evaluate((input) => {
    input.dataset.keyboardActivationCount = '0';
    input.addEventListener('click', (event) => {
      input.dataset.keyboardActivationCount = String(
        Number(input.dataset.keyboardActivationCount) + 1,
      );
      event.preventDefault();
    });
  });

  await button.focus();
  await expect(button).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(fileInput).toHaveAttribute('data-keyboard-activation-count', '1');
  await fileInput.setInputFiles(file);
}

test('Upload 移动端拖放说明保持居中', async ({ page }) => {
  await page.goto('/components/form/upload');
  await page.setViewportSize({ width: 390, height: 844 });

  await expect(
    page.getByText('支持 PDF、XLSX、CSV 和 ZIP。单文件上限 50 MB；文件类型仍需由服务端校验。', {
      exact: true,
    }),
  ).toHaveCSS('text-align', 'center');
});

test('Upload 网络示例通过真实 multipart 请求支持失败恢复与远端移除', async ({ page }) => {
  const fileName = 'quarterly-report.txt';
  const fileContents = 'multipart browser payload 2026';
  let postCount = 0;
  let deleteCount = 0;
  let notifyFirstUploadStarted: () => void = () => undefined;
  let releaseFirstUpload: () => void = () => undefined;
  const firstUploadStarted = new Promise<void>((resolve) => {
    notifyFirstUploadStarted = resolve;
  });
  const firstUploadGate = new Promise<void>((resolve) => {
    releaseFirstUpload = resolve;
  });

  await page.route('**/api/uploads**', async (route) => {
    const request = route.request();
    if (request.method() === 'POST') {
      postCount += 1;
      const body = request.postDataBuffer()?.toString('utf8') ?? '';
      expect(body).toContain('filename="' + fileName + '"');
      expect(body).toContain(fileContents);
      expect(request.headers()['content-type']).toContain('multipart/form-data; boundary=');
      if (postCount === 1) {
        notifyFirstUploadStarted();
        await firstUploadGate;
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: '演示服务暂不可用' }),
        });
        return;
      }
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ fileId: 'demo-file-42' }),
      });
      return;
    }

    if (request.method() === 'DELETE') {
      deleteCount += 1;
      expect(request.url()).toContain('/api/uploads/demo-file-42');
      if (deleteCount === 1) {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ message: '演示删除暂时失败' }),
        });
        return;
      }
      await route.fulfill({ status: 204, body: '' });
      return;
    }

    await route.fulfill({ status: 405, body: 'Method not allowed' });
  });

  await page.goto('/components/form/upload');
  const endpoint = page.getByLabel('服务端地址');
  await endpoint.fill(new URL('/api/uploads', page.url()).href);
  await endpoint.focus();
  await page.keyboard.press('Tab');
  const consent = page.getByRole('checkbox', { name: /启用网络传输/ });
  await expect(consent).toBeFocused();
  await expect(consent).not.toBeChecked();
  await page.keyboard.press('Tab');
  const chooseFile = page.getByRole('button', { name: '选择文件', exact: true });
  await expect(chooseFile).toBeFocused();

  await selectFileWithKeyboard(page, chooseFile, {
    name: fileName,
    mimeType: 'text/plain',
    buffer: Buffer.from(fileContents),
  });
  await expect(chooseFile).toBeFocused();
  await expect(page.getByText(fileName, { exact: true })).toBeVisible();
  await expect(page.getByText(/仅本地选择，尚未上传/)).toBeVisible();
  expect(postCount).toBe(0);

  await page.keyboard.press('Shift+Tab');
  await expect(consent).toBeFocused();
  await page.keyboard.press('Space');
  await expect(consent).toBeChecked();
  const uploadButton = page.getByRole('button', { name: '上传到服务端 ' + fileName });
  await expect(uploadButton).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(chooseFile).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(uploadButton).toBeFocused();
  await page.keyboard.press('Enter');
  await firstUploadStarted;
  const pendingUpload = page.getByRole('button', { name: '正在上传 ' + fileName });
  const cancelUpload = page.getByRole('button', { name: '取消上传文件 ' + fileName });
  await expect(pendingUpload).toBeDisabled();
  await expect(cancelUpload).toBeFocused();
  await pendingUpload.dispatchEvent('click');
  expect(postCount).toBe(1);
  const progressbar = page.getByRole('progressbar', { name: '上传进度 ' + fileName });
  await expect(progressbar).toBeVisible();
  const demoStatus = page.locator(
    '[aria-label="Upload 宿主网络传输示例"] [role="status"][aria-live="polite"]',
  );
  try {
    await expect(demoStatus).toHaveCount(1);
    await expect(demoStatus).toContainText('正在发送');
    await expect(progressbar).toHaveAttribute('aria-valuenow', /\d+/);
    await expect(
      page.locator('[aria-label="Upload 宿主网络传输示例"] [role="status"]').filter({
        hasText: /正在上传 \d+%/,
      }),
    ).toHaveCount(0);
  } finally {
    releaseFirstUpload();
  }
  const retryUpload = page.getByRole('button', { name: '重试上传 ' + fileName });
  await expect(retryUpload).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('HTTP 503');
  await expect(demoStatus).toContainText('上传失败');
  expect(postCount).toBe(1);

  await expect(retryUpload).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText('服务端 fileId：demo-file-42')).toBeVisible();
  await expect(demoStatus).toContainText(fileName + ' 上传成功。');
  expect(postCount).toBe(2);

  const removeButton = page.getByRole('button', {
    name: '删除已上传文件 ' + fileName,
  });
  await chooseFile.focus();
  await page.keyboard.press('Tab');
  await expect(removeButton).toBeFocused();
  await page.keyboard.press('Enter');
  const deleteConfirmation = page.getByRole('group', {
    name: '确认删除远端文件 ' + fileName,
  });
  const confirmDelete = page.getByRole('button', {
    name: '确认删除远端文件 ' + fileName,
  });
  await expect(deleteConfirmation).toBeVisible();
  await expect(removeButton).toHaveAttribute('aria-expanded', 'true');
  expect(deleteCount).toBe(0);
  await page.keyboard.press('Tab');
  await expect(confirmDelete).toBeFocused();
  await page.keyboard.press('Enter');
  const retryDelete = page.getByRole('button', {
    name: '重试删除远端文件 ' + fileName,
  });
  await expect(page.getByText(fileName, { exact: true })).toBeVisible();
  await expect(retryDelete).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('远端文件仍保留在列表中');
  expect(deleteCount).toBe(1);

  await expect(retryDelete).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(deleteConfirmation).toHaveCount(0);
  await expect(page.getByText(fileName, { exact: true })).toHaveCount(0);
  await expect(chooseFile).toBeFocused();
  expect(deleteCount).toBe(2);
});

test('自动上传失败会更新全局状态播报', async ({ page }) => {
  let postCount = 0;

  await page.route('**/api/uploads**', async (route) => {
    if (route.request().method() === 'POST') {
      postCount += 1;
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ message: '自动上传服务暂不可用' }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/components/form/upload');
  const demoStatus = page.locator(
    '[aria-label="Upload 宿主网络传输示例"] [role="status"][aria-live="polite"]',
  );
  await page.getByLabel('服务端地址').fill(new URL('/api/uploads', page.url()).href);
  await page.getByRole('checkbox', { name: /启用网络传输/ }).check();
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '选择文件', exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: 'automatic-failure.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('automatic upload failure'),
  });

  await expect(page.getByRole('alert')).toContainText('HTTP 503');
  await expect(demoStatus).toHaveText('automatic-failure.csv 上传失败。');
  expect(postCount).toBe(1);
});

test('自动上传成功更新文件状态和全局播报', async ({ page }) => {
  const fileName = 'automatic-success.csv';
  let postCount = 0;

  await page.route('**/api/uploads**', async (route) => {
    if (route.request().method() === 'POST') {
      postCount += 1;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ fileId: 'automatic-success-file-42' }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/components/form/upload');
  const demo = page.getByRole('region', { name: 'Upload 宿主网络传输示例' });
  const demoStatus = demo.locator('[role="status"][aria-live="polite"]');
  await page.getByLabel('服务端地址').fill(new URL('/api/uploads', page.url()).href);
  await page.getByRole('checkbox', { name: /启用网络传输/ }).check();
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '选择文件', exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: fileName,
    mimeType: 'text/csv',
    buffer: Buffer.from('automatic upload success'),
  });

  const fileRow = page.locator('[aria-label="已选择文件"] > li').filter({ hasText: fileName });
  await expect(fileRow.getByText('服务端 fileId：automatic-success-file-42')).toBeVisible();
  await expect(fileRow.locator('[data-status="done"]')).toHaveCount(1);
  await expect(fileRow.getByRole('progressbar')).toHaveCount(0);
  await expect(fileRow.getByRole('button', { name: '删除已上传文件 ' + fileName })).toBeVisible();
  await expect(fileRow.getByRole('button', { name: /上传到服务端|重试上传/ })).toHaveCount(0);
  await expect(demoStatus).toHaveText(fileName + ' 上传成功。');
  expect(postCount).toBe(1);
});

test('取消自动上传播报取消状态并移除文件', async ({ page }) => {
  let notifyPostStarted: () => void = () => undefined;
  let releasePost: () => void = () => undefined;
  const postStarted = new Promise<void>((resolve) => {
    notifyPostStarted = resolve;
  });
  const postGate = new Promise<void>((resolve) => {
    releasePost = resolve;
  });

  await page.route('**/api/uploads**', async (route) => {
    if (route.request().method() === 'POST') {
      notifyPostStarted();
      await postGate;
      await route
        .fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ fileId: 'unused' }),
        })
        .catch(() => undefined);
      return;
    }
    await route.continue();
  });

  await page.goto('/components/form/upload');
  const demoStatus = page.locator(
    '[aria-label="Upload 宿主网络传输示例"] [role="status"][aria-live="polite"]',
  );
  await page.getByLabel('服务端地址').fill(new URL('/api/uploads', page.url()).href);
  await page.getByRole('checkbox', { name: /启用网络传输/ }).check();
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '选择文件', exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: 'cancelled-upload.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('cancel this upload'),
  });
  await postStarted;

  try {
    await page.getByRole('button', { name: '取消上传文件 cancelled-upload.csv' }).click();
    await expect(page.getByText('cancelled-upload.csv', { exact: true })).toHaveCount(0);
    await expect(demoStatus).toHaveText('cancelled-upload.csv 上传已取消，并从列表移除。');
  } finally {
    releasePost();
  }
});

test('远端删除确认可取消，不请求并将焦点还给原按钮', async ({ page }) => {
  let deleteCount = 0;

  await page.route('**/api/uploads**', async (route) => {
    const request = route.request();
    if (request.method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ fileId: 'cancel-delete-file' }),
      });
      return;
    }
    if (request.method() === 'DELETE') {
      deleteCount += 1;
      await route.fulfill({ status: 204, body: '' });
      return;
    }
    await route.continue();
  });

  await page.goto('/components/form/upload');
  await page.getByLabel('服务端地址').fill(new URL('/api/uploads', page.url()).href);
  await page.getByRole('checkbox', { name: /启用网络传输/ }).check();
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '选择文件', exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: 'keep-file.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('keep this remote file'),
  });
  await expect(page.getByText('服务端 fileId：cancel-delete-file')).toBeVisible();

  const removeButton = page.getByRole('button', { name: '删除已上传文件 keep-file.csv' });
  const confirmation = page.getByRole('group', { name: '确认删除远端文件 keep-file.csv' });
  const confirmButton = page.getByRole('button', { name: '确认删除远端文件 keep-file.csv' });
  const keepButton = page.getByRole('button', { name: '保留远端文件 keep-file.csv' });
  await removeButton.focus();
  await page.keyboard.press('Enter');
  await expect(confirmation).toBeVisible();
  await expect(removeButton).toBeFocused();
  const confirmationId = await confirmation.getAttribute('id');
  expect(confirmationId).not.toBeNull();
  await expect(removeButton).toHaveAttribute('aria-controls', confirmationId || '');
  expect(deleteCount).toBe(0);

  await page.keyboard.press('Tab');
  await expect(confirmButton).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(keepButton).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(confirmation).toHaveCount(0);
  await expect(removeButton).toBeFocused();
  await expect(page.getByText('keep-file.csv', { exact: true })).toBeVisible();
  expect(deleteCount).toBe(0);
});

test('非持焦启动上传时禁用状态不会抢走其他字段焦点', async ({ page }) => {
  let postCount = 0;
  let notifyPostStarted: () => void = () => undefined;
  let releasePost: () => void = () => undefined;
  const postStarted = new Promise<void>((resolve) => {
    notifyPostStarted = resolve;
  });
  const postGate = new Promise<void>((resolve) => {
    releasePost = resolve;
  });

  await page.route('**/api/uploads**', async (route) => {
    if (route.request().method() === 'POST') {
      postCount += 1;
      notifyPostStarted();
      await postGate;
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ fileId: 'background-upload-file' }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/components/form/upload');
  const endpoint = page.getByLabel('服务端地址');
  await endpoint.fill(new URL('/api/uploads', page.url()).href);
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '选择文件', exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: 'background.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('background upload'),
  });
  await expect(page.getByText(/仅本地选择，尚未上传/)).toBeVisible();
  await page.getByRole('checkbox', { name: /启用网络传输/ }).check();
  const uploadButton = page.getByRole('button', { name: '上传到服务端 background.csv' });
  await endpoint.focus();
  await uploadButton.evaluate((button) => (button as HTMLButtonElement).click());
  await postStarted;

  try {
    await expect(page.getByRole('button', { name: '正在上传 background.csv' })).toBeDisabled();
    await expect(endpoint).toBeFocused();
    expect(postCount).toBe(1);
  } finally {
    releasePost();
  }
  await expect(page.getByText('服务端 fileId：background-upload-file')).toBeVisible();
});

test('空白服务端地址不发送请求，修正地址后可重试同一文件', async ({ page }) => {
  const requests: Array<{ method: string; url: string }> = [];

  await page.route('**/*', async (route) => {
    const request = route.request();
    if (request.method() === 'POST') {
      requests.push({ method: request.method(), url: request.url() });
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ fileId: 'recovered-file' }),
      });
      return;
    }
    if (request.method() === 'DELETE') {
      requests.push({ method: request.method(), url: request.url() });
      await route.fulfill({ status: 204, body: '' });
      return;
    }
    await route.continue();
  });

  await page.goto('/components/form/upload');
  const endpoint = page.getByLabel('服务端地址');
  const consent = page.getByRole('checkbox', { name: /启用网络传输/ });
  const demoStatus = page.locator(
    '[aria-label="Upload 宿主网络传输示例"] [role="status"][aria-live="polite"]',
  );
  await endpoint.fill(' \t ');
  await consent.check();
  await expect(page.getByRole('alert')).toHaveCount(1);
  await expect(page.getByRole('alert')).toContainText('不会发送网络请求');

  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '选择文件', exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: 'endpoint-retry.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('retry the same file'),
  });
  await expect(page.getByText('endpoint-retry.csv', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(1);
  await expect(demoStatus).toHaveText('endpoint-retry.csv 已暂存；修正服务端地址后即可上传。');
  expect(requests).toHaveLength(0);

  await endpoint.fill(new URL('/api/uploads', page.url()).href);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(demoStatus).toHaveText('服务端地址已更新；已暂存文件可单独上传。');
  const uploadButton = page.getByRole('button', {
    name: /^(上传到服务端|重试上传) endpoint-retry\.csv$/,
  });
  await expect(uploadButton).toBeEnabled();
  await uploadButton.click();
  await expect(page.getByText('服务端 fileId：recovered-file')).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(new URL(requests[0].url).pathname).toBe('/api/uploads');

  await endpoint.fill('   ');
  await page.getByRole('button', { name: '删除已上传文件 endpoint-retry.csv' }).click();
  const confirmInvalidDelete = page.getByRole('button', {
    name: '确认删除远端文件 endpoint-retry.csv',
  });
  await expect(confirmInvalidDelete).toBeVisible();
  expect(requests).toHaveLength(1);
  await confirmInvalidDelete.click();
  await expect(
    page.getByText('服务端地址无效；文件仍保留在列表中，请填写有效地址后重试删除。', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(1);
  await expect(page.getByText('endpoint-retry.csv', { exact: true })).toBeVisible();
  expect(requests).toHaveLength(1);

  await endpoint.fill(new URL('/api/uploads', page.url()).href);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(
    page.getByText('服务端地址无效；文件仍保留在列表中，请填写有效地址后重试删除。', {
      exact: true,
    }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: '重试删除远端文件 endpoint-retry.csv' }).click();
  await expect(page.getByText('endpoint-retry.csv', { exact: true })).toHaveCount(0);
  expect(requests).toHaveLength(2);
});

test('删除挂起时用户移走焦点后失败不抢回焦点', async ({ page }) => {
  let deleteCount = 0;
  let notifyDeleteStarted: () => void = () => undefined;
  let releaseDelete: () => void = () => undefined;
  const deleteStarted = new Promise<void>((resolve) => {
    notifyDeleteStarted = resolve;
  });
  const deleteGate = new Promise<void>((resolve) => {
    releaseDelete = resolve;
  });

  await page.route('**/api/uploads**', async (route) => {
    const request = route.request();
    if (request.method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ fileId: 'mouse-delete-file' }),
      });
      return;
    }
    if (request.method() === 'DELETE') {
      deleteCount += 1;
      notifyDeleteStarted();
      await deleteGate;
      await route.fulfill({ status: 503, body: '' });
      return;
    }
    await route.fulfill({ status: 405, body: 'Method not allowed' });
  });

  await page.goto('/components/form/upload');
  const endpoint = page.getByLabel('服务端地址');
  await endpoint.fill(new URL('/api/uploads', page.url()).href);
  await page.getByRole('checkbox', { name: /启用网络传输/ }).check();
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '选择文件', exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: 'mouse-delete.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('mouse delete'),
  });
  await expect(page.getByText('服务端 fileId：mouse-delete-file')).toBeVisible();

  const removeButton = page.getByRole('button', { name: '删除已上传文件 mouse-delete.csv' });
  const retryButton = page.getByRole('button', { name: '重试删除远端文件 mouse-delete.csv' });
  await endpoint.focus();
  await expect(endpoint).toBeFocused();
  await expect(removeButton).not.toBeFocused();
  await removeButton.click();
  const confirmButton = page.getByRole('button', {
    name: '确认删除远端文件 mouse-delete.csv',
  });
  await expect(confirmButton).toBeVisible();
  await confirmButton.click();
  await deleteStarted;
  try {
    await expect(
      page.getByRole('button', { name: '正在删除远端文件 mouse-delete.csv' }),
    ).toBeDisabled();
    await endpoint.focus();
    await expect(endpoint).toBeFocused();
  } finally {
    releaseDelete();
  }
  await expect(retryButton).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('远端文件仍保留在列表中');
  await expect(endpoint).toBeFocused();
  await expect(retryButton).not.toBeFocused();
  expect(deleteCount).toBe(1);
});

test('删除挂起时用户移走焦点后成功也不抢回焦点', async ({ page }) => {
  let notifyDeleteStarted: () => void = () => undefined;
  let releaseDelete: () => void = () => undefined;
  const deleteStarted = new Promise<void>((resolve) => {
    notifyDeleteStarted = resolve;
  });
  const deleteGate = new Promise<void>((resolve) => {
    releaseDelete = resolve;
  });

  await page.route('**/api/uploads**', async (route) => {
    const request = route.request();
    if (request.method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ fileId: 'focused-delete-file' }),
      });
      return;
    }
    if (request.method() === 'DELETE') {
      notifyDeleteStarted();
      await deleteGate;
      await route.fulfill({ status: 204, body: '' });
      return;
    }
    await route.fulfill({ status: 405, body: 'Method not allowed' });
  });

  await page.goto('/components/form/upload');
  const endpoint = page.getByLabel('服务端地址');
  await endpoint.fill(new URL('/api/uploads', page.url()).href);
  await page.getByRole('checkbox', { name: /启用网络传输/ }).check();
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '选择文件', exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: 'focused-delete.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('focused delete'),
  });
  await expect(page.getByText('服务端 fileId：focused-delete-file')).toBeVisible();

  const removeButton = page.getByRole('button', { name: '删除已上传文件 focused-delete.csv' });
  await removeButton.focus();
  await expect(removeButton).toBeFocused();
  await removeButton.click();
  const confirmButton = page.getByRole('button', {
    name: '确认删除远端文件 focused-delete.csv',
  });
  await expect(confirmButton).toBeVisible();
  await confirmButton.click();
  await deleteStarted;
  try {
    await expect(
      page.getByRole('button', { name: '正在删除远端文件 focused-delete.csv' }),
    ).toBeDisabled();
    await endpoint.focus();
    await expect(endpoint).toBeFocused();
  } finally {
    releaseDelete();
  }

  await expect(page.getByText('focused-delete.csv', { exact: true })).toHaveCount(0);
  await expect(endpoint).toBeFocused();
});

test('并发删除先后失败时只恢复到最后一次操作的重试按钮', async ({ page }) => {
  let notifyFirstDelete: () => void = () => undefined;
  let notifyLastDelete: () => void = () => undefined;
  let releaseFirstDelete: () => void = () => undefined;
  let releaseLastDelete: () => void = () => undefined;
  const firstDeleteStarted = new Promise<void>((resolve) => {
    notifyFirstDelete = resolve;
  });
  const lastDeleteStarted = new Promise<void>((resolve) => {
    notifyLastDelete = resolve;
  });
  const firstDeleteGate = new Promise<void>((resolve) => {
    releaseFirstDelete = resolve;
  });
  const lastDeleteGate = new Promise<void>((resolve) => {
    releaseLastDelete = resolve;
  });

  await page.route('**/*', async (route) => {
    const request = route.request();
    if (request.method() === 'POST') {
      const body = request.postDataBuffer()?.toString('utf8') ?? '';
      const fileId = body.includes('filename="first.csv"') ? 'first-file' : 'last-file';
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ fileId }),
      });
      return;
    }
    if (request.method() === 'DELETE') {
      if (request.url().endsWith('/first-file')) {
        notifyFirstDelete();
        await firstDeleteGate;
      } else {
        notifyLastDelete();
        await lastDeleteGate;
      }
      await route.fulfill({ status: 503, body: 'Service unavailable' });
      return;
    }
    await route.continue();
  });

  await page.goto('/components/form/upload');
  await page.getByLabel('服务端地址').fill(new URL('/api/uploads', page.url()).href);
  await page.getByRole('checkbox', { name: /启用网络传输/ }).check();
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '选择文件', exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles([
    { name: 'first.csv', mimeType: 'text/csv', buffer: Buffer.from('first') },
    { name: 'last.csv', mimeType: 'text/csv', buffer: Buffer.from('last') },
  ]);
  await expect(page.getByText('服务端 fileId：first-file')).toBeVisible();
  await expect(page.getByText('服务端 fileId：last-file')).toBeVisible();

  const firstRemove = page.getByRole('button', { name: '删除已上传文件 first.csv' });
  const lastRemove = page.getByRole('button', { name: '删除已上传文件 last.csv' });
  await firstRemove.focus();
  await firstRemove.click();
  await page.getByRole('button', { name: '确认删除远端文件 first.csv' }).click();
  await firstDeleteStarted;
  await lastRemove.focus();
  await lastRemove.click();
  await page.getByRole('button', { name: '确认删除远端文件 last.csv' }).click();
  await lastDeleteStarted;

  try {
    releaseFirstDelete();
    await expect(
      page.locator('li').filter({ hasText: 'first.csv' }).getByRole('alert'),
    ).toContainText('HTTP 503');
    await expect(
      page.getByRole('button', { name: '重试删除远端文件 first.csv' }),
    ).not.toBeFocused();

    releaseLastDelete();
    await expect(page.getByRole('button', { name: '重试删除远端文件 last.csv' })).toBeFocused();
  } finally {
    releaseFirstDelete();
    releaseLastDelete();
  }
});

test('打开另一文件的确认流程后较早删除失败不抢焦点', async ({ page }) => {
  let notifyDeleteStarted: () => void = () => undefined;
  let releaseDelete: () => void = () => undefined;
  const deleteStarted = new Promise<void>((resolve) => {
    notifyDeleteStarted = resolve;
  });
  const deleteGate = new Promise<void>((resolve) => {
    releaseDelete = resolve;
  });

  await page.route('**/*', async (route) => {
    const request = route.request();
    if (request.method() === 'POST') {
      const body = request.postDataBuffer()?.toString('utf8') ?? '';
      const fileId = body.includes('filename="first-confirm.csv"')
        ? 'first-confirm-file'
        : 'last-confirm-file';
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ fileId }),
      });
      return;
    }
    if (request.method() === 'DELETE') {
      notifyDeleteStarted();
      await deleteGate;
      await route.fulfill({ status: 503, body: 'Service unavailable' });
      return;
    }
    await route.continue();
  });

  await page.goto('/components/form/upload');
  await page.getByLabel('服务端地址').fill(new URL('/api/uploads', page.url()).href);
  await page.getByRole('checkbox', { name: /启用网络传输/ }).check();
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '选择文件', exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles([
    {
      name: 'first-confirm.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('first confirmation'),
    },
    {
      name: 'last-confirm.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('last confirmation'),
    },
  ]);
  await expect(page.getByText('服务端 fileId：first-confirm-file')).toBeVisible();
  await expect(page.getByText('服务端 fileId：last-confirm-file')).toBeVisible();

  const firstRemove = page.getByRole('button', {
    name: '删除已上传文件 first-confirm.csv',
  });
  await firstRemove.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await deleteStarted;

  const lastRemove = page.getByRole('button', {
    name: '删除已上传文件 last-confirm.csv',
  });
  const lastConfirmation = page.getByRole('group', {
    name: '确认删除远端文件 last-confirm.csv',
  });
  const keepLast = page.getByRole('button', { name: '保留远端文件 last-confirm.csv' });
  try {
    // 模拟鼠标激活目标未获得焦点的浏览器行为，验证序号能取消旧请求的焦点意图。
    await lastRemove.evaluate((button) => (button as HTMLButtonElement).click());
    await expect(lastConfirmation).toBeVisible();
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    releaseDelete();

    await expect(
      page.locator('li').filter({ hasText: 'first-confirm.csv' }).getByRole('alert'),
    ).toContainText('HTTP 503');
    await expect(lastConfirmation).toBeVisible();
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  } finally {
    releaseDelete();
  }

  await keepLast.click();
  await expect(lastRemove).toBeFocused();
  await expect(page.getByText('last-confirm.csv', { exact: true })).toBeVisible();
});

test('Upload 网络示例拒绝会被 URL 规范化改写的 fileId', async ({ page }) => {
  const methods: string[] = [];
  const unsafeFileIds = [
    '',
    '.',
    '..',
    'folder/file',
    'folder\\file',
    '%2e%2e',
    'demo-file\n',
    'demo-file\r',
    'demo-file\u2028',
    'demo-file\u2029',
  ];
  let postIndex = 0;

  await page.route('**/*', async (route) => {
    const request = route.request();
    if (request.method() === 'POST') {
      methods.push(request.method());
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ fileId: unsafeFileIds[postIndex++] }),
      });
      return;
    }
    if (request.method() === 'DELETE') {
      methods.push(request.method());
      await route.fulfill({ status: 204, body: '' });
      return;
    }
    await route.continue();
  });

  await page.goto('/components/form/upload');
  await page.getByLabel('服务端地址').fill(new URL('/api/uploads', page.url()).href);
  await page.getByRole('checkbox', { name: /启用网络传输/ }).check();
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '选择文件', exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles(
    unsafeFileIds.map((_, index) => ({
      name: 'unsafe-id-' + index + '.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('unsafe file id ' + index),
    })),
  );

  await expect(page.getByRole('alert')).toHaveCount(unsafeFileIds.length);
  await expect(page.getByRole('alert').first()).toContainText('安全的单路径标识');
  await expect(page.getByText(/服务端 fileId：/)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /删除已上传文件/ })).toHaveCount(0);
  expect(methods).toEqual(Array.from({ length: unsafeFileIds.length }, () => 'POST'));
});

test('删除期间按文件锁定操作，并在移除后恢复到相邻删除按钮或选择按钮', async ({ page }) => {
  let deleteCount = 0;
  let notifyDeleteStarted: () => void = () => undefined;
  let releaseDelete: () => void = () => undefined;
  const deleteStarted = new Promise<void>((resolve) => {
    notifyDeleteStarted = resolve;
  });
  const deleteGate = new Promise<void>((resolve) => {
    releaseDelete = resolve;
  });

  await page.route('**/*', async (route) => {
    const request = route.request();
    if (request.method() === 'POST') {
      const body = request.postDataBuffer()?.toString('utf8') ?? '';
      const fileId = body.includes('filename="first.csv"') ? 'first-file' : 'last-file';
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ fileId }),
      });
      return;
    }
    if (request.method() === 'DELETE') {
      deleteCount += 1;
      if (request.url().endsWith('/first-file')) {
        notifyDeleteStarted();
        await deleteGate;
      }
      await route.fulfill({ status: 204, body: '' });
      return;
    }
    await route.continue();
  });

  await page.goto('/components/form/upload');
  await page.getByLabel('服务端地址').fill(new URL('/api/uploads', page.url()).href);
  await page.getByRole('checkbox', { name: /启用网络传输/ }).check();
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '选择文件', exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles([
    { name: 'first.csv', mimeType: 'text/csv', buffer: Buffer.from('first') },
    { name: 'last.csv', mimeType: 'text/csv', buffer: Buffer.from('last') },
  ]);
  await expect(page.getByText('服务端 fileId：first-file')).toBeVisible();
  await expect(page.getByText('服务端 fileId：last-file')).toBeVisible();

  const firstRemove = page.getByRole('button', { name: '删除已上传文件 first.csv' });
  await firstRemove.click();
  await page.getByRole('button', { name: '确认删除远端文件 first.csv' }).click();
  await deleteStarted;
  const pendingRemove = page.getByRole('button', { name: '正在删除远端文件 first.csv' });
  await expect(pendingRemove).toBeDisabled();
  await expect(pendingRemove).toHaveText('正在删除');
  await pendingRemove.dispatchEvent('click');
  expect(deleteCount).toBe(1);

  releaseDelete();
  const lastRemove = page.getByRole('button', { name: '删除已上传文件 last.csv' });
  await expect(lastRemove).toBeFocused();
  await lastRemove.click();
  await page.getByRole('button', { name: '确认删除远端文件 last.csv' }).click();
  await expect(page.getByText('last.csv', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '选择文件', exact: true })).toBeFocused();
  expect(deleteCount).toBe(2);
});

test('Upload 网络示例支持拖放文件并保留键盘选择入口', async ({ page }) => {
  await page.goto('/components/form/upload');
  const chooseFile = page.getByRole('button', { name: '选择文件', exact: true });
  await expect(chooseFile).toBeVisible();
  await chooseFile.evaluate((element) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File(['dragged payload'], 'dragged.csv', { type: 'text/csv' }));
    if (dataTransfer.files.length !== 1) {
      throw new Error('拖放测试没有准备好文件');
    }
    element.dispatchEvent(new DragEvent('dragenter', { bubbles: true, dataTransfer }));
    element.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer }));
    element.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }));
  });

  await expect(page.getByText('dragged.csv', { exact: true })).toBeVisible();
  await expect(page.getByText(/仅本地选择，尚未上传/)).toBeVisible();
  await selectFileWithKeyboard(page, chooseFile, {
    name: 'keyboard.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('keyboard payload'),
  });
  await expect(page.getByText('keyboard.csv', { exact: true })).toBeVisible();
});

test('Upload 宿主示例跟随局部暗色主题并关闭减少动态效果', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/form/upload');

  const demo = page.getByRole('region', { name: 'Upload 宿主网络传输示例' });
  const themeScope = page.locator('[data-lx-mode]').filter({ has: demo });
  const themeSettings = themeScope.getByText('主题设置', { exact: true });
  await themeSettings.click();
  await themeScope.getByRole('switch', { name: '暗色模式' }).click();
  await expect(themeScope).toHaveAttribute('data-lx-mode', 'dark');
  await expect(demo.locator('[aria-hidden="true"]').first()).toHaveCSS('animation-name', 'none');
});
