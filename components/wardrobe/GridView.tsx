'use client';

import { motion } from 'motion/react';
import { HangTag } from '@/components/ui/HangTag';
import { spring } from '@/lib/motion';
import type { Item } from '@/lib/types';
import type { HangTagLabel } from '@/lib/wardrobe/insights';
import { ItemImage } from './ItemImage';

/** Taller tiles for long pieces so the masonry has rhythm. */
const ASPECT: Record<Item['category'], string> = {
  top: 'aspect-[4/5]',
  outerwear: 'aspect-[4/5]',
  onepiece: 'aspect-[3/5]',
  bottom: 'aspect-[3/5]',
  shoes: 'aspect-[5/4]',
  accessory: 'aspect-square',
};

export function GridView({ items, tags, onOpen }: { items: Item[]; tags: Map<string, HangTagLabel>; onOpen: (item: Item) => void }) {
  return (
    <ul className="columns-2 gap-3 sm:columns-3 lg:columns-4 lg:gap-4">
      {items.map((item, i) => (
        <motion.li
          key={item.id}
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring.gentle, delay: Math.min(i, 12) * 0.025 }}
          className="mb-3 break-inside-avoid lg:mb-4"
        >
          <button
            type="button"
            onClick={() => onOpen(item)}
            className="group flex w-full flex-col gap-2 rounded-sm bg-paper-raised p-3 text-left ring-1 ring-rule transition-[box-shadow,transform] duration-(--duration-base) ease-emphasized hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className={`relative block w-full ${ASPECT[item.category]}`}>
              <span className="absolute inset-[4%]">
                <ItemImage item={item} layoutId={`item-${item.id}`} />
              </span>
              {tags.get(item.id) ? (
                <span className="absolute top-0 right-0">
                  <HangTag tone={tags.get(item.id) === 'Most versatile' ? 'ink' : 'paper'}>{tags.get(item.id)}</HangTag>
                </span>
              ) : null}
            </span>
            <span className="flex flex-col">
              <span className="text-body font-medium text-ink">{item.name ?? item.subtype}</span>
              <span className="caps text-ink-subtle">{item.subtype}</span>
            </span>
          </button>
        </motion.li>
      ))}
    </ul>
  );
}
