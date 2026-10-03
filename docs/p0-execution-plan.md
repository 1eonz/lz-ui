# P0 实施路线与架构门禁

> 更新：2026-10-04。此文件是实施顺序和验收依据，不表示列出的组件已经完成。长期拆分计划见 `docs/roadmap.md`。每批以 `docs/project-rules.md` 和 `docs/impeccable-workflow.md` 为共同门禁；`UI/` 是只读设计证据。

## 当前基线

当前代码和入口包含主题 Provider、General、表单基础控件、DynamicForm、1A 展示组件、1B Pagination/Table/Tree、2A Alert/Spin/Progress 和 2B-1 Tooltip。Tooltip 已完成代码、文档、SSR/StrictMode 测试和静态复审；完整视觉矩阵仍按 `docs/roadmap.md` 待补。Popover/Popconfirm 暂缓，等待可访问的锚定对话框能力完成评审；Navigation、Layout、业务组合和 UMD 仍未交付。不得用目录 README 或 Stitch 静态稿替代实现状态。

### 本轮实施与验收清单

| 任务                        | 当前状态                     | 关闭条件                                                                                  |
| --------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------- |
| 模型与验收规则同步          | 2026-10-04 更新              | 实施使用 gpt-6.1-sol medium，独立复审使用 gpt-6.1-sol xhigh                               |
| 现有组件设计对应盘点        | A0 已静态复审                | 设计映射已落地；真实渲染矩阵仍待验收                                                      |
| Input、1A/1B 可运行演示     | 构建及静态复审通过           | 六个 Input demo、13页基础/交互 demo；浏览器验收待补                                       |
| 2A Feedback                 | 静态复审通过                 | 32项行为测试、九个专属 demo；明暗与动效浏览器验收待补                                     |
| Tooltip                     | 代码交付完成，视觉矩阵待补   | 已完成公开 API、动态 aria-describedby、方位/主题 demo、SSR/StrictMode；待补完整浏览器矩阵 |
| General 与其余 Form 文档    | 构建及静态复审通过           | 独立场景、完整源码、参数、事件/ref方法及使用边界                                          |
| 现有组件浏览器与 Impeccable | A/B 静态审查已执行，视觉待验 | 真实组件的桌面/窄屏、明暗、密度、键盘和 reduced motion 证据                               |
| 2B、导航、布局、业务和发布  | 待前序门禁                   | 分批实施、独立复审、返工复审、浏览器及产物验收                                            |

每批记录的是已检查的具体范围，不以“99%”或一次静态 GO 推定其余组件通过。已写代码但缺少交互、视觉或产物证据的项保持待验收。

组件实现按依赖方向逐批开放 `scripts/check-scaffold.mjs`，只有完成设计映射、API 评审、代码、相邻文档、行为测试、浏览器验证和包体检查的组件才进入 `src/index.ts`。每一批必须说明为什么采用当前抽象、宿主如何扩展、代价和不适用场景；详细注释解释受控/异步/卸载/SSR 等非显然逻辑，而不复述代码。

## 依赖顺序

