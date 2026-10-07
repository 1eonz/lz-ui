---
title: Upload 文件选择
group: Form
demo:
  defaultShowCode: false
---

# Upload 文件选择

默认只选择并保留本地文件，不发起网络请求。服务端传输、认证、失败恢复和服务器文件 ID 均由宿主负责。

## 最小使用

```tsx pure
import { Button, LxConfigProvider, Upload } from 'lx-ui';
import 'lx-ui/style.css';

export default function Demo() {
  return (
    <LxConfigProvider theme={{ persist: false }}>
      <Upload>
        <Button>选择本地附件</Button>
      </Upload>
    </LxConfigProvider>
  );
}
```

## 示例

### 默认本地与禁用

选择文件后加入列表，无action/customRequest，包装层默认beforeUpload=false；不会产生伪上传进度。

<code src="../../../../docs/demos/form-doc-upload-basic.tsx" title="本地选择"></code>

### 受控列表与移除

fileList通过onChange更新；列表移除与清空真实修改当前数据，不调用网络。

<code src="../../../../docs/demos/form-doc-upload-controlled.tsx" title="受控文件"></code>

### 类型、大小和数量限制

accept仅是文件选择器提示；beforeUpload验证PDF与2MB限制。不合格返回公开AntD LIST_IGNORE，合格返回false保持本地；最多保留2项。

<code src="../../../../docs/demos/form-doc-upload-limit.tsx" title="文件限制"></code>

### 宿主网络传输与恢复

示例默认关闭网络传输，服务端地址初始为同源 `/api/uploads`。文件可拖放到区域或通过键盘可用的按钮选择。启用后新选文件会发送到配置地址；已暂存文件需单独点击“上传到服务端”。请求使用浏览器 `multipart/form-data`，字段名为 `file`；成功响应需包含 1–128 位安全单路径 `fileId`：首位为字母、数字、下划线或连字符，后续可含点和波浪线，不含路径分隔符或转义字符。删除已上传项会请求该文件上传时的服务端地址下的 `/{fileId}`；删除前当前地址输入值也必须有效，否则文件保留，修正地址后可重试。HTTP 失败、重试和删除失败均在列表内保留恢复操作。

<code src="../../../../docs/demos/upload-network.tsx" title="宿主网络传输"></code>

#### 操作路径

1. 保持网络开关关闭时选择文件，只暂存到当前页面，不会发起请求。
2. 填写服务端地址并启用网络传输；之后新选文件会直接上传。
3. 单独上传已暂存文件；失败时保留原文件和重试操作。
4. 删除已上传文件时调用远端删除接口；失败时保留列表项并提供重试。

#### 服务端请求契约

| 操作         | 请求                                                     | 成功条件                               | 失败后的状态                         |
| ------------ | -------------------------------------------------------- | -------------------------------------- | ------------------------------------ |
| 上传         | `POST {endpoint}`，`multipart/form-data` 字段名为 `file` | 任意 2xx 且 JSON 含安全单路径 `fileId` | 保留本地文件，可重试；不清除所选内容 |
| 删除远端文件 | `DELETE {endpoint}/{fileId}`                             | 任意 2xx                               | 保留列表项及 `fileId`，可重试删除    |

此 demo 的服务端契约仅用于演示，浏览器测试用 Playwright route mock 响应，不证明生产后端实现、存储、认证或部署能力。

#### 恢复与安全边界

- 无效地址只在地址输入处显示一条告警；文件仍可暂存，修正地址后同一文件可上传。
- 上传失败保留原文件，重试沿用相同文件内容；删除失败保留远端文件记录，避免 UI 显示“已删除”而服务端仍有文件。
- `fileId` 只接受安全路径字符并作为单段 URL 编码；服务端仍需鉴权、授权、校验文件类型与大小，并限制跨租户访问。
- 断点续传、SHA-256 校验、认证、权限与并发策略均依赖服务端契约，本示例未实现、未验收。

## API

`UploadProps`为公开AntD >=5.24 <6上传属性别名。

### 组件属性

