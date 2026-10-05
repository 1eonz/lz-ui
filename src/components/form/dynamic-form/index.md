---
title: DynamicForm 动态表单
group: Form
demo:
  defaultShowCode: false
---

# DynamicForm 动态表单

`DynamicForm` 根据字段数组生成后台录入表单，适合 ERP/CRM 的新建和编辑场景。它负责字段渲染、条件显示、验证和提交值整理；请求、权限、路由和字典来源由业务项目传入。传入的 `children` 会在字段之后渲染，适合放置保存、取消和次要操作。

当前版本组合 lx-ui 的 Input、TextArea、InputNumber、Select、DatePicker、DateRangePicker、Checkbox、Switch、Radio、Upload 和 FormItem。Radio、Upload 保留 Ant Design 5 的公开 Props、事件和 ref 合约；焦点轮廓由实际控件通过公开主题 token 绘制，Upload 包装层不额外画框。Upload 默认仅本地选择文件；视觉和可访问性验收状态以 [UI 设计门禁](/ui-design-gate) 为准。

## 使用方法

```tsx pure
import { Button, DynamicForm, LxConfigProvider } from 'lx-ui';
import type { FieldSchema } from 'lx-ui';
import 'lx-ui/style.css';

const schema: readonly FieldSchema[] = [
  { key: 'name', name: 'name', type: 'text', label: '客户名称', required: true },
];

export default function CustomerForm() {
  return (
    <LxConfigProvider>
      <DynamicForm schema={schema}>
        <Button htmlType="submit" type="primary">
          保存客户
        </Button>
      </DynamicForm>
    </LxConfigProvider>
  );
}
```

DynamicForm 已包含 Form 上下文，不能再嵌套原生 form。业务请求在 `onFinish` 处理；必填和其它规则通过后才调用。数组来自 JSON 时仍须由宿主检查字段种类和值路径，函数和 ReactNode 不可序列化。

## 交互示例

### 字段与值行为

#### 最小字段与提交、重置

<code src="../../../../docs/demos/dynamic-doc-basic.tsx"></code>

#### 受控值与嵌套路径回填

<code src="../../../../docs/demos/dynamic-doc-controlled.tsx"></code>

#### 条件字段与提交过滤

<code src="../../../../docs/demos/dynamic-doc-conditional.tsx"></code>

### 自定义字段

#### 局部注册表与自定义字段

<code src="../../../../docs/demos/dynamic-doc-custom.tsx"></code>

### 异步工作流

