'use client';

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useEffect } from 'react';
import { cx } from '@/lib/cx';
import { duration, ease } from '@/lib/motion';
import type { Verdict } from '@/lib/types';
import { VERDICT_LABEL, verdictFor } from '@/lib/verdict';

type RingSize = 'sm' | 'md' | 'lg';

const sizes: Record<RingSize, { box: string; numeral: string; showVerdict: boolean }> = {
  sm: { box: 'size-ring-sm', numeral: 'text-title', showVerdict: false },
  md: { box: 'size-ring-md', numeral: 'text-headline', showVerdict: true },
  lg: { box: 'size-ring-lg', numeral: 'text-numeral', showVerdict: true },
};

const strokeColor: Record<Verdict, string> = {
  matched: 'stroke-matched',
  works: 'stroke-works',
  rethink: 'stroke-rethink',
};

const labelColor: Record<Verdict, string> = {
  matched: 'text-matched',
  works: 'text-ink-muted',
  rethink: 'text-rethink',
};

/** Ring geometry in viewBox units; stroke width comes from --ring-stroke. */
const RADIUS = 47;

/**
 * Match score as a filling ring with a large serif numeral.
 * Fills from zero on mount and re-animates when the score changes.
 */
export function ScoreRing({ score, size = 'md', className }: { score: number; size?: RingSize; className?: string }) {
  const verdict = verdictFor(score);
  const reduceMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const dashOffset = useTransform(progress, (v) => 1 - v / 100);
  const numeral = useTransform(progress, (v) => Math.round(v));
  const { box, numeral: numeralSize, showVerdict } = sizes[size];

  useEffect(() => {
    if (reduceMotion) {
      progress.set(score);
      return;
    }
    const controls = animate(progress, score, { duration: duration.ring, ease: ease.emphasized });
    return () => controls.stop();
  }, [score, reduceMotion, progress]);

  return (
    <div
      role="img"
      aria-label={`Score ${score} out of 100: ${VERDICT_LABEL[verdict]}`}
      className={cx('relative inline-grid shrink-0 place-items-center', box, className)}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          className="stroke-rule"
          strokeWidth="var(--ring-stroke)"
          vectorEffect="non-scaling-stroke"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          className={strokeColor[verdict]}
          strokeWidth="var(--ring-stroke)"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray="1 1"
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div aria-hidden className="relative flex flex-col items-center">
        <motion.span className={cx('font-display numerals leading-none tracking-display', numeralSize)}>
          {numeral}
        </motion.span>
        {showVerdict ? <span className={cx('caps mt-1', labelColor[verdict])}>{VERDICT_LABEL[verdict]}</span> : null}
      </div>
    </div>
  );
}
