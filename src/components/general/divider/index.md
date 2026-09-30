# Divider 分割线

<code src="../../../../docs/demos/divider.tsx"></code>

无标题的水平分隔使用原生 `hr`，带标题的分隔使用 `role="separator"`；垂直分隔用于同一工具栏内相邻操作。线条颜色随浅色、深色及外观主题切换。

```tsx pure
<Divider orientation="left">客户资料</Divider>
<Space><Button>编辑</Button><Divider type="vertical" /><Button>导出</Button></Space>
```

`variant` 支持 `solid`、`dashed`、`dotted`。垂直分隔忽略 `children`，避免把标题塞进窄线条中。
