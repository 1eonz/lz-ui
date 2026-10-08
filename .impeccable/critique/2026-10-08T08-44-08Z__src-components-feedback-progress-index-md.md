---
target: Progress API 窄屏文档
total_score: 35
max_score: 40
na_heuristics: ""
p0_count: 0
p1_count: 0
target_identity: "file:F:\\work\\lz-ui\\src\\components\\feedback\\progress\\index.md"
target_fingerprint: "sha256:eee11a5b8214a063232e51e3092e90291c00cd7bc9dd3ed3136d9b64325243d1"
target_path: "F:\\work\\lz-ui\\src\\components\\feedback\\progress\\index.md"
timestamp: 2026-10-08T08-44-08Z
slug: src-components-feedback-progress-index-md
---
Method: dual-agent (A: /root/progress_ux_final · B: /root/progress_evidence_review)

# Progress API 窄屏与可访问滚动评审

**Target:** `src/components/feedback/progress/index.md`

**Mode:** Read

**Assessment A:** 35/40 (Good)

**Assessment B:** 17/20 (Good)

## Design Specificity

该页面是 Progress 的开发者参考，不是泛化展示页。属性类型、默认值、`successPercent` 弃用状态、数值边界和可运行 demo 都针对真实组件契约。命名滚动区和键盘移动为窄屏 API 查阅提供了具体路径。

## Heuristic Scores

| Heuristic | Score | Observation |
| --- | ---: | --- |
| Visibility of system status | 3/4 | 滚动提示与可见内容裁切能说明表格可横向浏览，但没有精确位置值。 |
| Match between system and the real world | 3/4 | Progress API 术语准确，面向开发者读者。 |
| User control and freedom | 4/4 | 目录可跳转，API 表可用键盘左右往返。 |
| Consistency and standards | 4/4 | 属性、类型、默认值、说明分栏清晰，语义符合常见 API 文档。 |
| Error prevention | 4/4 | 范围约束、数值规范和弃用状态清楚可见。 |
| Recognition rather than recall | 4/4 | 属性名固定显示，API 标识符不会被断行。 |
| Flexibility and efficiency | 3/4 | 键盘滚动有效；长文档导航和横移仍有一定操作成本。 |
| Aesthetic and minimalist design | 3/4 | 文档结构简洁，320px 下同时可见的信息量有限。 |
| Error recovery | 3/4 | demo 展示失败时保留进度和恢复路径。 |
| Help and documentation | 4/4 | API 说明、边界、废弃替代项和 demo 均可查。 |
| **Total** | **35/40** | **Good** |

## Cognitive Load and Emotional Journey

四列表格与固定属性列减少了查找时的记忆负担；一张表包含约 13 项属性，但读者只需浏览，没有超过四个的同时操作选项。数值边界与弃用标签降低误用风险。失败 demo 保留当前比例并提供恢复操作，结果可信；320px 下查看长类型说明仍需要主动横移。

## Strengths

- 320px 下属性名仍保持单行，首列固定为 144px，能预览下一列。
- 可聚焦命名区域以方向键完成横向往返，并有浏览器几何断言证明位移和复位。
- `successPercent` 的“已废弃”状态与 `success.percent` 替代项同时呈现。

## Priority Issues

- **P3:** 320px 下完整查看较长类型表达式需要横向滚动。保留完整属性名和类型内容比强制压缩列宽更重要；方向键及滚动提示提供了明确路径。无剩余 P0、P1 或 P2。

## Persona Red Flags

- **窄屏开发者:** 首列占可视区约一半，阅读长类型时需要横移；可见滚动提示和左右方向键降低了发现成本。
- **快速查找 API 的开发者:** 属性数量集中在一张表，但固定首列、四列标题和可跳转目录使扫描路径仍清楚。

## Assessment B and Code Review

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Accessibility | 3/4 | 命名、表格语义、焦点样式和键盘滚动已有浏览器证据；真实读屏未测。 |
| Performance | 3/4 | 页面为静态表格和轻量 demo，未见性能问题；未做性能剖析。 |
| Theme | 3/4 | dark、compact、glass 组合和 reduced-motion 有页面实测。 |
| Responsive | 4/4 | 320/390/930/1280px 均无根溢出；320px 首列 144px。 |
| Implementation completeness | 4/4 | 属性文档、边界 demo、横向键盘操作和回归用例完整。 |
| **Total** | **17/20** | **Good; no P0-P2** |

独立代码复审发现初版横移断言只检查按键后状态，不能证明实际滚动。已改为等待 `scrollLeft >= 30`，再验证 `ArrowLeft` 返回 0；复审 GO。Chromium 与 Microsoft Edge 各 5/5，browser-health 错误为 0。

## Detector and Coverage Limits

Impeccable 4.1.3 `detect.mjs --json src/components/feedback/progress/index.md` 原始输出为 `[]`，退出码 0。`[]` 只表示确定性静态规则未命中，不代表视觉或交互通过。真实屏幕阅读器、200%/400% page zoom、Safari、实体设备和性能剖析未覆盖；当前结论只适用于本地 Dumi 页面和已列出的 CSS viewport。

Questions skipped: 用户已确认下一项 Table 详情采用信息层级与关系分组；本轮 Progress 仅剩一个不阻断的 P3。
