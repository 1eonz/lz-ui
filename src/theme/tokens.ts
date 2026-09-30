import type { CSSProperties } from 'react';
import type { ThemeConfig } from 'antd';
import type { LxAppearance, LxColorPreset, LxDensity, LxPalettePreset } from './types';

/** Approved seed colors. Palette secondary values tint ambient surfaces, never body text. */
export const brandSeeds: Record<LxColorPreset, string> = {
  blue: '#1677ff',
  orange: '#f97316',
  green: '#16a34a',
  purple: '#7c3aed',
  cyan: '#0891b2',
  rose: '#e11d48',
};
export const paletteSeeds: Record<LxPalettePreset, readonly [string, string]> = {
  'celadon-laurel': ['#3fa796', '#e8d9b5'],
  'twilight-peach': ['#4a5f8c', '#e8b4a2'],
  'garnet-almond': ['#b5485d', '#f3e2d1'],
  'pine-amber': ['#365b4c', '#d9a441'],
  'misty-oatmeal': ['#8877c7', '#f0e7db'],
  'bean-sand-ink': ['#c88697', '#31424d'],
  'cheese-distant-cyan': ['#e7c86a', '#5d7e7a'],
};

type LxCssProperties = CSSProperties & Record<`--lx-${string}`, string>;
const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif';
// Keep fixed-format measurements here: CSS and public AntD tokens must use the
// same numbers. Component props still own explicit/custom sizes and rich content.
const headings = [
  [38, 46, 800],
  [30, 38, 700],
  [24, 32, 600],
  [20, 28, 600],
  [16, 24, 600],
] as const;
const body = { size: 14, lineHeight: 22 };
const caption = { size: 12, lineHeight: 20 };
const sizes = {
  controlSmall: 24,
  controlLarge: 48,
  tableHeader: 36,
  tableFont: 12,
  tableLineHeight: 18,
  tablePaddingInline: 16,
  paginationSmall: 24,
  paginationRadius: 8,
  avatarLarge: 48,
  avatarDefault: 36,
  avatarSmall: 24,
  avatarOverlap: -8,
  avatarSpace: 4,
  avatarSquareRadius: 8,
  treeIndent: 24,
  descriptionPaddingBlock: 8,
  descriptionPaddingInline: 12,
  statisticTitle: 12,
  statisticContent: 28,
  resultTitle: 16,
  resultSubtitle: 12,
  resultIcon: 32,
  resultExtraMargin: 12,
  cardPadding: 16,
  cardPaddingSmall: 12,
  cardTitle: 16,
  cardTitleSmall: 14,
  spinSmall: 16,
  spinDefault: 24,
  spinLarge: 36,
  dividerTitleOffset: 24,
  panelBlur: 16,
  radiusPill: 999,
} as const;
const motion = { duration: '180ms', spin: '800ms', alertExit: '160ms' };
const px = (value: number) => `${value}px`;
const rgb = (hex: string): [number, number, number] =>
  [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)) as [
    number,
    number,
    number,
  ];
const hex = (values: number[]) =>
  `#${values.map((part) => Math.round(part).toString(16).padStart(2, '0')).join('')}`;
const mix = (a: string, b: string, amount: number) =>
  hex(rgb(a).map((part, index) => part * (1 - amount) + rgb(b)[index] * amount));
const luminance = (color: string) =>
  rgb(color)
    .map((part) => {
      const value = part / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    })
    .reduce((sum, part, index) => sum + part * [0.2126, 0.7152, 0.0722][index], 0);
const contrast = (a: string, b: string) => {
  const [high, low] = [luminance(a), luminance(b)].sort((left, right) => right - left);
  return (high + 0.05) / (low + 0.05);
};

/**
 * Seeds are design inputs, not legibility guarantees. Adjust toward the mode's
 * foreground until all known opaque backgrounds reach 4.5:1. Transparent glass
 * over host imagery is outside this contract; its fallback is checked instead.
 */
