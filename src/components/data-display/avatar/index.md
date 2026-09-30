---
title: Avatar
group: Data Display
---

<code src="../../../../docs/demos/avatar.tsx"></code>

用于人员或实体识别。AntD 的 `onError` 可提供图片失败回退；为避免布局跳动，请为异步头像预留尺寸。`AvatarGroup` 支持受控的最大数量和省略计数。

单个 `Avatar` 的 `ref` 指向实际头像根节点；`AvatarGroup` 因 AntD 未提供 DOM ref，`ref` 指向 lx-ui 的稳定行内容器。该容器为 inline-block，不改变头像组的横向占位语义。

## 演示与验证边界

此示例映射 `UI/P0 基础组件-Data Display/` 中的对应组件场景。顶部开关只作用于当前演示，可切换明暗、舒适/紧凑密度以及三种外观。数据与操作均在本地 React 状态中运行，不发送网络请求；加载/失败控件用于显式切换展示状态。服务端请求、权限及持久化仍由宿主实现。真实浏览器的主题、键盘和窄屏验收以批次评审记录为准。
