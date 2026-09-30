# 项目架构

## 1. 架构目标

lx-ui 需要同时满足三件事：对业务开发者足够简单，对组件维护者足够可扩展，对最终用户足够快。首版采用单包工程和清晰子路径出口，先控制认知成本；当业务组件的边界稳定后，再按真实依赖拆包。

## 2. 模块分层

```text
src/index.ts                 # lx-ui 主入口
src/antd.ts                  # 原生 antd5 过渡出口
src/business.ts              # business 组件出口
src/components/*             # 具体组件，按领域分类
src/theme/*                  # token、主题、模式和运行时协议
src/styles/*                 # reset、cascade layer 和全局样式
src/utils/*                  # 无 UI 的可复用工具
```

### 2.1 主入口

主入口只导出稳定的 lx-ui API。它不把每个内部文件都暴露出去，否则任何文件移动都会变成破坏性变更。

### 2.2 组件层

基础组件依赖主题、样式和工具；business 组件可以依赖基础组件和公开 token，但不能反向被基础组件依赖。组件内部实现细节留在目录内，只有经过评审的类型、组件和必要工具才进入出口。

### 2.3 主题层

主题层负责把 `appearance`、`colorPreset`、`mode` 和 `density` 转成语义 token、CSS Variables 和 Ant Design 5 的 `ConfigProvider` token。它不负责请求、路由、权限和业务状态。

### 2.4 适配层

Ant Design 5 是底座，不是业务 API。需要重命名、状态补齐或业务组合时，在 lx-ui 组件层完成；需要处理 AntD token 或公开 API 差异时集中在 adapter，避免适配逻辑散落在每个组件。

## 3. 单包的优点和代价

### 优点

- 新成员可以从一个 `package.json`、一个文档站和一套脚本开始。
- 组件、样式、文档相邻，适合个人和小团队快速迭代。
- 通过 `exports` 和独立入口仍然可以按需引入，不必一开始承担 monorepo 的发布和版本同步成本。
- 业务组件先在同一个仓库验证，API 稳定后再拆包有真实依据。

### 代价

- 基础组件和业务组件共享版本号，发布节奏需要更谨慎。
- 需要严格维护入口和依赖方向，否则单包容易变成互相引用的大目录。
- business 组件不能自行快速发版，必须遵守主包质量门槛。

### 未来拆包条件

同时满足以下条件时再考虑拆包：business 组件被至少两个项目使用、基础组件和业务组件发布节奏明显不同、或独立安装 business 能明显减少主包体积。拆包优先顺序为 `lx-ui-business`，再考虑 `lx-ui-icons` 或 `lx-ui-theme`。

## 4. 构建架构

```text
src/index.ts
   ├─ TypeScript / JSX 编译
   ├─ ESM 构建，保留模块边界
   ├─ CJS 构建，兼容旧工具链
   ├─ d.ts 生成
   ├─ CSS 提取
   └─ UMD 构建（单独的 standalone 入口）
```

普通 npm 产物将 React、ReactDOM、Ant Design 作为外部 peer dependency，避免业务项目重复加载。脚本直引使用单独的 standalone UMD，明确接受更大的文件体积，并记录 gzip/brotli 大小。

Dumi 只负责文档站。文档 demo 可以导入源码，但不得让 demo 专用依赖进入 library 构建入口。

## 5. 主题架构

主题采用三层 token：

1. 原始 token：基础色、字体、间距和几何值。
2. 语义 token：文字、表面、边框、交互和状态。
3. 组件 token：按钮、输入框、表格、弹框等组件的局部变量。

这样做的优点是组件不需要知道具体品牌颜色，切换主题时只更新 token；缺点是初始设计需要先建立完整的 token 命名，并且设计稿和代码必须同步维护 token 表。

`LxConfigProvider` 计划同时渲染 lx-ui 的 CSS Variables 和 Ant Design 5 的 `ConfigProvider`，但不让业务项目直接操作内部 style tag。持久化恢复、系统明暗模式和 SSR 防闪烁都集中在主题层。

## 6. 扩展点

- 主题：增加新主题色只新增 preset 和 token 校验，不修改每个组件。
- 风格：增加 appearance 只扩展 style token，不复制组件实现。
- 业务组件：通过组合基础组件和 render props 扩展，不把请求和权限写进核心组件。
- 图标：通过明确的 icon 类型和按需入口扩展，不把整套图标默认打入主包。
- 国际化：组件只消费 locale 和格式化函数，中文文案不硬编码在状态逻辑中。

## 7. 架构风险

| 风险                   | 影响                         | 预防                             |
| ---------------------- | ---------------------------- | -------------------------------- |
| 入口通配符导出         | 名称覆盖、tree-shaking 失效  | 公开入口使用显式导出             |
| 过度依赖 antd 私有结构 | antd 升级时样式和行为崩溃    | 适配逻辑集中，优先使用公开 API   |
| 业务逻辑进入基础组件   | 基础包难以复用和测试         | 业务请求、权限和路由留在宿主项目 |
| 主题 token 分散        | 三种风格和暗色模式出现不一致 | token 单一来源和主题矩阵验收     |
| 先做视觉再补状态       | error、focus、loading 被遗漏 | 组件模板要求状态清单先行         |
| standalone UMD 过大    | 脚本直引首屏变慢             | 独立产物、体积预算和按页面加载   |
