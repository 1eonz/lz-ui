import { Avatar as AntAvatar } from 'antd';
import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import type { AvatarGroupProps, AvatarProps } from './types';
import styles from './index.module.css';

type AvatarStyle = CSSProperties & {
  '--lx-avatar-identity-bg'?: string;
};

type GraphemeSegmenter = {
  segment(value: string): Iterable<{ segment: string }>;
};

type IntlWithSegmenter = typeof Intl & {
  Segmenter?: new (
    locales?: string | string[],
    options?: { granularity: 'grapheme' },
  ) => GraphemeSegmenter;
};

const identityColorCount = 6;
const graphemeMark = /^\p{Mark}$/u;
const regionalIndicator = /^[\u{1F1E6}-\u{1F1FF}]$/u;
const unicodeLetter = /^\p{Letter}$/u;

// 原生分段器优先；回退路径覆盖常见印度语 virama，避免把辅音连写拆成独立首字母。
const indicConjunctLinkers = new Set([
  0x094d, 0x09cd, 0x0a4d, 0x0acd, 0x0b4d, 0x0bcd, 0x0c4d, 0x0ccd, 0x0d4d, 0x0dca, 0x1039, 0x103a,
  0x17d2, 0x1a60, 0x1b44, 0x1baa, 0x1bab, 0xa806, 0xa8c4, 0xa953, 0xa9c0, 0xaaf6, 0xabe5, 0xabed,
  0x10a3f, 0x11046, 0x11070, 0x11133, 0x11134, 0x111c0, 0x11235, 0x112ea, 0x1134d, 0x11442, 0x11446,
  0x114c2, 0x115bf, 0x1163f, 0x116b6, 0x1172b, 0x11839, 0x1193d, 0x1193e, 0x119e0, 0x11a34, 0x11a47,
  0x11a99, 0x11c3f, 0x11d44, 0x11d45, 0x11d97, 0x11f41,
]);

let cachedGraphemeSegmenter: GraphemeSegmenter | undefined;

/** 逐码点判断扩展符，避免拆开 emoji 修饰符、变体选择符与国旗 tag 序列。 */
function isGraphemeExtension(character: string): boolean {
  const codePoint = character.codePointAt(0) ?? -1;
  return (
    graphemeMark.test(character) ||
    (codePoint >= 0xfe00 && codePoint <= 0xfe0f) ||
    (codePoint >= 0xe0100 && codePoint <= 0xe01ef) ||
    (codePoint >= 0x1f3fb && codePoint <= 0x1f3ff) ||
    (codePoint >= 0xe0020 && codePoint <= 0xe007f)
  );
}

/** 优先复用原生字素簇分段器；缺少该 API 时合并组合符号、印度语连写、旗帜和 ZWJ 序列。 */
function getGraphemes(value: string): string[] {
  const Segmenter = (Intl as IntlWithSegmenter).Segmenter;
  if (Segmenter) {
    cachedGraphemeSegmenter ??= new Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(cachedGraphemeSegmenter.segment(value), ({ segment }) => segment);
  }

  const graphemes: string[] = [];
  let regionalIndicatorCount = 0;
  let hasTrailingConjunctLinker = false;
  for (const character of value) {
    const lastIndex = graphemes.length - 1;
    const lastGrapheme = graphemes[lastIndex];
    const isRegionalIndicator = regionalIndicator.test(character);
    const isExtension = isGraphemeExtension(character);
    const codePoint = character.codePointAt(0) ?? -1;
    const isConjunctLinker = indicConjunctLinkers.has(codePoint);
    const joinsPrevious =
      lastGrapheme !== undefined &&
      (isExtension ||
        character === '\u200D' ||
        lastGrapheme.endsWith('\u200D') ||
        (isRegionalIndicator && regionalIndicatorCount % 2 === 1) ||
        (hasTrailingConjunctLinker && unicodeLetter.test(character)));

    if (joinsPrevious) {
      graphemes[lastIndex] += character;
      regionalIndicatorCount = isRegionalIndicator ? regionalIndicatorCount + 1 : 0;
      if (isConjunctLinker) {
        hasTrailingConjunctLinker = true;
      } else if (!isExtension && character !== '\u200D') {
        hasTrailingConjunctLinker = false;
      }
      continue;
    }

    graphemes.push(character);
    regionalIndicatorCount = isRegionalIndicator ? 1 : 0;
    hasTrailingConjunctLinker = isConjunctLinker;
  }

  return graphemes;
}

