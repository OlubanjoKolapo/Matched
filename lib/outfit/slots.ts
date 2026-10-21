import { generateOutfits, scoreOutfit, type RulesProfile } from '@/lib/rules';
import type { ItemTags } from '@/lib/types';

/** The builder's slots. "top" also holds dresses and one-pieces, which make "bottom" unnecessary. */
export const SLOT_KEYS = ['top', 'bottom', 'shoes', 'outer'] as const;
export type SlotKey = (typeof SLOT_KEYS)[number];
export type Slots = Partial<Record<SlotKey, string>>;

export const SLOT_LABEL: Record<SlotKey, string> = { top: 'Top', bottom: 'Bottom', shoes: 'Shoes', outer: 'Layer' };

export function slotOf(item: ItemTags): SlotKey | null {
  switch (item.category) {
    case 'top':
    case 'onepiece':
      return 'top';
    case 'bottom':
      return 'bottom';
    case 'shoes':
      return 'shoes';
    case 'outerwear':
      return 'outer';
    default:
      return null;
  }
}

/** Everything that can go in a slot, in wardrobe order. */
export function candidatesFor<T extends ItemTags>(slot: SlotKey, wardrobe: T[]): T[] {
  return wardrobe.filter((i) => slotOf(i) === slot);
}

/** A one-piece in the top slot covers the bottom too. */
export function needsBottom<T extends ItemTags>(slots: Slots, wardrobe: T[]): boolean {
  const top = wardrobe.find((i) => i.id === slots.top);
  return top?.category !== 'onepiece';
}

/** The items in the slots, ready to score or draw. */
export function slotItems<T extends ItemTags>(slots: Slots, wardrobe: T[]): T[] {
  const byId = new Map(wardrobe.map((i) => [i.id, i]));
  const bottomNeeded = needsBottom(slots, wardrobe);
  return SLOT_KEYS.flatMap((key) => {
    if (key === 'bottom' && !bottomNeeded) return [];
    const item = slots[key] ? byId.get(slots[key]!) : undefined;
    return item ? [item] : [];
  });
}

export function slotsFromItems(items: ItemTags[]): Slots {
  const slots: Slots = {};
  for (const item of items) {
    const key = slotOf(item);
    if (key && !slots[key]) slots[key] = item.id;
  }
  return slots;
}

/**
 * "Match it for me": keeps whatever is chosen and fills the rest with the best
 * options. A layer is only added when it makes the outfit score higher.
 */
export function fillBest<T extends ItemTags>(slots: Slots, wardrobe: T[], profile?: RulesProfile): Slots {
  const chosen = slotItems(slots, wardrobe).map((i) => i.id);
  const best = generateOutfits(wardrobe, profile, { include: chosen, outerwear: 'optional', limit: 1 })[0];
  if (!best) return slots;
  const filled = { ...slotsFromItems(best.items) };
  // Respect an explicit choice of layer, even if the best outfit dropped it.
  if (slots.outer) filled.outer = slots.outer;
  return filled;
}

/** The score for whatever is in the slots, if it's a wearable outfit. */
export function scoreSlots<T extends ItemTags>(slots: Slots, wardrobe: T[], profile?: RulesProfile) {
  const items = slotItems(slots, wardrobe);
  const hasBody = items.some((i) => i.category === 'onepiece') || (items.some((i) => i.category === 'top') && items.some((i) => i.category === 'bottom'));
  if (!hasBody) return null;
  return scoreOutfit(items, profile);
}

/** A stable key for an outfit: the same pieces in any order give the same key. */
export const outfitKey = (items: ItemTags[]) => items.map((i) => i.id).sort().join('+');
