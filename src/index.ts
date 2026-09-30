/**
 * lx-ui 的公共入口。
 *
 * 这里只显式转出已完成首批验收的主题与基础组件。业务组合按
 * 实际复用场景逐步加入，避免一个入口意外引入整套 Ant Design。
 */
export const LX_UI_VERSION = '0.0.0-alpha.0' as const;

export type {
  LxAppearance,
  LxColorPreset,
  LxDensity,
  LxPalettePreset,
  LxThemeMode,
  LxThemeOptions,
  LxThemeSelection,
  LxThemeContextValue,
  LxConfigProviderProps,
} from './theme';
export { LxConfigProvider, useLxTheme } from './theme';
export { Button } from './components/general/button';
export type { ButtonProps, ButtonRef } from './components/general/button';
export { Icon } from './components/general/icon';
export type { IconComponent, IconProps } from './components/general/icon';
export { Typography, Text, Title, Paragraph, Link } from './components/general/typography';
export type {
  CopyableOptions,
  LinkProps,
  ParagraphProps,
  TextProps,
  TitleProps,
  TypographyBaseProps,
  TypographyType,
} from './components/general/typography';
export { Space } from './components/general/space';
export type { SpaceProps, SpaceSize } from './components/general/space';
export { Divider } from './components/general/divider';
export type { DividerProps } from './components/general/divider';
export { Input, TextArea } from './components/form/input';
export type { InputProps, InputRef, TextAreaProps, TextAreaRef } from './components/form/input';
export { Checkbox } from './components/form/checkbox';
export type { CheckboxProps, CheckboxRef } from './components/form/checkbox';
export { Switch } from './components/form/switch';
export type { SwitchProps, SwitchRef } from './components/form/switch';
export { Radio, RadioGroup } from './components/form/radio';
export type { RadioProps, RadioGroupProps, RadioRef } from './components/form/radio';
export { Upload } from './components/form/upload';
export type { UploadProps, UploadRef } from './components/form/upload';
export { InputNumber } from './components/form/input-number';
export type { InputNumberProps, InputNumberRef } from './components/form/input-number';
export { Select } from './components/form/select';
export type { SelectProps, SelectRef } from './components/form/select';
export { DatePicker, DateRangePicker } from './components/form/date-picker';
export type {
  DatePickerProps,
  DatePickerRef,
  DateRangePickerProps,
} from './components/form/date-picker';
export { FormItem } from './components/form/form-item';
export type { FormItemProps } from './components/form/form-item';
export { DynamicForm } from './components/form/dynamic-form';
export type {
  DynamicFormProps,
  DynamicFormRef,
  DynamicFormValues,
  DynamicNamePath,
  DynamicRule,
  DynamicFieldOption,
  DynamicFieldType,
  FieldSchema,
  FormRendererRegistry,
  CustomRenderer,
} from './components/form/dynamic-form';
export { registerRenderer, resolveRenderer } from './components/form/dynamic-form';
export { Empty } from './components/data-display/empty';
export type { EmptyProps } from './components/data-display/empty';
export { Skeleton } from './components/data-display/skeleton';
export type { SkeletonProps } from './components/data-display/skeleton';
export { Result } from './components/data-display/result';
export type { ResultProps } from './components/data-display/result';
export { Tag, CheckableTag } from './components/data-display/tag';
export type { TagProps, CheckableTagProps } from './components/data-display/tag';
export { Badge } from './components/data-display/badge';
export type { BadgeProps } from './components/data-display/badge';
export { Descriptions } from './components/data-display/descriptions';
export type { DescriptionsProps } from './components/data-display/descriptions';
export { Avatar, AvatarGroup } from './components/data-display/avatar';
export type { AvatarProps, AvatarGroupProps } from './components/data-display/avatar';
export { Statistic } from './components/data-display/statistic';
export type { StatisticProps } from './components/data-display/statistic';
export { Card } from './components/data-display/card';
export type { CardProps } from './components/data-display/card';
export { List } from './components/data-display/list';
export type { ListProps } from './components/data-display/list';
export { Pagination } from './components/data-display/pagination';
export type { PaginationProps, PaginationRef } from './components/data-display/pagination';
export { Table } from './components/data-display/table';
export type { LxTableColumns, LxTableProps, LxTableRef } from './components/data-display/table';
export { Tree } from './components/data-display/tree';
export type {
  DataNode,
  TreeDataNode,
  TreeNodeProps,
  TreeProps,
  TreeRef,
} from './components/data-display/tree';
export { Alert } from './components/feedback/alert';
export type { AlertProps, AlertRef } from './components/feedback/alert';
export { Spin } from './components/feedback/spin';
export type { SpinProps } from './components/feedback/spin';
export { Progress } from './components/feedback/progress';
export type { ProgressProps, ProgressRef } from './components/feedback/progress';
