import { generateOutfits, type GeneratedOutfit, type RulesProfile } from '@/lib/rules';
import type { Item } from '@/lib/types';
import { outfitKey } from './slots';

/** Local calendar date, YYYY-MM-DD. */
export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** A small deterministic PRNG (mulberry32) seeded from a string. */
export function seeded(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

export const TODAY = {
  /** Only outfits at least this good are offered. */
  minScore: 62,
  /** Pieces worn within this many days are pushed down the list. */
  restDays: 3,
  /** Points off for each recently worn piece. */
  wornPenalty: 14,
  /** How many of the best candidates the day draws from. */
  pool: 8,
} as const;

function wornRecently(item: Item, today: string): boolean {
  const now = Date.parse(today);
  return item.wornDates.some((d) => d !== today && now - Date.parse(d) < TODAY.restDays * DAY_MS && Date.parse(d) <= now);
}

/**
 * Today's fit: drawn from the best outfits in the wardrobe, favouring pieces
 * that haven't been worn lately. Stable for a given date and shuffle count;
 * each shuffle moves to a different outfit until the pool runs out.
 */
export function todaysFit(
  wardrobe: Item[],
  profile: RulesProfile | undefined,
  { date = dayKey(), shuffle = 0 }: { date?: string; shuffle?: number } = {},
): GeneratedOutfit<Item> | null {
  const candidates = generateOutfits(wardrobe, profile, { outerwear: 'optional', limit: 60, minScore: TODAY.minScore });
  if (!candidates.length) {
    return generateOutfits(wardrobe, profile, { outerwear: 'never', limit: 1 })[0] ?? null;
  }

  // One outfit per set of core pieces: an added layer shouldn't count as a new fit.
  const seen = new Set<string>();
  const distinct = candidates.filter((o) => {
    const key = outfitKey(o.items.filter((i) => i.category !== 'outerwear'));
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const pool = distinct
    .map((o) => ({ o, rank: o.result.score - TODAY.wornPenalty * o.items.filter((i) => wornRecently(i, date)).length }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, TODAY.pool)
    .map((x) => x.o);

  // Walk the shuffles deterministically, never repeating until the pool is exhausted.
  const random = seeded(date);
  let remaining = [...pool];
  let pick = pool[0]!;
  for (let i = 0; i <= shuffle; i++) {
    if (!remaining.length) remaining = [...pool];
    // Squaring biases towards the top of the list without making it fixed.
    const index = Math.floor(random() ** 2 * remaining.length);
    pick = remaining.splice(index, 1)[0]!;
  }
  return pick;
}
