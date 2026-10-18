'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import type { FlatLayPiece } from '@/components/avatar/FlatLay';
import { itemLabel } from '@/lib/rules/garment';
import { cx } from '@/lib/cx';
import { haptic, HAPTICS } from '@/lib/haptics';
import { spring } from '@/lib/motion';

/** Where each piece starts: scattered, as if pulled from different corners of the wardrobe. */
const SCATTER = [
  { x: -120, y: -40, rotate: -16 },
  { x: 0, y: 70, rotate: 10 },
  { x: 130, y: -30, rotate: 18 },
  { x: 60, y: -80, rotate: -8 },
];

/** Where each piece lands: overlapping slightly, like a styled flat-lay. */
const LANDED = [-4, 2, -2, 3];

/**
 * The Matched moment: pieces fly in and snap together with a firm spring and a
 * short haptic tap. Calls onSnap once they've landed. Reduced motion: they
 * simply appear, and onSnap fires straight away.
 */
export function MatchedMoment({
  pieces,
  onSnap,
  className,
}: {
  pieces: FlatLayPiece[];
  onSnap?: () => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const snapped = useRef(false);

  const snap = () => {
    if (snapped.current) return;
    snapped.current = true;
    haptic(HAPTICS.snap);
    onSnap?.();
  };

  useEffect(() => {
    if (reduce) snap();
    // Only on mount: the moment plays once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cx('flex items-end justify-center', className)} role="group" aria-label="Pieces snapping together">
      {pieces.map(({ item, src }, i) => {
        const from = SCATTER[i % SCATTER.length]!;
        const last = i === pieces.length - 1;
        return (
          <motion.div
            key={item.id}
            className={cx('relative w-1/3 max-w-40', i > 0 && '-ml-[6%]')}
            style={{ zIndex: pieces.length - i }}
            initial={reduce ? false : { ...from, opacity: 0, scale: 0.86 }}
            animate={{ x: 0, y: 0, rotate: LANDED[i % LANDED.length], opacity: 1, scale: 1 }}
            transition={{ ...spring.snap, delay: i * 0.09, opacity: { duration: 0.2, delay: i * 0.09 } }}
            onAnimationComplete={last ? snap : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={itemLabel(item)} className="h-auto w-full drop-shadow-garment" />
          </motion.div>
        );
      })}
    </div>
  );
}
