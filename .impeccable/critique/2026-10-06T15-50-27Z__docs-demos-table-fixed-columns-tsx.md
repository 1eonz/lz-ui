---
target_identity: "file:F:\\work\\lz-ui\\docs\\demos\\table-fixed-columns.tsx"
target_fingerprint: "sha256:291518eab35f85886217697151d43fd8636b2def824c1f45ed567cb4aee324d5"
target_path: "F:\\work\\lz-ui\\docs\\demos\\table-fixed-columns.tsx"
timestamp: 2026-10-06T15-50-27Z
slug: docs-demos-table-fixed-columns-tsx
closed: true
---
## 目标与方法

- 目标：Table 文档的固定列宿主示例、1000 行虚拟化示例、对应说明与浏览器断言；不修改 `Table` 的公开组件 API。
- 设计依据：`UI/P0 基础组件-Data Display/screen.png`、同目录 `DESIGN.md`、`docs/project-rules.md` 与 `docs/impeccable-workflow.md`。执行 Impeccable 4.1.3；先运行 `context.mjs --target /components/data-display/table` 和 `context.mjs --target src/components/data-display/table`，再阅读现有设计、craft floor、audit、critique 与 polish 约束。
- 独立评审：A 组为 `gpt-6-luna max`，只读核对设计和真实页面；B 组为 `gpt-6-luna max`，独立运行 detector 与 Chromium 浏览器复核；同一代理随后进行了只读代码复审。主代理根据真实发现修复再请 reviewer 复查。

## 局部设计评审

- A 组给出设计特异性高、Nielsen 33/40（Good）。采购字段、审批状态、行展开、操作列、固定列和大数据虚拟化都与 ERP 采购表格场景一致。
- A 组发现 P3：固定列 demo 使用纯文本审批状态，不同于主表示例及设计稿的语义 Tag。已改为从 `lx-ui` 根入口导入 `Tag`，以 success/warning 表达已审批/待审批；浏览器回归断言分别检查两条目标订单行的“已审”和“待审”。Chrome 154 热更新检查状态标签为 46×26px，完整位于 120px 列内，与主表示例色彩和文字一致。A 组复核新断言仅依赖公开 row role 与可见文本，不读取 AntD 私有 DOM。
- 认知负荷整体低；一处轻微压力是主表示例露出 5 个分页页码。它是既有 Table demo 的常规分页信息，不属于本次固定列/虚拟化改动，不影响操作，因此本次不扩展修复。

## 技术审计

| 维度 | 评分 | 证据与边界 |
| --- | ---: | --- |
| 无障碍 | 3/4 | 行选择名称、当前页全选名称、状态文本和真实按钮可见；在窄屏验证 Tab 焦点、scrollport 边界、中心命中及真实点击。未运行 axe 或真实屏幕阅读器。 |
| 性能 | 3/4 | 1000 行启用 AntD 公开 `virtual` 能力；实际首末 DOM 为 9/8 行。没有测设备帧率、内存或 Core Web Vitals。 |
| 主题 | 2/4 | 本轮只实测默认 light/business/blue/comfortable；没有将历史 Table 主 demo 的 dark/compact 证据外推到新 demo。 |
| 响应式 | 4/4 | 1280/930px 两端固定；390/320px 取消固定后内部横向滚动，采购员按钮完整可见可操作；页面根稳定无水平溢出。 |
| 实现完整性 | 4/4 | 容器宽度由 `ResizeObserver` 测量且在 effect 清理时 disconnect；422px 由相关列宽相加得出；类型、格式、lint、单测、浏览器和文档构建闭环。 |
| **合计** | **16/20** | **局部审计，不代表 Table 全量矩阵或全库通过。** |

## Detector 与浏览器证据

- B 组只运行一次 `node C:\\Users\\Administrator\\.codex\\skills\\impeccable\\scripts\\detect.mjs --json docs/demos/table-fixed-columns.tsx docs/demos/table-virtual.tsx docs/demos/table-demo.module.css`。原始 stdout 为 `[]`、stderr 为空、退出码 0。它对 TSX/CSS 使用正则扫描，不解析 JSX AST，不跟随 CSS Modules，也不能衡量浏览器行为；因此不作为视觉通过依据。本轮未注入 overlay。
- 新的 Chromium context 在 Dumi 路由检查 1280×800（section 870px）、930×800（520px）、390×844（260px）、320×844（190px）；根溢出稳定为 0。421px section 不固定，422px 固定。930px 一次连续视口切换采到 5px 溢出，之后新 context、同域 Button 对照、等待 250ms 的 Table 复测均为 0；不能稳定复现为页面缺陷。
- 390/320px 时从 PO-2026-1041 选择框 Tab 到采购员按钮，内部横向 `scrollLeft` 到 510/545px；目标在 scrollport 内、不与两侧边缘列相交，`elementFromPoint` 命中并由真实鼠标点击更新订单状态。桌面选择列、订单编号、操作列在滚动起点、中点、末端保持固定。
- 1000 行虚拟表真实滚轮操作到 `PO-2026-1000`：首屏/末屏订单 DOM 数 9/8，末行完整位于 360px holder，实际 `scrollTop` 为 0→54538，`scrollHeight=54898`，document scrollTop 不变。
- `expectNoDocumentOverflow` 首次使用即时读取时曾捕获 viewport 改变后尚未提交的 139px 旧布局值。helper 现使用 Playwright `expect.poll` 等待响应式布局稳定；每个通过采样仍必须 ≤1px，持续溢出将在 30 秒后失败。独立代码复审确认此等待没有掩盖持续溢出。
- 当前源码在 8000 Dumi live route 的 Chromium 固定列/Tag 与虚拟表示例为 2/2。随后从包含最终源文件的隔离副本运行 `npx dumi build`、静态导出门禁和两项目浏览器验收；Chromium 与 Edge 各两项，共 4/4 通过。隔离构建没有触碰仍在使用的 8000/8001 Dumi 服务。

## 工程门禁与复审

- `npm run check:scaffold`、全仓 `npm run format:check`、`npm run typecheck`、`npm run lint`、`npm run typecheck:docs`（103 demo 源文件）、Table 单测（21/21）、全量测试（55 文件/444 项）、`npm run build:lib`、隔离 `npx dumi build`、`check-docs-export`（158 HTML/474 本地资源/88 嵌套 demo）、最终源码 Chromium/Edge Playwright（4/4）和 `npm pack --dry-run` 均通过。
- jsdom 对 AntD 测量 scrollbar 伪元素的 `getComputedStyle` 警告是现有测试环境限制；断言通过。打包预览 522 文件、163.0 kB 压缩、755.1 kB 解包；未包含 `docs/demos`、浏览器测试或设计稿。
- 独立代码复审无未关闭 P0–P2；状态 Tag P3 已增加两分支可见文案回归并由复审确认。A/B 与 code review 的 GO 仅对本报告描述的固定列、Tag、虚拟化行为有效。

## 未覆盖与状态

- 尚未验证 dark、compact、soft/glass、6 个标准主题色、7 套东方色、200%/400% 缩放、真实读屏、Safari、实体触屏、目标部署配置、动态行高、展开行或设备级虚拟表性能。最新 Tag 修改后的 Edge 已通过静态构建实测，但上述矩阵仍未完成。
- Table 完整设计验收仍开放；全库 2B-1 仍开放。此报告只关闭新增固定列和虚拟化文档示例的局部问题，不声称组件库已达到商用发布完成状态。
