import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

/**
 * Dumi 示例不进入组件包，但仍需严格类型检查。原 tsconfig 排除了 docs，
 * 只运行库 typecheck 会漏掉错误的示例参数和公开 API 用法。
 * 此检查复用同一配置与项目声明，仅为文档增加源码别名和 noEmit，
 * 避免创建另一套长期配置，也不会将示例写入 dist 或修改锁文件。
 */
const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const configPath = resolve(projectRoot, 'tsconfig.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, projectRoot);

async function collect(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collect(path)));
    else if (/\.[cm]?tsx?$/.test(entry.name)) files.push(path);
  }
  return files;
}

const demos = await collect(resolve(projectRoot, 'docs/demos'));
const program = ts.createProgram([...new Set([...parsed.fileNames, ...demos])], {
  ...parsed.options,
  noEmit: true,
  declaration: false,
  declarationMap: false,
  emitDeclarationOnly: false,
  baseUrl: projectRoot,
  paths: {
    ...parsed.options.paths,
    'lx-ui': ['src/index.ts'],
    'lx-ui/antd': ['src/antd.ts'],
    'lx-ui/business': ['src/business.ts'],
    'lx-ui/theme': ['src/theme/index.ts'],
  },
});
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
if (diagnostics.length) {
  console.error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (file) => file,
      getCurrentDirectory: () => projectRoot,
      getNewLine: () => '\n',
    }),
  );
  process.exitCode = 1;
} else console.log(`Dumi 示例类型检查通过：${demos.length} 个源码文件。`);
