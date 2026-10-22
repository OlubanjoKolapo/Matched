'use client';

import { cx } from '@/lib/cx';
import { currentStreak } from '@/lib/lessons';
import type { Profile } from '@/lib/types';

/** "5 days of style": consecutive days with a lesson read. Kept on this device only. */
export function StreakBadge({ streak, today, className }: { streak: Profile['streak']; today: string; className?: string }) {
  const days = currentStreak(streak, today);
  const readToday = streak.lastDay === today;
  if (!days) {
    // Same shape as the live streak, so the page doesn't jump when the first lesson counts.
    return (
      <p className={cx('inline-flex items-baseline gap-2', className)}>
        <span className="numerals font-display text-subhead font-heading tracking-tight text-ink-subtle">0</span>
        <span className="caps text-ink-muted">A lesson a day starts a streak</span>
      </p>
    );
  }
  return (
    <p className={cx('inline-flex items-baseline gap-2', className)}>
      <span className="numerals font-display text-subhead font-heading tracking-tight text-ink">{days}</span>
      <span className="caps text-ink-muted">
        {days === 1 ? 'day' : 'days'} of style
        {!readToday ? <span className="text-accent"> · keep it today</span> : null}
      </span>
    </p>
  );
}
