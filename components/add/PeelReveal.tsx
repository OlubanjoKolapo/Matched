'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cx } from '@/lib/cx';
import { ease } from '@/lib/motion';

/**
 * The photo, then the cutout peeling across it like a sticker lifting off its
 * backing: the background falls away behind a moving curl. Reduced motion:
 * the cutout simply fades in.
 */
export function PeelReveal({
  photoUrl,
  cutoutUrl,
  working,
  progress,
  alt,
  className,
}: {
  photoUrl: string;
  /** Set once the background is removed; null if removal failed. */
  cutoutUrl?: string | null;
  working: boolean;
  /** 0–1 while the model loads and runs. */
  progress?: number;
  alt: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const peeled = !!cutoutUrl;
  const duration = reduce ? 0 : 1;

  return (
    <div className={cx('relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-studio', className)}>
      {/* The original photo, fading back once the cutout is in place. */}
      <motion.img
        src={photoUrl}
        alt={peeled ? '' : alt}
        className="absolute inset-0 size-full object-contain"
        initial={false}
        animate={{ opacity: peeled ? 0 : 1, scale: peeled ? 1.02 : 1 }}
        transition={{ duration: reduce ? 0.2 : 0.6, delay: reduce ? 0 : 0.7, ease: ease.emphasized }}
      />

      {/* Scanning sheen while the background is being removed. */}
      <AnimatePresence>
        {working && !reduce ? (
          <motion.div
            key="scan"
            aria-hidden
            className="pointer-events-none absolute inset-x-0 h-1/4 bg-gradient-to-b from-transparent via-paper-raised/40 to-transparent"
            initial={{ top: '-25%', opacity: 0 }}
            animate={{ top: ['-25%', '100%'], opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ top: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.3 } }}
          />
        ) : null}
      </AnimatePresence>

      {peeled ? (
        <>
          <motion.div
            className="absolute inset-0 bg-studio"
            initial={{ clipPath: reduce ? 'inset(0 0 0 0)' : 'inset(0 0 0 100%)', opacity: reduce ? 0 : 1 }}
            animate={{ clipPath: 'inset(0 0 0 0%)', opacity: 1 }}
            transition={{ duration, ease: ease.emphasized }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cutoutUrl!} alt={alt} className="absolute inset-[6%] size-[88%] object-contain drop-shadow-garment" />
          </motion.div>
          {!reduce ? (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-paper-raised to-ink/15 blur-[1px]"
              initial={{ left: '100%', opacity: 1 }}
              animate={{ left: '-12%', opacity: [1, 1, 0] }}
              transition={{ duration, ease: ease.emphasized, opacity: { duration, times: [0, 0.85, 1] } }}
            />
          ) : null}
        </>
      ) : null}

      {working ? (
        <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-pill bg-paper/90 px-4 py-2 shadow-lift backdrop-blur-sm">
          <span className="caps text-ink">Cutting it out</span>
          <span className="h-0.5 flex-1 overflow-hidden rounded-pill bg-rule">
            <motion.span
              className="block h-full origin-left bg-accent"
              animate={{ scaleX: Math.max(0.06, progress ?? 0) }}
              transition={{ duration: 0.3 }}
            />
          </span>
        </div>
      ) : null}

      {cutoutUrl === null && !working ? (
        <p className="caps absolute inset-x-4 bottom-4 rounded-pill bg-paper/90 px-4 py-2 text-center text-ink-muted">
          Kept the original photo
        </p>
      ) : null}
    </div>
  );
}
