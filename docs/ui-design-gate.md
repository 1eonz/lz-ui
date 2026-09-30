# UI 设计交接门禁

这个文档记录从 Foundation 阶段进入组件实现阶段的检查表。Stitch 已交付基础视觉、主题矩阵、P0 组件和业务组合稿，当前已进入 P0 implementation；每个组件仍需单独完成代码、文档、测试和可访问性验收。

## Stitch 交付项

- 基础 token：颜色、字体、间距、圆角、阴影、控件高度、层级和动效时长。
- 三种风格：商务稳重、轻盈现代、玻璃液态。
- 六个品牌主题色和七套东方配色：每组至少给出 light/dark 的关键 token，并在代码中使用独立的 `colorPreset` / `palettePreset` 命名空间。
- 两种密度：comfortable、compact。
- 关键组件状态：default、hover、active、focus-visible、disabled、loading、error、empty、selected、expanded、read-only。
- 交互动画：触发条件、进入/退出、时长、缓动、中断和 reduced motion 替代。
- 业务组合：ProTable、SearchForm、QuickField、PageContainer 的真实页面示例。
- 可访问性：键盘顺序、焦点移动、错误播报、对比度和 200%/400% 缩放规则。

## 评审输出

设计评审后需要留下：

1. 设计稿链接或导出版本。
2. token 表的版本号。
3. 已确认的组件清单和优先级。
4. 未决问题、负责人和预计解决时间。
5. 允许开始实现的第一批组件。

## 解除门禁

负责人已确认设计交付项，`design.md` 当前阶段进入 P0 implementation。第一批实现顺序固定为主题运行时、基础表单控件、FormItem、DynamicForm；后续业务组件必须组合这些公开控件。`check-scaffold` 只允许已审批的组件目录，并继续检查目录模板；每个组件仍需要逐个通过组件模板、测试、可访问性和包体检查。
