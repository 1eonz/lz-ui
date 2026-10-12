const fs = require('node:fs');
const path = require('node:path');
const { transformCssModules } = require('./stable-css-modules.cjs');

module.exports = function stableCssModulesPlugin({ types: t }, options) {
  const sourceRoot = path.resolve(__dirname, '../src');

  return {
    name: 'stable-css-modules',
    visitor: {
      ImportDeclaration(importPath, state) {
        const request = importPath.node.source.value;
        if (!request.endsWith('.module.css')) return;

        const defaults = importPath.node.specifiers.filter((specifier) =>
          t.isImportDefaultSpecifier(specifier),
        );
        if (defaults.length !== 1 || importPath.node.specifiers.length !== 1) {
          throw importPath.buildCodeFrameError('CSS Modules imports must use one default import.');
        }

        const filename = path.resolve(path.dirname(state.file.opts.filename), request);
        const { mapping } = transformCssModules(
          fs.readFileSync(filename, 'utf8'),
          filename,
          sourceRoot,
        );
        const cssRequest = request.replace(/\.module\.css$/, '.css');
        const cssEffect =
          options.format === 'cjs'
            ? t.ifStatement(
                t.binaryExpression(
                  '!==',
                  t.unaryExpression('typeof', t.identifier('document')),
                  t.stringLiteral('undefined'),
                ),
                t.expressionStatement(
                  t.callExpression(t.identifier('require'), [t.stringLiteral(cssRequest)]),
                ),
              )
            : t.importDeclaration([], t.stringLiteral(cssRequest));
        const styleMap = t.variableDeclaration('const', [
          t.variableDeclarator(
            t.cloneNode(defaults[0].local),
            t.objectExpression(
              Object.entries(mapping).map(([name, value]) =>
                t.objectProperty(t.stringLiteral(name), t.stringLiteral(value)),
              ),
            ),
          ),
        ]);

        importPath.replaceWithMultiple([cssEffect, styleMap]);
      },
    },
  };
};
