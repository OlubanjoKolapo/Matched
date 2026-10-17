'use client';

import { motion } from 'motion/react';
import { cx } from '@/lib/cx';
import { spring } from '@/lib/motion';

/** Thin editorial progress rule. `value` is 0–1. */
export function ProgressBar({ value, label, className }: { value: number; label: string; className?: string }) {
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      className={cx('h-0.5 w-full overflow-hidden bg-rule', className)}
    >
      <motion.div
        className="h-full origin-left bg-ink"
        initial={false}
        animate={{ scaleX: clamped }}
        transition={spring.settle}
      />
    </div>
  );
}
