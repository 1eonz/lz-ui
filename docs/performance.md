# 性能和包体规则

性能从架构开始控制，不能等组件全部完成后再压缩。所有数字是首版预算，真实项目接入后使用数据修正。

## 1. 目标

- LCP ≤ 2.5s、INP ≤ 200ms、CLS ≤ 0.1，按真实流量 75 分位观察。
- 普通 ESM/CJS 入口不打包 React、ReactDOM、Ant Design。
- 组件按子路径和模块边界可 tree-shaking。
- 首屏页面不因为主题恢复、字体加载或组件测量产生明显布局跳动。

## 2. 包体预算

| 产物                     | 预算             | 说明                                            |
| ------------------------ | ---------------- | ----------------------------------------------- |
| 单个基础组件新增 gzip    | ≤ 8 KB           | 不包含 peer dependency                          |
| 主题运行时新增 gzip      | ≤ 6 KB           | token 计算和 Provider 逻辑                      |
| `lx-ui` 主入口未使用组件 | 不得因导入而执行 | 入口保留模块边界                                |
| standalone UMD           | 首版单独记录     | 可包含 React/ReactDOM/AntD，不能与 npm 入口混用 |
| CSS 增量                 | 组件按需加载     | 全局 token 只加载一次                           |

超过预算时先检查重复依赖、导入路径和运行时分支，再考虑压缩；不能用删除错误状态或可访问性行为换体积。

## 3. React 渲染规则

- 不在 render 中做同步布局读取、storage 写入、请求或复杂排序。
- 连续 pointermove、resize 和 scroll 事件使用 `requestAnimationFrame` 合并，输入搜索使用合理 debounce。
- 大表格支持分页、窗口化或虚拟化，但虚拟化不能破坏键盘导航和屏幕阅读器语义。
- 避免无意义的 `memo`。只有在 props 稳定且存在可测量的重复渲染成本时才使用。
- 组件内部状态只放在最低公共拥有者，减少页面级重新渲染。

## 4. CSS 规则

- 不用会触发布局的高频动画属性驱动拖拽，优先 transform 和 opacity。
- 明确设置图片、图标和容器尺寸，避免内容加载造成 CLS。
- 不在所有组件上默认加大阴影、backdrop-filter 或复杂渐变；glass 风格按需启用。
- 使用 CSS Modules 保持选择器低特异性，使用 cascade layer 处理全局覆盖。
- 主题切换优先更新 CSS Variables，不重建整棵组件树。

## 5. 依赖规则

引入依赖前必须记录：功能收益、压缩后体积、是否重复已有能力、维护活跃度、SSR 兼容性和 tree-shaking 行为。能用少量平台 API 完成的能力不为了“统一”增加第三方包。

React、ReactDOM 和 antd 使用 peer dependency。图标包、日期库、拖拽库和虚拟列表库按实际组件需要再引入，禁止提前把整套生态放进基础工程。

## 6. 测量方式

- `npm pack --dry-run` 检查发布文件清单。
- 构建后分别记录 ESM、CJS、CSS 和 standalone UMD 的 raw/gzip/brotli 大小。
- 文档站和 examples 用 Lighthouse 或 Playwright 记录 LCP、INP、CLS。
- 关键交互用浏览器 Performance 面板验证长任务和布局抖动。
- 性能结论写入变更记录，避免只凭“感觉变快了”。
