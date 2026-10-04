# lx-ui 项目脑图

这张脑图是开发者进入仓库后的总览。它描述公开入口、主题系统、组件分层、文档质量链路和首批交付顺序；组件实现完成后，新增模块仍应先更新这里对应的分支。

```mermaid
mindmap
  root((lx-ui))
    使用入口
      lx-ui
        主题 Provider
        P0 基础增强组件
        稳定类型与 CSS
      lx-ui/antd
        Ant Design 5 显式转出
        迁移与补充能力
      lx-ui/business
        ProTable 规划中
        SearchForm 规划中
        QuickField 规划中
        PageContainer 规划中
      style.css
        token 与全局层
      UMD
        外置 React/antd 规划中
        standalone 直引版规划中
    主题系统
      LxConfigProvider
        appearance
          business 商务稳重
          soft 轻盈现代
          glass 玻璃液态
        colorPreset
          6 个标准主题色
            blue
            orange
            green
            purple
            cyan
            rose
        palettePreset
          7 组东方双配色
        mode
          light
          dark
          system
        density
          comfortable 40px
          compact 32px
        持久化与 SSR 防闪烁
      Token 三层
        原始 token
        语义 token
        组件 token
      CSS Variables
        --lx-* 前缀
        CSS Modules
        cascade layers
    组件层
      General
        Button
        Icon
        Typography
        Space
        Divider
      Form
        Form
        Input
        InputNumber
        Select
        DatePicker
        Checkbox
        Switch
        FormItem
        DynamicForm
        Radio
        Upload
        校验与可访问性
      Data Display
        Pagination
        Table
        Tree
        Tag/Badge
        List
        Descriptions
        Empty/Skeleton（已公开）
      Feedback
        Alert
        Spin/Progress
        2A 区域反馈
          Alert
          Spin
          Progress
        2B 非交互提示
          Tooltip（代码已交付，完整视觉矩阵待补）
          hover/focus
          aria-describedby 合并
        锚定交互弹层（架构待定）
          可访问的锚定对话框能力
          Popover（依赖就绪后）
          Popconfirm（依赖就绪后）
        Modal/Drawer
        Message/Notification
      Navigation
        Tabs/Menu
        Breadcrumb
        Steps
      Layout
        Layout
        Flex/Grid
      Business
        ProTable
        SearchForm
        QuickField
        PageContainer
        业务请求与权限由宿主注入
    依赖方向
      公开入口
        ↓
      business 与基础组件
        ↓
      theme / styles / utils
        ↓
      React 18/19 + antd 5.24以上 peerDependencies
      禁止反向依赖
        基础组件不得依赖 business
        theme 不依赖路由/请求/权限
        runtime 不依赖 Dumi/examples
        不读取 antd 私有 DOM
    文档与设计
      design.md
        范围与决策基线
      docs
        architecture
        project-rules
        performance
        animation
        testing
        release
        ui-design-gate
        impeccable-workflow
        impeccable-audit
        p0-execution-plan
        design-review
        design-correspondence
        compatibility
        project-mindmap
      组件目录相邻文档
        index.tsx
        index.module.css
        index.md
        types.ts
        __tests__
      UI 设计输入
        Token 规范
        主题矩阵
        P0/P1 组件稿
        交互与无障碍状态
    质量与发布
      format
        Prettier
        ESLint
        TypeScript strict
      test
        Vitest
        Testing Library
        axe 规划中
        视觉回归规划中
      独立复审
        gpt-6-luna max 实施
        gpt-6-luna max 独立复审
        修改后独立复审
        代码与视觉分开验收
      单组件文档
        独立可运行场景
        源码按需展开
        Props默认值与事件
        ref方法与边界
        文档源码严格类型检查
        Dumi路由构建
        浏览器证据单独验收
      build
        ESM/CJS
        d.ts
        CSS
        UMD 规划中
        exports 检查
      release
        SemVer
        变更记录和待接入的 Changesets
        npm 私库
        release guard
        体积预算
    首批路线
      0 Foundation
        主题协议与入口
        文档和脚手架门禁
      1 主题运行时
        Provider
        6 基础色/7 东方色/3 风格/明暗/密度
      2 P0 基础
        General
        Form primitives
          Input/Select/InputNumber
          DatePicker
          FormItem
          Checkbox/Switch
          Radio/Upload
        Data Display
        Feedback
        Navigation/Layout
      3 P0 业务
        SearchForm
        QuickField
        PageContainer
        ProTable
      4 验收发布
        真实 ERP/CRM 页面
        键盘/对比度/reduced motion
        包体与构建矩阵
```

## 动态表单在脑图中的位置

`DynamicForm` 是 P0 业务组件，但必须建立在 P0 Form 基础组件之上。它接收字段描述数组和可选的字段注册表，负责布局、联动、校验展示和提交值整理；请求、权限、字典加载和业务 API 由宿主传入。这样可以复用基础字段，同时避免把业务协议写死在组件库里。

旧版 `lxComponent` 的 `quick-field`、虚拟表格、树形部门选择和组件相邻文档会作为经验输入；旧版 AntD4/Less/业务请求耦合不进入 lx-ui 运行时。

建议首版字段描述至少覆盖 `text`、`textarea`、`number`、`select`、`date`、`dateRange`、`checkbox`、`radio`、`switch`、`upload` 和自定义 `render`。进入编码前仍需确认异步选项、字段联动、数组字段、分组/步骤、默认值和错误回填协议。

## 设计稿与代码的关系

`UI/` 下的 `DESIGN.md`、`screen.png` 和 `code.html` 是 Stitch 设计输入与评审证据，不是 npm 运行时代码。实现时只提取已确认的 token、状态和交互规则，不能直接把 Tailwind CDN、Google Fonts 或设计稿脚本带入组件产物。
