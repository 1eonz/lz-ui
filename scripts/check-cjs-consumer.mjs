import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { build } from 'vite';

const require = createRequire(import.meta.url);
const { transformCssModules } = require('./stable-css-modules.cjs');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'src');
const React = require('react');
const { renderToString } = require('react-dom/server');
const { Button } = require('lx-ui');
const markup = renderToString(React.createElement(Button, { type: 'primary' }, 'CJS consumer'));

assert.match(markup, /CJS consumer/);
assert.match(markup, /class="[^"]*\blx-ui-general-button__root\b[^"]*"/);
assert.match(markup, /ant-btn/);

async function findFiles(directory, predicate) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(
    entries.map(async (entry) => {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) return findFiles(filename, predicate);
      return entry.isFile() && predicate(filename) ? [filename] : [];
    }),
  );
  return groups.flat();
}

function readStylesMap(filename) {
  const source = ts.createSourceFile(
    filename,
    readFileSync(filename, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  let mapping;

  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'styles' &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      mapping = Object.fromEntries(
        node.initializer.properties.map((property) => {
          assert.ok(
            ts.isPropertyAssignment(property),
            `CSS map in ${filename} must use static properties.`,
          );
          const key = ts.isIdentifier(property.name) ? property.name.text : property.name.text;
          assert.ok(
            ts.isStringLiteral(property.initializer),
            `CSS map values in ${filename} must be strings.`,
          );
          return [key, property.initializer.text];
        }),
      );
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
  return mapping;
}

function prefixedClasses(css) {
  return collectClasses(css, (name) => name.startsWith('lx-ui-'));
}

function collectClasses(css, predicate = () => true) {
  const postcss = require('postcss');
  const selectorParser = require('postcss-selector-parser');
  const classes = new Set();
  postcss.parse(css).walkRules((rule) => {
    selectorParser((selectors) => {
      selectors.walkClasses((classNode) => {
        if (predicate(classNode.value)) classes.add(classNode.value);
      });
    }).processSync(rule.selector);
  });
  return classes;
}

function sourceGlobalClasses(css) {
  const postcss = require('postcss');
  const selectorParser = require('postcss-selector-parser');
  const classes = new Set();
  postcss.parse(css).walkRules((rule) => {
    selectorParser((selectors) => {
      selectors.walkPseudos((pseudo) => {
        if (pseudo.value.toLowerCase() !== ':global') return;
        pseudo.walkClasses((classNode) => classes.add(classNode.value));
      });
    }).processSync(rule.selector);
  });
  return classes;
}

function animationNames(css) {
  const postcss = require('postcss');
  const valueParser = require('postcss-value-parser');
  const names = new Set();
  postcss.parse(css).walkDecls(/^(animation|animation-name)$/i, (declaration) => {
    valueParser(declaration.value).walk((node) => {
      if (node.type === 'word' && node.value.startsWith('lx-ui-')) names.add(node.value);
    });
  });
  return names;
}

function assertNameSet(actual, expected, label) {
  const actualNames = [...actual].sort();
  const expectedNames = [...expected].sort();
  if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
    assert.fail(
      `${label} differ. Expected ${expectedNames.join(', ')}; got ${actualNames.join(', ')}.`,
    );
  }
}

const moduleFiles = await findFiles(path.join(sourceRoot, 'components'), (filename) =>
  filename.endsWith('.module.css'),
);
assert.ok(moduleFiles.length > 0, 'component CSS Modules must be processed');

const expectedBrowserClasses = new Set();
const expectedKeyframes = new Set();
const browserEntries = [];
let globalRuleCount = 0;

for (const sourceFile of moduleFiles) {
  const relative = path.relative(sourceRoot, sourceFile);
  const sourceCss = await readFile(sourceFile, 'utf8');
  const expected = transformCssModules(sourceCss, sourceFile, sourceRoot);
  const componentRelative = path.dirname(relative);
  const prefix = `lx-ui-${componentRelative.split(path.sep).slice(1).join('-')}__`;
  const outputCss = path.join(root, 'dist', 'esm', componentRelative, 'index.css');
  const hasCssRules = require('postcss')
    .parse(expected.css)
    .nodes.some((node) => node.type !== 'comment');

  for (const [format, extension] of [
    ['esm', '.js'],
    ['cjs', '.cjs'],
  ]) {
    const outputDir = path.join(root, 'dist', format, componentRelative);
    const candidates = await findFiles(outputDir, (filename) => filename.endsWith(extension));
    assert.ok(candidates.length > 0, `${format} must emit JavaScript for ${relative}`);
    const emittedMaps = candidates
      .map((filename) => ({ filename, mapping: readStylesMap(filename) }))
      .filter((entry) => entry.mapping);

    for (const filename of candidates) {
      const code = await readFile(filename, 'utf8');
      assert.ok(
        !code.includes('.module.css'),
        `${filename} must not import a CSS Module at runtime`,
      );
    }

    if (Object.keys(expected.mapping).length > 0 || hasCssRules) {
      assert.ok(emittedMaps.length > 0, `${format} must emit a class map for ${relative}`);
      if (
        !emittedMaps.some(
          (entry) => JSON.stringify(entry.mapping) === JSON.stringify(expected.mapping),
        )
      ) {
        assert.fail(`${format} mapping for ${relative} differs from the stable class map`);
      }

      for (const { filename } of emittedMaps) {
        const code = await readFile(filename, 'utf8');
        assert.ok(code.includes('./index.css'), `${filename} must reference ordinary CSS`);
        if (format === 'cjs') {
          assert.match(code, /typeof document\s*!==\s*["']undefined["']/);
        }
      }
    } else {
      const outputRoot = require('postcss').parse(
        await readFile(path.join(root, 'dist', format, componentRelative, 'index.css'), 'utf8'),
      );
      assert.ok(
        outputRoot.nodes.every((node) => node.type === 'comment'),
        `${format} CSS without a class map must not contain style rules for ${relative}`,
      );
    }
  }

  const css = await readFile(outputCss, 'utf8');
  const actualLocals = [...prefixedClasses(css)].filter((name) => name.startsWith(prefix));
  assertNameSet(actualLocals, Object.values(expected.mapping), `CSS selectors for ${relative}`);

  const actualKeyframes = new Set();
  require('postcss')
    .parse(css)
    .walkAtRules(/^(-\w+-)?keyframes$/i, (rule) => {
      actualKeyframes.add(rule.params.trim());
    });
  assert.deepEqual([...actualKeyframes].sort(), Object.values(expected.keyframes).sort());
  assert.deepEqual([...animationNames(css)].sort(), Object.values(expected.keyframes).sort());

  if (sourceCss.includes(':global(')) {
    assert.doesNotMatch(css, /:(global|local)\(/i);
    const unscopedClasses = collectClasses(css, (name) => !name.startsWith(prefix));
    assertNameSet(
      unscopedClasses,
      sourceGlobalClasses(sourceCss),
      `:global selectors for ${relative}`,
    );
    globalRuleCount += 1;
  }

  Object.values(expected.mapping).forEach((name) => expectedBrowserClasses.add(name));
  Object.values(expected.keyframes).forEach((name) => expectedKeyframes.add(name));
  browserEntries.push(path.join(root, 'dist', 'esm', path.dirname(relative), 'index.js'));
}

assert.ok(globalRuleCount > 0, 'the source CSS Modules must exercise :global(...)');

const dynamicCases = [
  ['feedback/alert/index.module.css', ['info', 'success', 'warning', 'error']],
  [
    'general/typography/index.module.css',
    [
      'default',
      'secondary',
      'success',
      'warning',
      'danger',
      'disabled',
      'heading1',
      'heading2',
      'heading3',
      'heading4',
      'heading5',
    ],
  ],
  [
    'general/divider/index.module.css',
    ['root', 'horizontal', 'vertical', 'dashed', 'dotted', 'left', 'right'],
  ],
  ['feedback/spin/index.module.css', ['small', 'large']],
];
for (const [relative, keys] of dynamicCases) {
  const filename = path.join(sourceRoot, 'components', relative);
  const { mapping } = transformCssModules(await readFile(filename, 'utf8'), filename, sourceRoot);
  for (const key of keys)
    assert.ok(mapping[key], `dynamic CSS key ${key} must be emitted for ${relative}`);
}
for (const [relative, keys] of [
  ['general/divider/index.module.css', ['solid', 'center']],
  ['feedback/spin/index.module.css', ['default']],
]) {
  const filename = path.join(sourceRoot, 'components', relative);
  const { mapping } = transformCssModules(await readFile(filename, 'utf8'), filename, sourceRoot);
  for (const key of keys) {
    assert.equal(
      mapping[key],
      undefined,
      `${relative} intentionally has no extra class for ${key}`,
    );
  }
}

assert.equal(require.resolve('lx-ui/style.css'), path.join(root, 'dist/esm/style.css'));
const sharedStylesheet = await readFile(path.join(root, 'dist/esm/styles/index.css'), 'utf8');
assert.match(sharedStylesheet, /@import\s+["']\.\/tokens\.css["']/);
assert.match(
  await readFile(path.join(root, 'dist/esm/styles/tokens.css'), 'utf8'),
  /--lx-control-height:\s*40px/,
);

const smokeRoot = path.join(root, '.codex');
await mkdir(smokeRoot, { recursive: true });
const tempDir = await mkdtemp(path.join(smokeRoot, 'css-modules-smoke-'));
try {
  const imports = browserEntries.map((filename, index) => {
    const specifier = path.relative(tempDir, filename).split(path.sep).join('/');
    return `import * as component${index} from ${JSON.stringify(specifier.startsWith('.') ? specifier : `./${specifier}`)};`;
  });
  const namespaces = browserEntries.map((_, index) => `component${index}`);
  const entry = path.join(tempDir, 'entry.mjs');
  await writeFile(
    entry,
    `${imports.join('\n')}\nglobalThis.__lxCssSmoke = [${namespaces.join(', ')}];\n`,
  );

  const browserBuild = await build({
    configFile: false,
    root: tempDir,
    build: {
      write: false,
      minify: false,
      cssCodeSplit: false,
      lib: { entry, name: 'CssModulesSmoke', formats: ['es'], fileName: 'consumer' },
      rollupOptions: {
        external: (id) => !id.startsWith('.') && !path.isAbsolute(id),
      },
    },
  });

  const output = browserBuild.flatMap((result) => result.output);
  const chunk = output.find((item) => item.type === 'chunk');
  const cssAsset = output.find((item) => item.type === 'asset' && item.fileName.endsWith('.css'));
  assert.ok(chunk && cssAsset, 'Vite must emit consumer JavaScript and extracted CSS');
  assertNameSet(prefixedClasses(cssAsset.source), expectedBrowserClasses, 'Browser CSS selectors');
  assertNameSet(animationNames(cssAsset.source), expectedKeyframes, 'Browser CSS keyframes');
  for (const className of expectedBrowserClasses) assert.ok(chunk.code.includes(className));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

process.stdout.write(
  `CJS SSR, ${moduleFiles.length} ESM/CJS class maps, :global, dynamic keys, keyframes, CSS selectors, and Vite browser bundle passed.\n`,
);
