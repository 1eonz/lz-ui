const path = require('node:path');
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');
const valueParser = require('postcss-value-parser');

function compareCodePoints(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function getComponentPrefix(filename, sourceRoot) {
  const relative = path.relative(path.join(sourceRoot, 'components'), path.dirname(filename));
  const segments = relative.split(path.sep);

  if (!relative || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`CSS Module must be inside src/components: ${filename}`);
  }

  return `lx-ui-${segments.join('-')}`;
}

function transformCssModules(source, filename, sourceRoot) {
  const prefix = getComponentPrefix(filename, sourceRoot);
  const mapping = Object.create(null);
  const keyframes = new Map();
  const root = postcss.parse(source, { from: filename });

  root.walkAtRules(/^(-\w+-)?keyframes$/i, (rule) => {
    const name = rule.params.trim();
    if (!/^[\w-]+$/.test(name)) {
      throw rule.error(`Unsupported CSS Module keyframe name: ${name}`);
    }
    const scopedName = `${prefix}__keyframes-${name}`;
    keyframes.set(name, scopedName);
    rule.params = scopedName;
  });

  root.walkRules((rule) => {
    const selector = selectorParser((selectors) => {
      const visit = (node, isGlobal = false) => {
        if (node.type === 'pseudo' && /^:(global|local)$/i.test(node.value)) {
          if (!node.nodes?.length) {
            throw rule.error(`Use functional :global(...) or :local(...): ${node.value}`);
          }
          // 逗号分隔的包装参数会改变选择器列表结构；明确拒绝，避免展平后静默改写语义。
          if (node.nodes.length !== 1) {
            throw rule.error(`Comma-separated selector lists are unsupported in ${node.value}`);
          }
          const scopeIsGlobal = node.value.toLowerCase() === ':global';
          const replacement = node.nodes[0].nodes;
          replacement.forEach((nested) => visit(nested, scopeIsGlobal));
          node.replaceWith(...replacement);
          return;
        }

        if (node.type === 'class' && !isGlobal) {
          const localName = node.value;
          if (!/^[\w-]+$/.test(localName)) {
            throw rule.error(`Unsupported CSS Module class name: ${localName}`);
          }
          mapping[localName] ??= `${prefix}__${localName}`;
          node.value = mapping[localName];
        }

        node.nodes?.forEach((child) => visit(child, isGlobal));
      };

      selectors.nodes.forEach((node) => visit(node));
    }).processSync(rule.selector);

    rule.selector = selector;
  });

  root.walkDecls(/^(animation|animation-name)$/i, (declaration) => {
    const parsed = valueParser(declaration.value);
    parsed.walk((node) => {
      if (node.type === 'word' && keyframes.has(node.value)) {
        node.value = keyframes.get(node.value);
      }
    });
    declaration.value = parsed.toString();
  });

  return {
    css: root.toString(),
    mapping: Object.fromEntries(
      Object.entries(mapping).sort(([left], [right]) => compareCodePoints(left, right)),
    ),
    keyframes: Object.fromEntries(
      [...keyframes.entries()].sort(([left], [right]) => compareCodePoints(left, right)),
    ),
  };
}

module.exports = { transformCssModules };
