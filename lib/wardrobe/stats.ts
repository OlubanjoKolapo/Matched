import { COLOR_FAMILIES, type ColorFamilyId } from '@/rules/colors';
import { combinations, scoreOutfit, type RulesProfile } from '@/lib/rules';
import { colorInfo, familyHex } from '@/lib/rules/color';
import { isDenim } from '@/lib/rules/garment';
import type { Category, ItemTags, Verdict } from '@/lib/types';
import { verdictFor } from '@/lib/verdict';

export interface ColorShare {
  family: ColorFamilyId;
  label: string;
  hex: string;
  count: number;
  /** 0–1 of all pieces. */
  share: number;
}

export interface WardrobeStats<T extends ItemTags> {
  pieces: number;
  byCategory: Record<Category, number>;
  /** Every complete combination, layers included. */
  combinations: number;
  /** Combinations by verdict. "Possible outfits" = matched + works. */
  verdicts: Record<Verdict, number>;
  /** The piece in the most working outfits, and how many. */
  mostVersatile?: { item: T; outfits: number };
  /** Main colors, most common first. */
  colors: ColorShare[];
}

/** Everything the stats page shows, computed in one pass over the combinations. */
export function wardrobeStats<T extends ItemTags>(wardrobe: T[], profile: RulesProfile): WardrobeStats<T> {
  const byCategory: Record<Category, number> = { top: 0, bottom: 0, onepiece: 0, outerwear: 0, shoes: 0, accessory: 0 };
  for (const item of wardrobe) byCategory[item.category] += 1;

  const verdicts: Record<Verdict, number> = { matched: 0, works: 0, rethink: 0 };
  const inOutfits = new Map<string, number>();
  // Without shoes nothing is complete yet, so there are no outfits to count.
  const all = byCategory.shoes ? combinations(wardrobe) : [];
  for (const outfit of all) {
    const verdict = verdictFor(scoreOutfit(outfit, profile).score);
    verdicts[verdict] += 1;
    if (verdict === 'rethink') continue;
    for (const item of outfit) inOutfits.set(item.id, (inOutfits.get(item.id) ?? 0) + 1);
  }

  let mostVersatile: WardrobeStats<T>['mostVersatile'];
  for (const item of wardrobe) {
    const outfits = inOutfits.get(item.id) ?? 0;
    if (outfits > (mostVersatile?.outfits ?? 0)) mostVersatile = { item, outfits };
  }

  const counts = new Map<ColorFamilyId, number>();
  for (const item of wardrobe) {
    const family = colorInfo(item, isDenim(item)).family;
    counts.set(family, (counts.get(family) ?? 0) + 1);
  }
  const colors = [...counts.entries()]
    .map(([family, count]) => ({
      family,
      label: COLOR_FAMILIES[family].label,
      hex: familyHex(family),
      count,
      share: count / Math.max(1, wardrobe.length),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    pieces: wardrobe.length,
    byCategory,
    combinations: all.length,
    verdicts,
    mostVersatile,
    colors,
  };
}
