import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'postcss';
import { describe, expect, it } from 'vitest';
import { brandSeeds, feedbackTooltipTokens, paletteSeeds, resolveLxTokens } from '../tokens';
import type { LxColorPreset, LxPalettePreset } from '../types';

const defaults = {
  mode: 'light',
  colorPreset: 'blue',
  appearance: 'business',
  density: 'comfortable',
} as const;
const palettes = [
  ...Object.keys(brandSeeds).map((colorPreset) => ({ colorPreset: colorPreset as LxColorPreset })),
  ...Object.keys(paletteSeeds).map((palettePreset) => ({
    colorPreset: 'blue' as const,
    palettePreset: palettePreset as LxPalettePreset,
  })),
];
const tableThemeMatrix = (['light', 'dark'] as const).flatMap((mode) =>
  (['business', 'soft', 'glass'] as const).flatMap((appearance) =>
    palettes.flatMap((palette) =>
      (['comfortable', 'compact'] as const).map((density) => ({
        ...palette,
        mode,
        appearance,
        density,
      })),
    ),
  ),
);
const contrast = (a: string, b: string) => {
  const luminance = (color: string) =>
    [1, 3, 5]
      .map((index) => parseInt(color.slice(index, index + 2), 16) / 255)
      .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
      .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  const [high, low] = [luminance(a), luminance(b)].sort((left, right) => right - left);
  return (high + 0.05) / (low + 0.05);
};

