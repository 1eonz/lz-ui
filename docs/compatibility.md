# 版本兼容与升级边界

当前 peer 声明为 React/ReactDOM `>=18 <20`、Ant Design `>=5.25 <6`。React 与 AntD 由宿主提供，不进入普通 ESM/CJS 产物。项目锁定的开发版本只证明该环境可编译，不代表所有 peer 组合已验证。

## Ant Design 最低版本

2026-09-30 将原 `>=5` 收敛为 `>=5.24`。Alert 的公开 `nativeElement` ref 从 5.17 才出现，Progress 的 ref 也并非全部 5.x 都存在；继续接受所有 5.x 会让类型和实际实例契约不一致。采用现有开发依赖 5.24 的最低基线，优点是统一公开 API 和主题 token，减少兼容分叉；代价是更早的 5.x 项目需升级。

2026-10-12 将当前最低基线提高至 `>=5.25`。精确发布包 `antd@5.24.0` 的声明文件不含 `Tooltip.destroyOnHidden` 和 `Select.popupRender`，`antd@5.25.0` 已公开这两个属性；Tooltip 文档与 Select 迁移入口使用这些公开 API。Empty、Tooltip、Descriptions 的部分 `classNames`/`styles` 语义槽在 5.24 已存在，不作为提高最低版本的依据。继续接受 5.24 会让宿主面对缺失的类型/运行时契约。代价是 AntD 5.24 宿主需先升级；最低版本的类型、运行时与 SSR 消费验证仍需单独执行。

宿主升级时先更新 AntD，再验证日期、表单、弹层、表格和主题。不要用 `--force` 忽略 peer 冲突。`lx-ui/antd` 转出与宿主相同实例，不能被当作另一份独立 AntD 运行时。

## Badge Ribbon 与状态尺寸

`Badge.Ribbon` 通过 AntD 5 根入口 `Badge` 的公开静态成员转出，`RibbonProps` 从 `ComponentProps<typeof AntBadge.Ribbon>` 推导，不依赖 `antd/es/*` 路径。它沿用 AntD 的 `text`、`color`、`placement`、`children`、`className`、`rootClassName` 和 `style` 契约；升级 AntD 时需检查静态成员和声明文件仍可从根入口使用。

Badge 状态点通过 AntD 公开 `statusSize` 主题 token 固定为 10px。processing 脉冲使用 lx 自有 `--lx-badge-processing-duration`，默认 1500ms；宿主可在 `LxConfigProvider` 的 `style` 属性或其子树中的 CSS scope 设置该自定义属性覆盖周期。reduced-motion 会将周期归零。升级 AntD 后复核 `statusSize` 是否仍被公开支持、状态点实际尺寸是否保持 10px，并确认 CSS 动效仍读取该变量；若消费方自行覆盖状态点大小或动画时长，应检查新默认值对现有视觉的影响。

## Tag 与 Table 尺寸 token 迁移

本批只增加可选样式扩展点，不改变组件 Props、事件、ref 或 AntD peer 范围。普通 Tag 的最小高度归一为 26px，可通过主题 Provider 的 `style` 或局部 CSS scope 覆盖 `--lx-tag-height`；该 token 只设最小值，较高内容仍可撑开标签。默认/large 非虚拟 Table 的普通单行基础高度为 comfortable/compact 的 48/36px，表头基础高度为 36px；粗指针设备下会按至少 44px 的操作目标重算行高和单元格内距，因此纯文本行、含控件的紧凑短行和表头实际至少满足 44px，舒适短行约为 48px。长内容仍自然增高，使用固定容器高度或依赖旧视觉尺寸的页面应复查。

Table 的默认/large 行高和 36px 表头 token 仅由非虚拟表格使用；有效尺寸按显式 `size` 优先、其次 AntD `ConfigProvider.componentSize` 继承解析。显式或继承的 `middle`/`small` 与 `virtual` 保留 AntD/宿主尺寸责任。宿主可按主题子树覆盖 `--lx-table-row-height`、`--lx-table-header-height` 和 `--lx-tag-height`，无需增加组件属性。Table 受控选择搭配 `preserveSelectedRowKeys` 时，筛选隐藏的 key 仍会计入完整选择数；宿主可提供清除选择动作。

## Button 尺寸映射

lx-ui 将 Button 的 AntD `controlHeightLG` 设为 40px，以对齐 General 专用设计；同一主题返回的全局 `token.controlHeightLG` 仍为 48px，其他 AntD 组件不受影响。省略 `size` 时由 lx 包装层按 density 使用 comfortable 40px、compact 32px，并显式使用自己的默认档位，因此宿主 `ConfigProvider.componentSize` 不覆盖省略解析；显式 `size="middle"` 固定 32px，`small` 固定 24px，`large` 固定 40px。若宿主曾依赖 AntD Button 默认 middle 的 comfortable 高度或 large 的其他高度，升级后应显式检查并按组件 `style` 或宿主主题调整；不要修改全局 `controlHeightLG` 来影响所有组件。迁移前检查固定高度容器、垂直对齐和连续按钮组。

| 组合                     | 验证状态                    | 必须包含的证据                              |
| ------------------------ | --------------------------- | ------------------------------------------- |
| React 18 + 当前锁定 AntD | 本轮源码门禁通过            | 类型、行为测试、库构建与文档构建            |
| React 18 + AntD 5.25.0   | 最低版本独立消费 smoke 通过 | tarball 类型、SSR、公开槽位、ref 与产物消费 |
| React 19 + AntD 5.25.0   | 待发布批次                  | React 19 消费构建、SSR/hydration 和真实交互 |

2026-10-12：`npm pack` 生成当前工作树包后，在项目内 `.codex/consumer-antd-525-final-20261012` 独立安装夹具中固定 `react@18.3.1`、`react-dom@18.3.1` 与精确 `antd@5.25.0`。TypeScript 5.7.2 对 `popupRender`、`destroyOnHidden`、公开语义样式槽、Skeleton 与 Tooltip ref 类型检查通过；CommonJS 运行时 SSR、Empty/Descriptions 语义槽、Tooltip `nativeElement` ref，以及 Skeleton 加载完成后移除 `role`/`aria-busy`/`aria-label` 均通过。该消费 smoke 不代表 React 19、UMD 或生产浏览器矩阵已验收。

## 尚未验收的能力

UMD/JS 直引、React 19 消费和完整浏览器主题矩阵仍属于发布门禁。静态 review、单元测试或 peer 范围声明不能替代这些证据。浏览器工具拒绝访问本地页面时保留待验证状态，不以其它浏览器入口绕过安全限制。
