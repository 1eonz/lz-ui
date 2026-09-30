---
title: Badge
group: Data Display
---

<code src="../../../../docs/demos/badge.tsx"></code>

用于计数、点状状态或文本状态。`overflowCount`、`showZero` 和 `status` 可控制显示；状态文本仍应提供，不以颜色作为唯一信息。

组件直接使用 AntD 根节点，`ref` 指向 Badge 容器；不会增加改变 inline/flex 排版的包装层。`title` 可为数字或状态补充可访问的文字说明。

## 演示与验证边界

此示例映射 `UI/P0 基础组件-Data Display/` 中的对应组件场景。顶部开关只作用于当前演示，可切换明暗、舒适/紧凑密度以及三种外观。数据与操作均在本地 React 状态中运行，不发送网络请求；加载/失败控件用于显式切换展示状态。服务端请求、权限及持久化仍由宿主实现。真实浏览器的主题、键盘和窄屏验收以批次评审记录为准。
