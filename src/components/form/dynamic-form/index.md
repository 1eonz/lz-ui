# DynamicForm

`DynamicForm` 根据字段数组生成后台录入表单，适合 ERP/CRM 的新建和编辑场景。它负责字段渲染、条件显示、验证和提交值整理；请求、权限、路由和字典来源由业务项目传入。传入的 `children` 会在字段之后渲染，适合放置保存、取消和次要操作。

当前版本组合 lx-ui 的 Input、TextArea、InputNumber、Select、DatePicker、DateRangePicker、Checkbox、Switch、Radio、Upload 和 FormItem。Radio、Upload 保留 Ant Design 5 的公开 Props、事件和 ref 合约；焦点轮廓由实际控件通过公开主题 token 绘制，Upload 包装层不额外画框。Upload 默认仅本地选择文件；视觉和可访问性验收状态以 [UI 设计门禁](/ui-design-gate) 为准。

## 客户录入示例

<code src="../../../../docs/demos/dynamic-form.tsx"></code>

填写名称和邮箱后选择客户等级；重点客户需要补充专属负责人。保存示例包含提交中、失败重试和成功后的“查看客户 / 继续新增”动作，重置会恢复初始等级。外观、明暗和密度收在“显示选项”中，默认不打断填写任务。

## 字段定义片段

```tsx pure
import type { FieldSchema } from 'lx-ui';

const schema = [
  { key: 'name', name: 'name', type: 'text', label: '客户名称', required: true },
  { key: 'amount', name: 'amount', type: 'number', label: '合同金额' },
  {
    key: 'level',
    name: 'level',
    type: 'select',
    label: '客户等级',
    options: [
      { label: '重点', value: 'priority' },
      { label: '普通', value: 'regular' },
    ],
  },
] satisfies FieldSchema[];
```

`key` 是稳定的渲染身份，`name` 是值路径。嵌套字段可写 `name: ['customer', 'contact', 'phone']`，不要把数组下标当作稳定 `key`。

## 值与联动

- 非受控：用 `defaultValue` 设置首次初始值，之后由表单内部管理。
- 受控：同时传 `value` 和 `onChange(changed, all)`；调用方需要把 `all` 更新回 `value`。程序化回填不会自动触发 `onChange`。
- `visible` 接收同步纯函数，用当前全部值计算是否显示；`hidden` 始终隐藏。隐藏字段默认保留值，设置 `preserve={false}` 可在卸载时清理；设置 `omitHidden` 可在提交结果中排除隐藏字段。
- `disabled`、`readOnly` 可接收布尔值或同步函数。文字输入使用原生只读语义；选择、日期、数字等没有完整只读语义的控件会禁用交互，但保留原值。它们不替代业务权限判断。
- 当前没有声明式表达式引擎、数组增删行或跨页草稿；这些场景需先通过真实业务示例验证 API。

## 异步选项与校验

Select 可提供 `loadOptions(query, values, signal)`。搜索输入会合并 200ms 内的连续变更；组件在新查询或卸载时取消旧请求，并用请求序号阻止旧结果覆盖新结果。返回值只用于选项显示，表单值只保存 option 的 `value`。调用方的请求适配器应响应 `AbortSignal`；无法响应时仍会被请求序号阻止回写。

字段 `rules` 支持 `required`、AntD 公开规则 `antd` 和 `validator(value, { values, signal })`。异步 validator 返回错误字符串或抛出错误；新一轮校验会取消上一轮。服务端仍需独立校验最终提交值。

`upload` 字段显示“选择文件”按钮，可通过 `uploadLabel` 自定义文案。默认仅将 `fileList` 存入表单，不自动发起网络请求；宿主需要明确提供 `action` 或 `customRequest` 才执行上传。大文件、权限、进度、重试和服务端文件 ID 映射由宿主负责。只保存 JSON 的业务表单应在提交前把文件对象转换为服务端引用。

## 自定义字段

`type: 'custom'` 可提供 `renderer` 名称，通过局部 `rendererRegistry` 解析；一次性的场景也可以提供 `render` 函数。需要保存为 JSON 的 schema 只能存 renderer 名称，不能保存函数、ReactNode 或请求对象。

自定义 renderer 必须将 `context.controlProps` 传给实际输入控件，才能参与 Form 的值、联动和校验。未知 renderer 默认显示明确错误，也可由 `onUnknownRenderer(field)` 提供替代内容。

## 状态与可访问性

`loading` 和 `error` 在已有字段上方显示状态，不卸载输入框或移动焦点；宿主应在 `error` 中提供重试等恢复操作。空 schema 单独显示加载、错误或空状态。异步 Select 请求失败时清空当前搜索选项并在字段旁提供“重试”，已选中的表单值不会被清除。每个字段必须有可读 `label`，错误信息由 `Form.Item` 关联到输入控件。交互组件沿用 Ant Design 5 的键盘语义和可见焦点；视觉样式与 reduced motion 由基础控件和主题 token 控制。

## API 边界

`DynamicFormRef` 提供 `form`、`submit()` 和 `reset()`。`form` 是当前 AntD5 底座的 `FormInstance`，属于过渡性公开类型；若将来替换底座，需要提供迁移层。`onFinish(values)` 可返回 Promise，但当前组件不代管请求状态和重复提交保护，业务项目需自行控制 `loading` 与错误恢复。

| 属性                      | 类型                                | 默认值           | 说明                                        |
| ------------------------- | ----------------------------------- | ---------------- | ------------------------------------------- |
| `schema`                  | `FieldSchema[]`                     | 必填             | 字段定义，`key` 为稳定身份，`name` 为值路径 |
| `value` / `defaultValue`  | `DynamicFormValues`                 | -                | 受控值 / 一次性初值                         |
| `onChange`                | `(changed, all) => void`            | -                | 用户编辑后的变更片段与全部值                |
| `onFinish`                | `(values) => void \| Promise<void>` | -                | 校验通过后的提交值；请求由宿主负责          |
| `loading` / `error`       | `boolean` / `ReactNode`             | `false` / -      | 原位状态，不卸载已有字段                    |
| `empty`                   | `ReactNode`                         | 默认空文案       | 无字段时的内容                              |
| `preserve` / `omitHidden` | `boolean`                           | `true` / `false` | 隐藏值在 store 中的保留与提交策略           |
| `compact`                 | `boolean`                           | `false`          | 缩小字段间距；控件密度由主题控制            |
| `rendererRegistry`        | `FormRendererRegistry`              | 默认 registry    | 局部自定义字段注册                          |