| 批次          | 范围                                                                            | 编码前锁定的关键协议                                                                                             | 必须验证的用户路径                                                                        |
| ------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 0A 表单前序   | Checkbox、Switch，再补 Radio、Upload、Form 及其余高频录入控件                   | `checked`/`value` 穿透 Form.Item；Upload 不默认请求；增强组件与 `lx-ui/antd` 的责任边界                          | DynamicForm 勾选、切换、校验、禁用、上传值、提交，不依赖 AntD 私有 DOM。                  |
| 0B 通用前序   | Icon、Typography、Space、Divider                                                | 图标按需入口，不引入整套图标；排版/间距消费 token                                                                | 长文本、图标名称与焦点、明暗及紧凑密度。                                                  |
| 1A 展示状态   | Empty、Skeleton、Result、Tag、Badge、Descriptions、Avatar、Statistic、Card/List | 空状态 action、Skeleton 与内容切换、Tag 可关闭/选择语义、数字/日期格式化注入                                     | 空/错/加载/恢复、非颜色信号、长值与图片失败、布局稳定。                                   |
| 1B 数据交互   | Pagination、Table、Tree                                                         | 泛型 rowKey；筛选/排序/分页/选择受控协议；表格行高独立于控件密度；虚拟化显式可选                                 | 翻页/排序/批量选中、固定列局部滚动、键盘、旧请求与大数据。                                |
| 2A 反馈状态   | Alert、Spin、Progress                                                           | 警告关闭后的焦点、区域 busy、进度数值/不确定语义                                                                 | 错误恢复、状态播报不过度、reduced motion。                                                |
| 2B-1 Tooltip  | Tooltip 非交互提示                                                              | AntD 公开 API/ref；hover+focus；合并宿主描述 ID；fixed spotlight 表面；异步/错误由宿主管理                       | 鼠标、键盘焦点、ARIA 描述恢复、12 方位、明暗主题、自定义 portal 与 reduced motion。       |
| 2B-2 锚定交互 | 先定义可访问的锚定对话框能力，再做 Popover/Popconfirm                           | Dialog 语义、焦点进入/恢复、Escape/外部关闭、锚点展开状态、SSR；不得改写角色或依赖 AntD 私有 DOM                 | 屏幕阅读器、键盘关闭/恢复、嵌套容器、失焦策略、窄屏定位与异步确认错误恢复。               |
| 2B-3 全局弹层 | Modal/Drawer、Message/Notification                                              | 对话框原语与锚定原语分开评审；Provider 主题传播、portal 容器与 z-index、异步上下文与卸载边界                     | Tab/Escape、焦点陷阱与恢复、嵌套、多 Provider、窄屏遮挡。                                 |
| 3 导航        | Breadcrumb/Steps、Tabs、Dropdown/Menu                                           | 稳定 key 和受控选择/展开；路由由宿主通过链接或回调注入                                                           | 箭头/Home/End/Enter/Escape、隐藏项、菜单定位与长标题。                                    |
| 4 布局        | Flex/Grid、Layout                                                               | Grid 沿用 AntD 公开栅格语义；Sider 折叠受控；sticky 区域所有权                                                   | 320px、200%/400% 缩放、长文本、SSR 初始布局与焦点可见。                                   |
| 5A 业务组合   | SearchForm、QuickField、PageContainer                                           | SearchForm 草稿/已提交查询分离，URL adapter 外置；QuickField 显示/编辑/提交状态机；PageContainer 不内置权限/路由 | 查询/重置/URL 往返、IME/Escape、异步失败保留草稿、页面操作区焦点。                        |
| 5B 表格业务   | ProTable                                                                        | `dataSource` 与 `request` 互斥；AbortSignal/requestId；总数变更页码修正；选择跨页策略；列配置由宿主持久化        | 真实 ERP/CRM 列表：筛选、分页、排序、批量操作、失败重试、旧请求不覆盖新结果。             |
| 6 发布闭合    | ESM/CJS/CSS/类型、AntD 迁移出口、UMD、私库发布准备                              | 普通 UMD 外置 peer；standalone 单独计量；版本与 registry 流程；发布前解除 `private` 需另行评审                   | React 18/19 消费 smoke、SSR、按需引入、直引脚本、`npm pack --dry-run`、产物无 demo/test。 |

## 每批代码与视觉验收

1. 在 Stitch 稿中列出对应组件、token、所有状态、动画、明暗、密度和响应式依据。设计缺项记入评审，不自行发明公开视觉 API。
2. 主负责人先审公开 Props、默认值、受控模式、Ref、异步竞态、宿主边界、依赖和包体预算；机械代码任务只接收已定边界。
3. 只开放该批 scaffold 名单，完成 CSS Module、类型、JSDoc、Dumi 可运行示例和公开行为测试。示例放在 `docs/demos/` 或文档内，不放进 `src` 的可发布产物。
4. 通过 `check:scaffold`、`format:check`、`typecheck`、`lint`、测试、库构建、文档构建；核查 dist 与 `npm pack --dry-run`。并行构建不得共用 Dumi 临时目录，以免破坏运行中的文档服务。
5. 按 Impeccable 技术审计、双路独立设计评审、真实浏览器打磨复测。至少覆盖桌面/平板/窄屏、light/dark、compact、键盘、错误、长内容和 reduced motion。十三套配色要有完整 token 与对比度证据，不能由两张示意图推定全部通过。
6. 主负责人复审代码和交付记录，确认问题解决才导出公开 API。仍有 P1 或未验证路径时明确标为未完成，不将其藏在“后续优化”。

## 需持续裁决的边界

- `docs/design-review.md` 中的 `paletteSuite` 是历史建议；已定 API 为独立的 `colorPreset` 与 `palettePreset`，以 `design.md` 和代码类型为准。
- PageContainer 仅归 `business`；布局设计稿只是它的视觉证据。表格的拖拽列排序仍属 P1，不因业务稿出现静态画面而自动进入 P0。
- Stitch 中 Tabs 自动同步路由、SearchForm 自动写 URL 都只是设计提案。首版核心组件不持有路由；明确 adapter 后再允许宿主启用。
- React 19、UMD、完整浏览器矩阵、所有主题对比度未有实测证据前，不标为已验证。AntD 4 继续不进入主包。
