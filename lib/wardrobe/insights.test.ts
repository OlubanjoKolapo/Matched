import { describe, expect, it } from 'vitest';
import { SAMPLE_WARDROBE } from '@/lib/sample/wardrobe';
import type { Item } from '@/lib/types';
import { goesWith, hangTags, versatility } from './insights';

const DAY = 24 * 60 * 60 * 1000;
const now = Date.parse('2026-10-21T12:00:00Z');
const asItem = (tags: (typeof SAMPLE_WARDROBE)[number], createdAt: string, wornDates: string[] = []): Item => ({
  ...tags,
  photo: new Blob(),
  wornDates,
  createdAt,
  taggedBy: 'user',
});

describe('versatility', () => {
  it('counts working outfits per piece and favours staples', () => {
    const counts = versatility(SAMPLE_WARDROBE);
    expect(counts.size).toBe(SAMPLE_WARDROBE.length);
    // Black straight jeans go with more than wide light-wash jeans in this wardrobe.
    expect(counts.get('sample-black-jeans')!).toBeGreaterThan(counts.get('sample-wide-jeans')!);
  });
});

describe('hangTags', () => {
  const old = new Date(now - 60 * DAY).toISOString();
  const fresh = new Date(now - 1 * DAY).toISOString();
  const items = [
    asItem(SAMPLE_WARDROBE[0]!, old, [new Date(now - 2 * DAY).toISOString()]),
    asItem(SAMPLE_WARDROBE[1]!, fresh),
    asItem(SAMPLE_WARDROBE[2]!, old),
  ];

  it('labels the most versatile, new and long-unworn pieces', () => {
    const counts = new Map([
      [items[0]!.id, 9],
      [items[1]!.id, 2],
      [items[2]!.id, 1],
    ]);
    const tags = hangTags(items, counts, now);
    expect(tags.get(items[0]!.id)).toBe('Most versatile');
    expect(tags.get(items[1]!.id)).toBe('New');
    expect(tags.get(items[2]!.id)).toBe('Not worn in 30 days');
  });

  it('skips "New" when most of the wardrobe is new', () => {
    const fresh2 = [asItem(SAMPLE_WARDROBE[3]!, fresh), asItem(SAMPLE_WARDROBE[4]!, fresh), asItem(SAMPLE_WARDROBE[5]!, old)];
    const tags = hangTags(fresh2, new Map(), now);
    expect([...tags.values()]).not.toContain('New');
  });
});

describe('goesWith', () => {
  it('returns working outfits that include the piece, best first', () => {
    const jeans = SAMPLE_WARDROBE.find((i) => i.id === 'sample-wide-jeans')!;
    const outfits = goesWith(jeans, SAMPLE_WARDROBE);
    expect(outfits.length).toBeGreaterThan(0);
    for (const o of outfits) expect(o.items.map((i) => i.id)).toContain(jeans.id);
    const scores = outfits.map((o) => o.result.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    expect(outfits[0]!.items.find((i) => i.category === 'shoes')?.shoeProfile).toBe('chunky');
  });
});
