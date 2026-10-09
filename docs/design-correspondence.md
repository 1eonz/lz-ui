# 设计对应关系与当前验收

本文件把设计输入、采用值和验收证据分开。`UI/` 和前公司项目是只读参考；Stitch 的 CDN、图标字体和演示脚本不进入运行时。实现存在、公开导出、静态代码 GO、实际界面 GO 是不同状态，任何一个都不能替代其余证据。

## 设计源冲突裁决

2026-09-30 主负责人采用对应组件的专用规格表优先于概览页。原因是概览用于展示系统关系，专用规格明确了组件尺寸、状态和交互。优点是组件实现可追溯、可验收；代价是初期 token 数值会调整，宿主升级必须注意下列变化。若专用稿违反可访问性，采用有记录的可访问替代并复测，不照搬不可读的颜色或没有键盘行为的静态交互。

| 目标                           | 设计证据                             | 采用协议                                                                            | 实施注意                                                                                                                                                                                                                                                 |
| ------------------------------ | ------------------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typography Title 1–5           | General 标题规格表                   | 字号 38/30/24/20/16，行高 46/38/32/28/24，字重 800/700/600/600/600                  | 只影响显式 Title；紧凑面板使用较低层级，不改变文档站全局标题                                                                                                                                                                                             |
| 正文与辅助文字                 | General Text/Caption 表              | 14/22、12/20                                                                        | 使用命名字体 token；不新增 CDN 字体                                                                                                                                                                                                                      |
| Button                         | General Button 尺寸表 + Density 规范 | 未指定：comfortable 40、compact 32；显式 middle 32、small 24、large 40              | 省略 `size` 由 lx 包装层解析，宿主 `ConfigProvider.componentSize` 不覆盖；显式档位固定，Middle 32px 在两种 density 下均不变；Button large 覆盖为 40px，全局大控件 token 48px 不变；详见 [ADR-0006](./adr/0006-button-size-density.md)                    |
| Table                          | Data Display `spec-table`            | 舒适行 48、紧凑行 36、表头 36                                                       | 行高是普通单行内容的基线，多行和展开内容允许增高；与 control 40/32 独立                                                                                                                                                                                  |
| Pagination                     | Data Display 专用分页区              | default 随 density 40/32，显式 small 为 24                                          | 沿用 AntD 的 default/small 公共 size，不新增不兼容的 large/middle                                                                                                                                                                                        |
| Avatar                         | Data Display 专用头像区              | large/default/small 为 48/36/24                                                     | 显式数值和响应式 size 优先，图片失败和长名称仍用公开 API                                                                                                                                                                                                 |
| Spin                           | Feedback `spin-spec`                 | 单弧 16/24/36，800ms linear，默认 delay 300ms                                       | indicator/delay 可覆盖；业务区域 busy 立即生效，独立图标沿用延迟显示语义                                                                                                                                                                                 |
| Alert                          | Feedback Alert 规格                  | 语义状态、160ms 退出、真实关闭生命周期                                              | 焦点目标由宿主提供；不在组件内猜测相邻元素                                                                                                                                                                                                               |
| Tooltip / Popover / Popconfirm | Feedback 专用稿与 `design.md` §7.4   | Tooltip 使用非交互 tooltip 语义；Popover 与普通 Popconfirm 使用非模态 `dialog` 契约 | Stitch 将 Popconfirm 标成 `alertdialog`，但稿件没有模态焦点与背景隔离行为；首版保留外观并采用 `dialog`。真正紧急中断的 `alertdialog` 必须另有模态规格。Portal 主题作用域与验收要求见 [ADR-0004](./adr/0004-anchored-dialog.md)，原语代码须等待 2B-1 关闭 |
| 三种 appearance                | Theme Presets + Card 专用稿          | business 平面、soft 轻表面和阴影、glass 渐进透明表面                                | 表格/输入/错误提示保留可读实色；不支持 filter 或 reduced motion 时回退                                                                                                                                                                                   |

## 当前实施与审查状态

| 范围                                               | 静态审查                                                | 实际演示                               | 浏览器验收                          |
| -------------------------------------------------- | ------------------------------------------------------- | -------------------------------------- | ----------------------------------- |
| Theme / General / Form 基础                        | General 尺寸与窄屏 API 修订已记录；其他基础风险持续跟踪 | General 15 个专属 live demo 已稳定定位 | Chromium 局部 6/6；完整矩阵仍待验证 |
| Data Display 1A/1B                                 | ref、间距、外观及密度问题待关闭                         | 新增 13 个专属 live demo，独立复审中   | 待验证                              |
| Feedback 2A                                        | 独立审查 NO-GO，修复中                                  | 失败/重试/关闭焦点 demo 返工中         | 待验证                              |
| Feedback 2B / Navigation / Layout / Business / UMD | 未交付                                                  | 待前序门禁                             | 待前序门禁                          |

独立设计盘点由 GPT-6.1-SOL xhigh 完成，覆盖源码和四套组件设计输入。它曾确认 15 个组件页缺专属可运行 demo，并指出主题 token 未被组件实际消费；后续 13 个展示组件与 15 个 General demo 已补充，General 局部 Chromium 交互现已复验。此证据不沿用为全组件视觉通过的推断。

## 待关闭的基础风险

- Button 的统一最小高度不能抹平 small/large；动态表单的字段动画、Icon 旋转和 Divider 标题偏移需与专用稿对应。
- Tag 的 CheckableTag 出口、键盘语义和默认外边距必须与文档一致。AntD `color` 允许自定义字符串，文档不能宣称类型已限制颜色；推荐语义预设并验证自定义对比度。
- Card 样式只能作用于自身，不能通过后代选择器覆盖嵌套 Card。AntD 5.24 已有公开 Card ref，优先直接转发真实根节点。
- 表单类型目前仍有 `rc-*` 与 AntD 深层类型引用；公开声明应从 AntD 根导出或 `ComponentProps`/`ComponentRef` 推导，避免宿主必须直接安装传递依赖。
- DynamicForm 内置规则类型接受 AntD 规则工厂，但现有对象展开可能丢失工厂行为；必须明确并验证对象规则和工厂规则的组合优先级。

## 证据限制

本轮本地服务已恢复到 `http://localhost:8002`。浏览器工具访问该页面被安全策略拒绝，不能改用其它入口或底层浏览器命令绕过。保留源码、单元测试、构建和 detector 的独立结果，实际截图、布局、明暗/紧凑、键盘焦点及系统 reduced-motion 仍待浏览器工具允许后验证。`[]` 只说明确定性规则没有命中，不表示上述路径通过。
