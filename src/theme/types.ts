import type { CSSProperties, ReactNode } from 'react';

/** Requested color scheme; system follows the operating system while mounted. */
export type LxThemeMode = 'light' | 'dark' | 'system';

/** Visual treatment. Glass is progressive enhancement. */
export type LxAppearance = 'business' | 'soft' | 'glass';

/** Control density; table row height remains an independent token. */
export type LxDensity = 'comfortable' | 'compact';

/** Stable brand presets used when no oriental palette is selected. */
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
 * Initial theme and persistence policy. `theme` is an initial value, not a controlled prop;
 * call `setTheme` for runtime updates. SSR and hydration use this value until mounted.
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

/** Values that can change at runtime; persistence policy remains with the provider. */
export type LxThemeSelection = Omit<LxThemeOptions, 'persist' | 'storageKey'> & {
  /** Null clears a palette to reveal the selected brand preset. */
  palettePreset?: LxPalettePreset | null;
};

/** Resolved state and updater returned by `useLxTheme`. */
export interface LxThemeContextValue {
  theme: Required<Omit<LxThemeSelection, 'palettePreset'>> &
    Pick<LxThemeSelection, 'palettePreset'>;
  resolvedMode: 'light' | 'dark';
  setTheme: (
    next: LxThemeSelection | ((current: LxThemeContextValue['theme']) => LxThemeSelection),
  ) => void;
}

/** Scope CSS tokens and Ant Design's public theme API to the provider subtree. */
export interface LxConfigProviderProps {
  children: ReactNode;
  theme?: LxThemeOptions;
  className?: string;
  /**
   * Scoped overrides, applied after computed tokens so a product can tune a
   * specific subtree. The custom-property index keeps `--lx-*` overrides
   * type-safe without allowing arbitrary non-CSS values.
   */
  style?: CSSProperties & Record<`--lx-${string}`, string | number>;
}
