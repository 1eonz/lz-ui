# 第三方补丁维护

`dumi+2.4.49.patch` 为文档站 Previewer 和源码区的图标控件补充可访问名称及中英文文案，为移动顶栏菜单补充双语名称、展开状态和受控区域，并在目录链接激活后聚焦对应标题。Dumi 的 demo ID 可以包含 `/`；默认链接保留这些路径段，和静态 exporter 输出的嵌套目录一致。补丁将文档端 `~demos/:id` 路由改为 `~demos/*`，并从 splat 参数恢复完整 ID，使客户端独立页面和 iframe 也能解析同一路径。修复只作用于文档依赖，不进入 lx-ui 组件产物。

`dumi` 在 `package.json` 中精确锁定为 `2.4.49`。`dev`、`dev:docs` 和 `build:docs` 会先运行 `patch:dumi` 自动应用补丁。

`patch-package` 仅用于仓库开发期重放补丁，不进入 `dist` 或发布文件白名单，因此不会增加组件库的运行时依赖和产物体积。它能保留可复现的 Dumi 修复，避免维护整套文档主题分支；代价是 Dumi 升级时需要人工重放和浏览器复验，内部主题文件的路径或生成代码也可能变化。若以后上游修复，删除补丁；若升级后多个改动点持续冲突，可评估维护少量本地主题槽位的替代成本，不直接复制整套主题。

独立 demo URL 使用 Dumi 原有的原始 ID 拼接，同一 URL 供独立页面链接和 iframe 使用。例如 ID `components/form/dynamic-form-demo-dynamic-form` 会生成 `/~demos/components/form/dynamic-form-demo-dynamic-form`，ID 中的 `/` 不会编码；`routeId` 查询参数会由 Dumi 单独调用 `encodeURIComponent`。补丁改动 `dist/features/routes.js` 与 `dist/client/pages/Demo/index.js`，以 React Router 6 splat 接收多段 ID 并传给 `useDemo`。显式 `demoUrl` 覆盖、hash 路由前缀和 basename 沿用 Dumi 行为。补丁只调整锁版依赖中的文档路由，不进入 lx-ui 组件产物。

升级 Dumi 时，先检查 PreviewerActions、SourceCode、移动顶栏菜单和目录标题焦点，再按新版本重新生成补丁。Dumi 当前嵌套的 Tabs 溢出装饰按钮会从辅助技术和 Tab 顺序中隐藏；源码标签本身可顺序聚焦并用 Enter 或 Space 激活，不要只为装饰性的省略号增加重复入口。确认工具栏名称、复制后的状态名称、菜单控制关系和标题焦点后的 Tab 顺序仍正确后，运行干净安装、文档构建，并在桌面和窄屏浏览器检查无障碍树；补丁应用失败时不得忽略安装错误。上游修复相应缺陷后，移除补丁和本说明。

URL 回归测试覆盖单段与多段 ID、`%2F` 分隔符、尾斜杠规范化、空及未知 ID 的 NotFound 槽、`routeId` 查询参数变化后的重新查找，以及路由变化时的 hook 稳定性。`test`、`test:watch` 和 `test:coverage` 均先通过 `test:prepare` 重放 Dumi 补丁。静态 exporter 仍需单独验收：应用补丁后运行 `npm run build:docs`，在目标静态服务器打开嵌套 `index.html` 路径，检查服务器是否补尾斜杠、iframe、源码区、实时编辑、hash 路由、basename、查询参数和自定义 `demoUrl`。静态输出使用原始 ID 生成嵌套目录，浏览器链接使用相同路径段，不依赖静态服务器解码路径内的 `%2F`。升级时先核对上游默认 URL 生成、客户端路由与静态导出逻辑，再重放补丁并执行上述验证。
