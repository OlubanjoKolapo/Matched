'use client';

import { motion } from 'motion/react';
import { imageUrl } from '@/lib/hooks/data';
import { itemLabel } from '@/lib/rules/garment';
import { cx } from '@/lib/cx';
import type { Category, Item } from '@/lib/types';

/** Garment silhouettes used to frame photos that have no clean cutout. */
const SILHOUETTES: Record<'top' | 'bottom' | 'shoes' | 'other', string> = {
  top: 'M30 8c6 7 34 7 40 0l22 9 8 26-15 6-5-11v58H20V38l-5 11-15-6 8-26Z',
  bottom: 'M22 4h56l4 10 10 82H58L50 34l-8 62H8L18 14Z',
  shoes: 'M4 70c0-12 8-20 22-22l30-6c12-10 24-12 34-6l8 6v32H4Z',
  other: 'M14 6h72a8 8 0 0 1 8 8v72a8 8 0 0 1-8 8H14a8 8 0 0 1-8-8V14a8 8 0 0 1 8-8Z',
};

function silhouetteFor(category: Category) {
  if (category === 'top' || category === 'outerwear' || category === 'onepiece') return SILHOUETTES.top;
  if (category === 'bottom') return SILHOUETTES.bottom;
  if (category === 'shoes') return SILHOUETTES.shoes;
  return SILHOUETTES.other;
}

const maskFor = (category: Category) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='${silhouetteFor(category)}'/></svg>`,
  )}")`;

/**
 * A piece's cutout, or, without one, its photo shown through a neutral
 * garment-shaped frame so the rail never shows a raw rectangle.
 */
export function ItemImage({
  item,
  className,
  layoutId,
  shadow = true,
}: {
  item: Item;
  className?: string;
  /** Shared-element id for morphing between views. */
  layoutId?: string;
  shadow?: boolean;
}) {
  const src = imageUrl(item);
  if (item.cutout) {
    return (
      <motion.img
        layoutId={layoutId}
        src={src}
        alt={itemLabel(item)}
        draggable={false}
        className={cx('block h-full w-full object-contain', shadow && 'drop-shadow-garment', className)}
      />
    );
  }
  const mask = maskFor(item.category);
  return (
    <motion.div
      layoutId={layoutId}
      role="img"
      aria-label={itemLabel(item)}
      className={cx('h-full w-full bg-paper-sunken', shadow && 'drop-shadow-garment', className)}
      style={{ WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" draggable={false} className="h-full w-full object-cover" />
    </motion.div>
  );
}
