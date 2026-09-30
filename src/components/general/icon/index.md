# Icon 图标

<code src="../../../../docs/demos/icon.tsx"></code>

图标来源由业务按需导入后传给 `component`，组件库不打包整套图标。单独使用的装饰图标默认从辅助技术隐藏；传入 `label` 或 `title` 后以图片语义暴露。交互图标应放进 Button 或链接中，由父控件承担焦点与键盘行为。

```tsx pure
import { SearchOutlined } from '@ant-design/icons';
import { Icon } from 'lx-ui';

<Icon component={SearchOutlined} label="搜索" size={18} />;
```

`spin` 尊重系统的减少动态效果设置。`rotate` 仅作用于内部 SVG，不改变外层占位尺寸。
