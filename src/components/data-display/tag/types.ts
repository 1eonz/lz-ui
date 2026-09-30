import type { TagProps as AntTagProps } from 'antd';
import type { ButtonHTMLAttributes } from 'react';
/** 沿用 AntD 标签参数；推荐语义配色，自定义颜色需要单独检查对比度。 */
export type TagProps = AntTagProps;

/**
 * 完全受控的选择标签。原生按钮提供键盘与禁用行为，无需模拟可点击 span。
 * 组件不会自行更新 checked；宿主通过 onChange 提交下一次选择。
 * 原生按钮属性和 ref 均属于实际按钮，不增加布局包装层。
 */
export interface CheckableTagProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange'
> {
  checked: boolean;
  /** 未被 preventDefault 取消的激活触发一次，参数为请求切换到的选中值。 */
  onChange?: (checked: boolean) => void;
}
