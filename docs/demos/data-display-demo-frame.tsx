import type { ReactNode } from 'react';
import { LxConfigProvider, RadioGroup, Switch, useLxTheme } from 'lx-ui';
import type { LxAppearance } from 'lx-ui';
import styles from './data-display-demo.module.css';

/**
 * Demo-only theme scope. Persistence is disabled so a specimen cannot overwrite
 * the documentation site's theme. Runtime updates deliberately use setTheme:
 * the provider's theme prop is an initial value, not a controlled selection.
 */
export function DataDisplayDemoFrame({ children }: { children: ReactNode }) {
  return (
    <LxConfigProvider theme={{ mode: 'light', persist: false }}>
      <DemoSurface>{children}</DemoSurface>
    </LxConfigProvider>
  );
}

function DemoSurface({ children }: { children: ReactNode }) {
  const { theme, resolvedMode, setTheme } = useLxTheme();
  return (
    <div className={styles.surface}>
      <div className={styles.toolbar}>
        <Switch
          aria-label="暗色模式"
          checked={resolvedMode === 'dark'}
          checkedChildren="暗色"
          unCheckedChildren="浅色"
          onChange={(dark) => setTheme({ mode: dark ? 'dark' : 'light' })}
        />
        <Switch
          aria-label="紧凑密度"
          checked={theme.density === 'compact'}
          checkedChildren="紧凑"
          unCheckedChildren="舒适"
          onChange={(compact) => setTheme({ density: compact ? 'compact' : 'comfortable' })}
        />
        <RadioGroup
          aria-label="外观"
          optionType="button"
          value={theme.appearance}
          options={[
            { label: '商务', value: 'business' },
            { label: '轻盈', value: 'soft' },
            { label: '玻璃', value: 'glass' },
          ]}
          onChange={(event) => setTheme({ appearance: event.target.value as LxAppearance })}
        />
      </div>
      <div className={styles.stack}>{children}</div>
    </div>
  );
}
