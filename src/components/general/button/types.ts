import type { ButtonProps as AntButtonProps } from 'antd';

/**
 * 保留 AntD 公开 Button 协议，宿主可使用原生按钮、链接、图标、danger、
 * loading 与分组能力，包装层不改变这些行为。
 */
export type ButtonProps = Omit<AntButtonProps, 'size'> & {
  /**
   * 按钮尺寸。省略时按 lx density 使用 comfortable 40px、compact 32px，
   * 不继承宿主 ConfigProvider.componentSize；middle 固定 32px，small 为 24px，large 为 40px。
   */
  size?: AntButtonProps['size'];
};

/** 提供 href 时，Button ref 可能指向链接元素。 */
export type ButtonRef = HTMLButtonElement | HTMLAnchorElement;
