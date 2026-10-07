# ADR-0003：CSS Variables + CSS Modules

## 状态

已接受

## 背景

组件库需要三种风格、六个基础主题色、七套东方配色、明暗模式和两种密度。只用 Less 编译变量无法满足不刷新页面的运行时切换，也容易让全局选择器互相覆盖。

## 选择

组件样式使用 CSS Modules，主题和语义 token 使用 CSS Variables，使用 cascade layers 固定覆盖顺序。Ant Design 5 的 token 通过 `ConfigProvider` 映射到同一套语义来源。

组件需要面向不同输入设备或遵循系统动效偏好时，使用公开 CSS token 表达边界。Tag 的关闭目标保持 24px 桌面基准，并在粗指针环境通过 `--lx-control-target-touch-min` 扩展为 44px；`--lx-motion-tag-exit-duration` 默认 120ms，在 reduced-motion 下归零。宿主自定义关闭节点时可复用尺寸 token。

Tag 的最小高度通过可选组件 token `--lx-tag-height` 暴露，默认 26px；宿主可在 Provider `style` 或局部 CSS scope 覆盖它，内容超过最小值时仍自然增高。Table 通过公开 `ConfigProvider.useConfig()` 按 `size ?? componentSize` 解析尺寸，`--lx-table-row-height` 与 `--lx-table-header-height` 只由非虚拟且解析为默认/large 的表格消费；普通行随 density 为 48/36px，表头为 36px。全选 checkbox 高于文字行高，表头内距按两者较大值计算以满足设计稿；粗指针设备通过 `@media (any-pointer: coarse)` 将 body/header 行高和内容基准扩展到 `max(现有行高 token, --lx-control-target-touch-min)`（默认至少 44px），确保纯文本行和控件周围都有足够的垂直空间；middle/small 与 virtual 表格不应用这组覆盖。内距显式限制下限为 0，与 CSS 非负内距的计算行为一致；过小的宿主高度由内容自然撑开。

## 优点

- 运行时主题切换成本低。
- 组件样式作用域明确，减少跨项目污染。
- 设计稿 token 和代码 token 可以一一映射。
- 暗色、密度和玻璃风格可以组合而不复制组件实现。

## 缺点

- 需要维护 token 命名和 CSS/JS 的映射。
- 某些旧浏览器或业务工程的 CSS 构建配置需要确认。
- 设计 token 未确定前不能快速凭感觉写样式。

## 重新评估条件

真实项目出现明确的 CSS Modules 兼容问题、SSR 样式注入问题或 token 计算瓶颈时，针对具体证据调整，不回退为散落的 Less 魔法值。
