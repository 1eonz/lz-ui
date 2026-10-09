# ADR-0006：Button 尺寸与密度的映射

## 状态

已接受

## 背景

General 专用稿的尺寸表给出 Large 40px、Middle 32px、Small 24px；主题密度规范规定未指定尺寸的 comfortable 控件基线 40px、compact 基线 32px。AntD Button 默认会读取宿主 `ConfigProvider.componentSize`，但 lx 包装层会把省略 `size` 显式解析为自己的默认档位，保持 lx density 协议稳定；宿主 componentSize 不覆盖省略解析。

## 决策

- 省略 `size` 时由 lx 包装层显式使用默认档位，并按 density 解析为 comfortable 40px、compact 32px；宿主 `ConfigProvider.componentSize` 不覆盖该解析。
- 显式 `size="middle"` 始终固定为 32px，覆盖宿主的 componentSize；General 尺寸表中的 Middle 32px 在 comfortable 下也保持不变。
- 显式 `size="small"` 固定为 24px，`size="large"` 固定为 40px；三种显式档位均不随 density 改变。
- 只覆盖 `components.Button.controlHeightLG=40`；共享 `token.controlHeightLG=48` 和 `--lx-control-height-large=48px` 保持原值。

## 原因与代价

该映射让省略尺寸的按钮跟随 lx density，同时把显式档位固定为 General 规格；Button 的 large 视觉尺寸可准确遵循组件稿而不改变其他 AntD 大控件。代价是宿主 `ConfigProvider.componentSize` 不再影响 lx Button 的省略尺寸，且显式 middle 与 AntD 默认 middle 的 comfortable 高度不同；文档与兼容说明必须同步，浏览器测试需检查四种档位的实际按钮盒高，而不只比较 token。

## 验收要求

- 实测 comfortable 与 compact 下省略 `size`、显式 `middle`、`small`、`large` 的实际按钮盒高分别为 40/32px、32px、24px、40px，并验证宿主 `componentSize` 不覆盖省略解析。
- 验证 `components.Button.controlHeightLG=40`，同时根 token 的 `controlHeightLG` 与 `--lx-control-height-large` 为 48。
- 更新 Button 文档、主题映射、设计对应关系、变更记录与兼容说明。

## 重新评估条件

若后续设计明确改变 middle 的 32px 固定规格、未指定尺寸的 density 映射，或 AntD 公共 API 改变 default/middle 关系，重新评估 size 解析方式、兼容成本与对应测试；不通过额外 CSS selector 或全局 token 覆盖临时绕开。
