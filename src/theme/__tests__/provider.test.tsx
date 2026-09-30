import { act, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { theme as antdTheme } from 'antd';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LxConfigProvider, useLxTheme } from '../provider';
import { brandSeeds, paletteSeeds, resolveLxTokens } from '../tokens';
import type { LxColorPreset, LxPalettePreset } from '../types';

const palettes = [
  ...Object.keys(brandSeeds).map((colorPreset) => ({ colorPreset: colorPreset as LxColorPreset })),
  ...Object.keys(paletteSeeds).map((palettePreset) => ({
    colorPreset: 'blue' as const,
    palettePreset: palettePreset as LxPalettePreset,
  })),
];

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

function AntTokenConsumer() {
  const { token } = antdTheme.useToken();
  return <output data-testid="antd-token">{JSON.stringify(token)}</output>;
}

function ClearPaletteConsumer() {
  const { theme, setTheme } = useLxTheme();
  return (
    <button type="button" onClick={() => setTheme({ palettePreset: null })}>
      {theme.palettePreset ?? theme.colorPreset}
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
        <AntTokenConsumer />
      </LxConfigProvider>,
    );
    const scope = container.querySelector('[data-lx-mode]') as HTMLElement;
    expect(scope.dataset.lxMode).toBe('light');
    expect(scope.style.getPropertyValue('--lx-control-height')).toBe('40px');
    expect(scope.style.getPropertyValue('--lx-table-row-height')).toBe('48px');
    expect(JSON.parse(screen.getByTestId('antd-token').textContent ?? '{}')).toMatchObject({
      colorPrimary: scope.style.getPropertyValue('--lx-color-primary'),
      controlHeight: 40,
      controlHeightSM: 24,
      controlHeightLG: 48,
      fontSize: 14,
      lineHeight: 22 / 14,
    });
    act(() => screen.getByRole('button').click());
    expect(scope.dataset.lxMode).toBe('dark');
    expect(scope.dataset.lxColor).toBe('pine-amber');
    expect(scope.style.getPropertyValue('--lx-control-height')).toBe('32px');
    expect(scope.style.getPropertyValue('--lx-table-row-height')).toBe('36px');
    expect(JSON.parse(screen.getByTestId('antd-token').textContent ?? '{}')).toMatchObject({
      colorPrimary: scope.style.getPropertyValue('--lx-color-primary'),
      controlHeight: 32,
      colorSuccessBg: scope.style.getPropertyValue('--lx-color-success-bg'),
    });
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
    vi.stubGlobal('window', undefined);
    const markup = renderToString(
      <LxConfigProvider theme={{ mode: 'system' }}>
        <span>Content</span>
      </LxConfigProvider>,
    );
    expect(markup).toContain('data-lx-mode="light"');
    expect(markup).toContain('Content');
  });

  it('clears an oriental palette with null and restores the selected brand color', () => {
    const { container } = render(
      <LxConfigProvider theme={{ colorPreset: 'rose', palettePreset: 'pine-amber' }}>
        <ClearPaletteConsumer />
        <AntTokenConsumer />
      </LxConfigProvider>,
    );
    const scope = container.querySelector('[data-lx-mode]') as HTMLElement;
    expect(scope.dataset.lxColor).toBe('pine-amber');
    act(() => screen.getByRole('button', { name: 'pine-amber' }).click());
    expect(screen.getByRole('button', { name: 'rose' })).toBeInTheDocument();
    expect(scope.dataset.lxColor).toBe('rose');
    const expected = resolveLxTokens({
      mode: 'light',
      colorPreset: 'rose',
      appearance: 'business',
      density: 'comfortable',
    });
    expect(scope.style.getPropertyValue('--lx-color-primary')).toBe(expected.primary);
    expect(JSON.parse(screen.getByTestId('antd-token').textContent ?? '{}')).toMatchObject(
      expected.token,
    );
  });

  it('keeps nested SSR selections and leaves glass enhancement to CSS', () => {
    vi.stubGlobal('window', undefined);
    const theme = {
      mode: 'dark',
      appearance: 'glass',
      density: 'compact',
      colorPreset: 'rose',
    } as const;
    const resolved = resolveLxTokens(theme);
    const markup = renderToString(
      <LxConfigProvider>
        <LxConfigProvider theme={theme}>
          <span>Nested content</span>
        </LxConfigProvider>
      </LxConfigProvider>,
    );
    expect(markup).toContain('data-lx-mode="light"');
    expect(markup).toContain('data-lx-mode="dark"');
    expect(markup).toContain('data-lx-appearance="glass"');
    expect(markup).toContain('--lx-panel-radius:12px');
    expect(markup).toContain(`--lx-panel-surface-base:${resolved.surface}`);
    expect(markup).not.toContain('--lx-panel-backdrop-filter:');
    expect(markup).not.toContain('--lx-panel-surface:');
  });

  it('disables AntD motion when the system requests reduced motion', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('reduced-motion'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    render(
      <LxConfigProvider>
        <AntTokenConsumer />
      </LxConfigProvider>,
    );
    expect(JSON.parse(screen.getByTestId('antd-token').textContent ?? '{}')).toMatchObject({
      motion: false,
      motionDurationFast: '0ms',
      motionDurationMid: '0ms',
      motionDurationSlow: '0ms',
    });
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

  for (const mode of ['light', 'dark'] as const) {
    it.each(palettes)(
      `keeps native AntD semantic tokens equal to CSS in ${mode}: %j`,
      (palette) => {
        const selection = {
          ...palette,
          mode,
          appearance: 'business',
          density: 'comfortable',
        } as const;
        const expected = resolveLxTokens(selection);
        const { container } = render(
          <LxConfigProvider theme={selection}>
            <AntTokenConsumer />
          </LxConfigProvider>,
        );
        const actual = JSON.parse(screen.getByTestId('antd-token').textContent ?? '{}');
        expect(actual).toMatchObject(expected.token);
        const scope = container.querySelector('[data-lx-mode]') as HTMLElement;
        expect(actual.colorPrimary).toBe(scope.style.getPropertyValue('--lx-color-primary'));
        expect(actual.colorPrimaryHover).toBe(
          scope.style.getPropertyValue('--lx-color-primary-hover'),
        );
        expect(actual.colorPrimaryActive).toBe(
          scope.style.getPropertyValue('--lx-color-primary-active'),
        );
        expect(actual.colorPrimaryBg).toBe(scope.style.getPropertyValue('--lx-color-primary-bg'));
        expect(actual.colorTextLightSolid).toBe(
          scope.style.getPropertyValue('--lx-color-on-primary'),
        );
        for (const status of ['success', 'warning', 'error', 'info'] as const) {
          const name = `color${status[0].toUpperCase()}${status.slice(1)}`;
          expect(actual[name]).toBe(scope.style.getPropertyValue(`--lx-color-${status}`));
          expect(actual[`${name}Bg`]).toBe(scope.style.getPropertyValue(`--lx-color-${status}-bg`));
        }
      },
    );
  }
});
