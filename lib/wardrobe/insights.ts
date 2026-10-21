import { combinations, generateOutfits, scoreOutfit, type GeneratedOutfit, type RulesProfile } from '@/lib/rules';
import type { Item, ItemTags } from '@/lib/types';
import { VERDICT_THRESHOLDS } from '@/lib/verdict';

const DAY_MS = 24 * 60 * 60 * 1000;
export const NEW_FOR_DAYS = 3;
export const STALE_AFTER_DAYS = 30;

/** How many working outfits (score ≥ 55, no outerwear) each piece appears in. */
export function versatility(wardrobe: ItemTags[], profile?: RulesProfile): Map<string, number> {
  const counts = new Map<string, number>(wardrobe.map((i) => [i.id, 0]));
  for (const outfit of combinations(wardrobe, 'never')) {
    if (scoreOutfit(outfit, profile).score < VERDICT_THRESHOLDS.works) continue;
    for (const item of outfit) counts.set(item.id, (counts.get(item.id) ?? 0) + 1);
  }
  return counts;
}

export type HangTagLabel = 'Most versatile' | 'New' | 'Not worn in 30 days';

/** One status label per piece, if any applies. Most versatile wins, then New, then Not worn. */
export function hangTags(wardrobe: Item[], counts: Map<string, number>, now = Date.now()): Map<string, HangTagLabel> {
  const tags = new Map<string, HangTagLabel>();
  const top = Math.max(0, ...counts.values());
  const champion = top > 0 ? wardrobe.find((i) => counts.get(i.id) === top) : undefined;
  if (champion) tags.set(champion.id, 'Most versatile');

  // When most of the wardrobe is new (a fresh start), "New" says nothing, so skip it.
  const isNew = (item: Item) => now - Date.parse(item.createdAt) < NEW_FOR_DAYS * DAY_MS;
  const showNew = wardrobe.filter(isNew).length <= wardrobe.length / 2;

  for (const item of wardrobe) {
    if (tags.has(item.id)) continue;
    const age = now - Date.parse(item.createdAt);
    if (isNew(item)) {
      if (!showNew) continue;
      tags.set(item.id, 'New');
      continue;
    }
    const lastWorn = item.wornDates.length ? Math.max(...item.wornDates.map((d) => Date.parse(d))) : undefined;
    if (age > STALE_AFTER_DAYS * DAY_MS && (!lastWorn || now - lastWorn > STALE_AFTER_DAYS * DAY_MS)) {
      tags.set(item.id, 'Not worn in 30 days');
    }
  }
  return tags;
}

/** The best outfits built around one piece, strongest first. */
export function goesWith<T extends ItemTags>(item: T, wardrobe: T[], profile?: RulesProfile, limit = 6): GeneratedOutfit<T>[] {
  return generateOutfits(wardrobe, profile, { include: [item.id], outerwear: 'never', limit, minScore: VERDICT_THRESHOLDS.works });
}
