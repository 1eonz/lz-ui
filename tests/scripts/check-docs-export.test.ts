import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  extractReferences,
  requiredDocsExportPages,
  validateDocsExport,
} from '../../scripts/check-docs-export.mjs';

const temporaryDirectories: string[] = [];

async function createTemporaryDirectory() {
  const directory = await mkdtemp(join(tmpdir(), 'lx-ui-docs-export-'));
  temporaryDirectories.push(directory);
  return directory;
}

async function writeHtml(
  root: string,
  relativePath: string,
  html = '<!doctype html><html></html>',
) {
  const filePath = join(root, relativePath);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, html, 'utf8');
}

async function createCompleteDocsExport(tableHtml = '<!doctype html><html></html>') {
  const docsDistPath = await createTemporaryDirectory();

  await Promise.all(
    requiredDocsExportPages.map((page) =>
      writeHtml(docsDistPath, page, page === requiredDocsExportPages[0] ? tableHtml : undefined),
    ),
  );

  return docsDistPath;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

describe('静态文档导出门禁', () => {
  it('不会把脚本原始文本中的相似结束标签解析成资源引用', () => {
    const html = `
      <script>
        const example = "</scriptx><link rel='stylesheet' href='./missing.css'>";
      </script>
      <link rel="stylesheet" href="./app.css">
      <textarea><script src="./also-missing.js"></script></textarea>
    `;

    expect(extractReferences(html)).toEqual([{ name: 'href', value: './app.css' }]);
  });

  it('按 HTML 属性规则解码合法资源路径实体', () => {
    expect(extractReferences('<script src="./vendor&amp;chunk.js"></script>')).toEqual([
      { name: 'src', value: './vendor&chunk.js' },
    ]);
  });

  it('要求关键 demo 路由存在，即使其他嵌套 demo 数量足够', async () => {
    const docsDistPath = await createTemporaryDirectory();
    const customerDemoPage = '~demos/components/form/dynamic-form-demo-dynamic-form/index.html';
    const pages = requiredDocsExportPages.filter((page) => page !== customerDemoPage);

    await Promise.all(
      [
        ...pages,
        '~demos/components/general/demo-one/index.html',
        '~demos/components/general/demo-two/index.html',
      ].map((page) => writeHtml(docsDistPath, page)),
    );

    const result = await validateDocsExport(docsDistPath);

    expect(result.nestedDemoPageCount).toBeGreaterThanOrEqual(2);
    expect(result.errors).toContain(`缺少必需页面：${customerDemoPage}`);
  });

  it('依据本地 base href 解析相对脚本和样式资源', async () => {
    const docsDistPath = await createCompleteDocsExport(
      '<base href="../assets/"><script src="bundle.js"></script><link rel="stylesheet" href="theme.css">',
    );
    const assetDirectory = join(docsDistPath, 'components', 'data-display', 'assets');

    await mkdir(assetDirectory, { recursive: true });
    await Promise.all([
      writeFile(join(assetDirectory, 'bundle.js'), '', 'utf8'),
      writeFile(join(assetDirectory, 'theme.css'), '', 'utf8'),
    ]);

    const result = await validateDocsExport(docsDistPath);

    expect(result.errors).toEqual([]);
    expect(result.checkedReferences).toBe(2);
  });

  it('遇到外链 base href 时跳过相对资源的本地存在性检查', async () => {
    const docsDistPath = await createCompleteDocsExport(
      '<base href="https://cdn.example.test/assets/"><script src="bundle.js"></script><link rel="stylesheet" href="theme.css">',
    );

    const result = await validateDocsExport(docsDistPath);

    expect(result.errors).toEqual([]);
    expect(result.checkedReferences).toBe(0);
  });

  it('遇到无效 base href 时回退到当前文档 URL', async () => {
    const docsDistPath = await createCompleteDocsExport(
      '<base href="http://["><script src="../../../umi.js"></script>',
    );
    await writeFile(join(docsDistPath, 'umi.js'), '', 'utf8');

    const result = await validateDocsExport(docsDistPath);

    expect(result.errors).toEqual([]);
    expect(result.checkedReferences).toBe(1);
  });
});
