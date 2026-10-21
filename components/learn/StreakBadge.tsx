'use client';

import { cx } from '@/lib/cx';
import { currentStreak } from '@/lib/lessons';
import type { Profile } from '@/lib/types';

/** "5 days of style": consecutive days with a lesson read. Kept on this device only. */
export function StreakBadge({ streak, today, className }: { streak: Profile['streak']; today: string; className?: string }) {
  const days = currentStreak(streak, today);
  const readToday = streak.lastDay === today;
  if (!days) {
    return <p className={cx('caps text-ink-muted', className)}>Read a lesson a day to start a streak</p>;
  }
  return (
    <p className={cx('inline-flex items-baseline gap-2', className)}>
      <span className="numerals font-display text-subhead font-heading tracking-tight text-ink">{days}</span>
      <span className="caps text-ink-muted">
        {days === 1 ? 'day' : 'days'} of style
        {!readToday ? <span className="text-accent"> · read one today to keep it</span> : null}
      </span>
    </p>
  );
}
