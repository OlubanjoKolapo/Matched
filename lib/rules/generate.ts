import type { ItemTags } from '@/lib/types';
import { VERDICT_THRESHOLDS } from '@/lib/verdict';
import { DEFAULT_RULES_PROFILE } from './context';
import { scoreOutfit } from './engine';
import type { RulesProfile, ScoreResult } from './types';

export interface GeneratedOutfit<T extends ItemTags> {
  items: T[];
  result: ScoreResult;
}

export interface GenerateOptions {
  /** Maximum outfits returned, best first. */
  limit?: number;
  /** Drop outfits scoring below this. */
  minScore?: number;
  /** Item ids every outfit must contain. */
  include?: string[];
  /** Whether to try adding each outerwear piece. */
  outerwear?: 'optional' | 'never';
}

/** A wearable outfit: top and bottom (or a one-piece), plus shoes. */
export function isComplete(items: ItemTags[]): boolean {
  const has = (c: ItemTags['category']) => items.some((i) => i.category === c);
  return (has('onepiece') || (has('top') && has('bottom'))) && has('shoes');
}

/** Every combination of top + bottom (or one-piece) + shoes, optionally with outerwear. */
export function combinations<T extends ItemTags>(wardrobe: T[], outerwear: 'optional' | 'never' = 'optional'): T[][] {
  const of = (c: ItemTags['category']) => wardrobe.filter((i) => i.category === c);
  const shoes = of('shoes');
  const layers: (T | undefined)[] = outerwear === 'optional' ? [undefined, ...of('outerwear')] : [undefined];

  const bases: T[][] = [
    ...of('top').flatMap((top) => of('bottom').map((bottom) => [top, bottom])),
    ...of('onepiece').map((piece) => [piece]),
  ];

  return bases.flatMap((base) =>
    (shoes.length ? shoes : [undefined]).flatMap((shoe) =>
      layers.map((layer) => [...base, ...(layer ? [layer] : []), ...(shoe ? [shoe] : [])]),
    ),
  );
}

/** Scores every combination in the wardrobe and returns the best. */
export function generateOutfits<T extends ItemTags>(
  wardrobe: T[],
  profile: RulesProfile = DEFAULT_RULES_PROFILE,
  { limit = 20, minScore = 0, include = [], outerwear = 'optional' }: GenerateOptions = {},
): GeneratedOutfit<T>[] {
  return combinations(wardrobe, outerwear)
    .filter((items) => include.every((id) => items.some((i) => i.id === id)))
    .map((items) => ({ items, result: scoreOutfit(items, profile) }))
    .filter(({ result }) => result.score >= minScore)
    .sort((a, b) => b.result.score - a.result.score || a.items.length - b.items.length)
    .slice(0, limit);
}

/** Outfits that at least "work" (score ≥ 55). */
export function countWorkingOutfits(wardrobe: ItemTags[], profile: RulesProfile = DEFAULT_RULES_PROFILE): number {
  return combinations(wardrobe).filter((items) => scoreOutfit(items, profile).score >= VERDICT_THRESHOLDS.works)
    .length;
}
