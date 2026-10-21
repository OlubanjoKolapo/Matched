'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';
import { HangTag } from '@/components/ui/HangTag';
import { haptic, HAPTICS } from '@/lib/haptics';
import { spring } from '@/lib/motion';

/**
 * The Matched moment as an overlay: a ripple of chalk-red, the tag snapping
 * in, and a haptic tap. Mount it with a new key each time an outfit becomes Matched.
 */
export function MatchedBurst({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    haptic(HAPTICS.snap);
  }, []);
  return (
    <div className={className} aria-live="polite">
      {!reduce ? (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-pill ring-2 ring-matched"
          initial={{ scale: 0.8, opacity: 0.9 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      ) : null}
      <motion.span
        className="absolute -top-7 left-1/2 -translate-x-1/2"
        initial={reduce ? false : { y: -10, scale: 0.6, opacity: 0, rotate: -8 }}
        animate={{ y: 0, scale: 1, opacity: 1, rotate: -3 }}
        transition={spring.snap}
      >
        <HangTag tone="matched">Matched</HangTag>
      </motion.span>
    </div>
  );
}
