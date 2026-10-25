'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { avatarSupports } from '@/lib/avatar/garments';
import { cx } from '@/lib/cx';
import { duration } from '@/lib/motion';
import type { AvatarConfig, Item } from '@/lib/types';
import { Avatar } from './Avatar';
import { FlatLay, type FlatLayPiece } from './FlatLay';
import { PhotoMannequin } from './PhotoMannequin';

type Mode = 'mannequin' | 'avatar' | 'flatlay';

/**
 * Every outfit can be seen as a photo mannequin, an SVG illustration, or a
 * flat-lay of the real cutouts. Defaults to the photo mannequin.
 */
export function OutfitView({
  pieces,
  avatar,
  heightCm,
  className,
}: {
  pieces: FlatLayPiece[];
  avatar: AvatarConfig;
  heightCm?: number;
  className?: string;
}) {
  const items = pieces.map((p) => p.item);
  const supported = avatarSupports(items);
  const [chosen, setChosen] = useState<Mode>('mannequin');
  const mode: Mode = chosen === 'avatar' && !supported ? 'flatlay' : chosen;

  const options: { value: Mode; label: string }[] = [
    { value: 'mannequin', label: 'Mannequin' },
    ...(supported ? [{ value: 'avatar' as Mode, label: 'Illustration' }] : []),
    { value: 'flatlay', label: 'Flat-lay' },
  ];

  return (
    <div className={cx('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="caps text-ink-muted">View</p>
        <SegmentedControl
          label="Outfit view"
          size="sm"
          value={mode}
          onChange={setChosen}
          options={options}
        />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration.base }}
          className="aspect-[4/5] w-full"
        >
          {mode === 'mannequin' ? (
            <PhotoMannequin
              frame={avatar.frame}
              pieces={pieces.map((p) => ({ item: p.item as Item, src: p.src }))}
            />
          ) : mode === 'avatar' ? (
            <Avatar config={avatar} heightCm={heightCm} outfit={items} />
          ) : (
            <FlatLay pieces={pieces} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
