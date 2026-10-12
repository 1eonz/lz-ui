import styles from './empty-illustration.module.css';

export function EmptyDemoIllustration({ size = 'default' }: { size?: 'default' | 'small' }) {
  return (
    <span
      className={[styles.illustration, size === 'small' ? styles.small : undefined]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <svg className={styles.svg} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect className={styles.frame} x="12" y="16" width="40" height="36" rx="4" />
        <path className={styles.primaryLine} d="M22 28H42" />
        <path className={styles.secondaryLine} d="M22 36H34" />
        <circle className={styles.marker} cx="46" cy="46" r="10" />
        <path className={styles.primaryLine} d="M43 46H49" />
      </svg>
    </span>
  );
}
