// @vitest-environment node
import { describe, expect, it } from 'vitest';
import dumiRoutes from '../../node_modules/dumi/dist/features/routes.js';

describe('Dumi demo route generator patch', () => {
  it('registers a splat route for standalone demos', () => {
    let generateRoutes: ((routes: Record<string, unknown>) => Record<string, unknown>) | undefined;
    const api = {
      addEntryCodeAhead: () => undefined,
      addLayouts: () => undefined,
      addTmpGenerateWatcherPaths: () => undefined,
      config: {
        conventionRoutes: { base: process.cwd() },
        locales: [],
        resolve: { atomDirs: [], docDirs: [], forceKebabCaseRouting: false },
      },
      cwd: process.cwd(),
      describe: () => undefined,
      env: 'test',
      modifyDefaultConfig: () => undefined,
      modifyRoutes: (handler: (routes: Record<string, unknown>) => Record<string, unknown>) => {
        generateRoutes = handler;
      },
      paths: { absTmpPath: '.dumi/tmp' },
      service: { themeData: { layouts: {} } },
      userConfig: { resolve: {} },
    } as unknown as Parameters<typeof dumiRoutes>[0];

    dumiRoutes(api);
    const routes = generateRoutes?.({
      root: { id: 'root', path: '/', absPath: '/', isLayout: true },
    });

    expect(routes?.['demo-render']).toMatchObject({
      path: '~demos/*',
      absPath: '/~demos/*',
      parentId: 'root',
    });
  });
});
