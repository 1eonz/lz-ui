import { ConfigProvider, theme as antdTheme } from 'antd';
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

/** Ignore stale/corrupt storage values instead of allowing them to index an undefined seed. */
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
    // Storage may be disabled by privacy settings; the provider remains fully functional.
    return null;
  }
}

/**
 * Provides nested, runtime-switchable CSS tokens and AntD v5 tokens. The first client render
 * matches SSR exactly; saved preferences restore after mount, which may cause one repaint.
 * An app requiring zero repaint can supply the saved selection from its server as `theme`.
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
      // Storage failure never prevents an in-memory theme change.
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

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider
        theme={{
          algorithm: resolvedMode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: tokens.primary,
            colorTextLightSolid: tokens.onPrimary,
            colorText: tokens.text,
            colorTextSecondary: tokens.textSecondary,
            colorBgBase: tokens.css['--lx-color-bg-base'],
            colorBgContainer: tokens.surface,
            colorBgElevated: tokens.elevated,
            colorBorder: tokens.border,
            colorBorderSecondary: tokens.css['--lx-color-border-secondary'],
            colorSuccess: tokens.css['--lx-color-success'],
            colorWarning: tokens.css['--lx-color-warning'],
            colorError: tokens.css['--lx-color-error'],
            colorInfo: tokens.css['--lx-color-info'],
            // AntD input-like controls draw this outline on their own border radius.
            // Share lx-ui's contrast-checked focus color instead of stacking a wrapper ring.
            controlOutline: tokens.css['--lx-focus-ring'],
            controlHeight: tokens.controlHeight,
            borderRadius: tokens.radius,
            motion: !reducedMotion,
          },
        }}
      >
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

/** Read and update the nearest provider. A missing provider is a usage error. */
export function useLxTheme(): LxThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useLxTheme must be used within LxConfigProvider');
  return value;
}
