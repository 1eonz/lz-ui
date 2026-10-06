export interface BrowserComponentRoute {
  name: string;
  path: `/components/${string}`;
  expectedTitle: string;
  expectedHeading: string;
}

export const browserComponentRoutes: readonly BrowserComponentRoute[] = [
  {
    name: 'Button',
    path: '/components/general/button',
    expectedTitle: 'Button 按钮',
    expectedHeading: 'Button 按钮',
  },
  {
    name: 'Icon',
    path: '/components/general/icon',
    expectedTitle: 'Icon 图标',
    expectedHeading: 'Icon 图标',
  },
  {
    name: 'Typography',
    path: '/components/general/typography',
    expectedTitle: 'Typography 排版',
    expectedHeading: 'Typography 排版',
  },
  {
    name: 'Space',
    path: '/components/general/space',
    expectedTitle: 'Space 间距',
    expectedHeading: 'Space 间距',
  },
  {
    name: 'Divider',
    path: '/components/general/divider',
    expectedTitle: 'Divider 分割线',
    expectedHeading: 'Divider 分割线',
  },
  {
    name: 'Input',
    path: '/components/form/input',
    expectedTitle: 'Input 输入框',
    expectedHeading: 'Input 输入框',
  },
  {
    name: 'InputNumber',
    path: '/components/form/input-number',
    expectedTitle: 'InputNumber 数值输入',
    expectedHeading: 'InputNumber 数值输入',
  },
  {
    name: 'Select',
    path: '/components/form/select',
    expectedTitle: 'Select 选择器',
    expectedHeading: 'Select 选择器',
  },
  {
    name: 'DatePicker',
    path: '/components/form/date-picker',
    expectedTitle: 'DatePicker 日期',
    expectedHeading: 'DatePicker / DateRangePicker 日期',
  },
  {
    name: 'Checkbox',
    path: '/components/form/checkbox',
    expectedTitle: 'Checkbox 复选框',
    expectedHeading: 'Checkbox 复选框',
  },
  {
    name: 'Switch',
    path: '/components/form/switch',
    expectedTitle: 'Switch 开关',
    expectedHeading: 'Switch 开关',
  },
  {
    name: 'Radio',
    path: '/components/form/radio',
    expectedTitle: 'Radio 单选',
    expectedHeading: 'Radio 单选',
  },
  {
    name: 'Upload',
    path: '/components/form/upload',
    expectedTitle: 'Upload 文件选择',
    expectedHeading: 'Upload 文件选择',
  },
  {
    name: 'FormItem',
    path: '/components/form/form-item',
    expectedTitle: 'FormItem 表单项',
    expectedHeading: 'FormItem 表单项',
  },
  {
    name: 'DynamicForm',
    path: '/components/form/dynamic-form',
    expectedTitle: 'DynamicForm 动态表单',
    expectedHeading: 'DynamicForm 动态表单',
  },
  {
    name: 'Pagination',
    path: '/components/data-display/pagination',
    expectedTitle: 'Pagination 分页',
    expectedHeading: 'Pagination 分页',
  },
  {
    name: 'Table',
    path: '/components/data-display/table',
    expectedTitle: 'Table 表格',
    expectedHeading: 'Table 表格',
  },
  {
    name: 'Tree',
    path: '/components/data-display/tree',
    expectedTitle: 'Tree 树形控件',
    expectedHeading: 'Tree 树形控件',
  },
  {
    name: 'Empty',
    path: '/components/data-display/empty',
    expectedTitle: 'Empty 空状态',
    expectedHeading: 'Empty 空状态',
  },
  {
    name: 'Skeleton',
    path: '/components/data-display/skeleton',
    expectedTitle: 'Skeleton 骨架屏',
    expectedHeading: 'Skeleton 骨架屏',
  },
  {
    name: 'Result',
    path: '/components/data-display/result',
    expectedTitle: 'Result 结果反馈',
    expectedHeading: 'Result 结果反馈',
  },
  {
    name: 'Tag',
    path: '/components/data-display/tag',
    expectedTitle: 'Tag 标签',
    expectedHeading: 'Tag 标签',
  },
  {
    name: 'Badge',
    path: '/components/data-display/badge',
    expectedTitle: 'Badge 徽标',
    expectedHeading: 'Badge 徽标',
  },
  {
    name: 'Descriptions',
    path: '/components/data-display/descriptions',
    expectedTitle: 'Descriptions 描述列表',
    expectedHeading: 'Descriptions 描述列表',
  },
  {
    name: 'Avatar',
    path: '/components/data-display/avatar',
    expectedTitle: 'Avatar 头像',
    expectedHeading: 'Avatar 头像',
  },
  {
    name: 'Statistic',
    path: '/components/data-display/statistic',
    expectedTitle: 'Statistic 统计数值',
    expectedHeading: 'Statistic 统计数值',
  },
  {
    name: 'Card',
    path: '/components/data-display/card',
    expectedTitle: 'Card 卡片',
    expectedHeading: 'Card 卡片',
  },
  {
    name: 'List',
    path: '/components/data-display/list',
    expectedTitle: 'List 列表',
    expectedHeading: 'List 列表',
  },
  {
    name: 'Alert',
    path: '/components/feedback/alert',
    expectedTitle: 'Alert',
    expectedHeading: 'Alert',
  },
  {
    name: 'Spin',
    path: '/components/feedback/spin',
    expectedTitle: 'Spin',
    expectedHeading: 'Spin',
  },
  {
    name: 'Progress',
    path: '/components/feedback/progress',
    expectedTitle: 'Progress',
    expectedHeading: 'Progress',
  },
  {
    name: 'Tooltip',
    path: '/components/feedback/tooltip',
    expectedTitle: 'Tooltip',
    expectedHeading: 'Tooltip',
  },
];
