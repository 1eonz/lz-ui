---
target: General 与 Form 详细文档及39个独立演示
total_score: 29
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 1
target_identity: "file:F:\\work\\lz-ui\\src\\components\\form\\dynamic-form\\index.md"
target_fingerprint: 'sha256:c52fae9cfce83513a36182b73632fdb435ef3f3d904ab6863ac2e9795b2813b3'
target_path: "F:\\work\\lz-ui\\src\\components\\form\\dynamic-form\\index.md"
timestamp: 2026-09-30T18-17-22Z
slug: src-components-form-dynamic-form-index-md
---

Method: dual-agent (A: /root/input_docs_impeccable_a · B: /root/feedback_2a_sol61_review)

# General 与 Form 组件文档审查

日期：2026-10-01。Impeccable 4.1.3；Read 模式。主目标为 `src/components/form/dynamic-form/index.md`，范围含 General 五页、基础 Form 八页、DynamicForm 和本批 39 个独立示例。设计依据为只读 `UI/`、`design.md`、公开 API 和既有主题 token。A 先独立完成，B 的 detector 和评分在 A 完成后进入综合；两组结论独立。

## 设计特异性与整体判断

场景来自客户、合同、采购与审批，符合 ERP/CRM 开发者。按场景展示、源码、参数、事件、实例和边界组织，符合组件文档阅读习惯；共享主题容器保留 lx-ui 的主题能力。没有营销布局或新的运行时依赖。实际视觉层级、排版和主题对比仍缺浏览器证据。

## Nielsen 评分

分数保留 A 修复前的源码判断，不能用主代理推测的修复效果抬高评分。

| 项目     | 分数  | 依据                                         |
| -------- | ----- | -------------------------------------------- |
| 状态可见 | 3/4   | 保存、选中和重试有原位反馈                   |
| 现实语言 | 3/4   | 中文客户、采购、合同场景；部分尺寸标签待改善 |
| 用户控制 | 3/4   | 清空、重置、恢复、移除与折叠有路径           |
| 一致性   | 3/4   | 统一容器与公开 API，错误语义曾遗漏           |
| 错误预防 | 3/4   | 必填、限制、加载锁、取消与清理               |
| 识别优先 | 3/4   | 场景与方法表可扫描；部分只有 ARIA 名称       |
| 灵活效率 | 3/4   | 受控回填、搜索、ref 与局部主题               |
| 简约     | 3/4   | 源码及主题默认折叠，实际排版待验             |
| 错误恢复 | 2/4   | 自定义字段错误关联与 Select 失败场景不足     |
| 帮助文档 | 3/4   | 参数、默认值、事件、实例与边界完整           |
| 合计     | 29/40 | 源码暂评 Good，不等于视觉交付                |

## 技术证据

B 的独立源码评分：无障碍 3/4、性能 3/4、主题 3/4、响应式 3/4、实现完整性 4/4，合计 16/20。稳定 schema、局部 registry、计时器清理与公开 API 有源码证据；没有运行时性能、完整主题或响应式实测。

命令：`node C:/Users/Administrator/.codex/skills/impeccable/scripts/detect.mjs --json src/components/general src/components/form docs/demos`。原始 stdout 为 `[]`，退出码 0；一次扫描，零确定性规则命中。没有逐条误报可复核，也没有可靠浏览器覆盖层；人工审查仍发现下列缺陷。主代理不重复扫描或把空数组作为通过证明。

## 优点

1. 本批 39 个独立示例实际导入组件，覆盖受控状态、校验、失败恢复、文件移除和实例方法。
2. 文档区分 DOM ref 与公开实例，不承诺不存在的 Upload open/focus 或 Progress onChange。
3. 表单唯一 name/id、稳定 schema、局部 registry 与卸载清理降低复制示例后的耦合与竞态风险。

## 优先问题与处理

1. P1：自定义 renderer 丢弃 Form.Item 注入的 `aria-required/aria-invalid/aria-describedby`，复制后无法关联错误。已完整展开 controlProps 再收窄 Input value，不展开 schema。对应 harden。
2. P2：数量错误只有红框，没有错误语义与文字关联。已使用 useId、可见 label、aria-invalid 和 aria-describedby。对应 audit。
3. P2：Select 只在首次加载失败，无法体验选中后失败保留值。已提供可控失败开关、同步加载锁、重试及选项和值保留；B 最终复审关闭。对应 harden。
4. P2：默认 Ghost 按钮 hover 前景与主色背景对比约 1.19:1 / 1.12:1。已通过公开 style 固定启用按钮的 on-primary 前景和边框；禁用状态保留原生样式。对应 polish。
5. P1 证据缺口：localhost 导航被浏览器安全策略拒绝；未换地址、浏览器入口、CDP 或隧道绕过。Dumi 源码展开/复制、日期弹层、文件选择、Clipboard、桌面/930/320–390px、明暗/密度、Tab/Enter/Escape、200%/400% 缩放和 reduced motion 未实测。恢复允许的浏览器能力后集中验收；本快照保持开放。对应 audit。

## 阅读负荷、角色与情绪路径

负荷低至中等：标题和邻近标签减少记忆，默认折叠源码和主题减少初次观察的选择。Space 参数、主题设置展开后仍有五类选项；比较画廊允许多样本，参数控件后续可按排列与容器分组，但需真实观察后再调整。

Alex 业务开发者需要能安全复制自定义 renderer，且实际复现选中后失败；Sam 键盘/读屏使用者需要错误关联、可见焦点和实际弹层验证；Jordan 首次使用者需要明确尺寸和 disabled/只读语义。即时反馈与失败保留值建立信任，缺失错误关联和无法复现的承诺损害信任。

## 次要观察

合同图标已补可见名称，避免只对读屏可识别。搜索结果宜显示中文部门名；disabled 审批字段应称禁止编辑，不能混称只读；Select 和日期尺寸示例需可见尺寸名称。视觉间距及认知负荷微调等待真实页面证据，不凭源码宣称完美。

## 门禁与边界

主代理已完成 scaffold、format、库与示例类型、lint 和 37 文件 / 264 项全量测试；库 ESM/CJS 与 Dumi 构建通过。B 最终仅给限定静态 GO，以上代码问题关闭；93 个示例源码检查及 Divider 4/4 回归通过，Ghost 的 156 组 token 对比最低 4.799:1。打包预检为 502 文件、134100 字节压缩、644841 字节解包，不含示例或测试。提交不表示 P1 浏览器缺证被关闭。测试环境中的 rc-table/jsdom 伪元素计算限制和废弃 API 警告保留，不屏蔽后伪称浏览器通过。

Questions skipped: 用户已明确授权全部 P1/P2 按序修复并继续完成；本轮方向、范围和提交授权沿用已有决定。
