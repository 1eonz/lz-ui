# Skeleton

<code src="../../../../docs/demos/skeleton.tsx"></code>

用于异步内容的结构化占位，减少加载完成时的布局跳动。`loading` 为 `true` 时显示骨架，为 `false` 时渲染 `children`；宿主应让两种状态保持相同的容器尺寸，并在请求失败时切换到带恢复操作的错误状态。

```tsx
import { Skeleton } from 'lx-ui';

<Skeleton loading={loading} active avatar paragraph={{ rows: 3 }}>
  <Article />
</Skeleton>;
```

`active` 只控制视觉扫光，不表达请求状态。组件在 loading 时设置 `role="status"` 和 `aria-busy`；占位块不逐个进入屏幕阅读器树。可传 `aria-label` 或 `aria-describedby` 描述区域用途。`prefers-reduced-motion: reduce` 下动画自动关闭。AntD 的 `Skeleton.Button`、`Avatar`、`Input`、`Image` 和 `Node` 等组合组件仍通过 `lx-ui/antd` 按需使用。

组件 ref 指向稳定的外层区域。loading 切换不会依赖 AntD 私有节点；宿主应让 children 与骨架结构保持近似尺寸，避免内容切换时产生布局跳动。

| 属性                              | 类型          | 默认值  | 说明                                     |
| --------------------------------- | ------------- | ------- | ---------------------------------------- |
| `loading`                         | `boolean`     | `true`  | 显示骨架还是 children                    |
| `active`                          | `boolean`     | `false` | 启用扫光动画； reduced motion 下静态显示 |
| `avatar` / `title` / `paragraph`  | AntD 公共类型 | -       | 匹配真实内容的占位结构                   |
| `aria-label` / `aria-describedby` | HTML 属性     | -       | 加载区域的可读说明                       |

无请求、缓存、重试或错误状态由组件管理；避免在大量列表中无界渲染骨架行。

## 演示与验证边界

此示例映射 `UI/P0 基础组件-Data Display/` 中的对应组件场景。顶部开关只作用于当前演示，可切换明暗、舒适/紧凑密度以及三种外观。数据与操作均在本地 React 状态中运行，不发送网络请求；加载/失败控件用于显式切换展示状态。服务端请求、权限及持久化仍由宿主实现。真实浏览器的主题、键盘和窄屏验收以批次评审记录为准。
