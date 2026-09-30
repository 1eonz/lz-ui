import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LxConfigProvider, useLxTheme } from '../provider';
import { brandSeeds, paletteSeeds, resolveLxTokens } from '../tokens';

function Consumer() {
  const { theme, resolvedMode, setTheme } = useLxTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme({ mode: 'dark', density: 'compact', palettePreset: 'pine-amber' })}
    >
      {theme.mode}/{resolvedMode}/{theme.density}
    </button>
  );
}

describe('theme runtime', () => {
  beforeEach(() => {
    const entries = new Map<string, string>();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => entries.get(key) ?? null,
        setItem: (key: string, value: string) => entries.set(key, value),
        clear: () => entries.clear(),
      },
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('switches semantic and AntD-bound state at runtime with distinct row height', () => {
    const { container } = render(
      <LxConfigProvider>
        <Consumer />
      </LxConfigProvider>,
    );
    const scope = container.querySelector('[data-lx-mode]') as HTMLElement;
    expect(scope.dataset.lxMode).toBe('light');
    expect(scope.style.getPropertyValue('--lx-control-height')).toBe('40px');
    expect(scope.style.getPropertyValue('--lx-table-row-height')).toBe('44px');
    act(() => screen.getByRole('button').click());
    expect(scope.dataset.lxMode).toBe('dark');
    expect(scope.dataset.lxColor).toBe('pine-amber');
    expect(scope.style.getPropertyValue('--lx-control-height')).toBe('32px');
    expect(scope.style.getPropertyValue('--lx-table-row-height')).toBe('34px');
  });

  it('restores valid preferences and persists updates', () => {
    window.localStorage.setItem('custom', JSON.stringify({ mode: 'dark', colorPreset: 'rose' }));
    const { container } = render(
      <LxConfigProvider theme={{ persist: true, storageKey: 'custom' }}>
        <Consumer />
      </LxConfigProvider>,
    );
    expect(container.querySelector('[data-lx-mode]')?.getAttribute('data-lx-mode')).toBe('dark');
    act(() => screen.getByRole('button').click());
    expect(JSON.parse(window.localStorage.getItem('custom') ?? '{}')).toMatchObject({
      mode: 'dark',
      density: 'compact',
      palettePreset: 'pine-amber',
    });
  });

  it('renders on the server without browser APIs', () => {
    const markup = renderToString(
      <LxConfigProvider theme={{ mode: 'system' }}>
        <span>Content</span>
      </LxConfigProvider>,
    );
    expect(markup).toContain('data-lx-mode="light"');
    expect(markup).toContain('Content');
  });

  it('follows system mode changes and releases its listener', () => {
    let onChange: ((event: { matches: boolean }) => void) | undefined;
    const remove = vi.fn();
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('color-scheme'),
      addEventListener: (_event: string, callback: typeof onChange) => {
        if (query.includes('color-scheme')) onChange = callback;
      },
      removeEventListener: remove,
    }));
    const { container, unmount } = render(
      <LxConfigProvider theme={{ mode: 'system' }}>
        <Consumer />
      </LxConfigProvider>,
    );
    expect(container.querySelector('[data-lx-mode]')?.getAttribute('data-lx-mode')).toBe('dark');
    act(() => onChange?.({ matches: false }));
    expect(container.querySelector('[data-lx-mode]')?.getAttribute('data-lx-mode')).toBe('light');
    unmount();
    expect(remove).toHaveBeenCalled();
  });

  it('keeps text contrast across every palette and mode', () => {
    const contrast = (a: string, b: string) => {
      const luminance = (color: string) =>
        [1, 3, 5]
          .map((index) => parseInt(color.slice(index, index + 2), 16) / 255)
          .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
          .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
      const [high, low] = [luminance(a), luminance(b)].sort((left, right) => right - left);
      return (high + 0.05) / (low + 0.05);
    };
    for (const mode of ['light', 'dark'] as const) {
      for (const colorPreset of Object.keys(brandSeeds) as (keyof typeof brandSeeds)[]) {
        const tokens = resolveLxTokens({
          mode,
          colorPreset,
          appearance: 'business',
          density: 'comfortable',
        });
        expect(contrast(tokens.primary, tokens.surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(tokens.css['--lx-focus-ring'], tokens.surface)).toBeGreaterThanOrEqual(3);
        for (const status of ['success', 'warning', 'error', 'info'] as const) {
          const foreground = tokens.css[`--lx-color-${status}`];
          const background = tokens.css[`--lx-color-${status}-bg`];
          expect(foreground).toMatch(/^#[0-9a-f]{6}$/i);
          expect(background).toMatch(/^#[0-9a-f]{6}$/i);
          expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
        }
      }
      for (const palettePreset of Object.keys(paletteSeeds) as (keyof typeof paletteSeeds)[]) {
        const tokens = resolveLxTokens({
          mode,
          colorPreset: 'blue',
          palettePreset,
          appearance: 'business',
          density: 'comfortable',
        });
        expect(contrast(tokens.primary, tokens.surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(tokens.css['--lx-focus-ring'], tokens.surface)).toBeGreaterThanOrEqual(3);
        for (const status of ['success', 'warning', 'error', 'info'] as const) {
          const foreground = tokens.css[`--lx-color-${status}`];
          const background = tokens.css[`--lx-color-${status}-bg`];
          expect(foreground).toMatch(/^#[0-9a-f]{6}$/i);
          expect(background).toMatch(/^#[0-9a-f]{6}$/i);
          expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
});
