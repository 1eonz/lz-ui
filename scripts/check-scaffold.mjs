import { access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const componentRoot = join(root, 'src', 'components');

const requiredFiles = [
  'package.json',
  'tsconfig.json',
  '.dumirc.ts',
  '.fatherrc.ts',
  'src/index.ts',
  'src/theme/types.ts',
  'docs/README.md',
  'docs/project-rules.md',
  'docs/ui-design-gate.md',
  'examples/README.md',
];

for (const file of requiredFiles) await access(join(root, file));

const approvedComponents = new Set([
  'general/button',
  'general/icon',
  'general/typography',
  'general/space',
  'general/divider',
  'form/input',
  'form/checkbox',
  'form/switch',
  'form/select',
  'form/input-number',
  'form/date-picker',
  'form/form-item',
  'form/dynamic-form',
  'form/radio',
  'form/upload',
  'data-display/empty',
  'data-display/skeleton',
  'data-display/result',
  'data-display/tag',
  'data-display/badge',
  'data-display/descriptions',
  'data-display/avatar',
  'data-display/statistic',
  'data-display/card',
  'data-display/list',
  'data-display/pagination',
  'data-display/table',
  'data-display/tree',
  'feedback/alert',
  'feedback/spin',
  'feedback/progress',
  'feedback/tooltip',
]);

/**
 * P0 阶段严格限定设计门禁：只有已批准的组件目录可以包含实现文件。
 * 每个已实现组件必须同时交付文档、CSS、类型和行为测试，避免仅新增
 * JSX 文件就未经明确审核成为公开 API。
 */
async function walk(directory) {
  if (directory.endsWith(`${process.platform === 'win32' ? '\\' : '/'}__tests__`)) return;
  const entries = await readdir(directory, { withFileTypes: true });
  const files = new Set(entries.filter((entry) => entry.isFile()).map((entry) => entry.name));
  const implementation = [...files].some((file) => /\.(?:tsx?|css)$/.test(file));

  if (implementation) {
    const component = relative(componentRoot, directory).replaceAll('\\', '/');
    const directoryName = component.split('/').at(-1);
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(directoryName)) {
      throw new Error(`组件目录必须使用 kebab-case：${component}`);
    }
    if (!approvedComponents.has(component)) {
      throw new Error(`组件尚未通过设计门禁：${component}`);
    }
    for (const file of ['index.tsx', 'index.module.css', 'index.md', 'types.ts']) {
      if (!files.has(file)) throw new Error(`组件缺少 ${component}/${file}`);
    }
    await access(join(directory, '__tests__', 'index.test.tsx'));
  }

  for (const entry of entries) {
    if (entry.isDirectory()) await walk(join(directory, entry.name));
  }
}

await walk(componentRoot);
console.log(
  'Scaffold check passed. Implemented components have approved design scope and file templates.',
);
