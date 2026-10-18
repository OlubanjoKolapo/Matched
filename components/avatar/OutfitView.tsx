'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { avatarSupports } from '@/lib/avatar/garments';
import { cx } from '@/lib/cx';
import { duration } from '@/lib/motion';
import type { AvatarConfig } from '@/lib/types';
import { Avatar } from './Avatar';
import { FlatLay, type FlatLayPiece } from './FlatLay';

type Mode = 'avatar' | 'flatlay';

/**
 * Every outfit can be seen on the avatar or as a flat-lay of the real cutouts.
 * Outfits with pieces the avatar can't draw open in flat-lay.
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
  const [chosen, setChosen] = useState<Mode>('avatar');
  const mode: Mode = supported ? chosen : 'flatlay';

  return (
    <div className={cx('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="caps text-ink-muted">View</p>
        <SegmentedControl
          label="Outfit view"
          size="sm"
          value={mode}
          onChange={setChosen}
          options={supported ? [{ value: 'avatar', label: 'Avatar' }, { value: 'flatlay', label: 'Flat-lay' }] : [{ value: 'flatlay', label: 'Flat-lay' }]}
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
          {mode === 'avatar' ? (
            <Avatar config={avatar} heightCm={heightCm} outfit={items} />
          ) : (
            <FlatLay pieces={pieces} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
