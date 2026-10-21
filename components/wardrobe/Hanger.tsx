import { cx } from '@/lib/cx';

/**
 * A thin wire hanger in brushed metal. Coat hangers carry tops, outerwear and
 * dresses; clip hangers carry trousers and skirts.
 */
export function Hanger({ kind = 'coat', className }: { kind?: 'coat' | 'clip'; className?: string }) {
  return (
    <svg viewBox="0 0 120 44" aria-hidden className={cx('block w-full overflow-visible', className)}>
      <defs>
        <linearGradient id="hanger-metal" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-metal-highlight)" />
          <stop offset="0.55" stopColor="var(--color-metal)" />
          <stop offset="1" stopColor="var(--color-metal-shadow)" />
        </linearGradient>
      </defs>
      {/* Hook over the rod. */}
      <path d="M60 22V14a6 6 0 1 1 6-6" fill="none" stroke="url(#hanger-metal)" strokeWidth="2.2" strokeLinecap="round" />
      {kind === 'coat' ? (
        <path
          d="M60 22 12 40.5c-3 1.2-2.2 3.5.8 3.5h94.4c3 0 3.8-2.3.8-3.5Z"
          fill="none"
          stroke="url(#hanger-metal)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <path d="M60 22 38 34M60 22l22 12M30 34h60" fill="none" stroke="url(#hanger-metal)" strokeWidth="2.2" strokeLinecap="round" />
          <rect x="27" y="33" width="9" height="9" rx="1.5" fill="var(--color-metal-shadow)" />
          <rect x="84" y="33" width="9" height="9" rx="1.5" fill="var(--color-metal-shadow)" />
        </>
      )}
    </svg>
  );
}
