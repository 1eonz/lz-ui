---
title: Upload 文件选择
group: Form
demo:
  defaultShowCode: false
---

# Upload 文件选择

默认本地文件选择，不自动发起上传。需要服务端传输时由宿主显式提供action/customRequest并负责认证、失败恢复和服务器文件ID。

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

## API

`UploadProps`为公开AntD >=5.24 <6上传属性别名。

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

## 安全边界、表单与性能

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

显式beforeUpload会覆盖本地默认，返回true/undefined可能放行请求；没有传输能力时务必返回false或LIST_IGNORE，不能把类型限制误写成放行路径。客户端大小/类型限制不能替代服务端校验。被false拦截的文件可能没有status，不应视作已经上传。

Form收集fileList时设置valuePropName="fileList"和getValueFromEvent归一化公开onChange参数。文件ID、权限、重试及取消由宿主负责。Tab聚焦触发按钮，Enter/Space打开原生选择器；主题和reduced motion遵循基础控件基线。大文件预览避免全量读取，创建object URL时须释放；真实浏览器文件选择/键盘与视觉门禁另行验证。
