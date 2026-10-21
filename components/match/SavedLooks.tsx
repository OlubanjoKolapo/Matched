'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { getDB } from '@/lib/db';
import { IconButton } from '@/components/ui/IconButton';
import { deleteOutfit } from '@/lib/outfit/actions';
import { slotsFromItems, type Slots } from '@/lib/outfit/slots';
import type { Item } from '@/lib/types';
import { OutfitCard } from './OutfitCard';

/** Looks saved from the builder, newest first. Pieces deleted since are skipped. */
export function SavedLooks({ wardrobe, onOpen }: { wardrobe: Item[]; onOpen: (slots: Slots) => void }) {
  const outfits = useLiveQuery(() => getDB().outfits.orderBy('savedAt').reverse().toArray(), []);
  if (!outfits?.length) return null;
  const byId = new Map(wardrobe.map((i) => [i.id, i]));

  return (
    <section aria-labelledby="saved-looks" className="flex flex-col gap-4 border-t border-rule pt-8">
      <h2 id="saved-looks" className="caps text-ink-muted">
        Saved looks · {outfits.length}
      </h2>
      <ul className="grid gap-3 lg:grid-cols-2">
        {outfits.map((o) => {
          const items = o.itemIds.flatMap((id) => byId.get(id) ?? []);
          if (items.length < 2) return null;
          return (
            <li key={o.id}>
              <OutfitCard
                items={items}
                score={o.score}
                reason={o.reasons[0]?.text}
                onClick={() => onOpen(slotsFromItems(items))}
                action={<IconButton icon="close" label="Remove saved look" size="sm" onClick={() => deleteOutfit(o.id)} />}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
