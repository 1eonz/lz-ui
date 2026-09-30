# Typography 排版

<code src="../../../../docs/demos/typography.tsx"></code>

`Text`、`Title`、`Paragraph`、`Link` 分别使用 `span`、`h1` 到 `h5`、`p`、`a`，保持原生文档语义。`Typography.Text` 等命名空间形式也可用。状态色与标题层级沿用主题 token，`ellipsis` 支持单行和 `{ rows }` 多行截断；截断只作用于文本子层，复制按钮和状态播报仍保持可用。

```tsx pure
<Title level={2}>客户资料</Title>
<Paragraph type="secondary">已同步的客户信息</Paragraph>
<Text copyable={{ text: 'KH-1024' }}>KH-1024</Text>
<Link href="/customers">查看客户</Link>
```

复制富文本时请显式提供 `copyable.text`；复制按钮会报告成功或失败，文本变化会使旧的异步复制结果失效，连续成功会重复播报。`onCopy` 回调异常不会伪装成剪贴板失败。`disabled` 链接移除 `href` 与 Tab 焦点。截断会隐藏超出的视觉内容，关键信息不宜仅以截断文本传达。标题字号使用 `--lx-font-size-heading-1` 到 `--lx-font-size-heading-5` 主题变量。
