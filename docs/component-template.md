# 组件开发模板

Stitch 完成设计并通过评审后，组件按下面的模板落地。模板的目的不是增加文件数量，而是让实现、文档、测试和设计状态一一对应。

## 1. 创建前检查

- 组件是否解决至少两个真实场景，且变化点已经稳定？
- 是否能通过组合已有组件完成？如果能，优先组合而不是新增组件。
- 是否有设计稿中的 token、状态、尺寸、密度、明暗、风格和动画说明？
- 是否明确受控/非受控、ref、键盘、焦点、错误、loading、empty 和 reduced motion 行为？
- 是否会引入新依赖、全局样式或 AntD 私有结构？

## 2. 目录模板

```text
component-name/
├─ index.tsx
├─ index.module.css
├─ index.md
├─ types.ts
├─ utils.ts                 # 只有逻辑真正跨文件时才创建
├─ constants.ts             # 只有稳定常量才创建
└─ __tests__/
   ├─ index.test.tsx
   └─ accessibility.test.tsx    # 新交互模式必须提供
```

### 文件职责

- `index.tsx`：组件实现、公开 ref 和本目录出口。
- `index.module.css`：局部样式，只引用 token，不重复硬编码主题值。
- `index.md`：Dumi 文档、示例、API、状态和使用限制。
- `types.ts`：公开 Props、事件和 ref 类型。
- `utils.ts`：与 UI 无关、可以独立测试的纯函数。
- `__tests__`：测试公开行为，不测试私有 state 名称或 DOM 层级细节。

公开组件、类型、事件与 ref 使用 JSDoc 说明用途、默认值、边界和扩展方式。复杂逻辑的注释解释竞态、取舍或兼容原因，不逐行翻译代码；具体规则以 `docs/project-rules.md` 第 4.2 节为准。

## 3. 实现顺序

1. 先写公开类型和最小示例。
2. 写语义 HTML 和键盘操作。
3. 接入 token 和 CSS Modules。
4. 写状态逻辑和受控/非受控行为。
5. 加入动画和 reduced motion 分支。
6. 完成 loading、empty、error、disabled、focus 和边界状态。
7. 写测试、文档和发布出口。

## 4. 文档最小内容

相邻 `index.md` 不是实现摘要，必须像组件官网一样让开发者先观察真实效果，再按需查看完整源码和 API。Dumi 当前 `codeBlockMode: 'passive'`，普通代码块与 `tsx pure` 不会运行；每个场景必须显式使用 `<code src>` 挂载 `docs/demos/` 下的独立文件。源码默认收起，组件预览保持可见；不得把一个综合业务示例当作所有组件的专属文档。

每个示例通过共享局部主题容器引入 `src/style.css`，保证直接打开路由时也加载基础字体、token 回退和 reduced motion。容器不持久化主题，不重置业务状态；受控演示必须更新值，工具按钮必须有真实操作。

- 组件用途和不适用场景。
- 基础示例和最小 API。
- 受控/非受控示例。
- 风格、主题色、明暗和密度示例。
- loading、empty、error、disabled 和 keyboard 示例。
- Props、事件、ref、默认值、边界和迁移提示。
- 性能注意事项，例如大数据量、虚拟化和请求取消。

Props 表固定包含参数名、准确类型、默认值与说明；事件表列出回调参数和触发时机；ref 表明确实例或 DOM 归属，以及每个方法的示例和挂载限制。没有方法时明确说明，不虚构 `focus/open` 等能力。最小使用代码必须包含正确 import、样式、Provider 和表单上下文，不能引用未公开静态成员。所有项目自有示例注释使用中文。

文档验收顺序为：`npm run typecheck:docs` 检查公开 API 用法，Dumi 构建确认 demo 路由生成，真实浏览器检查效果与交互，独立复审确认参数与实现一致。源码检查或构建通过不能替代真实视觉验收。

## 5. 组件完成条件

组件只有同时满足代码、设计、文档、测试、可访问性和包体检查，才可以从分类出口进入 `src/index.ts`。
