import { Card, LxConfigProvider, useLxTheme } from 'lx-ui';
import type { LxAppearance } from 'lx-ui';
import { DataDisplayDemoFrame } from './data-display-demo-frame';
import styles from './card.module.css';

const appearanceOptions: readonly {
  appearance: LxAppearance;
  label: string;
  useCase: string;
}[] = [
  { appearance: 'business', label: 'Business', useCase: '适合财务与运营后台' },
  { appearance: 'soft', label: 'Soft', useCase: '适合轻量分组与运营工作台' },
  { appearance: 'glass', label: 'Glass', useCase: '适合有内容底图的展示面板' },
];

export default function CardAppearancesDemo() {
  return (
    <DataDisplayDemoFrame demoId="card-appearance-demo" showAppearanceControl={false}>
      <CardAppearanceGrid />
    </DataDisplayDemoFrame>
  );
}

function CardAppearanceGrid() {
  const { theme, resolvedMode } = useLxTheme();
  const effectiveThemeKey = [
    theme.mode,
    resolvedMode,
    theme.density,
    theme.colorPreset,
    theme.palettePreset ?? 'brand',
  ].join(':');

  return (
    <div className={styles.appearanceContainer}>
      <div className={styles.appearanceGrid} data-testid="card-appearance-grid">
        {appearanceOptions.map(({ appearance, label, useCase }) => (
          <LxConfigProvider
            key={`${effectiveThemeKey}:${appearance}`}
            theme={{
              mode: theme.mode,
              appearance,
              density: theme.density,
              colorPreset: theme.colorPreset,
              palettePreset: theme.palettePreset ?? undefined,
              persist: false,
            }}
          >
            <div className={styles.appearanceStage}>
              {appearance === 'glass' && (
                <div
                  className={styles.glassBackdrop}
                  data-testid="card-appearance-glass-backdrop"
                  aria-hidden="true"
                >
                  <span />
                  <span />
                  <span />
                </div>
              )}
              <Card
                className={styles.appearanceCard}
                data-testid={`card-appearance-${appearance}`}
                title={label}
              >
                <p className={styles.appearanceUseCase}>{useCase}</p>
                <p className={styles.appearanceSummary}>12 笔待复核</p>
                <p className={styles.appearanceDetail}>预警金额 ¥284,600</p>
              </Card>
            </div>
          </LxConfigProvider>
        ))}
      </div>
    </div>
  );
}
