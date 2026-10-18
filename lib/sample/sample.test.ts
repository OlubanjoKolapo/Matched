import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { combinations, generateOutfits, hexToFamily, isComplete, scoreOutfit } from '@/lib/rules';
import { SAMPLE_WARDROBE } from './wardrobe';

const byId = (id: string) => SAMPLE_WARDROBE.find((i) => i.id === id)!;

describe('sample wardrobe', () => {
  it('has about a dozen pieces with unique ids', () => {
    expect(SAMPLE_WARDROBE.length).toBeGreaterThanOrEqual(12);
    expect(new Set(SAMPLE_WARDROBE.map((i) => i.id)).size).toBe(SAMPLE_WARDROBE.length);
  });

  it('ships an illustration for every piece', () => {
    for (const item of SAMPLE_WARDROBE) {
      const file = path.join(process.cwd(), 'public', item.image);
      expect(fs.existsSync(file), item.image).toBe(true);
    }
  });

  it('tags colors that the hex detector agrees with', () => {
    for (const item of SAMPLE_WARDROBE) {
      for (const color of item.colors) expect(hexToFamily(color.hex), item.name).toBe(color.family);
    }
  });

  it('covers every slot an outfit needs', () => {
    const categories = new Set(SAMPLE_WARDROBE.map((i) => i.category));
    for (const c of ['top', 'bottom', 'shoes', 'outerwear'] as const) expect(categories).toContain(c);
  });
});

describe('sample outfits score sensibly', () => {
  const all = combinations(SAMPLE_WARDROBE).map((items) => ({ items, result: scoreOutfit(items) }));

  it('every combination is complete and explained in 2–4 well-formed reasons', () => {
    for (const { items, result } of all) {
      expect(isComplete(items)).toBe(true);
      expect(result.reasons.length).toBeGreaterThanOrEqual(2);
      expect(result.reasons.length).toBeLessThanOrEqual(4);
      for (const reason of result.reasons) expect(reason.text).not.toMatch(/[{}]/);
    }
  });

  it('has a spread of verdicts, mostly good', () => {
    const count = (v: string) => all.filter((o) => o.result.verdict === v).length;
    expect(count('matched')).toBeGreaterThan(all.length / 2);
    expect(count('works')).toBeGreaterThan(0);
    expect(count('rethink')).toBeGreaterThan(0);
  });

  it('ranks a crisp, balanced outfit near the top', () => {
    const best = generateOutfits(SAMPLE_WARDROBE, undefined, { limit: 1 })[0]!;
    expect(best.result.score).toBeGreaterThanOrEqual(85);
  });

  it('matches wide jeans with chunky sneakers, not slim ones', () => {
    const wide = byId('sample-wide-jeans');
    const tee = byId('sample-boxy-tee');
    const chunky = scoreOutfit([tee, wide, byId('sample-chunky-sneakers')]);
    const slim = scoreOutfit([tee, wide, byId('sample-white-sneakers')]);
    expect(chunky.verdict).toBe('matched');
    expect(chunky.score).toBeGreaterThan(slim.score);
    expect(slim.reasons.some((r) => r.ruleId === 'shoes.swallowed')).toBe(true);
  });

  it('flags the oversized hoodie with wide jeans and loafers', () => {
    const result = scoreOutfit([byId('sample-green-hoodie'), byId('sample-wide-jeans'), byId('sample-loafers')]);
    expect(result.verdict).toBe('rethink');
  });
});

describe('generateOutfits', () => {
  it('returns outfits best first, within the limit', () => {
    const outfits = generateOutfits(SAMPLE_WARDROBE, undefined, { limit: 10 });
    expect(outfits).toHaveLength(10);
    const scores = outfits.map((o) => o.result.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('builds around a chosen piece', () => {
    const outfits = generateOutfits(SAMPLE_WARDROBE, undefined, { include: ['sample-green-hoodie'], limit: 50 });
    expect(outfits.length).toBeGreaterThan(0);
    for (const o of outfits) expect(o.items.map((i) => i.id)).toContain('sample-green-hoodie');
  });

  it('can skip outerwear and filter by score', () => {
    const outfits = generateOutfits(SAMPLE_WARDROBE, undefined, { outerwear: 'never', minScore: 75, limit: 500 });
    for (const o of outfits) {
      expect(o.items.some((i) => i.category === 'outerwear')).toBe(false);
      expect(o.result.score).toBeGreaterThanOrEqual(75);
    }
  });
});
