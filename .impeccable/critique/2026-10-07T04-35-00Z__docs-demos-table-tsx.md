# Impeccable 复核快照：Table 文档示例

## 范围

- 目标：`docs/demos/table.tsx`、Table 组件适配层、Table 文档页与窄屏分页样式。
- 模式：Read；使用既有 ERP/采购后台视觉系统，不改变组件公开 API。
- 工具版本：Impeccable 4.1.3。
- 上下文命令：`node C:\Users\Administrator\.codex\skills\impeccable\scripts\context.mjs --target docs/demos/table.tsx`，退出码 0；项目没有 `PRODUCT.md`，本次按既有视觉系统做局部复核。
- 静态 detector：`node C:\Users\Administrator\.codex\skills\impeccable\scripts\detect.mjs --json docs/demos/table.tsx`，原始 stdout 为 `[]`，退出码 0。该结果只代表确定性静态规则未命中，不能替代浏览器验收。

## 本批结论

- Table 详情按“采购信息、履约进度、审批与结算”三组组织，桌面并列、窄屏单列；打开后标题获焦，关闭后回到对应触发按钮。
- 默认/large、非虚拟 Table 在粗指针下以 `max(基础行高, --lx-control-target-touch-min)` 计算行和表头高度，纯文本短行也至少 44px；middle/small、virtual 和宿主内联高度仍由原责任边界控制。
- 320px 下分页使用三行布局，包含跳页、可见页摘要和前后页操作；640px 下使用两行布局。表格横向滚动留在命名区域，页面根节点无横向溢出。
- Chromium 和 Microsoft Edge 的 Table 专项各 8/8 通过；覆盖主题切换、6 个标准色、7 组东方配色、两种密度、640/320px 窄视口、详情、固定列、粗指针和虚拟滚动。
- 独立 B 组在 1440/640/390/320 细指针与 390/320 粗指针场景中记录根宽度始终无溢出；粗指针 compact 纯文本行与表头均为 45px，详情三组标题的 `aria-labelledby` 关系完整。P0/P1/P2 均为 0、结论 GO；demo surface 下方默认白色余量仅为不阻断 P3 观察。
- 全量 Vitest 为 55 个文件、606 项通过；`typecheck`、demo 类型检查、Lint、脚手架检查、库构建和 Dumi 静态导出均通过。

## 保留边界

- 真实 page zoom 200%/400%、真实屏幕阅读器、Safari、实体触控设备、设备性能和目标部署环境仍未覆盖。
- detector 的 `[]` 不作为视觉或交互通过结论；浏览器 overlay 对 Dumi 壳、AntD 生成结构和虚拟滚动裁切的命中需按真实页面证据解释。
- AntD 公开 API 不提供纯文本单元格方向键横向导航入口，该 P2 继续记录在路线图中，不通过私有 DOM 改写规避。
