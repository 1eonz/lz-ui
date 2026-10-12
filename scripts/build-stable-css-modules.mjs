import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { transformCssModules } = require('./stable-css-modules.cjs');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'src');

async function findCssModules(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) return findCssModules(filename);
      return entry.isFile() && entry.name.endsWith('.module.css') ? [filename] : [];
    }),
  );
  return files.flat();
}

const files = await findCssModules(path.join(sourceRoot, 'components'));
if (files.length === 0) throw new Error('No component CSS Modules were found.');
files.sort((left, right) => {
  const leftPath = path.relative(sourceRoot, left).split(path.sep).join('/');
  const rightPath = path.relative(sourceRoot, right).split(path.sep).join('/');
  return leftPath < rightPath ? -1 : leftPath > rightPath ? 1 : 0;
});

for (const sourceFile of files) {
  const relative = path.relative(sourceRoot, sourceFile);
  const { css } = transformCssModules(await readFile(sourceFile, 'utf8'), sourceFile, sourceRoot);

  for (const format of ['esm', 'cjs']) {
    const moduleFile = path.join(root, 'dist', format, relative);
    const cssFile = moduleFile.replace(/\.module\.css$/, '.css');
    await writeFile(cssFile, css);
    await rm(moduleFile, { force: true });
  }
}

process.stdout.write(`Wrote stable CSS for ${files.length} component modules.\n`);
