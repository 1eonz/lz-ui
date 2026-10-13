import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { usePrefersColor, useSiteData } from 'dumi';
import '../../src/style.css';
import { LxConfigProvider, RadioGroup, Select, Switch, useLxTheme } from 'lx-ui';
import type { LxAppearance, LxColorPreset, LxPalettePreset } from 'lx-ui';
import styles from './data-display-demo.module.css';

interface DataDisplayDemoFrameProps {
  children: ReactNode;
  /** 稳定的示例选择标识；省略时不添加测试属性。 */
  demoId?: string;
  /** 当示例自身提供密度控件时设为 false；默认保留通用主题设置中的开关。 */
  showDensitySwitch?: boolean;
  /** 当示例并排展示多种外观时设为 false，避免重复提供单一外观选择。 */
  showAppearanceControl?: boolean;
}

/** 让示例跟随文档站明暗模式；示例内的其他主题选择仍彼此隔离且不持久化。 */
export function DataDisplayDemoFrame({
  children,
  demoId,
  showDensitySwitch = true,
  showAppearanceControl = true,
}: DataDisplayDemoFrameProps) {
  const [preferredColor] = usePrefersColor();
  const { themeConfig } = useSiteData();
  const fallbackMode = themeConfig.prefersColor.default === 'dark' ? 'dark' : 'light';
  const docsMode = preferredColor ?? fallbackMode;

  return (
    <LxConfigProvider theme={{ mode: docsMode, persist: false }}>
      <DemoSurface
        docsMode={docsMode}
        demoId={demoId}
        showDensitySwitch={showDensitySwitch}
        showAppearanceControl={showAppearanceControl}
      >
        {children}
      </DemoSurface>
    </LxConfigProvider>
  );
}

function DemoSurface({
  children,
  docsMode,
  demoId,
  showDensitySwitch,
  showAppearanceControl,
}: {
  children: ReactNode;
  docsMode: 'light' | 'dark';
  demoId?: string;
  showDensitySwitch: boolean;
  showAppearanceControl: boolean;
}) {
  const { theme, resolvedMode, setTheme } = useLxTheme();

  useEffect(() => {
    // 文档明暗变化时同步示例；局部切换在文档模式不变时继续保持独立。
    setTheme({ mode: docsMode });
  }, [docsMode, setTheme]);

  return (
    <div className={styles.surface} data-testid={demoId}>
      <details className={styles.themeSettings}>
        <summary>主题设置</summary>
        <div className={styles.toolbar}>
          <Switch
            className={styles.themeSwitchTarget}
            aria-label="暗色模式"
            checked={resolvedMode === 'dark'}
            checkedChildren="暗色"
            unCheckedChildren="浅色"
            onChange={(dark) => setTheme({ mode: dark ? 'dark' : 'light' })}
          />
          {showDensitySwitch && (
            <Switch
              className={styles.themeSwitchTarget}
              aria-label="紧凑密度"
              checked={theme.density === 'compact'}
              checkedChildren="紧凑"
              unCheckedChildren="舒适"
              onChange={(compact) => setTheme({ density: compact ? 'compact' : 'comfortable' })}
            />
          )}
          {showAppearanceControl && (
            <RadioGroup
              aria-label="外观"
              optionType="button"
              value={theme.appearance}
              options={[
                {
                  label: '商务',
                  value: 'business',
                  style: {
                    minWidth: 'var(--lx-demo-theme-settings-target-size)',
                    minHeight: 'var(--lx-demo-theme-settings-target-size)',
                  },
                },
                {
                  label: '轻盈',
                  value: 'soft',
                  style: {
                    minWidth: 'var(--lx-demo-theme-settings-target-size)',
                    minHeight: 'var(--lx-demo-theme-settings-target-size)',
                  },
                },
                {
                  label: '玻璃',
                  value: 'glass',
                  style: {
                    minWidth: 'var(--lx-demo-theme-settings-target-size)',
                    minHeight: 'var(--lx-demo-theme-settings-target-size)',
                  },
                },
              ]}
              onChange={(event) => setTheme({ appearance: event.target.value as LxAppearance })}
            />
          )}
          <label className={styles.field}>
            品牌色
            <Select
              aria-label="品牌色"
              data-testid="theme-color-select"
              styles={{ root: { height: 'var(--lx-demo-theme-settings-target-size)' } }}
              value={theme.colorPreset}
              options={[
                { label: '海洋蓝', value: 'blue' },
                { label: '活力橙', value: 'orange' },
                { label: '翡翠绿', value: 'green' },
                { label: '智慧紫', value: 'purple' },
                { label: '清透青', value: 'cyan' },
                { label: '品牌玫红', value: 'rose' },
              ]}
              onChange={(value: string) =>
                setTheme({ colorPreset: value as LxColorPreset, palettePreset: null })
              }
            />
          </label>
          <label className={styles.field}>
            东方配色
            <Select
              aria-label="东方配色"
              data-testid="theme-palette-select"
              styles={{ root: { height: 'var(--lx-demo-theme-settings-target-size)' } }}
              value={theme.palettePreset ?? 'brand'}
              options={[
                { label: '使用品牌色', value: 'brand' },
                { label: '青瓷桂影', value: 'celadon-laurel' },
                { label: '暮桃微光', value: 'twilight-peach' },
                { label: '石榴杏仁', value: 'garnet-almond' },
                { label: '松针琥珀', value: 'pine-amber' },
                { label: '雾色燕麦', value: 'misty-oatmeal' },
                { label: '豆沙墨色', value: 'bean-sand-ink' },
                { label: '奶酪远青', value: 'cheese-distant-cyan' },
              ]}
              onChange={(value: string) =>
                setTheme({ palettePreset: value === 'brand' ? null : (value as LxPalettePreset) })
              }
            />
          </label>
        </div>
      </details>
      <div className={styles.stack}>{children}</div>
    </div>
  );
}
