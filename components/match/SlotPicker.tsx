'use client';

import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { useState, type KeyboardEvent } from 'react';
import { ItemImage } from '@/components/wardrobe/ItemImage';
import { IconButton } from '@/components/ui/IconButton';
import { cx } from '@/lib/cx';
import { haptic } from '@/lib/haptics';
import { spring } from '@/lib/motion';
import { SLOT_LABEL, type SlotKey } from '@/lib/outfit/slots';
import type { Item } from '@/lib/types';

/** A swipe has to travel this far (or this fast) to change the piece. */
const SWIPE = { distance: 40, velocity: 400 } as const;

/**
 * One builder slot: swipe (or use the arrows) to cycle through owned pieces.
 * The neighbours peek in at the edges so it reads as a carousel.
 */
export function SlotPicker({
  slot,
  items,
  value,
  onChange,
  allowNone = false,
  disabled = false,
  disabledNote,
}: {
  slot: SlotKey;
  items: Item[];
  value?: string;
  onChange: (id: string | undefined) => void;
  allowNone?: boolean;
  disabled?: boolean;
  disabledNote?: string;
}) {
  const [direction, setDirection] = useState<1 | -1>(1);
  const options: (Item | undefined)[] = allowNone ? [undefined, ...items] : items;
  const found = options.findIndex((o) => o?.id === value);
  const index = Math.max(0, found);
  const current = value ? options[found] : undefined;
  const at = (offset: number) => options[(index + offset + options.length) % options.length];

  function step(delta: 1 | -1) {
    if (disabled || !options.length) return;
    setDirection(delta);
    haptic();
    // From an empty required slot, the first swipe lands on the first piece.
    if (found < 0) onChange((delta === 1 ? options[0] : options[options.length - 1])?.id);
    else if (options.length > 1) onChange(at(delta)?.id);
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE.distance || info.velocity.x < -SWIPE.velocity) step(1);
    else if (info.offset.x > SWIPE.distance || info.velocity.x > SWIPE.velocity) step(-1);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else return;
    e.preventDefault();
  }

  const name = current ? (current.name ?? current.subtype) : value === undefined && !allowNone ? 'Choose one' : 'None';

  return (
    <div className={cx('flex flex-col gap-2', disabled && 'opacity-(--opacity-disabled)')}>
      <div className="flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-baseline gap-2">
          <span className="caps shrink-0 text-ink-muted">{SLOT_LABEL[slot]}</span>
          <span className="truncate text-body font-medium text-ink">{disabled ? disabledNote : name}</span>
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <span className="caps numerals mr-1 text-ink-subtle">
            {options.length ? `${index + 1}/${options.length}` : '0'}
          </span>
          <IconButton icon="arrow-left" label={`Previous ${SLOT_LABEL[slot].toLowerCase()}`} size="sm" variant="outline" onClick={() => step(-1)} disabled={disabled || !options.length} />
          <IconButton icon="arrow-right" label={`Next ${SLOT_LABEL[slot].toLowerCase()}`} size="sm" variant="outline" onClick={() => step(1)} disabled={disabled || !options.length} />
        </div>
      </div>

      <motion.div
        role="group"
        aria-roledescription="carousel"
        aria-label={`${SLOT_LABEL[slot]}: ${name}. Swipe or use the arrow keys to change.`}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={onKeyDown}
        drag={disabled || !options.length ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={onDragEnd}
        className="relative h-28 touch-pan-y overflow-hidden rounded-md bg-studio sm:h-32"
      >
        {options.length > 1 ? (
          <>
            <span aria-hidden className="absolute inset-y-3 -left-6 w-20 opacity-30">
              {at(-1) ? <ItemImage item={at(-1)!} shadow={false} /> : null}
            </span>
            <span aria-hidden className="absolute inset-y-3 -right-6 w-20 opacity-30">
              {at(1) ? <ItemImage item={at(1)!} shadow={false} /> : null}
            </span>
          </>
        ) : null}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current?.id ?? 'none'}
            custom={direction}
            initial={{ x: direction * 70, opacity: 0, scale: 0.92 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: direction * -70, opacity: 0, scale: 0.92 }}
            transition={spring.settle}
            className="absolute inset-x-16 inset-y-2 flex items-center justify-center"
          >
            {current ? (
              <ItemImage item={current} />
            ) : (
              <span className="caps text-ink-subtle">{allowNone ? 'No layer' : 'Nothing yet'}</span>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
