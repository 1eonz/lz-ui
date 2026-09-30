# Theme runtime

`LxConfigProvider` scopes lx-ui CSS variables and Ant Design 5 tokens to a subtree. Import `lx-ui/style.css` once at the application root. Components use semantic `--lx-*` variables, so changing a preset does not remount the page.

```tsx pure
import { LxConfigProvider, useLxTheme } from 'lx-ui/theme';

function ThemeSwitch() {
  const { theme, resolvedMode, setTheme } = useLxTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme({ mode: resolvedMode === 'dark' ? 'light' : 'dark' })}
    >
      {theme.mode}
    </button>
  );
}

export function App() {
  return (
    <LxConfigProvider theme={{ colorPreset: 'blue', mode: 'system', persist: true }}>
      <ThemeSwitch />
    </LxConfigProvider>
  );
}
```

`theme` is an initial value. `setTheme` accepts a partial selection or updater. `palettePreset` selects one of seven oriental pairs and takes visual priority over `colorPreset`; set it to `null` to return to the brand color. Stable brand keys are `blue`, `orange`, `green`, `purple`, `cyan`, `rose`. Palette keys are `celadon-laurel`, `twilight-peach`, `garnet-almond`, `pine-amber`, `misty-oatmeal`, `bean-sand-ink`, `cheese-distant-cyan`. Appearance is `business`, `soft`, or `glass`; density is `comfortable` or `compact`.

Persistence is opt-in (`persist: true`) and defaults to key `lx-ui-theme`. Malformed or unavailable storage is ignored. SSR and the first hydration render use the supplied initial theme; saved settings and system dark preference apply after mount. A server that knows the user's preference can pass it as `theme` to avoid the repaint. Glass surfaces consume `--lx-glass-surface` and `--lx-glass-backdrop-filter`; both fall back to an opaque surface without filter support or under reduced motion. Ant Design motion is also disabled when reduced motion is requested. Control heights are 40/32px, while table row heights are separately 44/34px and header height is 36px.

The provider sets `data-lx-mode`, `data-lx-appearance`, `data-lx-density`, and `data-lx-color` on its scope. Ant Design's public `ConfigProvider` receives the same resolved semantic colors, sizing, and radius. The palette seed is adjusted only when needed to maintain 4.5:1 contrast; the original palette values remain documented design inputs, not guaranteed final interactive fills.

The provider's `style` prop can override a `--lx-*` variable for one subtree. TypeScript accepts custom properties using the `--lx-${string}` index, while ordinary CSS properties remain checked. These overrides affect lx-ui CSS consumers only; Ant Design tokens continue to use the resolved theme. Keep brand-level changes in the theme presets so both systems agree.

Status messaging can use the paired semantic variables `--lx-color-success` / `--lx-color-success-bg`, `--lx-color-warning` / `--lx-color-warning-bg`, `--lx-color-error` / `--lx-color-error-bg`, and `--lx-color-info` / `--lx-color-info-bg`. The foreground is resolved against its matching tinted background for every brand or oriental palette in both light and dark mode, with a WCAG AA normal-text target of at least 4.5:1. Keep the pairs together when overriding tokens; changing only a background or foreground can invalidate that contrast contract.