快速跳转到[多级异步字段级联](#多级异步字段级联)或[异步提交与失败恢复](#异步提交与失败恢复)。

#### 异步选项与失败重试

<code src="../../../../docs/demos/dynamic-doc-options.tsx"></code>

#### 多级异步字段级联

<code src="../../../../docs/demos/dynamic-form-cascade.tsx"></code>

此例用多个独立 Select 表达区域、城市和区县字段，让每级值分别参与字段校验、部分填写和提交，并可按上级值异步加载候选。UI 稿中的单个 Cascader 适合把完整路径作为一个不可分割的选择值；当业务需要独立字段校验或分步保存时，多个 Select 更合适。更改区域会刷新城市候选并清空旧城市与区县；更改城市会清空旧区县。输入“市”或“区”可加载对应候选，底部显示当前值和简短状态播报。本例聚焦依赖刷新和旧值清理；异步候选加载失败与重试见[异步选项与失败重试](#异步选项与失败重试)。

#### 异步提交与失败恢复

<code src="../../../../docs/demos/dynamic-doc-submit.tsx"></code>

此例首次保存失败，重试成功，失败后保留输入。宿主通过同步 ref 锁避免重复请求，控制 loading 和错误提示，取消卸载后的请求并检查当前请求身份；`onFinishError` 接收提交错误。它与字段校验失败的 `onFinishFailed` 相互独立。

### 完整客户录入

<code src="../../../../docs/demos/dynamic-form.tsx"></code>

填写名称和邮箱后选择客户等级；重点客户需要补充专属负责人。保存示例包含提交中、失败重试和成功后的“查看客户 / 继续新增”动作，重置会恢复初始等级。外观、明暗和密度收在“显示选项”中，默认不打断填写任务。

## 字段与联动

### 字段定义与联动

#### 字段定义片段

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

#### 值与联动

- 非受控：用 `defaultValue` 设置首次初始值，之后由表单内部管理。
- 受控：同时传 `value` 和 `onChange(changed, all)`；调用方需要把 `all` 更新回 `value`。程序化回填不会自动触发 `onChange`。
- `visible` 接收同步纯函数，用当前全部值计算是否显示；`hidden` 始终隐藏。隐藏字段默认保留值，设置 `preserve={false}` 可在卸载时清理；设置 `omitHidden` 可在提交结果中排除隐藏字段。
- `disabled`、`readOnly` 可接收布尔值或同步函数。文字输入使用原生只读语义；选择、日期、数字等没有完整只读语义的控件会禁用交互，但保留原值。它们不替代业务权限判断。
- 当前没有声明式表达式引擎、数组增删行或跨页草稿；这些场景需先通过真实业务示例验证 API。

**依赖行为速查。**

`dependencies` 沿用 AntD 语义：声明依赖后，依赖字段变化会重新校验当前字段；异步 Select 会按原查询刷新候选。依赖本身不会清除表单值。

| 配置                                           | 重新校验         | 异步选项刷新         | 清空当前字段旧值                                     |
| ---------------------------------------------- | ---------------- | -------------------- | ---------------------------------------------------- |
| 未设置 `dependencies`                          | 不因依赖字段变化 | 任意表单值变化时刷新 | 否                                                   |
| `dependencies: ['region']`                     | `region` 变化时  | `region` 变化时      | 否                                                   |
| 声明依赖并设置 `clearOnDependencyChange: true` | `region` 变化时  | `region` 变化时      | 用户交互真实改变依赖，且新旧值至少一侧非空时同步清空 |
| `dependencies: []`                             | 不因依赖字段变化 | 不因表单值变化       | 否，清空选项不生效                                   |

`clearOnDependencyChange` 只用于配置了 `loadOptions` 的异步 Select，默认 `false`。依赖值没有真实变化，或新旧值都为空时不会清理；从非空值切换、清空依赖值，或首次从空值设置为非空值时，都会清空该字段已有的旧选项值。若同一交互已提供新的目标字段值，则保留新值。程序化 `setFieldsValue`、受控 `value` 更新和 `reset()` 不会触发清空；宿主应原子更新程序化的父子值，重置会恢复初始值。清空在消费者 `onChange` 之前完成，嵌套路径会以 `undefined` 同时出现在 `changed` 和 `all` 中；隐藏的保留字段也会显式包含该路径。`omitHidden` 提交仍只输出可见字段。

#### 异步选项与校验

**查询快照与过滤。**

`loadOptions(query, values, signal)` 会合并 200ms 内的连续输入；`values` 是请求执行时的完整表单快照，包含 `preserve` 保留的隐藏值。

**依赖刷新。** 未设置 `dependencies` 时，异步 Select 会在任意表单值变化后按原查询重新加载；声明依赖路径后只在这些字段变化时重载，依赖值清空也会把空值放入新快照。`dependencies: []` 表示候选不依赖表单值，只由用户查询触发。默认不清除字段值；启用 `clearOnDependencyChange` 后，仅当用户交互真实改变已声明依赖且新旧值至少一侧非空时清除目标值，程序化更新和重置仍由宿主负责。普通 `onChange(changed, all)` 保留已注册字段的快照语义；因级联清除而变更的路径会额外包含在两个快照中。

**请求生命周期。** 新查询、相关表单值变化或卸载时会取消旧请求；请求序号还会阻止忽略 `AbortSignal` 的旧适配器覆盖当前候选。重载保留关键词并经过 200ms 防抖；未交互过的 Select 保持惰性加载。异步字段隐藏时会取消请求与防抖计时器，但保留当前查询；字段重新显示后按原查询刷新。schema 移除字段会清除查询和选项状态；同一 `key` 替换 `loadOptions` 时取消旧请求并用新函数重载原查询。

**候选项与过滤。** 返回选项只用于显示，表单值保存 option 的 `value`。远程模式默认使用 `filterOption={false}`，避免 AntD 再按 `value` 过滤；需要本地过滤时可通过 `inputProps.filterOption` 显式开启。

**搜索与显隐回调。** 远程搜索同时调用 `loadOptions` 和 `inputProps.onSearch(query)`。关闭下拉触发的 AntD 清空词仍会传给宿主 `onSearch`，但不会覆盖内部保留的搜索词；展开后按 Escape 会清空查询并加载空查询结果。Select 选择值时依次尝试 Form 注入的 `onChange(value, option)`、`inputProps.onChange(value, option)` 和内部查询清理；两个回调收到相同的值和选项参数。任一回调抛错时仍执行后续回调和清理，全部完成后重新抛出最先发生的异常。显隐回调优先调用 `inputProps.onOpenChange`；仅在未提供时兼容调用 `inputProps.onDropdownVisibleChange`。旧回调不会传给 AntD，因此不会触发弃用警告。

**结果状态。**

| 状态               | 下拉内容                 | 辅助技术反馈                            |
| ------------------ | ------------------------ | --------------------------------------- |
| 首次加载或重试     | 显示对应的加载文案       | Select 暴露 `aria-busy`，并播报加载状态 |
| 查询成功但无匹配项 | 提示调整关键词后重新搜索 | 播报无匹配项                            |
| 空查询且无候选项   | 显示“暂无可用选项”       | 播报暂无可用选项                        |
| 查询成功且有候选项 | 显示远程返回的候选项     | 礼貌播报候选数量                        |

**失败恢复。**

加载失败时会清空旧候选项，但保留搜索词和表单中已选的值。错误在字段下方保持可见，即使下拉关闭也能看到；字段级 `role="alert"` 负责播报，弹层中的重复文案仅作视觉说明。默认错误文案不暴露原始异常；可选的 `loadOptionsError(error, query)` 可返回面向用户的 `ReactNode`。返回 `null` 或 `undefined` 时使用通用文案。错误与重试按钮关联；新查询或请求成功后清除。

重试立即执行同一查询，不等待搜索防抖。按钮与 Select 保持在同一控件行，展开下拉时仍可见。按钮名称由“重试”动作和字段可见 label 组成，因此 JSX 或 Fragment 标签也能提供稳定名称。

**焦点行为。**

重试按钮通过 `aria-describedby` 关联错误。请求期间保留同一个按钮和键盘焦点，以 `aria-disabled`、`aria-busy` 及状态消息表示等待；连续激活不会重复发起请求，失败后按钮恢复可用。重试成功后菜单关闭并把焦点还给 Select；有候选项时播报结果数量，并提示重新展开列表选择。空结果会播报恢复后的空状态。

字段 `rules` 支持 `required`、AntD 公开规则 `antd` 和 `validator(value, { values, signal })`。异步 validator 返回错误字符串或抛出错误；新一轮校验会取消上一轮。服务端仍需独立校验最终提交值。

`upload` 字段显示“选择文件”按钮，可通过 `uploadLabel` 自定义文案。默认仅将 `fileList` 存入表单，不自动发起网络请求；宿主需要明确提供 `action` 或 `customRequest` 才执行上传。大文件、权限、进度、重试和服务端文件 ID 映射由宿主负责。只保存 JSON 的业务表单应在提交前把文件对象转换为服务端引用。

#### 自定义字段

`type: 'custom'` 可提供 `renderer` 名称，通过局部 `rendererRegistry` 解析；一次性的场景也可以提供 `render` 函数。需要保存为 JSON 的 schema 只能存 renderer 名称，不能保存函数、ReactNode 或请求对象。

自定义 renderer 必须将 `context.controlProps` 传给实际输入控件，才能参与 Form 的值、联动和校验。未知 renderer 默认显示明确错误，也可由 `onUnknownRenderer(field)` 提供替代内容。

## 状态与可访问性

`loading` 和 `error` 在已有字段上方显示状态，不卸载输入框或移动焦点；宿主应在 `error` 中提供重试等恢复操作。空 schema 单独显示加载、错误或空状态。异步 Select 在首次请求时明确显示加载文案，不将等待误报成空结果；成功无结果与成功有候选分别呈现空状态和候选数量播报。请求失败会清空当前搜索选项并在控件行显示“重试”，已选中的表单值不会被清除；失败原因显示在字段下方并保持可见，不依赖下拉是否展开。重试按钮的可访问名称包含字段 label，并通过 `aria-describedby` 关联错误；弹层内相同失败文案设为辅助技术隐藏，避免重复朗读。重试等待期间按钮继续留在文档流和键盘顺序中，不使用原生 `disabled` 移走当前焦点；`aria-disabled` 表示暂不可重复操作，`aria-busy` 与状态消息说明请求仍在进行。失败后重试控件回到可操作状态，成功后恢复选项并移除错误及重试控件；成功候选的播报会提示重新展开列表。每个字段必须有可读 `label`，错误信息由 `Form.Item` 关联到输入控件。交互组件沿用 Ant Design 5 的键盘语义和可见焦点；视觉样式与 reduced motion 由基础控件和主题 token 控制。

## API 与状态边界

### 表单与提交

#### API 边界

`DynamicFormRef` 提供 `form`、`submit()` 和 `reset()`。`form` 是当前 AntD5 底座的 `FormInstance`，属于过渡性公开类型；若将来替换底座，需要提供迁移层。`onFinish(values)` 可以同步抛错或返回拒绝的 Promise，组件会捕获并调用 `onFinishError(error, values)`；错误回调也可以返回 Promise，组件会捕获其拒绝。未提供错误回调时会通过中文 `console.error` 保留可见错误，避免产生未处理 Promise 拒绝。组件仍不代管请求状态和重复提交保护，业务项目需自行控制 `loading`、错误展示和恢复操作。

| 属性                      | 类型                                       | 默认值           | 说明                                                                   |
| ------------------------- | ------------------------------------------ | ---------------- | ---------------------------------------------------------------------- |
| `schema`                  | `FieldSchema[]`                            | 必填             | 字段定义，`key` 为稳定身份，`name` 为值路径                            |
| `value` / `defaultValue`  | `DynamicFormValues`                        | -                | 受控值 / 一次性初值                                                    |
| `onChange`                | `(changed, all) => void`                   | -                | 用户编辑后的变更片段与全部值                                           |
| `onFinish`                | `(values) => void \| Promise<void>`        | -                | 校验通过后的提交值；请求由宿主负责                                     |
| `onFinishError`           | `(error, values) => void \| Promise<void>` | -                | `onFinish` 抛错或 Promise 拒绝时触发；未提供时记录中文 `console.error` |
| `loading` / `error`       | `boolean` / `ReactNode`                    | `false` / -      | 原位状态，不卸载已有字段                                               |
| `empty`                   | `ReactNode`                                | 默认空文案       | 无字段时的内容                                                         |
| `preserve` / `omitHidden` | `boolean`                                  | `true` / `false` | 隐藏值在 store 中的保留与提交策略                                      |
| `compact`                 | `boolean`                                  | `false`          | 缩小字段间距；控件密度由主题控制                                       |
| `rendererRegistry`        | `FormRendererRegistry`                     | 默认 registry    | 局部自定义字段注册                                                     |

| 补充属性            | 类型                                     | 默认值           | 说明                                                         |
| ------------------- | ---------------------------------------- | ---------------- | ------------------------------------------------------------ |
| `children`          | `ReactNode`                              | —                | 字段后的操作区，提交按钮显式 `htmlType="submit"`             |
| `layout`            | `'horizontal' \| 'vertical' \| 'inline'` | `'vertical'`     | AntD 表单布局；长字段优先纵向                                |
| `disabled`          | `boolean`                                | `false`          | 禁用实际字段及自定义渲染上下文；自定义操作按钮需自己同步禁用 |
| `onUnknownRenderer` | `(field: FieldSchema) => ReactNode`      | 显示未知字段错误 | 未找到注册项时的回退，不自动生成输入                         |

### 字段配置

#### 字段通用参数

| 参数                      | 类型                                                       | 默认值         | 说明                                                                           |
| ------------------------- | ---------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------ |
| `key`                     | `string`                                                   | 必填           | 稳定渲染身份，与值路径独立                                                     |
| `name`                    | `string \| number \| readonly (string \| number)[]`        | 必填           | 值路径；禁止空路径和原型属性片段                                               |
| `type`                    | `DynamicFieldType`                                         | 必填           | text/textarea/number/select/checkbox/radio/date/dateRange/switch/upload/custom |
| `label / help / extra`    | `ReactNode`                                                | —              | 标签、帮助/错误说明、补充说明；可访问字段提供可见标签                          |
| `required / rules`        | `boolean / DynamicRule[]`                                  | `false / —`    | 简化必填与规则；required 不重复已有 required 规则                              |
| `hidden / visible`        | `boolean / boolean \| ((values) => boolean)`               | `false / true` | hidden 优先；visible 为同步纯函数                                              |
| `disabled / readOnly`     | `boolean \| ((values) => boolean)`                         | `false`        | 动态状态；缺少只读能力的控件改为禁用交互                                       |
| `preserve`                | `boolean`                                                  | 表单级值       | 隐藏时的存储策略，与 omitHidden 提交策略分离                                   |
| `dependencies`            | `DynamicNamePath[]`                                        | —              | 字段值变化时重新校验；异步 Select 按原查询刷新候选，空数组关闭表单值触发的刷新 |
| `clearOnDependencyChange` | `boolean`                                                  | `false`        | 仅异步 Select 可用；用户交互真实改变依赖且新旧值至少一侧非空时同步清除目标值   |
| `inputProps`              | 相应 AntD 公开控件属性                                     | —              | 按type区分；Form注入的值、id、禁用与只读协议优先                               |
| `options`                 | `DynamicFieldOption[]`                                     | —              | select/radio选项；radio必填，提交value而非label                                |
| `loadOptions`             | `(query, values, signal) => Promise<DynamicFieldOption[]>` | —              | select加载器，接收完整快照；默认随任意值变化重载，过期响应不会回写             |
| `loadOptionsError`        | `(error: unknown, query: string) => ReactNode`             | 通用错误文案   | 映射异步选项拒绝原因；返回空值时回退，不展示原始异常                           |
| `renderer / render`       | `string / CustomRenderer`                                  | —              | custom字段名称或一次性渲染，显式render优先                                     |
| `uploadLabel`             | `ReactNode`                                                | `'选择文件'`   | upload触发按钮文字                                                             |

### 事件与实例方法

| 成员               | 签名或用法                                          | 触发与边界                                                                  |
| ------------------ | --------------------------------------------------- | --------------------------------------------------------------------------- |
| `onChange`         | `(changed, all) => void`                            | 用户编辑；程序化回填不触发。受控宿主更新all                                 |
| `onFinish`         | `(values) => void \| Promise<void>`                 | 校验成功；omitHidden开启时只包含可见字段；不托管提交锁或异常提示            |
| `onFinishError`    | `(error, values) => void \| Promise<void>`          | `onFinish` 抛错或 Promise 拒绝时触发；错误不会形成未处理 Promise 拒绝       |
| `onFinishFailed`   | AntD `FormProps['onFinishFailed']`                  | 校验失败；不会调用onFinish                                                  |
| `ref.submit()`     | `ref.current?.submit()`                             | 命令式提交并执行校验，不等于绕过规则                                        |
| `ref.reset()`      | `ref.current?.reset()`                              | 恢复当前初值；受控宿主还需同步外部快照                                      |
| `ref.form`         | `FormInstance<DynamicFormValues>`                   | 挂载后读取；如setFieldsValue/validateFields/scrollToField，行为遵循宿主AntD |
| `registerRenderer` | `(name, renderer) => void`                          | 显式写默认全局注册表；多应用优先局部registry，没有自动清理协议              |
| `resolveRenderer`  | `(name?, registry?) => CustomRenderer \| undefined` | 按名称读取；未找到返回undefined                                             |

`onFinish` 保持 AntD 校验成功回调中的同步调用时序，不额外延迟到微任务。同步抛错立即通知 `onFinishError`，Promise 拒绝在拒绝处理时通知；两个回调收到同一份提交输出，开启 `omitHidden` 时均为过滤后的值。错误回调自身同步抛错或异步拒绝均由 `console.error` 兜底。

`ref.submit()` 返回 `void`，不能通过 `await ref.submit()` 等待业务保存完成。提交锁、loading、取消、过期响应与卸载保护由宿主控制；组件在卸载后仍捕获 Promise 拒绝并通知错误回调，宿主应在更新状态前检查是否仍挂载。失败不会自动重置字段。

迁移：原有同步 `onFinish` 的时序保持不变。先前依赖全局未处理拒绝展示错误的宿主，应改为 `onFinishError`；已有回调内部自行处理失败且不继续抛错时，不会重复通知。保留 `onFinishFailed` 处理字段校验失败。

Ref 在卸载后为空；不要把命令式form访问当作受控状态同步方案。多个演示提供不同name以隔离label/id，实际同页表单也应提供唯一name。

### 扩展与性能

缓存稳定schema和局部registry引用；联动函数只读快照，不发请求。大量动态字段应按业务分组/分步，当前没有数组增删、虚拟化或表达式引擎。保存JSON时将Dayjs和文件转换为服务端字段格式，renderer名称可序列化但函数不能。异步选项及校验需响应AbortSignal，业务层仍独立校验权限与最终提交值。