| 属性                       | 类型                                                      | 默认                 | 说明                                                 |
| -------------------------- | --------------------------------------------------------- | -------------------- | ---------------------------------------------------- |
| fileList / defaultFileList | UploadProps['fileList']                                   | —                    | 受控列表 / 非受控初始列表，uid必须稳定               |
| action                     | UploadProps['action']                                     | —                    | 显式上传地址或公开地址函数；启用传输                 |
| customRequest              | UploadProps['customRequest']                              | —                    | 宿主传输实现；负责进度、成功/失败回调                |
| beforeUpload               | UploadProps['beforeUpload']                               | 无传输时()=&gt;false | 显式值优先；false保留本地，LIST_IGNORE不入列表       |
| accept                     | string                                                    | —                    | 文件选择器类型提示，非安全校验                       |
| multiple / disabled        | boolean                                                   | false                | 多选 / 禁用                                          |
| maxCount                   | number                                                    | —                    | 列表最大数量；1时替换旧文件                          |
| listType                   | 'text' \| 'picture' \| 'picture-card' \| 'picture-circle' | text                 | 列表展示方式                                         |
| showUploadList             | UploadProps['showUploadList']                             | true                 | 公开列表配置                                         |
| onChange                   | UploadProps['onChange']                                   | —                    | {file,fileList,event?}，选择/进度/完成/失败/移除更新 |
| onRemove                   | UploadProps['onRemove']                                   | —                    | file参数；false或Promise&lt;false&gt;阻止移除        |
| children                   | ReactNode                                                 | —                    | 真实选择触发控件，禁用时应同步禁用按钮               |

`UploadRef`保留AntD公开实例，可在挂载期间读取nativeElement和fileList；不承诺focus/open方法，选择由真实按钮触发。组件没有size属性，触发按钮和主题决定几何。未导出Upload.Dragger或Upload.LIST_IGNORE，需要原生静态能力从lx-ui/antd引入。

### 事件参数

| 事件         | 参数与用法                                                                  | 时机与边界                                               |
| ------------ | --------------------------------------------------------------------------- | -------------------------------------------------------- |
| onChange     | `({file,fileList,event?})`；`onChange={({fileList}) => setFiles(fileList)}` | 选择、移除或传输状态变化；本地拦截文件未必有status       |
| beforeUpload | `(file,fileList)`，返回公开布尔/文件/Promise/LIST_IGNORE结果                | 加入传输前；false阻止请求但保留列表，LIST_IGNORE排除列表 |
| onRemove     | `(file)`，`onRemove={(file) => canRemove(file)}`                            | 用户点击移除；false或异步false阻止移除                   |
| onPreview    | `(file)`                                                                    | 用户预览；URL权限与释放由宿主负责                        |

### 公开实例成员

`useRef<UploadRef>(null)`可读取公开成员；组件不提供focus/open方法。

| 成员          | 用法                         | 边界                                                          |
| ------------- | ---------------------------- | ------------------------------------------------------------- |
| nativeElement | `ref.current?.nativeElement` | HTMLSpanElement或null；挂载后读取根布局，不依赖内部file input |
| fileList      | `ref.current?.fileList`      | 当前公开列表快照；受控业务修改通过setFiles，不直接改数组      |
| 文件选择入口  | 点击children中的真实Button   | 无ref.open()/focus()承诺；原生选择器由用户操作打开            |

## 集成与安全边界

### 上传拦截与校验

显式 `beforeUpload` 会覆盖本地默认，返回 `true`/`undefined` 可能放行请求；没有传输能力时务必返回 `false` 或 `LIST_IGNORE`，不能把类型限制误写成放行路径。被 `false` 拦截的文件可能没有 `status`，不应视为已经上传。

### Form 表单集成

将文件数组绑定到表单字段时，设置 `valuePropName="fileList"`，并用 `getValueFromEvent` 从公开 `onChange` 参数中返回 `fileList`：

```tsx
<Form.Item
  name="attachments"
  valuePropName="fileList"
  getValueFromEvent={({ fileList }) => fileList}
>
  <Upload>
    <Button>选择附件</Button>
  </Upload>
</Form.Item>
```

### 宿主与性能责任

客户端大小/类型限制只用于体验提示，不能替代服务端校验。文件 ID、权限、重试及取消策略由宿主定义。Tab 聚焦真实选择按钮，Enter/Space 打开原生选择器；主题和 reduced motion 遵循基础控件基线。大文件预览避免全量读取，创建 object URL 时须释放；真实浏览器行为按验收矩阵单独记录。
