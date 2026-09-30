import { rm } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url);

for (const directory of ['dist', 'docs-dist', 'coverage', '.dumi', '.umi']) {
  await rm(new URL(directory, root), { recursive: true, force: true });
}

console.log('Generated output removed.');
