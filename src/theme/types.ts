import type { CSSProperties, ReactNode } from 'react';

/** 请求的明暗模式；system 在挂载后跟随操作系统设置。 */
export type LxThemeMode = 'light' | 'dark' | 'system';

/** 视觉外观；glass 采用渐进增强并保留实色回退。 */
export type LxAppearance = 'business' | 'soft' | 'glass';

/** 控件密度；表格行高仍使用独立 token。 */
export type LxDensity = 'comfortable' | 'compact';

/** 未选择东方配色时使用的稳定品牌预设。 */
export type LxColorPreset = 'blue' | 'orange' | 'green' | 'purple' | 'cyan' | 'rose';

/**
 * 东方色系使用独立命名空间，避免把已有六色主题的公开 API 变成不兼容联合类型。
 */
export type LxPalettePreset =
  | 'celadon-laurel'
  | 'twilight-peach'
  | 'garnet-almond'
  | 'pine-amber'
  | 'misty-oatmeal'
  | 'bean-sand-ink'
  | 'cheese-distant-cyan';

/**
 * 初始主题与持久化策略。`theme` 不是受控属性，运行时更新使用 `setTheme`。
 * 挂载前 SSR 与 hydration 使用同一初始值，挂载后才应用存储或系统偏好。
 */
export interface LxThemeOptions {
  mode?: LxThemeMode;
  appearance?: LxAppearance;
  density?: LxDensity;
  colorPreset?: LxColorPreset;
  palettePreset?: LxPalettePreset;
  persist?: boolean;
  storageKey?: string;
}

/** 可在运行时修改的选择；持久化策略始终由 Provider 持有。 */
export type LxThemeSelection = Omit<LxThemeOptions, 'persist' | 'storageKey' | 'palettePreset'> & {
  /** null 清除配色组，重新使用当前品牌预设。 */
  palettePreset?: LxPalettePreset | null;
};

/** `useLxTheme` 返回的已解析状态与更新函数。 */
export interface LxThemeContextValue {
  theme: Required<Omit<LxThemeSelection, 'palettePreset'>> &
    Pick<LxThemeSelection, 'palettePreset'>;
  resolvedMode: 'light' | 'dark';
  setTheme: (
    next: LxThemeSelection | ((current: LxThemeContextValue['theme']) => LxThemeSelection),
  ) => void;
}

/** 将 CSS token 与 Ant Design 公开主题 API 限定在 Provider 子树。 */
export interface LxConfigProviderProps {
  children: ReactNode;
  theme?: LxThemeOptions;
  className?: string;
  /**
   * 作用域覆盖值在解析后的 token 之后应用，供宿主调整特定子树。
   * 自定义属性索引允许类型安全的 `--lx-*` 覆盖，普通 CSS 属性仍受类型检查。
   * 这些值只改变 CSS 消费者，不会同步修改 AntD 的公开 token。
   */
  style?: CSSProperties & Record<`--lx-${string}`, string | number>;
}
