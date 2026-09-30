import { ConfigProvider, theme as antdTheme } from 'antd';
import type { ThemeConfig } from 'antd';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { LxConfigProviderProps, LxThemeContextValue, LxThemeSelection } from './types';
import { brandSeeds, paletteSeeds, resolveLxTokens } from './tokens';

const defaults: LxThemeContextValue['theme'] = {
  mode: 'light',
  appearance: 'business',
  density: 'comfortable',
  colorPreset: 'blue',
};
const ThemeContext = createContext<LxThemeContextValue | null>(null);

/** 忽略过期或损坏的存储值，避免无效预设访问不存在的种子颜色。 */
function readStoredTheme(key: string): LxThemeSelection | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const candidate = value as Record<string, unknown>;
    const valid = (entry: unknown, allowed: readonly string[]) =>
      entry === undefined || allowed.includes(entry as string);
    if (
      !valid(candidate.mode, ['light', 'dark', 'system']) ||
      !valid(candidate.appearance, ['business', 'soft', 'glass']) ||
      !valid(candidate.density, ['comfortable', 'compact']) ||
      !valid(candidate.colorPreset, Object.keys(brandSeeds)) ||
      !(
        candidate.palettePreset === null ||
        valid(candidate.palettePreset, Object.keys(paletteSeeds))
      )
    )
      return null;
    return candidate as LxThemeSelection;
  } catch {
    // 隐私设置可能禁用存储；此时主题仍可在内存中正常切换。
    return null;
  }
}

/**
 * 提供可嵌套、可运行时切换的 CSS 与 AntD v5 token。客户端首次渲染与 SSR 一致；
 * 存储偏好在挂载后恢复，可能引起一次重绘。要求无重绘的宿主可由服务端读取偏好，
 * 通过初始 `theme` 传入。后续变更使用 `setTheme`，此属性并非受控状态。
 */
export function LxConfigProvider({ children, theme, className, style }: LxConfigProviderProps) {
  const [selection, setSelection] = useState<LxThemeContextValue['theme']>(() => ({
    ...defaults,
    ...theme,
  }));
  const [systemDark, setSystemDark] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [restored, setRestored] = useState(false);
  const persist = theme?.persist ?? false;
  const storageKey = theme?.storageKey ?? 'lx-ui-theme';

  useEffect(() => {
    if (persist) {
      const stored = readStoredTheme(storageKey);
      if (stored) setSelection((current) => ({ ...current, ...stored }));
    }
    setRestored(true);
  }, [persist, storageKey]);

  useEffect(() => {
    if (!persist || !restored) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(selection));
    } catch {
      // 写入失败不会阻止内存中的主题变更。
    }
  }, [persist, restored, selection, storageKey]);

  useEffect(() => {
    if (selection.mode !== 'system' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(media.matches);
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, [selection.mode]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, []);

  const setTheme = useCallback<LxThemeContextValue['setTheme']>((next) => {
    setSelection((current) => {
      const patch = typeof next === 'function' ? next(current) : next;
      return {
        ...current,
        ...patch,
        palettePreset:
          patch.palettePreset === null ? undefined : (patch.palettePreset ?? current.palettePreset),
      };
    });
  }, []);
  const resolvedMode =
    selection.mode === 'system' ? (systemDark ? 'dark' : 'light') : selection.mode;
  const tokens = useMemo(
    () => resolveLxTokens({ ...selection, mode: resolvedMode }),
    [selection, resolvedMode],
  );
  const contextValue = useMemo(
    () => ({ theme: selection, resolvedMode, setTheme }),
    [selection, resolvedMode, setTheme],
  );
  const antdConfig = useMemo<ThemeConfig>(() => {
    const token = {
      ...tokens.token,
      motion: !reducedMotion,
      ...(reducedMotion
        ? { motionDurationFast: '0ms', motionDurationMid: '0ms', motionDurationSlow: '0ms' }
        : {}),
    };
    const baseAlgorithm =
      resolvedMode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;
    return {
      // 官方暗色算法会再次转换 colorPrimary 等 seed。先保留官方派生结构，
      // 再恢复已验证的语义值，确保 CSS 与 AntD 实际消费的颜色和尺寸一致。
      // 这使用公开 algorithm 扩展点，宿主无需依赖 AntD 内部主题实现。
      algorithm: (seed, map) => ({ ...baseAlgorithm(seed, map), ...token }),
      token,
      components: {
        ...tokens.components,
        ...(reducedMotion
          ? {
              Tree: {
                ...tokens.components.Tree,
                motionDurationMid: '0ms',
                motionDurationSlow: '0ms',
              },
              Alert: { ...tokens.components.Alert, motionDurationSlow: '0ms' },
            }
          : {}),
      },
    };
  }, [tokens, resolvedMode, reducedMotion]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={antdConfig}>
        <div
          className={className}
          style={{ ...tokens.css, ...style }}
          data-lx-mode={resolvedMode}
          data-lx-appearance={selection.appearance}
          data-lx-density={selection.density}
          data-lx-color={selection.palettePreset ?? selection.colorPreset}
        >
          {children}
        </div>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

/** 读取并更新最近的 Provider；缺少 Provider 属于调用方式错误。 */
export function useLxTheme(): LxThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useLxTheme must be used within LxConfigProvider');
  return value;
}
