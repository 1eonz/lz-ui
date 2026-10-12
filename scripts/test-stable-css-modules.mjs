import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { transformCssModules } = require('./stable-css-modules.cjs');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'src');
const filename = path.join(sourceRoot, 'components', 'general', 'fixture', 'index.module.css');
const source = `
.root, .root .child :global(.ant-btn) {
  animation: 1s ease pulse;
  animation-name: pulse, none;
}
:local(.extra) { color: red; }
@keyframes pulse { to { opacity: 1; } }
`;

const result = transformCssModules(source, filename, sourceRoot);
assert.deepEqual(result.mapping, {
  child: 'lx-ui-general-fixture__child',
  extra: 'lx-ui-general-fixture__extra',
  root: 'lx-ui-general-fixture__root',
});
assert.deepEqual(result.keyframes, {
  pulse: 'lx-ui-general-fixture__keyframes-pulse',
});
assert.match(result.css, /\.lx-ui-general-fixture__root/);
assert.match(result.css, /\.ant-btn/);
assert.doesNotMatch(result.css, /\.lx-ui-general-fixture__ant-btn/);
assert.match(result.css, /animation: 1s ease lx-ui-general-fixture__keyframes-pulse/);
assert.match(result.css, /animation-name: lx-ui-general-fixture__keyframes-pulse, none/);

const dynamicClass = 'child';
assert.equal(result.mapping[dynamicClass], 'lx-ui-general-fixture__child');

for (const selector of [':global(.a, .b)', ':local(.a, .b)']) {
  assert.throws(
    () => transformCssModules(`${selector} { color: red; }`, filename, sourceRoot),
    /Comma-separated selector lists are unsupported/,
  );
}
assert.throws(
  () => transformCssModules(':global .a { color: red; }', filename, sourceRoot),
  /Use functional :global\(\.\.\.\) or :local\(\.\.\.\)/,
);

process.stdout.write('Stable CSS Modules scope, mapping, and keyframe transforms passed.\n');
