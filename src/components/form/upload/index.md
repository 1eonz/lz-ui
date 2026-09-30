# Upload

<code src="../../../../docs/demos/upload.tsx"></code>

Upload is a local file picker by default. Without `action` or `customRequest`, `beforeUpload` returns `false`, so files remain in the local `fileList` and no request is made. Supply `customRequest` or `action` when the host owns transport; the default then allows AntD's upload lifecycle, including `onChange` progress and failure states.

```tsx
<Upload multiple onChange={({ fileList }) => setFiles(fileList)}>
  <Button>选择文件</Button>
</Upload>
```

Controlled `fileList`, `disabled`, `accept`, `maxCount`, `onRemove`, and other AntD public props pass through. The ref is valid while mounted and can focus or open the picker. Validate size and type in `beforeUpload`; show recovery actions around the control for failed requests.

When neither `action` nor `customRequest` is supplied, the wrapper defaults `beforeUpload` to `false` and keeps the selected files local. Supplying either transport prop enables AntD's upload lifecycle; an explicit `beforeUpload` always takes precedence, so returning `true` without transport can re-enable an unintended request path. Prefer an explicit `customRequest` for authenticated APIs and map the resulting file object to a server file ID before submitting business data.