describe('resolved theme tokens', () => {
  it('covers all 156 Table theme combinations', () => {
    expect(tableThemeMatrix).toHaveLength(156);
  });

  it('在所有主题配色、外观和明暗模式下保持 Tooltip 对比度', () => {
    expect(feedbackTooltipTokens.spotlightBackground).toBe('#1f2937');
    expect(feedbackTooltipTokens.spotlightText).toBe('#ffffff');
    expect(
      contrast(feedbackTooltipTokens.spotlightText, feedbackTooltipTokens.spotlightBackground),
    ).toBeGreaterThanOrEqual(4.5);
    for (const mode of ['light', 'dark'] as const) {
      for (const appearance of ['business', 'soft', 'glass'] as const) {
        for (const palette of palettes) {
          const { token } = resolveLxTokens({ ...defaults, ...palette, mode, appearance });
          const spotlightBackground = token.colorBgSpotlight;
          expect(spotlightBackground).toBe(feedbackTooltipTokens.spotlightBackground);
          if (!spotlightBackground) continue;
          expect(
            contrast(feedbackTooltipTokens.spotlightText, spotlightBackground),
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it.each(['comfortable', 'compact'] as const)('shares explicit sizes at %s density', (density) => {
    const { css, token, components } = resolveLxTokens({ ...defaults, density });
    const compact = density === 'compact';
    expect(components.Button).toMatchObject({
      controlHeight: compact ? 32 : 40,
      controlHeightSM: 24,
      controlHeightLG: 40,
    });
    expect(token.controlHeightLG).toBe(48);
    expect(css['--lx-control-height-large']).toBe('48px');
    expect(css['--lx-button-middle-height']).toBe('32px');
    expect(components.Table).toMatchObject({
      cellPaddingBlock: compact ? 9 : 15,
      cellPaddingBlockMD: compact ? 7 : 12,
      cellPaddingBlockSM: compact ? 5 : 9,
      cellPaddingInline: 16,
      cellPaddingInlineMD: 16,
      cellPaddingInlineSM: 16,
      cellFontSize: 12,
      cellFontSizeMD: 12,
      cellFontSizeSM: 12,
      lineHeight: 18 / 12,
    });
    expect(css['--lx-table-row-height']).toBe(compact ? '36px' : '48px');
    expect(css['--lx-table-header-height']).toBe('36px');
    expect(css['--lx-tag-height']).toBe('26px');
    expect(components.Pagination).toMatchObject({
      itemSize: compact ? 32 : 40,
      itemSizeSM: 24,
      fontSize: compact ? 14 : 16,
      marginXS: compact ? 6 : 8,
      borderRadius: 8,
    });
    expect(css['--lx-pagination-gap']).toBe(compact ? '6px' : '8px');
    expect(components.Avatar).toMatchObject({
      containerSizeLG: 48,
      containerSize: 36,
      containerSizeSM: 24,
      groupOverlapping: -8,
      groupSpace: 4,
      borderRadius: 8,
    });
    expect(components.Spin).toMatchObject({ dotSizeSM: 16, dotSize: 24, dotSizeLG: 36 });
  });

  it.each(tableThemeMatrix)(
    'keeps Table sizes and readable colors for $mode/$appearance/$density/$colorPreset/$palettePreset',
    (options) => {
      const { css, components } = resolveLxTokens(options);
      const compact = options.density === 'compact';
      const panelRadius =
        options.appearance === 'business' ? 4 : options.appearance === 'soft' ? 8 : 12;
      const table = components.Table;
      if (!table) throw new Error('解析结果缺少 Table 主题 token');

      expect(table).toMatchObject({
        cellPaddingBlock: compact ? 9 : 15,
        cellPaddingBlockMD: compact ? 7 : 12,
        cellPaddingBlockSM: compact ? 5 : 9,
        cellPaddingInline: 16,
        cellPaddingInlineMD: 16,
        cellPaddingInlineSM: 16,
        cellFontSize: 12,
        cellFontSizeMD: 12,
        cellFontSizeSM: 12,
        lineHeight: 18 / 12,
        headerBg: css['--lx-color-item-hover-bg'],
        headerColor: css['--lx-color-text-secondary'],
        rowHoverBg: css['--lx-color-item-hover-bg'],
        rowSelectedBg: css['--lx-color-item-selected-bg'],
        borderColor: css['--lx-color-border-secondary'],
        headerBorderRadius: panelRadius,
      });
      expect(css['--lx-table-row-height']).toBe(compact ? '36px' : '48px');
      expect(css['--lx-table-header-height']).toBe('36px');
      expect(css['--lx-table-font-size']).toBe('12px');
      expect(css['--lx-table-line-height']).toBe('18px');
      expect(css['--lx-table-cell-padding-block']).toBe(compact ? '9px' : '15px');
      expect(css['--lx-table-cell-padding-inline']).toBe('16px');

      expect(
        contrast(css['--lx-color-text'], css['--lx-color-surface']),
        'body text on the table surface',
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(table.headerColor ?? '', table.headerBg ?? ''),
        'header text on the table header background',
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(css['--lx-color-text'], css['--lx-color-item-selected-bg']),
        'body text on the selected row background',
      ).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('uses the highest content token for body cells and checkbox height for table headers', () => {
    const stylesheet = parse(
      readFileSync(resolve('src/components/data-display/table/index.module.css'), 'utf8'),
    );
    let paddingBlock: string | undefined;
    let headerPaddingBlock: string | undefined;
    let coarseBodyHeight: string | undefined;
    let coarseHeaderHeight: string | undefined;
    let coarsePaddingBlock: string | undefined;
    let coarseHeaderPaddingBlock: string | undefined;
    stylesheet.walkRules('.root .bodyRow.bodyRow > td', (rule) => {
      if (rule.parent?.type !== 'root') return;
      rule.walkDecls('padding-block', (declaration) => {
        paddingBlock = declaration.value;
      });
    });
    stylesheet.walkRules((rule) => {
      if (rule.parent?.type !== 'root') return;
      if (!rule.selector.includes('.headerRow.headerRow > th')) return;
      rule.walkDecls('padding-block', (declaration) => {
        headerPaddingBlock = declaration.value;
      });
    });
    stylesheet.walkAtRules('media', (media) => {
      if (media.params !== '(any-pointer: coarse)') return;
      media.walkRules('.root .bodyRow', (rule) => {
        rule.walkDecls('height', (declaration) => {
          coarseBodyHeight = declaration.value;
        });
      });
      media.walkRules('.root .headerRow', (rule) => {
        rule.walkDecls('height', (declaration) => {
          coarseHeaderHeight = declaration.value;
        });
      });
      media.walkRules('.root .bodyRow.bodyRow > td', (rule) => {
        rule.walkDecls('padding-block', (declaration) => {
          coarsePaddingBlock = declaration.value;
        });
      });
      media.walkRules((rule) => {
        if (!rule.selector.includes('.headerRow.headerRow > th')) return;
        rule.walkDecls('padding-block', (declaration) => {
          coarseHeaderPaddingBlock = declaration.value;
        });
      });
    });

    expect(paddingBlock).toContain('max(');
    expect(paddingBlock).toContain('var(--lx-table-line-height)');
    expect(paddingBlock).toContain('var(--lx-control-height-small)');
    expect(paddingBlock).toContain('var(--lx-tag-height)');
    expect(headerPaddingBlock).toContain('max(');
    expect(headerPaddingBlock).toContain('var(--lx-table-header-height)');
    expect(headerPaddingBlock).toContain('var(--lx-control-height-small)');
    expect(coarsePaddingBlock).toContain('max(');
    expect(coarsePaddingBlock).toContain('var(--lx-table-line-height)');
    expect(coarsePaddingBlock).toContain('var(--lx-control-target-touch-min)');
    expect(coarsePaddingBlock).toContain('var(--lx-tag-height)');
    expect(coarseHeaderPaddingBlock).toContain('max(');
    expect(coarseHeaderPaddingBlock).toContain('var(--lx-table-header-height)');
    expect(coarseHeaderPaddingBlock).toContain('var(--lx-control-target-touch-min)');
    expect(coarseBodyHeight).toBe(
      'max(var(--lx-table-row-height), var(--lx-control-target-touch-min))',
    );
    expect(coarseHeaderHeight).toBe(
      'max(var(--lx-table-header-height), var(--lx-control-target-touch-min))',
    );
  });

  it('maps approved typography, semantic states and content spacing through public tokens', () => {
    const { css, token, components } = resolveLxTokens(defaults);
    const headings = [
      [38, 46, 800],
      [30, 38, 700],
      [24, 32, 600],
      [20, 28, 600],
      [16, 24, 600],
    ];
    headings.forEach(([size, lineHeight, weight], index) => {
      expect(css[`--lx-font-size-heading-${index + 1}`]).toBe(`${size}px`);
      expect(css[`--lx-line-height-heading-${index + 1}`]).toBe(`${lineHeight}px`);
      expect(css[`--lx-font-weight-heading-${index + 1}`]).toBe(String(weight));
    });
    expect(token).toMatchObject({
      fontSize: 14,
      lineHeight: 22 / 14,
      fontSizeSM: 12,
      lineHeightSM: 20 / 12,
      colorSuccess: css['--lx-color-success'],
      colorSuccessBg: css['--lx-color-success-bg'],
      colorSplit: css['--lx-color-split'],
      controlOutline: css['--lx-focus-ring'],
    });
    expect(components.Tree).toMatchObject({
      indentSize: 24,
      nodeHoverBg: css['--lx-color-item-hover-bg'],
      nodeSelectedBg: css['--lx-color-item-selected-bg'],
      nodeSelectedColor: css['--lx-color-primary-text'],
      motionDurationMid: '180ms',
    });
    expect(components.Descriptions).toMatchObject({ itemPaddingBottom: 8, itemPaddingEnd: 12 });
    expect(components.Statistic).toMatchObject({ titleFontSize: 12, contentFontSize: 28 });
    expect(css['--lx-statistic-value-font-size']).toBe('28px');
    expect(css['--lx-statistic-value-line-height']).toBe('36px');
    expect(css['--lx-statistic-value-weight']).toBe('700');
    expect(css['--lx-tag-height']).toBe('26px');
    expect(components.Result).toMatchObject({
      titleFontSize: 16,
      subtitleFontSize: 12,
      iconFontSize: 32,
      extraMargin: '12px 0 0',
    });
    expect(components.Card).toMatchObject({
      bodyPadding: 16,
      bodyPaddingSM: 12,
      headerPadding: 16,
      headerPaddingSM: 12,
      headerFontSize: 16,
      headerFontSizeSM: 14,
    });
    expect(components.Tag).toMatchObject({
      fontSizeSM: 12,
      lineHeightSM: 16 / 12,
      borderRadiusSM: 6,
    });
    expect(components.Alert).toMatchObject({
      defaultPadding: '8px 12px',
      withDescriptionPadding: 16,
      motionDurationSlow: '160ms',
    });
  });

  it.each([
    ['business', 4],
    ['soft', 8],
    ['glass', 12],
  ] as const)(
    'shares the %s opaque panel fallback without overriding progressive properties',
    (appearance, radius) => {
      const { css, components } = resolveLxTokens({ ...defaults, appearance });
      expect(css['--lx-panel-radius']).toBe(`${radius}px`);
      expect(components.Card).toMatchObject({
        borderRadiusLG: radius,
        colorBgContainer: css['--lx-panel-surface-base'],
        boxShadowTertiary: css['--lx-panel-shadow'],
      });
      expect(components.Alert).toMatchObject({ borderRadiusLG: radius });
      expect(css['--lx-panel-backdrop-blur']).toBe('16px');
      expect(css).not.toHaveProperty('--lx-panel-surface');
      expect(css).not.toHaveProperty('--lx-panel-backdrop-filter');
      if (appearance === 'business') expect(css['--lx-panel-shadow']).toBe('none');
      if (appearance === 'soft')
        expect(css['--lx-panel-surface-base']).toBe(css['--lx-color-ambient']);
    },
  );

  it('has a matching CSS fallback for every default resolved variable', () => {
    const stylesheet = parse(readFileSync(resolve('src/styles/tokens.css'), 'utf8'));
    const fallback = new Map<string, string>();
    stylesheet.walkRules(':root', (rule) => {
      rule.walkDecls((declaration) => {
        fallback.set(declaration.prop, declaration.value);
      });
    });
    const normalize = (value: string) => value.replace(/\s+/g, ' ').replace(/"/g, "'");
    for (const [name, value] of Object.entries(resolveLxTokens(defaults).css)) {
      expect(fallback.has(name), name).toBe(true);
      expect(normalize(fallback.get(name) ?? ''), name).toBe(normalize(value));
    }
    expect(fallback.get('--lx-panel-surface')).toBe('var(--lx-panel-surface-base)');
    expect(fallback.get('--lx-panel-backdrop-filter')).toBe('none');
  });

  for (const mode of ['light', 'dark'] as const) {
    for (const appearance of ['business', 'soft', 'glass'] as const) {
      it.each(palettes)(
        `keeps normal text legible on opaque ${mode}/${appearance} surfaces: %j`,
        (palette) => {
          const { css, primary, onPrimary } = resolveLxTokens({
            ...defaults,
            ...palette,
            mode,
            appearance,
          });
          // 只测试可确定的实色表面；透明 glass 需要宿主针对实际图片单独验证。
          const surfaces = [
            '--lx-color-bg-base',
            '--lx-color-surface',
            '--lx-color-bg-elevated',
            '--lx-panel-surface-base',
            '--lx-color-item-hover-bg',
            '--lx-color-item-selected-bg',
            '--lx-color-item-selected-hover-bg',
          ] as const;
          for (const backgroundName of surfaces) {
            const background = css[backgroundName];
            for (const name of [
              '--lx-color-text',
              '--lx-color-text-secondary',
              '--lx-color-text-tertiary',
              '--lx-color-primary-text',
            ] as const) {
              expect(
                contrast(css[name], background),
                `${name} on ${backgroundName}`,
              ).toBeGreaterThanOrEqual(4.5);
            }
            expect(
              contrast(css['--lx-focus-ring'], background),
              `focus on ${backgroundName}`,
            ).toBeGreaterThanOrEqual(3);
          }
          expect(contrast(primary, css['--lx-color-surface'])).toBeGreaterThanOrEqual(4.5);
          for (const fill of [
            primary,
            css['--lx-color-primary-hover'],
            css['--lx-color-primary-active'],
          ]) {
            expect(contrast(onPrimary, fill), 'solid action label').toBeGreaterThanOrEqual(4.5);
          }
          for (const status of ['success', 'warning', 'error', 'info'] as const) {
            const foreground = css[`--lx-color-${status}`];
            const background = css[`--lx-color-${status}-bg`];
            expect(
              contrast(foreground, background),
              `${status} foreground/background`,
            ).toBeGreaterThanOrEqual(4.5);
            expect(
              contrast(foreground, css['--lx-panel-surface-base']),
              `${status} text on panel`,
            ).toBeGreaterThanOrEqual(4.5);
          }
        },
      );
    }
  }
});
