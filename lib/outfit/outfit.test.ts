import { describe, expect, it } from 'vitest';
import { SAMPLE_WARDROBE } from '@/lib/sample/wardrobe';
import { dress, shoes as shoe } from '@/lib/rules/test-fixtures';
import type { Item, ItemTags } from '@/lib/types';
import { outfitsFromOwned } from './own';
import { candidatesFor, fillBest, outfitKey, scoreSlots, slotItems, slotsFromItems } from './slots';
import { dayKey, seeded, todaysFit } from './today';

const asItem = (t: ItemTags, wornDates: string[] = []): Item => ({ ...t, photo: new Blob(), wornDates, createdAt: '2026-10-01T00:00:00Z', taggedBy: 'user' });
const wardrobe = SAMPLE_WARDROBE.map((t) => asItem(t));
const byId = (id: string) => wardrobe.find((i) => i.id === id)!;

describe('slots', () => {
  it('maps items to slots and back', () => {
    const items = [byId('sample-knit'), byId('sample-black-jeans'), byId('sample-chelsea'), byId('sample-overshirt')];
    const slots = slotsFromItems(items);
    expect(slots).toEqual({ top: 'sample-knit', bottom: 'sample-black-jeans', shoes: 'sample-chelsea', outer: 'sample-overshirt' });
    expect(outfitKey(slotItems(slots, wardrobe))).toBe(outfitKey(items));
  });

  it('lets a dress stand in for top and bottom', () => {
    const d = { ...dress('midi dress', { color: 'navy' }) };
    const pool = [...wardrobe, d];
    expect(candidatesFor('top', pool)).toContain(d);
    const slots = { top: d.id, bottom: 'sample-black-jeans', shoes: 'sample-loafers' };
    expect(slotItems(slots, pool).map((i) => i.id)).toEqual([d.id, 'sample-loafers']);
    expect(scoreSlots(slots, pool)).not.toBeNull();
  });

  it('only scores wearable outfits', () => {
    expect(scoreSlots({ top: 'sample-knit' }, wardrobe)).toBeNull();
    expect(scoreSlots({ top: 'sample-knit', bottom: 'sample-black-jeans' }, wardrobe)?.score).toBeGreaterThan(0);
  });

  it('fills empty slots around what was chosen', () => {
    const filled = fillBest({ bottom: 'sample-wide-jeans' }, wardrobe);
    expect(filled.bottom).toBe('sample-wide-jeans');
    expect(filled.top).toBeDefined();
    expect(byId(filled.shoes!).shoeProfile).toBe('chunky');
    expect(scoreSlots(filled, wardrobe)!.verdict).toBe('matched');
  });
});

describe('todaysFit', () => {
  it('is stable for a date and changes with a shuffle', () => {
    const a = todaysFit(wardrobe, undefined, { date: '2026-10-21' });
    const b = todaysFit(wardrobe, undefined, { date: '2026-10-21' });
    const c = todaysFit(wardrobe, undefined, { date: '2026-10-21', shuffle: 1 });
    expect(outfitKey(a!.items)).toBe(outfitKey(b!.items));
    expect(outfitKey(c!.items)).not.toBe(outfitKey(a!.items));
    expect(a!.result.score).toBeGreaterThanOrEqual(62);
  });

  it('rests recently worn pieces', () => {
    const first = todaysFit(wardrobe, undefined, { date: '2026-10-21' })!;
    const wornYesterday = wardrobe.map((i) => (first.items.some((f) => f.id === i.id) ? asItem(i, ['2026-10-20']) : i));
    const next = todaysFit(wornYesterday, undefined, { date: '2026-10-21' })!;
    const overlap = next.items.filter((i) => first.items.some((f) => f.id === i.id)).length;
    expect(overlap).toBeLessThan(first.items.length);
  });

  it('needs a complete outfit', () => {
    expect(todaysFit([byId('sample-knit'), shoe('sneaker') as unknown as Item], undefined)).toBeNull();
  });

  it('formats local dates and seeds deterministically', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(seeded('x')()).toBe(seeded('x')());
    expect(seeded('x')()).not.toBe(seeded('y')());
  });
});

describe('outfitsFromOwned', () => {
  it('builds every working outfit around the chosen pieces, borrowing only for empty slots', () => {
    const chosen = [byId('sample-white-tee'), byId('sample-boxy-tee'), byId('sample-wide-jeans')];
    const outfits = outfitsFromOwned(chosen, wardrobe);
    expect(outfits.length).toBeGreaterThan(0);
    for (const o of outfits) {
      const top = o.items.find((i) => i.category === 'top')!;
      const bottom = o.items.find((i) => i.category === 'bottom')!;
      expect(['sample-white-tee', 'sample-boxy-tee']).toContain(top.id);
      expect(bottom.id).toBe('sample-wide-jeans');
      expect(o.items.some((i) => i.category === 'shoes')).toBe(true);
      expect(o.result.score).toBeGreaterThanOrEqual(55);
    }
    const scores = outfits.map((o) => o.result.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('is empty when nothing is chosen', () => {
    expect(outfitsFromOwned([], wardrobe)).toEqual([]);
  });
});
