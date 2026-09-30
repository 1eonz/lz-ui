import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

if (packageJson.private === true) {
  throw new Error(
    'lx-ui 当前仍是 private 包。完成组件、测试、文档和发布检查后，明确修改 private=false 才允许发布。',
  );
}

if (packageJson.version.startsWith('0.0.0')) {
  throw new Error('lx-ui 仍是 scaffold 版本，请先按版本策略发布一个明确的 alpha 版本。');
}

console.log(`Release guard passed for ${packageJson.name}@${packageJson.version}.`);
