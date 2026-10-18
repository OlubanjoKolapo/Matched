import { describe, expect, it } from 'vitest';
import type { ItemTags, Verdict } from '@/lib/types';
import { scoreOutfit } from './engine';
import { bottom, dress, outer, shoes, top } from './test-fixtures';
import type { RulesProfile } from './types';

/**
 * Known outfits with the verdict a good stylist would give. These pin the
 * engine's overall judgement; if a rule change flips one, it should be on purpose.
 */
const OUTFITS: { name: string; items: () => ItemTags[]; verdict: Verdict; profile?: Partial<RulesProfile> }[] = [
  // ── Matched ──────────────────────────────────────────
  {
    name: 'cream knit, black straight jeans, white leather sneakers',
    verdict: 'matched',
    items: () => [
      top('crewneck sweater', { fit: 'relaxed', color: 'cream', material: 'knit', formality: 3 }),
      bottom('jeans', { fit: 'straight', color: 'black', material: 'denim' }),
      shoes('leather sneaker', { shoeProfile: 'low', color: 'white', formality: 3 }),
    ],
  },
  {
    name: 'oversized hoodie, slim black jeans, low sneakers',
    verdict: 'matched',
    items: () => [
      top('hoodie', { fit: 'oversized', color: 'grey' }),
      bottom('jeans', { fit: 'slim', color: 'black', material: 'denim' }),
      shoes('leather sneaker', { shoeProfile: 'low', color: 'white', formality: 3 }),
    ],
  },
  {
    name: 'boxy cropped tee, high-rise wide jeans, chunky sneakers',
    verdict: 'matched',
    items: () => [
      top('t-shirt', { fit: 'boxy', length: 'cropped', color: 'black' }),
      bottom('jeans', { fit: 'wide', rise: 'high', wash: 'light' }),
      shoes('chunky sneaker', { shoeProfile: 'chunky', color: 'white' }),
    ],
  },
  {
    name: 'fitted tee, baggy jeans, skate shoes',
    verdict: 'matched',
    items: () => [
      top('t-shirt', { fit: 'fitted', color: 'white' }),
      bottom('jeans', { fit: 'baggy', wash: 'mid' }),
      shoes('skate shoe', { shoeProfile: 'chunky', color: 'black' }),
    ],
  },
  {
    name: 'all black: tee, slim jeans, Chelsea boots',
    verdict: 'matched',
    items: () => [
      top('t-shirt', { fit: 'regular', color: 'black' }),
      bottom('jeans', { fit: 'slim', color: 'black', material: 'denim' }),
      shoes('chelsea boot', { shoeProfile: 'boot', color: 'black', formality: 4 }),
    ],
  },
  {
    name: 'oxford shirt, navy chinos, brown loafers',
    verdict: 'matched',
    items: () => [
      top('oxford shirt', { fit: 'regular', color: 'light-blue', formality: 3 }),
      bottom('chinos', { fit: 'slim', color: 'navy', formality: 3 }),
      shoes('penny loafer', { shoeProfile: 'low', color: 'brown', formality: 4 }),
    ],
  },
  {
    name: 'white tee, olive overshirt, dark jeans, white sneakers',
    verdict: 'matched',
    items: () => [
      top('t-shirt', { fit: 'regular', color: 'white' }),
      outer('overshirt', { fit: 'relaxed', color: 'olive', formality: 3 }),
      bottom('jeans', { fit: 'straight', wash: 'dark' }),
      shoes('leather sneaker', { shoeProfile: 'low', color: 'white', formality: 3 }),
    ],
  },
  {
    name: 'knit polo, pleated trousers, loafers',
    verdict: 'matched',
    items: () => [
      top('knit polo', { fit: 'regular', color: 'cream', material: 'knit', formality: 3 }),
      bottom('pleated trousers', { fit: 'straight', color: 'charcoal', formality: 4 }),
      shoes('penny loafer', { shoeProfile: 'low', color: 'brown', formality: 4 }),
    ],
  },
  {
    name: 'light denim jacket over dark jeans (contrasting washes)',
    verdict: 'matched',
    items: () => [
      top('t-shirt', { fit: 'regular', color: 'white' }),
      outer('denim jacket', { wash: 'light' }),
      bottom('jeans', { fit: 'slim', wash: 'dark' }),
      shoes('leather sneaker', { shoeProfile: 'low', color: 'white', formality: 3 }),
    ],
  },
  {
    name: 'womenswear: midi dress with ballet flats',
    verdict: 'matched',
    profile: { track: 'womenswear' },
    items: () => [
      dress('midi dress', { color: 'navy', formality: 3 }),
      shoes('ballet flat', { shoeProfile: 'low', color: 'black', formality: 3, track: 'womenswear' }),
    ],
  },

  // ── Works ────────────────────────────────────────────
  {
    name: 'regular tee, straight jeans, standard sneakers',
    verdict: 'works',
    items: () => [
      top('t-shirt', { fit: 'regular', color: 'grey' }),
      bottom('jeans', { fit: 'straight', wash: 'mid' }),
      shoes('canvas sneaker', { shoeProfile: 'standard', color: 'white' }),
    ],
  },
  {
    name: 'red tee, navy chinos, white sneakers (one statement, little else)',
    verdict: 'works',
    items: () => [
      top('t-shirt', { fit: 'regular', color: 'red' }),
      bottom('chinos', { fit: 'regular', color: 'navy', formality: 3 }),
      shoes('canvas sneaker', { shoeProfile: 'standard', color: 'white' }),
    ],
  },
  {
    name: 'white tee, wide jeans, minimal sneakers (shoe too slim)',
    verdict: 'works',
    items: () => [
      top('t-shirt', { fit: 'regular', color: 'white' }),
      bottom('jeans', { fit: 'wide', wash: 'light' }),
      shoes('leather sneaker', { shoeProfile: 'low', color: 'white', formality: 3 }),
    ],
  },
  {
    name: 'brown knit with black trousers (same-weight clash)',
    verdict: 'works',
    items: () => [
      top('sweater', { fit: 'regular', color: 'brown', material: 'knit', formality: 3 }),
      bottom('trousers', { fit: 'straight', color: 'black', formality: 3 }),
      shoes('leather sneaker', { shoeProfile: 'low', color: 'white', formality: 3 }),
    ],
  },
  {
    name: 'skinny jeans with chunky sneakers',
    verdict: 'works',
    items: () => [
      top('t-shirt', { fit: 'regular', color: 'white' }),
      bottom('jeans', { fit: 'skinny', color: 'black', material: 'denim' }),
      shoes('chunky sneaker', { shoeProfile: 'chunky', color: 'grey' }),
    ],
  },

  // ── Rethink ──────────────────────────────────────────
  {
    name: 'oversized hoodie, baggy jeans, slim sneakers',
    verdict: 'rethink',
    items: () => [
      top('hoodie', { fit: 'oversized', color: 'grey' }),
      bottom('jeans', { fit: 'baggy', wash: 'mid' }),
      shoes('leather sneaker', { shoeProfile: 'low', color: 'white', formality: 3 }),
    ],
  },
  {
    name: 'suit jacket with track pants and running shoes',
    verdict: 'rethink',
    items: () => [
      top('t-shirt', { fit: 'regular', color: 'white' }),
      outer('suit jacket', { fit: 'fitted', color: 'navy', formality: 5 }),
      bottom('track pants', { fit: 'relaxed', color: 'black', formality: 1 }),
      shoes('running shoe', { shoeProfile: 'standard', color: 'grey', formality: 1 }),
    ],
  },
  {
    name: 'red tee, green trousers, yellow sneakers',
    verdict: 'rethink',
    items: () => [
      top('t-shirt', { fit: 'regular', color: 'red' }),
      bottom('trousers', { fit: 'straight', color: 'green' }),
      shoes('canvas sneaker', { shoeProfile: 'standard', color: 'yellow' }),
    ],
  },
  {
    name: 'denim jacket and jeans in the same wash',
    verdict: 'rethink',
    items: () => [
      top('t-shirt', { fit: 'regular', color: 'red' }),
      outer('denim jacket', { wash: 'mid' }),
      bottom('jeans', { fit: 'wide', wash: 'mid' }),
      shoes('leather sneaker', { shoeProfile: 'low', color: 'white', formality: 3 }),
    ],
  },
  {
    name: 'striped shirt with check trousers and runners',
    verdict: 'rethink',
    items: () => [
      top('shirt', { fit: 'regular', color: 'blue', pattern: 'stripe', formality: 3 }),
      bottom('trousers', { fit: 'straight', color: 'brown', pattern: 'check', formality: 4 }),
      shoes('running shoe', { shoeProfile: 'standard', color: 'grey', formality: 1 }),
    ],
  },
  {
    name: 'pleated trousers with running shoes',
    verdict: 'rethink',
    items: () => [
      top('hoodie', { fit: 'oversized', color: 'red' }),
      bottom('pleated trousers', { fit: 'wide', color: 'charcoal', formality: 4 }),
      shoes('running shoe', { shoeProfile: 'standard', color: 'yellow', formality: 1 }),
    ],
  },
  {
    name: 'cropped tee over low-rise baggy jeans with slim shoes',
    verdict: 'rethink',
    items: () => [
      top('t-shirt', { fit: 'cropped', color: 'pink' }),
      bottom('jeans', { fit: 'baggy', rise: 'low', wash: 'light' }),
      shoes('ballet flat', { shoeProfile: 'low', color: 'red' }),
    ],
  },
  {
    name: 'womenswear: heels with joggers and a gym top',
    verdict: 'rethink',
    profile: { track: 'womenswear' },
    items: () => [
      top('sports top', { fit: 'fitted', color: 'red', formality: 1 }),
      bottom('joggers', { fit: 'relaxed', color: 'grey', formality: 1 }),
      shoes('stiletto heel', { shoeProfile: 'heel', color: 'green', formality: 4, track: 'womenswear' }),
    ],
  },
  {
    name: 'oversized long hoodie on a shorter frame wanting height, wide jeans, flats',
    verdict: 'rethink',
    profile: { heightCm: 165, goals: ['taller'] },
    items: () => [
      top('hoodie', { fit: 'oversized', length: 'long', color: 'grey' }),
      bottom('jeans', { fit: 'wide', wash: 'mid' }),
      shoes('leather sneaker', { shoeProfile: 'low', color: 'white', formality: 3 }),
    ],
  },
];