/** 为同一姓名生成跨会话稳定的颜色索引，避免列表刷新后用户身份颜色跳变。 */
function getIdentityColorIndex(name: string): number {
  let hash = 2166136261;
  for (const character of name.trim().normalize('NFC')) {
    const codePoint = character.codePointAt(0);
    if (codePoint !== undefined) hash = Math.imul(hash ^ codePoint, 16777619) >>> 0;
  }
  return hash % identityColorCount;
}

/** 大写映射可能扩展字符；转换后再限制为两个字素簇，避免缩写挤出头像。 */
function getUppercaseInitials(value: string): string {
  return getGraphemes(value.toUpperCase()).slice(0, 2).join('');
}

/** 多词姓名按语义首字母分别映射，避免 ß 等扩展映射挤掉末词首字母。 */
function getUppercaseInitial(value: string): string {
  return getGraphemes(value.toUpperCase())[0] ?? '';
}

/** 姓名缩写遵循中日韩取首字、其他语言按首末词或前两个字素簇取首字母的习惯。 */
function getInitials(name: string): string {
  const words = name.trim().normalize('NFC').split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';

  const firstWordGraphemes = getGraphemes(words[0]);
  const firstCharacter = firstWordGraphemes[0] ?? '';
  if (
    /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(firstCharacter)
  ) {
    return firstCharacter;
  }

  if (words.length > 1) {
    const lastCharacter = getGraphemes(words[words.length - 1])[0] ?? '';
    return `${getUppercaseInitial(firstCharacter)}${getUppercaseInitial(lastCharacter)}`;
  }

  return getUppercaseInitials(firstWordGraphemes.slice(0, 2).join(''));
}

/**
 * 用户或实体头像。将名称放到稳定的根语义上，避免 AntD 图片失败后内部 img 被移除时丢名；
 * name 派生缩写与身份色只作默认值，显式 children、ARIA、role 和背景样式始终由宿主掌控。
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(props, ref) {
  const { name, ...avatarProps } = props;
  const normalizedName = name?.trim();
  const hasLabelledBy = Boolean(avatarProps['aria-labelledby']?.trim());
  const ariaLabel =
    avatarProps['aria-label'] !== undefined
      ? avatarProps['aria-label']
      : hasLabelledBy
        ? undefined
        : (avatarProps.alt ?? normalizedName);
  const hasAccessibleName = Boolean(ariaLabel?.trim()) || hasLabelledBy;
  const role = avatarProps.role ?? (hasAccessibleName ? 'img' : undefined);
  const hasCustomBackground = Boolean(
    avatarProps.style?.background ||
    avatarProps.style?.backgroundColor ||
    avatarProps.style?.backgroundImage !== undefined,
  );
  const identityColor = normalizedName && !hasCustomBackground;
  const hasExplicitChildren = Object.prototype.hasOwnProperty.call(avatarProps, 'children');
  const children = hasExplicitChildren
    ? avatarProps.children
    : normalizedName
      ? getInitials(normalizedName)
      : undefined;
  const style: AvatarStyle = {
    ...(avatarProps.shape === 'square'
      ? { borderRadius: 'var(--lx-avatar-square-radius, 8px)' }
      : {}),
    ...(identityColor
      ? {
          '--lx-avatar-identity-bg': `var(--lx-color-avatar-identity-${getIdentityColorIndex(normalizedName) + 1})`,
        }
      : {}),
    ...avatarProps.style,
  };
  const antAvatarProps = {
    ...avatarProps,
    role,
    'aria-label': ariaLabel,
    alt: role ? '' : avatarProps.alt,
    children,
    style,
    className: [styles.root, identityColor ? styles.named : undefined, avatarProps.className]
      .filter(Boolean)
      .join(' '),
  };

  return <AntAvatar {...antAvatarProps} ref={ref} />;
});
/**
 * 带溢出限制的头像组。AntD 5.24 未公开 Group ref，因此 ref 指向 lx-ui 容器。
 * className 同时附加到 lx-ui 容器和 AntD 公开的 Group 根节点，便于宿主用 CSS Module
 * 布局成员；style 与 ref 仍指向 lx-ui 容器，尺寸、数量限制和提示弹层沿用 AntD 公开参数。
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup(props, ref) {
    const { className, style, ...groupProps } = props;
    return (
      <div
        ref={ref}
        style={style}
        className={[styles.groupRoot, className].filter(Boolean).join(' ')}
      >
        <AntAvatar.Group {...groupProps} className={className} />
      </div>
    );
  },
);
export type { AvatarGroupProps, AvatarProps } from './types';
