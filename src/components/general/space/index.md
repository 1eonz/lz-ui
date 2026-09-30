# Space 间距

<code src="../../../../docs/demos/space.tsx"></code>

使用 flex `gap` 排列子元素，子元素无需自行补 margin。`size` 可用 `small`（8px）、`middle`（16px）、`large`（24px）或数值；数组依次指定水平、垂直间距。`wrap` 用于窄容器自动换行，`block` 占满容器。

```tsx pure
<Space size="middle" wrap split={<Divider type="vertical" />}>
  <Button>保存</Button>
  <Button>取消</Button>
</Space>
```

`split` 是纯视觉分隔，不应承载可操作内容；对于有语义的分组请使用结构化 HTML。启用 `wrap` 时，分隔符会与后一个子元素组成不可拆分的 inline-flex 组，避免窄容器换行后出现孤立分隔符；这会让该组整体换行，属于可预测的空间取舍。
