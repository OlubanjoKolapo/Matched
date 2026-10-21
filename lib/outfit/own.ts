import { combinations, scoreOutfit, type GeneratedOutfit, type RulesProfile } from '@/lib/rules';
import type { ItemTags } from '@/lib/types';
import { VERDICT_THRESHOLDS } from '@/lib/verdict';
import { slotOf, type SlotKey } from './slots';

/**
 * "I own…": every outfit that works using the chosen pieces. Slots with
 * nothing chosen (say, shoes) are filled from the rest of the wardrobe, so
 * "four tees and brown jeans" still gives complete outfits.
 */
export function outfitsFromOwned<T extends ItemTags>(
  selected: T[],
  wardrobe: T[],
  profile?: RulesProfile,
  limit = 30,
): GeneratedOutfit<T>[] {
  if (!selected.length) return [];
  const chosenSlots = new Set(selected.map(slotOf).filter((s): s is SlotKey => !!s));
  const selectedIds = new Set(selected.map((i) => i.id));
  // A chosen dress also fills the bottom slot's need, so don't borrow tops for it.
  const pool = [
    ...selected,
    ...wardrobe.filter((i) => {
      const slot = slotOf(i);
      return !selectedIds.has(i.id) && slot !== null && slot !== 'outer' && !chosenSlots.has(slot);
    }),
  ];
  const outerwear = chosenSlots.has('outer') ? 'optional' : 'never';

  return combinations(pool, outerwear)
    .filter((items) => items.some((i) => selectedIds.has(i.id)))
    .map((items) => ({ items, result: scoreOutfit(items, profile) }))
    .filter(({ result }) => result.score >= VERDICT_THRESHOLDS.works)
    .sort((a, b) => b.result.score - a.result.score)
    .slice(0, limit);
}