function readableAccent(seed: string, backgrounds: readonly string[], dark: boolean): string {
  const readable = (color: string) => backgrounds.every((background) => contrast(color, background) >= 4.5);
  if (readable(seed)) return seed;
  const target = dark ? '#ffffff' : '#000000';
  let low = 0;
  let high = 1;
  for (let index = 0; index < 18; index += 1) {
    const middle = (low + high) / 2;
    if (readable(mix(seed, target, middle))) high = middle;
    else low = middle;
  }
  return mix(seed, target, Math.min(1, high + 0.01));
}

export interface LxResolvedTokens {
  css: LxCssProperties;
  token: NonNullable<ThemeConfig['token']>;
  components: NonNullable<ThemeConfig['components']>;
  primary: string;
  onPrimary: string;
  text: string;
  textSecondary: string;
  surface: string;
  elevated: string;
  border: string;
  controlHeight: number;
  radius: number;
}

/** Semantic source shared by CSS variables and Ant Design's public ConfigProvider tokens. */
export function resolveLxTokens(options: {
  colorPreset: LxColorPreset;
  palettePreset?: LxPalettePreset | null;
  appearance: LxAppearance;
  density: LxDensity;
  mode: 'light' | 'dark';
}): LxResolvedTokens {
  const dark = options.mode === 'dark';
  const [seed, ambient] = options.palettePreset
    ? paletteSeeds[options.palettePreset]
    : [brandSeeds[options.colorPreset], brandSeeds[options.colorPreset]];
  const canvas = dark ? '#111820' : '#f8f9ff';
  const surface = dark ? '#1b2630' : '#ffffff';
  const elevated = dark ? '#26333e' : '#ffffff';
  const text = dark ? '#f2f5f7' : '#0b1c30';
  const textSecondary = dark ? '#c2ccd2' : '#414755';
  const border = dark ? '#61717c' : '#727786';
  const subtleBorder = dark ? '#455662' : '#c1c6d7';
  const ambientSurface = mix(ambient, surface, dark ? 0.83 : 0.9);
  const panelSurface = options.appearance === 'soft' ? ambientSurface : surface;
  const opaqueSurfaces = [canvas, surface, elevated, panelSurface];
  const primary = readableAccent(seed, opaqueSurfaces, dark);
  const primaryBg = mix(primary, surface, 0.9);
  const primaryText = readableAccent(seed, [...opaqueSurfaces, primaryBg], dark);
  const primaryHover = mix(primary, dark ? '#ffffff' : '#000000', 0.1);
  const primaryActive = mix(primary, dark ? '#ffffff' : '#000000', 0.2);
  const hoverBg = mix(primary, surface, 0.95);
  const selectedHoverBg = mix(primary, surface, 0.85);
  const successBg = mix('#16a34a', surface, dark ? 0.95 : 0.94);
  const warningBg = mix('#b26b00', surface, dark ? 0.95 : 0.94);
  const errorBg = mix('#dc2626', surface, dark ? 0.95 : 0.94);
  const infoBg = mix('#2563eb', surface, dark ? 0.95 : 0.94);
  // Resolve each semantic foreground against its actual tinted background;
  // resolving against the surface alone can lose contrast in dark mode.
  const success = readableAccent('#16a34a', [...opaqueSurfaces, successBg], dark);
  const warning = readableAccent('#b26b00', [...opaqueSurfaces, warningBg], dark);
  const error = readableAccent('#dc2626', [...opaqueSurfaces, errorBg], dark);
  const info = readableAccent('#2563eb', [...opaqueSurfaces, infoBg], dark);
  const onPrimary = contrast('#ffffff', primary) >= 4.5 ? '#ffffff' : '#0b1c30';
  const controlHeight = options.density === 'compact' ? 32 : 40;
  const compact = options.density === 'compact';
  const tableRow = compact ? 36 : 48;
  const tablePaddingBlock = compact ? 9 : 15;
  const paginationFont = compact ? 14 : 16;
  const paginationGap = compact ? 6 : 8;
  const radius = options.appearance === 'business' ? 4 : options.appearance === 'soft' ? 6 : 8;
  const panelRadius = options.appearance === 'business' ? 4 : options.appearance === 'soft' ? 8 : 12;
  const panelShadow = options.appearance === 'business'
    ? 'none'
    : dark
      ? '0 8px 24px -4px rgba(0, 0, 0, 0.4)'
      : '0 8px 24px -4px rgba(15, 30, 60, 0.08)';
  const tertiaryText = dark ? '#a8b7c0' : '#555e6d';
  const disabledText = dark ? '#96a6b0' : '#616b78';
  const css: LxCssProperties = {
    '--lx-color-primary': primary,
    '--lx-color-primary-text': primaryText,
    '--lx-color-on-primary': onPrimary,
    '--lx-color-primary-hover': primaryHover,
    '--lx-color-primary-active': primaryActive,
    '--lx-color-primary-bg': primaryBg,
    '--lx-color-primary-border': mix(primary, surface, 0.35),
    '--lx-color-ambient': ambientSurface,
    '--lx-color-bg-base': canvas,
    '--lx-color-surface': surface,
    '--lx-color-bg-container': surface,
    '--lx-color-bg-elevated': elevated,
    '--lx-color-text': text,
    '--lx-color-text-secondary': textSecondary,
    '--lx-color-text-tertiary': tertiaryText,
    '--lx-color-text-disabled': disabledText,
    '--lx-color-border': border,
    '--lx-color-border-secondary': subtleBorder,
    '--lx-color-split': subtleBorder,
    '--lx-color-success': success,
    // Status backgrounds stay close to the surface so the semantic foreground
    // remains readable in both modes. The foreground is already adjusted by
    // readableAccent; keeping the tint subtle preserves >= 4.5:1 contrast.
    '--lx-color-success-bg': successBg,
    '--lx-color-warning': warning,
    '--lx-color-warning-bg': warningBg,
    '--lx-color-error': error,
    '--lx-color-error-bg': errorBg,
    '--lx-color-info': info,
    '--lx-color-info-bg': infoBg,
    '--lx-control-height': px(controlHeight),
    '--lx-control-height-small': px(sizes.controlSmall),
    '--lx-control-height-large': px(sizes.controlLarge),
    '--lx-table-row-height': px(tableRow),
    '--lx-table-header-height': px(sizes.tableHeader),
    '--lx-table-font-size': px(sizes.tableFont),
    '--lx-table-line-height': px(sizes.tableLineHeight),
    '--lx-table-cell-padding-block': px(tablePaddingBlock),
    '--lx-table-cell-padding-inline': px(sizes.tablePaddingInline),
    '--lx-pagination-item-size': px(controlHeight),
    '--lx-pagination-item-size-small': px(sizes.paginationSmall),
    '--lx-pagination-font-size': px(paginationFont),
    '--lx-pagination-gap': px(paginationGap),
    '--lx-pagination-radius': px(sizes.paginationRadius),
    '--lx-avatar-size-large': px(sizes.avatarLarge),
    '--lx-avatar-size-default': px(sizes.avatarDefault),
    '--lx-avatar-size-small': px(sizes.avatarSmall),
    '--lx-avatar-group-overlap': px(sizes.avatarOverlap),
    '--lx-avatar-group-space': px(sizes.avatarSpace),
    '--lx-avatar-square-radius': px(sizes.avatarSquareRadius),
    '--lx-tree-indent': px(sizes.treeIndent),
    '--lx-color-item-hover-bg': hoverBg,
    '--lx-color-item-selected-bg': primaryBg,
    '--lx-color-item-selected-hover-bg': selectedHoverBg,
    '--lx-descriptions-padding-block': px(sizes.descriptionPaddingBlock),
    '--lx-descriptions-padding-inline': px(sizes.descriptionPaddingInline),
    '--lx-statistic-title-font-size': px(sizes.statisticTitle),
    '--lx-statistic-content-font-size': px(sizes.statisticContent),
    '--lx-result-title-font-size': px(sizes.resultTitle),
    '--lx-result-subtitle-font-size': px(sizes.resultSubtitle),
    '--lx-result-icon-font-size': px(sizes.resultIcon),
    '--lx-result-extra-margin': px(sizes.resultExtraMargin),
    '--lx-card-padding': px(sizes.cardPadding),
    '--lx-card-padding-small': px(sizes.cardPaddingSmall),
    '--lx-card-title-font-size': px(sizes.cardTitle),
    '--lx-card-title-font-size-small': px(sizes.cardTitleSmall),
    '--lx-spin-size-small': px(sizes.spinSmall),
    '--lx-spin-size-default': px(sizes.spinDefault),
    '--lx-spin-size-large': px(sizes.spinLarge),
    '--lx-alert-padding': '8px 12px',
    '--lx-alert-padding-description': px(sizes.cardPadding),
    '--lx-divider-title-offset': px(sizes.dividerTitleOffset),
    '--lx-radius-control': px(radius),
    '--lx-radius-panel': px(panelRadius),
    '--lx-radius-pill': px(sizes.radiusPill),
    '--lx-panel-surface': panelSurface,
    '--lx-panel-backdrop-blur': px(sizes.panelBlur),
    '--lx-panel-glass-opacity': '85%',
    '--lx-space-xs': '4px',
    '--lx-space-sm': '8px',
    '--lx-space-md': '12px',
    '--lx-space-lg': '16px',
    '--lx-space-xl': '24px',
    '--lx-font-family': fontFamily,
    '--lx-font-size-body': px(body.size),
    '--lx-line-height-body': px(body.lineHeight),
    '--lx-font-size-caption': px(caption.size),
    '--lx-line-height-caption': px(caption.lineHeight),
    '--lx-shadow-panel': panelShadow,
    '--lx-motion-duration': motion.duration,
    '--lx-motion-spin-duration': motion.spin,
    '--lx-motion-alert-exit-duration': motion.alertExit,
    '--lx-focus-ring': primary,
  };
  headings.forEach(([size, lineHeight, weight], index) => {
    css[`--lx-font-size-heading-${index + 1}`] = px(size);
    css[`--lx-line-height-heading-${index + 1}`] = px(lineHeight);
    css[`--lx-font-weight-heading-${index + 1}`] = String(weight);
  });

  // These are public AntD v5 aliases/component tokens, checked through its root
  // export. CSS variables alone cannot configure AntD; no invented --ant-* vars.
  const token: LxResolvedTokens['token'] = {
    colorPrimary: primary,
    colorPrimaryHover: primaryHover,
    colorPrimaryActive: primaryActive,
    colorPrimaryBg: primaryBg,
    colorPrimaryBgHover: selectedHoverBg,
    colorPrimaryBorder: css['--lx-color-primary-border'],
    colorPrimaryText: primaryText,
    colorPrimaryTextHover: primaryHover,
    colorPrimaryTextActive: primaryActive,
    colorLink: primaryText,
    colorLinkHover: primaryHover,
    colorLinkActive: primaryActive,
    colorTextLightSolid: onPrimary,
    colorText: text,
    colorTextSecondary: textSecondary,
    colorTextTertiary: tertiaryText,
    colorTextQuaternary: disabledText,
    colorTextDisabled: disabledText,
    colorTextPlaceholder: tertiaryText,
    colorTextHeading: text,
    colorTextLabel: textSecondary,
    colorTextDescription: textSecondary,
    colorIcon: textSecondary,
    colorIconHover: text,
    colorBgBase: canvas,
    colorBgLayout: canvas,
    colorBgContainer: surface,
    colorBgElevated: elevated,
    colorBgContainerDisabled: hoverBg,
    colorBorder: border,
    colorBorderSecondary: subtleBorder,
    colorSplit: subtleBorder,
    colorFillAlter: hoverBg,
    colorFillContent: hoverBg,
    colorFillSecondary: hoverBg,
    colorFillTertiary: primaryBg,
    colorBgTextHover: hoverBg,
    colorBgTextActive: primaryBg,
    controlItemBgHover: hoverBg,
    controlItemBgActive: primaryBg,
    controlItemBgActiveHover: selectedHoverBg,
    colorSuccess: success,
    colorSuccessText: success,
    colorSuccessBg: successBg,
    colorSuccessBorder: success,
    colorWarning: warning,
    colorWarningText: warning,
    colorWarningBg: warningBg,
    colorWarningBorder: warning,
    colorError: error,
    colorErrorText: error,
    colorErrorBg: errorBg,
    colorErrorBorder: error,
    colorInfo: info,
    colorInfoText: info,
    colorInfoBg: infoBg,
    colorInfoBorder: info,
    controlOutline: primary,
    colorWarningOutline: warning,
    colorErrorOutline: error,
    controlHeight,
    controlHeightSM: sizes.controlSmall,
    controlHeightLG: sizes.controlLarge,
    borderRadius: radius,
    fontFamily,
    fontSize: body.size,
    lineHeight: body.lineHeight / body.size,
    fontSizeSM: caption.size,
    lineHeightSM: caption.lineHeight / caption.size,
    motionDurationFast: motion.duration,
    motionDurationMid: motion.duration,
    motionDurationSlow: motion.duration,
  };
  const components: LxResolvedTokens['components'] = {
    Button: {
      controlHeight,
      controlHeightSM: sizes.controlSmall,
      controlHeightLG: sizes.controlLarge,
      borderRadius: radius,
      borderRadiusSM: radius,
      borderRadiusLG: radius,
      contentFontSize: body.size,
      contentFontSizeSM: caption.size,
      contentFontSizeLG: sizes.cardTitle,
      contentLineHeight: body.lineHeight / body.size,
      contentLineHeightSM: caption.lineHeight / caption.size,
      contentLineHeightLG: headings[4][1] / sizes.cardTitle,
      primaryColor: onPrimary,
      defaultBg: surface,
      defaultColor: text,
      defaultBorderColor: border,
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
    },
    Typography: {
      fontSizeHeading1: headings[0][0],
      fontSizeHeading2: headings[1][0],
      fontSizeHeading3: headings[2][0],
      fontSizeHeading4: headings[3][0],
      fontSizeHeading5: headings[4][0],
      lineHeightHeading1: headings[0][1] / headings[0][0],
      lineHeightHeading2: headings[1][1] / headings[1][0],
      lineHeightHeading3: headings[2][1] / headings[2][0],
      lineHeightHeading4: headings[3][1] / headings[3][0],
      lineHeightHeading5: headings[4][1] / headings[4][0],
      titleMarginTop: 0,
      titleMarginBottom: 12,
    },
    Table: {
      cellPaddingBlock: tablePaddingBlock,
      cellPaddingBlockMD: compact ? 7 : 12,
      cellPaddingBlockSM: compact ? 5 : 9,
      cellPaddingInline: sizes.tablePaddingInline,
      cellPaddingInlineMD: sizes.tablePaddingInline,
      cellPaddingInlineSM: sizes.tablePaddingInline,
      cellFontSize: sizes.tableFont,
      cellFontSizeMD: sizes.tableFont,
      cellFontSizeSM: sizes.tableFont,
      lineHeight: sizes.tableLineHeight / sizes.tableFont,
      headerBg: hoverBg,
      headerColor: textSecondary,
      headerSortActiveBg: primaryBg,
      headerSortHoverBg: selectedHoverBg,
      headerFilterHoverBg: primaryBg,
      fixedHeaderSortActiveBg: primaryBg,
      bodySortBg: hoverBg,
      rowHoverBg: hoverBg,
      rowSelectedBg: primaryBg,
      rowSelectedHoverBg: selectedHoverBg,
      rowExpandedBg: hoverBg,
      borderColor: subtleBorder,
      headerSplitColor: subtleBorder,
      headerBorderRadius: panelRadius,
      filterDropdownBg: elevated,
      filterDropdownMenuBg: elevated,
    },
    Pagination: {
      itemSize: controlHeight,
      itemSizeSM: sizes.paginationSmall,
      controlHeight,
      controlHeightSM: sizes.paginationSmall,
      fontSize: paginationFont,
      marginXS: paginationGap,
      borderRadius: sizes.paginationRadius,
      borderRadiusSM: sizes.paginationRadius,
      itemBg: surface,
      itemLinkBg: surface,
      itemInputBg: surface,
      itemActiveBg: primary,
      itemActiveColor: onPrimary,
      itemActiveColorHover: onPrimary,
      itemActiveBgDisabled: hoverBg,
      itemActiveColorDisabled: disabledText,
    },
    Avatar: {
      containerSizeLG: sizes.avatarLarge,
      containerSize: sizes.avatarDefault,
      containerSizeSM: sizes.avatarSmall,
      groupOverlapping: sizes.avatarOverlap,
      groupSpace: sizes.avatarSpace,
      groupBorderColor: surface,
      borderRadius: sizes.avatarSquareRadius,
      borderRadiusSM: sizes.avatarSquareRadius,
      borderRadiusLG: sizes.avatarSquareRadius,
    },
    Card: {
      bodyPadding: sizes.cardPadding,
      bodyPaddingSM: sizes.cardPaddingSmall,
      headerPadding: sizes.cardPadding,
      headerPaddingSM: sizes.cardPaddingSmall,
      headerFontSize: sizes.cardTitle,
      headerFontSizeSM: sizes.cardTitleSmall,
      borderRadiusLG: panelRadius,
      colorBgContainer: panelSurface,
      headerBg: 'transparent',
      actionsBg: panelSurface,
      boxShadowTertiary: panelShadow,
      extraColor: textSecondary,
    },
    Tree: {
      indentSize: sizes.treeIndent,
      nodeHoverBg: hoverBg,
      nodeHoverColor: text,
      nodeSelectedBg: primaryBg,
      nodeSelectedColor: primaryText,
      directoryNodeSelectedBg: primary,
      directoryNodeSelectedColor: onPrimary,
      motionDurationMid: motion.duration,
      motionDurationSlow: motion.duration,
    },
    Tag: {
      defaultBg: hoverBg,
      defaultColor: textSecondary,
      fontSizeSM: caption.size,
      lineHeightSM: caption.lineHeight / caption.size,
      borderRadiusSM: radius,
    },
    Descriptions: {
      labelBg: hoverBg,
      labelColor: textSecondary,
      contentColor: text,
      titleColor: text,
      extraColor: textSecondary,
      itemPaddingBottom: sizes.descriptionPaddingBlock,
      itemPaddingEnd: sizes.descriptionPaddingInline,
      padding: sizes.descriptionPaddingBlock,
      paddingLG: sizes.descriptionPaddingInline,
      paddingSM: sizes.descriptionPaddingBlock,
      paddingXS: sizes.descriptionPaddingInline,
    },
    Statistic: {
      titleFontSize: sizes.statisticTitle,
      contentFontSize: sizes.statisticContent,
      fontFamily,
    },
    Result: {
      titleFontSize: sizes.resultTitle,
      subtitleFontSize: sizes.resultSubtitle,
      iconFontSize: sizes.resultIcon,
      extraMargin: `${px(sizes.resultExtraMargin)} 0 0`,
      lineHeightHeading3: headings[4][1] / sizes.resultTitle,
      lineHeight: caption.lineHeight / sizes.resultSubtitle,
    },
    Alert: {
      defaultPadding: css['--lx-alert-padding'],
      withDescriptionPadding: sizes.cardPadding,
      withDescriptionIconSize: 20,
      borderRadiusLG: panelRadius,
      fontSize: body.size,
      fontSizeLG: body.size,
      fontSizeIcon: 16,
      motionDurationSlow: motion.alertExit,
    },
    Spin: {
      dotSizeSM: sizes.spinSmall,
      dotSize: sizes.spinDefault,
      dotSizeLG: sizes.spinLarge,
    },
    Progress: {
      defaultColor: primary,
      remainingColor: subtleBorder,
      circleTextColor: text,
      lineBorderRadius: sizes.radiusPill,
    },
    Skeleton: {
      gradientFromColor: hoverBg,
      gradientToColor: primaryBg,
      blockRadius: radius,
      paragraphLiHeight: caption.size,
      paragraphMarginTop: 16,
    },
    Empty: { colorTextDescription: textSecondary, fontSize: caption.size },
  };
  return {
    css,
    token,
    components,
    primary,
    onPrimary,
    text,
    textSecondary,
    surface,
    elevated,
    border,
    controlHeight,
    radius,
  };
}
