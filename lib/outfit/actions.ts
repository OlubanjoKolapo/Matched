import { getDB, newId, type DayRecord } from '@/lib/db';
import type { ScoreResult } from '@/lib/rules';
import type { ItemTags, Outfit } from '@/lib/types';
import { dayKey } from './today';

export async function getDay(date = dayKey()): Promise<DayRecord> {
  return (await getDB().days.get(date)) ?? { date, shuffle: 0 };
}

/** Next outfit for today; remembered so a reload shows the same one. */
export async function shuffleToday(date = dayKey()): Promise<void> {
  const day = await getDay(date);
  await getDB().days.put({ ...day, shuffle: day.shuffle + 1 });
}

/** Marks today's fit as worn: the pieces rest for a few days so the rotation moves on. */
export async function wearToday(items: ItemTags[], date = dayKey()): Promise<void> {
  const db = getDB();
  await db.transaction('rw', [db.items, db.days], async () => {
    for (const item of items) {
      const stored = await db.items.get(item.id);
      if (stored && !stored.wornDates.includes(date)) await db.items.update(item.id, { wornDates: [...stored.wornDates, date] });
    }
    const day = (await db.days.get(date)) ?? { date, shuffle: 0 };
    await db.days.put({ ...day, wornItemIds: items.map((i) => i.id), wornAt: new Date().toISOString() });
  });
}

/** Saves a look. Saving the same pieces again just updates the date. */
export async function saveOutfit(items: ItemTags[], result: ScoreResult): Promise<Outfit> {
  const db = getDB();
  const itemIds = items.map((i) => i.id).sort();
  const existing = (await db.outfits.toArray()).find((o) => o.itemIds.slice().sort().join() === itemIds.join());
  const outfit: Outfit = {
    id: existing?.id ?? newId(),
    itemIds,
    score: result.score,
    verdict: result.verdict,
    reasons: result.reasons,
    savedAt: new Date().toISOString(),
  };
  await db.outfits.put(outfit);
  return outfit;
}

export async function deleteOutfit(id: string): Promise<void> {
  await getDB().outfits.delete(id);
}
