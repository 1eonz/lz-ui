# Empty

<code src="../../../../docs/demos/empty.tsx"></code>

用于列表、表格和页面内容没有可展示数据时的中性状态。数据请求、权限判断和恢复动作由宿主负责；`action` 可以放置 `Button` 或链接。

```tsx
import { Button } from 'lx-ui';
import { Empty } from 'lx-ui';

<Empty description="暂无采购单" action={<Button type="primary">新建采购单</Button>} />;
```

`description` 支持文本或 ReactNode，不能只依赖插画表达状态。`variant="small"` 适合表格或列表内嵌空状态。`action` 优先于 AntD `children` 作为 footer；不需要操作时省略两者。组件没有受控值、请求或重试状态，也不添加 aria-live 播报。操作元素沿用原生 Button/Link 的键盘和焦点语义。

组件 ref 指向 lx-ui 的稳定外层容器；它不会暴露 AntD 内部节点。异步数据更新由宿主在合适的区域使用 live region 或状态消息播报。

| 属性                   | 类型                   | 默认值        | 说明                                    |
| ---------------------- | ---------------------- | ------------- | --------------------------------------- |
| `description`          | `ReactNode`            | AntD 默认文案 | 状态说明                                |
| `action`               | `ReactNode`            | -             | 恢复、创建或重试操作，优先于 `children` |
| `variant`              | `'default' \| 'small'` | `'default'`   | 小尺寸嵌入式展示                        |
| `image` / `imageStyle` | AntD 公共类型          | -             | 自定义插画或图像                        |

主题、明暗模式和密度由 `LxConfigProvider` 的 token 控制。长文案会自然换行；窄容器应由宿主提供可用宽度。

## 演示与验证边界

此示例映射 `UI/P0 基础组件-Data Display/` 中的对应组件场景。顶部开关只作用于当前演示，可切换明暗、舒适/紧凑密度以及三种外观。数据与操作均在本地 React 状态中运行，不发送网络请求；加载/失败控件用于显式切换展示状态。服务端请求、权限及持久化仍由宿主实现。真实浏览器的主题、键盘和窄屏验收以批次评审记录为准。
