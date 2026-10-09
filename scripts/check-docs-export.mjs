import { readdir, readFile, realpath, stat } from 'node:fs/promises';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL, URL as NodeURL } from 'node:url';
import { JSDOM } from 'jsdom';

const scriptDirectory = dirname(fileURLToPath(new NodeURL(import.meta.url)));
const defaultDocsDistPath = resolve(scriptDirectory, '..', 'docs-dist');
const localDocsOrigin = 'http://lx-ui-docs.invalid';
const htmlDocumentParser = new JSDOM('').window.DOMParser;

/**
 * 组件文档及核心演示必须进入静态导出，避免文档路由存在但可运行示例缺失。
 */
export const requiredDocsExportPages = Object.freeze([
  'components/data-display/table/index.html',
  'components/form/dynamic-form/index.html',
  '~demos/components/data-display/table-demo-table-basic/index.html',
  '~demos/components/data-display/table-demo-table/index.html',
  '~demos/components/form/dynamic-form-demo-dynamic-form/index.html',
]);

/**
 * 此脚本只检查静态导出文件及 HTML 中的本地资源引用，不替代浏览器渲染和交互验收。
 */
async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filePath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(filePath)));
    else if (entry.isFile()) files.push(filePath);
  }
  return files;
}

/**
 * 使用 HTML5 解析器读取资源属性，使原始文本区域、注释和字符实体遵循浏览器解析规则。
 */
function parseHtmlReferences(html) {
  const document = new htmlDocumentParser().parseFromString(html, 'text/html');
  const baseHref = document.querySelector('base[href]')?.getAttribute('href') ?? null;
  const viewports = [...document.querySelectorAll('meta[name="viewport"]')];
  const viewportContent = viewports[0]?.getAttribute('content') ?? '';
  const references = [];

  for (const element of document.querySelectorAll('[href], [src]')) {
    if (element.tagName.toLowerCase() === 'base') continue;
    for (const name of ['href', 'src']) {
      if (element.hasAttribute(name))
        references.push({ name, value: element.getAttribute(name) ?? '' });
    }
  }

  return { baseHref, references, viewports, viewportContent };
}

/**
 * 按完整指令解析视口配置，避免从其他值中误匹配 width 或 initial-scale。
 * 重复指令的浏览器处理存在差异，门禁要求唯一值以保证导出结果可预测。
 */
function parseViewportDirectives(content) {
  const directives = new Map();
  let hasDuplicates = false;

  for (const part of content.split(',')) {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex < 0) continue;

    const name = part.slice(0, separatorIndex).trim().toLowerCase();
    const value = part
      .slice(separatorIndex + 1)
      .trim()
      .toLowerCase();
    if (!name) continue;

    if (directives.has(name)) hasDuplicates = true;
    directives.set(name, value);
  }

  return { directives, hasDuplicates };
}

/**
 * 文档统一采用初始比例 1 的十进制声明，且不设置缩放上限。
 * 这是本站的导出契约，不尝试接受所有浏览器容错写法；升级时先评审再扩展。
 */
function hasAccessibleViewport(viewports, content) {
  if (viewports.length !== 1) return false;

  const { directives, hasDuplicates } = parseViewportDirectives(content);
  const initialScale = directives.get('initial-scale') ?? '';
  const userScalable = directives.get('user-scalable');

  return (
    !hasDuplicates &&
    directives.get('width') === 'device-width' &&
    /^1(?:\.0+)?$/.test(initialScale) &&
    !directives.has('maximum-scale') &&
    !['no', '0'].includes(userScalable)
  );
}

/**
 * 使用 HTML5 解析规则抽取资源引用，并将属性中的字符实体还原为浏览器实际 URL。
 */
export function extractReferences(html) {
  return parseHtmlReferences(html).references;
}

function isInsideDirectory(directory, target) {
  const relativePath = relative(directory, target);
  return (
    relativePath !== '' &&
    relativePath !== '..' &&
    !relativePath.startsWith(`..${sep}`) &&
    !isAbsolute(relativePath)
  );
}

function resolvePageUrl(pagePath, docsDistRoot) {
  const relativePagePath = relative(docsDistRoot, pagePath).split(sep).join('/');
  return new NodeURL(relativePagePath, `${localDocsOrigin}/`);
}

function resolveDocumentBase(baseHref, pageUrl) {
  if (baseHref === null) return pageUrl;

  try {
    return new NodeURL(baseHref, pageUrl);
  } catch {
    // 浏览器忽略无法解析的 base href，并继续使用当前文档 URL。
    return pageUrl;
  }
}

