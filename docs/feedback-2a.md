# 2A 反馈状态组件协议

> Alert、Spin、Progress 是区域反馈组件。它们保留 Ant Design 5 的公开 API 和语义，不发起业务请求，不管理重试、权限、路由、缓存或全局消息。

## 1. 共同边界

- 组件只表达当前状态；请求、失败恢复、焦点目标和状态文本由宿主控制。
- 兼容基线为 AntD `>=5.24 <6`。CSS Module 只在组件根 class 下增强 token 和 focus，不改写全局 `.ant-*`，不使用动画库。
- `LxConfigProvider` 负责主题 token 和 reduced-motion 基线；每个组件仍需验证持续旋转/扫光是否在 reduced motion 下停止。
- 组件不新增 portal、全屏遮罩和全局状态；这些能力归 2B 弹层反馈批次。

## 2. Alert

Alert 直接适配 AntD 根节点，透传 `message`、`description`、`type`、`showIcon`、`action`、`closable`、`onClose`、`afterClose` 等公开 Props，不增加第二套关闭状态机。`className` 和 ref 的归属必须与 AntD 实际契约一致；如果最低支持版本不能稳定提供 ref，就不自行通过全局 DOM 查询补 ref。

播报策略由宿主通过 `role`、文案和独立状态节点决定：普通信息使用 `status`，需要立即处理的新错误才使用 `alert`，静态说明可使用 `note`。组件不默认给容器增加 `tabIndex`，关闭按钮和 action 中的真实交互元素才进入 Tab 顺序。宿主在 onClose 恢复到稳定焦点目标；afterClose 是原生动画完成通知，motion off 或不支持动画事件时 AntD 不保证调用，不能作为必要恢复的唯一入口。

## 3. Spin

Spin 支持 `spinning`、`delay`、`size`、`tip`、`indicator`、`children` 等 AntD 公开能力。区域模式保留 children 挂载，原生 nested 根立即表达 `aria-busy=spinning`，视觉 delay 不延迟业务区域的 busy 事实。不加布局 wrapper，不做 DOM 查询、MutationObserver 或 aria 补写。standalone 没有业务内容，保留 AntD 原生延迟后的 busy 语义。`SpinProps` 排除 `fullscreen` 和 `percent`，运行时也剥离，首版不提供全屏遮罩或伪进度协议。

默认 delay 300ms，caller 可覆盖；默认单弧 small/default/large 对应稿件 16/24/36px，800ms linear，消费 `--lx-spin-size-*` 和 `--lx-motion-spin-duration`。默认 indicator 为每个实例的公开 prop，不调用全局 `setDefaultIndicator`。显式 indicator 优先并自行负责尺寸；宿主 ConfigProvider indicator/AntD 既有全局 indicator 必须显式传入才能替换局部单弧。reduced motion 在局部根停止包括 SVG/伪元素/custom indicator/nested 内容的动画和过渡，不依赖固定 prefixCls。

含业务内容的区域不默认设为 `role=status`，避免重复播报；需要播报时使用短的独立状态文本。Spin 不等于禁用，宿主仍需明确禁用提交按钮或表单控件，不自动设置 `inert`。

## 4. Progress

Progress 直接适配 AntD 根节点，透传 `line`/`circle`/`dashboard`、`percent`、`status`、`format` 等公开 Props。`status="active"` 只是确定进度的视觉动效，不表示未知比例；未知比例使用 Spin。Progress 不默认添加 `aria-live`，避免每个百分点造成播报；任务名称通过 `aria-label`/`aria-labelledby` 或宿主状态文本提供。

总 percent 与 success.percent/success.progress/successPercent 使用相同规范：有限值 clamp 0–100，NaN/正负 Infinity 归零，小数保持精度。规范后的总值传给视觉层、format 和 aria-valuenow；成功分段不替代总值（80/30 的可访问总进度为80）。不改写 format 返回内容，不添加 aria-valuetext。ref 用 AntD public ComponentRef 推导。所有形态的局部动画/transition/SVG/伪元素在 reduced motion 停止。失败状态由宿主提供恢复 action，不实现重试请求和伪进度。

## 4.1 返工记录与验收边界

只读依据：`UI/P0 基础组件-Feedback/code.html` 的 Alert 160ms、Spin 16/24/36px、800ms linear、300ms delay 和 Progress 多形态章节。Alert 根使用真实存在的语义背景/边框与 radius-panel；移除无效的 --ant-* 变量和不存在的 radius-md/space-3。AlertRef 直接推导 AntD public 类型。

Dumi 演示复用独立主题 frame，提供 light/dark、密度和外观操作；loading 900ms（300ms 后显示 spinner），首次失败、重试成功，取消卸载定时器，保留筛选和 children。查看会展开真实同步范围，onClose 立即通过稳定 ref 恢复焦点，正常 afterClose 再卸载；重新显示使用新 key 挂载，motion off 未调用 afterClose 时也可恢复。Progress 包含62.5、circle/dashboard/steps与成功分段。

本轮为独立 NO-GO 修复（context -> audit -> polish）；父代理负责独立 critique/复审。浏览器工具的 security policy 已拒绝 localhost，禁止以其它地址、浏览器或网络隧道绕过；静态测试通过不能作为视觉 GO。明暗实际对比度、窄屏、焦点和 reduced motion 的 computed style/动画状态仍需工具允许后的真实浏览器证据。

2026-09-30 静态证据：feedback focused Vitest 3 files / 28 tests 通过；涵盖全部有限/非有限数值、format 返回 React 内容、成功分段和 deprecated APIs、ref mount/unmount、nested 即时 busy 与 300ms delay、standalone 原生延迟 busy、runtime 剥离、自定义 prefixCls/indicator、卸载取消、真实 Alert afterClose。废弃 API 的 AntD 提示为预期输出。typecheck、focused ESLint、修改文件 Prettier check 通过；detect=[] 只代表确定性规则未命中。全仓 lint/test/build/scaffold 和最终独立复审由父代理统一执行。用户新增的逐组件详细 demo/Props 文档另批实施，综合 demo 不作为其替代。

## 5. 2A 不做

第二轮复审修复：成功分段所有API均限制不超过规范后的总percent；总80/成功120输出80/80，覆盖总0、负值、12.5与62.5。Spin nested单弧margin与本身size变量同源，带tip时额外使用间距token向上留出文字区，standalone不应用负margin。全部本批注释已转中文。逐组件文档各有基础、变体和真实交互三个独立场景，Dumi defaultShowCode 展开源代码；保留综合路径，不替代单组件页。最新focused测试32/32通过，视觉门禁限制不变。

- 全屏遮罩、portal、z-index、焦点陷阱、Message/Notification 全局 API。
- 自动请求、自动重试、自动聚焦 body/邻居或自动 `inert`。
- 不确定进度条的新增 API、动画库和全套图标。
- 替换 DynamicForm 内部已经验收的 AntD Spin；替换另行评估，避免 live region 回归。
