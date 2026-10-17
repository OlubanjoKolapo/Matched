'use client';

import { motion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { duration, ease, scale } from '@/lib/motion';

interface ChipProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  selected?: boolean;
  /** Low-confidence AI tag: highlighted so the user confirms it. */
  uncertain?: boolean;
  /** Leading visual, e.g. a <Swatch />. */
  leading?: ReactNode;
  children: ReactNode;
}

const popVariants = {
  off: { scale: 1 },
  on: { scale: [1, scale.pop, 1], transition: { duration: duration.slow, ease: ease.emphasized } },
};

export function Chip({ selected = false, uncertain = false, leading, className, children, type = 'button', ...props }: ChipProps) {
  return (
    <motion.button
      type={type}
      aria-pressed={selected}
      initial={false}
      animate={selected ? 'on' : 'off'}
      variants={popVariants}
      whileTap={{ scale: scale.tap }}
      className={cx(
        'inline-flex h-9 items-center gap-2 rounded-pill border px-3.5 text-caption font-medium whitespace-nowrap',
        'transition-[background-color,color,border-color] duration-(--duration-fast) ease-standard',
        selected
          ? 'border-ink bg-ink text-on-ink'
          : uncertain
            ? 'border-dashed border-rethink bg-rethink-soft text-ink hover:border-solid'
            : 'border-rule-strong text-ink hover:border-ink',
        className,
      )}
      {...props}
    >
      {leading}
      {children}
      {uncertain && !selected ? <span className="sr-only">(please confirm)</span> : null}
    </motion.button>
  );
}