function resolveAssetReference(value, baseUrl, docsDistRoot) {
  const reference = value.trim();
  if (!reference) return null;

  let resolvedUrl;
  try {
    resolvedUrl = new NodeURL(reference, baseUrl);
  } catch {
    return null;
  }

  if (resolvedUrl.origin !== localDocsOrigin) return null;

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(resolvedUrl.pathname);
  } catch {
    if (/\.(?:js|css)$/i.test(resolvedUrl.pathname)) {
      throw new Error(`资源路径包含无效的 URL 编码：${reference}`);
    }
    return null;
  }

  const urlPath = decodedPath.replaceAll('\\', '/');
  if (!['.js', '.css'].includes(extname(urlPath).toLowerCase())) return null;

  const targetPath = resolve(docsDistRoot, urlPath.replace(/^\/+/, ''));
  if (!isInsideDirectory(docsDistRoot, targetPath)) {
    throw new Error(`资源路径解析到 docs-dist 外：${reference}`);
  }
  return targetPath;
}

/**
 * 校验静态导出目录并返回问题列表，允许测试使用隔离目录而不修改真实构建产物。
 */
export async function validateDocsExport(docsDistPath = defaultDocsDistPath) {
  const docsDistRoot = await realpath(docsDistPath);
  const files = await collectFiles(docsDistRoot);
  const htmlFiles = files.filter((filePath) => extname(filePath).toLowerCase() === '.html');
  const pages = new Set(
    htmlFiles.map((filePath) => relative(docsDistRoot, filePath).split(sep).join('/')),
  );
  const errors = [];
  let checkedReferences = 0;

  for (const requiredPage of requiredDocsExportPages) {
    if (!pages.has(requiredPage)) errors.push(`缺少必需页面：${requiredPage}`);
  }

  const nestedDemoPages = [...pages].filter((page) => {
    const segments = page.split('/');
    return segments[0] === '~demos' && segments.length >= 4 && segments.at(-1) === 'index.html';
  });
  if (nestedDemoPages.length < 2) {
    errors.push(`嵌套 ~demos/ 页面不足：至少需要 2 个，实际 ${nestedDemoPages.length} 个`);
  }

  for (const pagePath of htmlFiles) {
    const page = relative(docsDistRoot, pagePath).split(sep).join('/');
    const html = await readFile(pagePath, 'utf8');
    const { baseHref, references, viewports, viewportContent } = parseHtmlReferences(html);
    if (!hasAccessibleViewport(viewports, viewportContent)) {
      errors.push(`${page} 的 viewport meta 缺失、重复或限制用户缩放`);
    }
    const pageUrl = resolvePageUrl(pagePath, docsDistRoot);
    const baseUrl = resolveDocumentBase(baseHref, pageUrl);
    for (const reference of references) {
      let assetPath;
      try {
        assetPath = resolveAssetReference(reference.value, baseUrl, docsDistRoot);
      } catch (error) {
        errors.push(`${page} 的 ${reference.name}="${reference.value}"：${error.message}`);
        continue;
      }
      if (!assetPath) continue;

      checkedReferences += 1;
      try {
        const assetInfo = await stat(assetPath);
        if (!assetInfo.isFile()) throw new Error('目标不是文件');
        const realAssetPath = await realpath(assetPath);
        if (!isInsideDirectory(docsDistRoot, realAssetPath)) {
          throw new Error('目标文件解析到 docs-dist 外');
        }
      } catch (error) {
        errors.push(`${page} 的 ${reference.name}="${reference.value}"：${error.message}`);
      }
    }
  }

  return {
    htmlCount: htmlFiles.length,
    checkedReferences,
    nestedDemoPageCount: nestedDemoPages.length,
    errors,
  };
}

async function main() {
  const result = await validateDocsExport();
  if (result.errors.length) {
    console.error(`Dumi 静态导出门禁失败：发现 ${result.errors.length} 个问题。`);
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `Dumi 静态导出门禁通过：${result.htmlCount} 个 HTML 页面，${result.checkedReferences} 个本地 JS/CSS 引用，${result.nestedDemoPageCount} 个嵌套 ~demos/ 页面。`,
  );
}

const invokedScriptUrl = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (invokedScriptUrl === import.meta.url) {
  main().catch((error) => {
    console.error(`Dumi 静态导出门禁失败：${error.message}`);
    process.exitCode = 1;
  });
}
