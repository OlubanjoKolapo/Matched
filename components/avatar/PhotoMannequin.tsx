'use client';

import { AnimatePresence, motion } from 'motion/react';
import { cx } from '@/lib/cx';
import { spring } from '@/lib/motion';
import type { Category, Frame, Item } from '@/lib/types';

/**
 * Photo-based mannequin: layers real clothing cutout images on a headless
 * mannequin body photograph. When the user has added clothes with cutout
 * photos, those appear on the mannequin. Items without cutouts fall back
 * to sample reference images.
 */

interface Slot {
  top: number;
  left: number;
  width: number;
  height: number;
  z: number;
}

const SLOTS: Record<Category, Slot> = {
  outerwear: { top: 10, left: 8, width: 84, height: 52, z: 40 },
  top:       { top: 12, left: 14, width: 72, height: 42, z: 30 },
  onepiece:  { top: 10, left: 10, width: 80, height: 70, z: 30 },
  bottom:    { top: 42, left: 16, width: 68, height: 48, z: 20 },
  shoes:     { top: 82, left: 22, width: 56, height: 16, z: 10 },
  accessory: { top: 4, left: 60, width: 30, height: 18, z: 50 },
};

interface Piece {
  item: Item;
  src: string;
}

export interface PhotoMannequinProps {
  frame: Frame;
  pieces?: Piece[];
  className?: string;
}

export function PhotoMannequin({ frame, pieces = [], className }: PhotoMannequinProps) {
  const mannequinSrc = frame === 'womenswear'
    ? '/mannequin/female.jfif'
    : '/mannequin/male.jfif';

  return (
    <div
      className={cx(
        'relative mx-auto flex h-full items-end justify-center overflow-hidden',
        className,
      )}
      role="img"
      aria-label={pieces.length ? `Mannequin wearing ${pieces.map(p => p.item.name ?? p.item.subtype).join(', ')}` : 'Mannequin'}
    >
      {/* Mannequin body photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mannequinSrc}
        alt=""
        className="relative z-0 h-full w-auto max-w-full object-contain drop-shadow-lg"
        draggable={false}
      />

      {/* Clothing layers positioned over the mannequin */}
      <AnimatePresence>
        {pieces.map(({ item, src }) => {
          const slot = SLOTS[item.category] ?? SLOTS.top;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={spring.drop}
              className="pointer-events-none absolute"
              style={{
                top: `${slot.top}%`,
                left: `${slot.left}%`,
                width: `${slot.width}%`,
                height: `${slot.height}%`,
                zIndex: slot.z,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={item.name ?? item.subtype}
                className="h-full w-full object-contain drop-shadow-md"
                draggable={false}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
