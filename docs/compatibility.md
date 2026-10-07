# 版本兼容与升级边界

当前 peer 声明为 React/ReactDOM `>=18 <20`、Ant Design `>=5.24 <6`。React 与 AntD 由宿主提供，不进入普通 ESM/CJS 产物。项目锁定的开发版本只证明该环境可编译，不代表所有 peer 组合已验证。

## Ant Design 最低版本

2026-09-30 将原 `>=5` 收敛为 `>=5.24`。Alert 的公开 `nativeElement` ref 从 5.17 才出现，Progress 的 ref 也并非全部 5.x 都存在；继续接受所有 5.x 会让类型和实际实例契约不一致。采用现有开发依赖 5.24 的最低基线，优点是统一公开 API 和主题 token，减少兼容分叉；代价是更早的 5.x 项目需升级。

宿主升级时先更新 AntD，再验证日期、表单、弹层、表格和主题。不要用 `--force` 忽略 peer 冲突。`lx-ui/antd` 转出与宿主相同实例，不能被当作另一份独立 AntD 运行时。

## Tag 与 Table 尺寸 token 迁移

本批只增加可选样式扩展点，不改变组件 Props、事件、ref 或 AntD peer 范围。普通 Tag 的最小高度归一为 26px，可通过主题 Provider 的 `style` 或局部 CSS scope 覆盖 `--lx-tag-height`；该 token 只设最小值，较高内容仍可撑开标签。默认/large 非虚拟 Table 的普通单行基础高度为 comfortable/compact 的 48/36px，表头基础高度为 36px；粗指针设备下会按至少 44px 的操作目标重算行高和单元格内距，因此纯文本行、含控件的紧凑短行和表头实际至少满足 44px，舒适短行约为 48px。长内容仍自然增高，使用固定容器高度或依赖旧视觉尺寸的页面应复查。

Table 的默认/large 行高和 36px 表头 token 仅由非虚拟表格使用；有效尺寸按显式 `size` 优先、其次 AntD `ConfigProvider.componentSize` 继承解析。显式或继承的 `middle`/`small` 与 `virtual` 保留 AntD/宿主尺寸责任。宿主可按主题子树覆盖 `--lx-table-row-height`、`--lx-table-header-height` 和 `--lx-tag-height`，无需增加组件属性。Table 受控选择搭配 `preserveSelectedRowKeys` 时，筛选隐藏的 key 仍会计入完整选择数；宿主可提供清除选择动作。

| 组合                     | 验证状态       | 必须包含的证据                              |
| ------------------------ | -------------- | ------------------------------------------- |
| React 18 + 当前锁定 AntD | 待本轮全量门禁 | 类型、行为测试、库与文档构建、消费 smoke    |
| React 18 + AntD 5.24.0   | 待最低版本验证 | 独立安装、公开类型、SSR/ref 语义、产物消费  |
| React 19 + AntD 5.24.0   | 待发布批次     | React 19 消费构建、SSR/hydration 和真实交互 |

## 尚未验收的能力

UMD/JS 直引、React 19 消费和完整浏览器主题矩阵仍属于发布门禁。静态 review、单元测试或 peer 范围声明不能替代这些证据。浏览器工具拒绝访问本地页面时保留待验证状态，不以其它浏览器入口绕过安全限制。
