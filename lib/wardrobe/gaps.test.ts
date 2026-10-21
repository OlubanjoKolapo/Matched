import { describe, expect, it } from 'vitest';
import { GAP_CANDIDATES } from '@/rules/gaps';
import { bottom, shoes, top } from '@/lib/rules/test-fixtures';
import { SAMPLE_WARDROBE } from '@/lib/sample/wardrobe';
import { countWorkingOutfits } from '@/lib/rules';
import { biggestGap, candidateItem, findGaps, gapPhrase } from './gaps';
import { wardrobeStats } from './stats';

const profile = { track: 'menswear' as const, heightCm: 176, goals: [] };

describe('gap finder', () => {
  it('needs a few pieces before it says anything', () => {
    expect(findGaps([top('t-shirt', { color: 'white' })], profile)).toEqual([]);
  });

  it('suggests shoes when there are none', () => {
    const wardrobe = [
      top('t-shirt', { color: 'white', fit: 'regular' }),
      top('crewneck sweater', { color: 'navy', fit: 'regular', formality: 3 }),
      bottom('jeans', { wash: 'mid', fit: 'straight' }),
      bottom('chinos', { color: 'beige', fit: 'slim', formality: 3 }),
    ];
    const gap = biggestGap(wardrobe, profile);
    expect(gap?.candidate.piece.category).toBe('shoes');
    expect(gap!.unlocks).toBeGreaterThan(0);
  });

  it('skips pieces you already own', () => {
    const wardrobe = [
      top('t-shirt', { color: 'white', fit: 'regular' }),
      bottom('jeans', { color: 'black', fit: 'straight' }),
      shoes('leather sneaker', { color: 'white', shoeProfile: 'low', formality: 3 }),
    ];
    const ids = findGaps(wardrobe, profile).map((g) => g.candidate.id);
    expect(ids).not.toContain('white-sneakers');
    expect(ids).not.toContain('white-tee');
  });

  it('counts exactly the new working outfits a piece adds', () => {
    const wardrobe = SAMPLE_WARDROBE.filter((i) => i.category !== 'outerwear');
    const before = countWorkingOutfits(wardrobe);
    for (const gap of findGaps(wardrobe, profile).slice(0, 6)) {
      const after = countWorkingOutfits([...wardrobe, candidateItem(gap.candidate, 'menswear')]);
      expect(after - before, gap.candidate.id).toBe(gap.unlocks);
    }
  });

  it('respects the track', () => {
    const wardrobe = SAMPLE_WARDROBE;
    const mens = findGaps(wardrobe, profile).map((g) => g.candidate.id);
    expect(mens).not.toContain('black-flats');
    expect(mens).not.toContain('navy-dress');
  });

  it('phrases the suggestion naturally', () => {
    const byId = (id: string) => GAP_CANDIDATES.find((c) => c.id === id)!;
    expect(gapPhrase(byId('white-sneakers'))).toBe('A pair of white low-profile sneakers');
    expect(gapPhrase({ ...byId('navy-knit'), label: 'olive overshirt' })).toBe('An olive overshirt');
    expect(gapPhrase(byId('navy-knit'))).toBe('A navy crewneck knit');
  });

  it('has unique candidate ids and no layers', () => {
    expect(new Set(GAP_CANDIDATES.map((c) => c.id)).size).toBe(GAP_CANDIDATES.length);
    expect(GAP_CANDIDATES.every((c) => c.piece.category !== 'outerwear')).toBe(true);
  });
});

describe('wardrobe stats', () => {
  it('counts outfits, verdicts and the most versatile piece', () => {
    const stats = wardrobeStats(SAMPLE_WARDROBE, profile);
    expect(stats.pieces).toBe(SAMPLE_WARDROBE.length);
    expect(stats.combinations).toBe(stats.verdicts.matched + stats.verdicts.works + stats.verdicts.rethink);
    expect(stats.verdicts.matched + stats.verdicts.works).toBe(countWorkingOutfits(SAMPLE_WARDROBE, profile));
    expect(stats.mostVersatile?.outfits).toBeGreaterThan(0);
  });

  it('breaks down colors, most common first, shares adding to one', () => {
    const { colors } = wardrobeStats(SAMPLE_WARDROBE, profile);
    expect(colors[0]!.count).toBeGreaterThanOrEqual(colors[colors.length - 1]!.count);
    expect(colors.reduce((s, c) => s + c.share, 0)).toBeCloseTo(1);
  });

  it('has no outfits without shoes', () => {
    const stats = wardrobeStats([top('t-shirt'), bottom('jeans', { wash: 'mid' })], profile);
    expect(stats.combinations).toBe(0);
    expect(stats.mostVersatile).toBeUndefined();
  });
});