const profileFor = (p?: Partial<RulesProfile>): RulesProfile => ({ track: 'menswear', goals: [], ...p });

describe('known outfits', () => {
  it('covers at least 20 outfits across all verdicts', () => {
    expect(OUTFITS.length).toBeGreaterThanOrEqual(20);
    expect(new Set(OUTFITS.map((o) => o.verdict))).toEqual(new Set(['matched', 'works', 'rethink']));
  });

  it.each(OUTFITS)('$verdict: $name', ({ items, verdict, profile }) => {
    const result = scoreOutfit(items(), profileFor(profile));
    expect(result.verdict, `score ${result.score}: ${result.hits.map((h) => h.rule.id).join(', ')}`).toBe(verdict);
    expect(result.reasons.length).toBeGreaterThanOrEqual(2);
    expect(result.reasons.length).toBeLessThanOrEqual(4);
  });
});

describe('scoreOutfit', () => {
  const hoodie = top('hoodie', { fit: 'oversized', color: 'grey' });
  const baggy = bottom('jeans', { fit: 'baggy', wash: 'mid' });
  const slimShoe = shoes('leather sneaker', { shoeProfile: 'low', color: 'white', formality: 3 });

  it('is deterministic', () => {
    const items = [hoodie, baggy, slimShoe];
    expect(scoreOutfit(items)).toEqual(scoreOutfit(items));
  });

  it('keeps the score within 0–100', () => {
    const disaster = [
      top('shirt', { pattern: 'stripe', color: 'red', formality: 5 }),
      outer('denim jacket', { wash: 'mid' }),
      bottom('jeans', { fit: 'baggy', rise: 'low', wash: 'mid', pattern: 'check' }),
      shoes('ballet flat', { shoeProfile: 'low', color: 'green', formality: 1 }),
    ];
    const { score } = scoreOutfit(disaster);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('always shows warnings when something is wrong', () => {
    const { reasons } = scoreOutfit([hoodie, baggy, slimShoe]);
    expect(reasons.some((r) => !r.positive)).toBe(true);
  });

  it('orders reasons strongest first', () => {
    const { reasons, hits } = scoreOutfit([hoodie, baggy, slimShoe]);
    const strength = (id: string) => Math.abs(hits.find((h) => h.rule.id === id)!.points);
    const strengths = reasons.map((r) => strength(r.ruleId));
    expect(strengths).toEqual([...strengths].sort((a, b) => b - a));
  });

  it('only runs the rules for the profile track', () => {
    const items = [dress('midi dress', { color: 'navy' }), shoes('ballet flat', { shoeProfile: 'low' })];
    const ids = (track: RulesProfile['track']) => scoreOutfit(items, profileFor({ track })).hits.map((h) => h.rule.id);
    expect(ids('womenswear')).toContain('womens.midi-grounded');
    expect(ids('menswear')).not.toContain('womens.midi-grounded');
    expect(ids('both')).toContain('womens.midi-grounded');
  });
});

describe('profile modifiers', () => {
  const tonal = [
    top('t-shirt', { fit: 'regular', color: 'black' }),
    bottom('jeans', { fit: 'slim', color: 'black', material: 'denim' }),
    shoes('chelsea boot', { shoeProfile: 'boot', color: 'black', formality: 4 }),
  ];

  it('"look taller" boosts tonal outfits and shoe–trouser matches', () => {
    const base = scoreOutfit(tonal, profileFor());
    const taller = scoreOutfit(tonal, profileFor({ goals: ['taller'] }));
    const points = (r: typeof base, id: string) => r.hits.find((h) => h.rule.id === id)!.points;
    expect(points(taller, 'color.tonal')).toBeGreaterThan(points(base, 'color.tonal'));
    expect(points(taller, 'color.leg-line')).toBeGreaterThan(points(base, 'color.leg-line'));
    expect(taller.score).toBeGreaterThan(base.score);
  });

  it('the taller band softens volume penalties', () => {
    const big = [
      top('hoodie', { fit: 'oversized', color: 'grey' }),
      bottom('jeans', { fit: 'baggy', wash: 'mid' }),
      shoes('loafer', { shoeProfile: 'low', color: 'black', formality: 2 }),
    ];
    const average = scoreOutfit(big, profileFor({ heightCm: 176 }));
    const tall = scoreOutfit(big, profileFor({ heightCm: 192 }));
    expect(tall.score).toBeGreaterThan(average.score);
  });

  it('warns about long, oversized tops only when height is a goal or the band is shorter', () => {
    const items = [
      top('hoodie', { fit: 'oversized', length: 'long', color: 'grey' }),
      bottom('jeans', { fit: 'slim', color: 'black', material: 'denim' }),
    ];
    const fired = (p: Partial<RulesProfile>) =>
      scoreOutfit(items, profileFor(p)).hits.some((h) => h.rule.id === 'proportion.long-top-short-leg');
    expect(fired({})).toBe(false);
    expect(fired({ heightCm: 165 })).toBe(true);
    expect(fired({ goals: ['taller'] })).toBe(true);
  });

  it('"look broader" boosts V-shape outfits', () => {
    const items = [
      top('t-shirt', { fit: 'regular', color: 'white' }),
      outer('bomber jacket', { color: 'navy' }),
      bottom('jeans', { fit: 'slim', color: 'black', material: 'denim' }),
    ];
    const vShape = (p: Partial<RulesProfile>) =>
      scoreOutfit(items, profileFor(p)).hits.find((h) => h.rule.id === 'mens.v-shape')!.points;
    expect(vShape({ goals: ['broader'] })).toBeGreaterThan(vShape({}));
  });

  it('uses height bands relative to the track average', () => {
    const items = [
      top('hoodie', { fit: 'oversized', length: 'long', color: 'grey' }),
      bottom('jeans', { fit: 'slim', color: 'black', material: 'denim' }),
    ];
    const fired = (p: Partial<RulesProfile>) =>
      scoreOutfit(items, profileFor(p)).hits.some((h) => h.rule.id === 'proportion.long-top-short-leg');
    // 165 cm is shorter than the menswear average but about average for womenswear.
    expect(fired({ track: 'menswear', heightCm: 165 })).toBe(true);
    expect(fired({ track: 'womenswear', heightCm: 165 })).toBe(false);
  });
});
