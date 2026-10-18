import { describe, expect, it } from 'vitest';
import { ALL_RULES } from '@/rules';
import type { ItemTags } from '@/lib/types';
import { buildContext } from './context';
import { scoreOutfit } from './engine';
import { bottom, dress, outer, shoes, top } from './test-fixtures';
import type { RulesProfile } from './types';

/**
 * Every rule needs a case here: an outfit where it fires and a close
 * variation where it doesn't. The coverage test below fails otherwise.
 */
interface RuleCase {
  fires: ItemTags[];
  misses: ItemTags[];
  profile?: Partial<RulesProfile>;
}

// Shared pieces
const regularTee = () => top('t-shirt', { fit: 'regular', color: 'white' });
const fittedTee = () => top('t-shirt', { fit: 'fitted', color: 'white' });
const boxyTee = () => top('t-shirt', { fit: 'boxy', length: 'cropped', color: 'black' });
const hoodie = (o = {}) => top('hoodie', { fit: 'oversized', color: 'green', ...o });

const wideJeans = (o = {}) => bottom('jeans', { fit: 'wide', wash: 'light', rise: 'high', ...o });
const slimJeans = () => bottom('jeans', { fit: 'slim', wash: 'dark' });
const skinnyJeans = () => bottom('jeans', { fit: 'skinny', color: 'black', material: 'denim' });
const straightJeans = () => bottom('jeans', { fit: 'straight', wash: 'mid' });
const relaxedTrousers = () => bottom('pleated trousers', { fit: 'relaxed', color: 'beige', formality: 4 });

const lowSneakers = () => shoes('leather sneaker', { shoeProfile: 'low', color: 'white', formality: 3 });
const canvasSneakers = () => shoes('canvas sneaker', { shoeProfile: 'low', color: 'white' });
const chunkySneakers = () => shoes('chunky sneaker', { shoeProfile: 'chunky', color: 'grey' });
const chelsea = () => shoes('chelsea boot', { shoeProfile: 'boot', color: 'black', formality: 4 });
const loafers = () => shoes('penny loafer', { shoeProfile: 'low', color: 'brown', formality: 4 });
const runners = () => shoes('running shoe', { shoeProfile: 'standard', color: 'grey', formality: 1 });
const heels = () => shoes('heeled pump', { shoeProfile: 'heel', color: 'black', formality: 4, track: 'womenswear' });
const flats = () => shoes('ballet flat', { shoeProfile: 'low', color: 'black', formality: 3, track: 'womenswear' });

const CASES: Record<string, RuleCase> = {
  // Proportion
  'proportion.volume-on-top': { fires: [hoodie(), slimJeans()], misses: [regularTee(), slimJeans()] },
  'proportion.volume-below': { fires: [fittedTee(), wideJeans()], misses: [hoodie(), wideJeans()] },
  'proportion.double-volume': {
    fires: [hoodie(), wideJeans(), lowSneakers()],
    misses: [hoodie(), wideJeans(), chunkySneakers()],
  },
  'proportion.deliberate-volume': {
    fires: [hoodie(), wideJeans(), chunkySneakers()],
    misses: [hoodie(), wideJeans(), lowSneakers()],
  },
  'proportion.raised-waist': { fires: [boxyTee(), wideJeans()], misses: [boxyTee(), wideJeans({ rise: 'mid' })] },
  'proportion.low-rise-crop': { fires: [boxyTee(), wideJeans({ rise: 'low' })], misses: [boxyTee(), wideJeans()] },
  'proportion.even': { fires: [regularTee(), straightJeans()], misses: [regularTee(), slimJeans()] },
  'proportion.long-top-short-leg': {
    fires: [hoodie({ length: 'long' }), slimJeans()],
    misses: [hoodie(), slimJeans()],
    profile: { goals: ['taller'] },
  },

  // Shoes
  'shoes.weight-for-volume': { fires: [wideJeans(), chunkySneakers()], misses: [wideJeans(), lowSneakers()] },
  'shoes.swallowed': { fires: [wideJeans(), lowSneakers()], misses: [straightJeans(), lowSneakers()] },
  'shoes.clean-line': { fires: [slimJeans(), lowSneakers()], misses: [slimJeans(), chunkySneakers()] },
  'shoes.relaxed-leg': { fires: [relaxedTrousers(), chunkySneakers()], misses: [relaxedTrousers(), canvasSneakers()] },
  'shoes.relaxed-low': { fires: [relaxedTrousers(), canvasSneakers()], misses: [relaxedTrousers(), loafers()] },
  'shoes.heavy-on-narrow': { fires: [skinnyJeans(), chunkySneakers()], misses: [skinnyJeans(), lowSneakers()] },

  // Color
  'color.tonal': {
    fires: [top('t-shirt', { color: 'black' }), bottom('jeans', { color: 'black' })],
    misses: [regularTee(), bottom('jeans', { color: 'black' })],
  },
  'color.leg-line': {
    fires: [bottom('jeans', { fit: 'straight', color: 'black' }), chelsea()],
    misses: [bottom('jeans', { fit: 'straight', color: 'black' }), lowSneakers()],
  },
  'color.all-neutral': {
    fires: [regularTee(), bottom('chinos', { color: 'navy' }), chunkySneakers()],
    misses: [top('t-shirt', { color: 'red' }), bottom('chinos', { color: 'navy' })],
  },
  'color.one-statement': {
    fires: [top('t-shirt', { color: 'red' }), bottom('chinos', { color: 'navy' }), lowSneakers()],
    misses: [top('t-shirt', { color: 'red' }), bottom('chinos', { color: 'green' })],
  },
  'color.competing': {
    fires: [top('t-shirt', { color: 'red' }), bottom('chinos', { color: 'green' })],
    misses: [top('t-shirt', { color: 'red' }), bottom('jeans', { color: 'black' })],
  },
  'color.earth-tones': {
    fires: [top('t-shirt', { color: 'cream' }), outer('overshirt', { color: 'olive' }), straightJeans()],
    misses: [top('t-shirt', { color: 'olive' }), bottom('chinos', { color: 'red' })],
  },
  'color.clash': {
    fires: [top('knit', { color: 'brown' }), bottom('trousers', { color: 'black' })],
    misses: [top('knit', { color: 'brown' }), bottom('trousers', { color: 'cream' }), chelsea()],
  },
  'color.pattern-clash': {
    fires: [top('shirt', { pattern: 'stripe' }), bottom('trousers', { pattern: 'check' })],
    misses: [top('shirt', { pattern: 'stripe' }), bottom('trousers')],
  },
  'color.one-pattern': {
    fires: [top('shirt', { pattern: 'stripe' }), bottom('trousers')],
    misses: [top('shirt'), bottom('trousers')],
  },
  'color.dark-base': {
    fires: [regularTee(), bottom('jeans', { color: 'black' })],
    misses: [regularTee(), wideJeans()],
  },

  // Denim
  'denim.contrast': {
    fires: [outer('denim jacket', { wash: 'light' }), bottom('jeans', { wash: 'dark' })],
    misses: [outer('denim jacket', { wash: 'mid' }), bottom('jeans', { wash: 'mid' })],
  },
  'denim.too-close': {
    fires: [outer('denim jacket', { wash: 'mid' }), bottom('jeans', { wash: 'mid' })],
    misses: [outer('denim jacket', { wash: 'light' }), bottom('jeans', { wash: 'dark' })],
  },

  // Formality
  'formality.mismatch': {
    fires: [outer('suit jacket', { formality: 5 }), bottom('track pants', { formality: 1 }), regularTee()],
    misses: [regularTee(), straightJeans(), loafers()],
  },
  'formality.smart-casual': {
    fires: [top('gym tee', { formality: 1 }), straightJeans(), loafers()],
    misses: [regularTee(), straightJeans(), loafers()],
  },
  'formality.bridged': {
    fires: [regularTee(), bottom('suit trousers', { formality: 5 }), lowSneakers()],
    misses: [regularTee(), bottom('suit trousers', { formality: 5 }), runners()],
  },
  'formality.dressed-down': {
    fires: [regularTee(), relaxedTrousers(), lowSneakers()],
    misses: [regularTee(), straightJeans(), canvasSneakers()],
  },
  'formality.consistent': {
    fires: [regularTee(), straightJeans(), canvasSneakers()],
    misses: [regularTee(), relaxedTrousers(), canvasSneakers()],
  },

  // Menswear
  'mens.tailoring-polish': { fires: [relaxedTrousers(), loafers()], misses: [relaxedTrousers(), chunkySneakers()] },
  'mens.tailoring-runners': { fires: [relaxedTrousers(), runners()], misses: [relaxedTrousers(), loafers()] },
  'mens.open-layer': {
    fires: [regularTee(), outer('overshirt', { color: 'olive' })],
    misses: [regularTee(), outer('bomber jacket', { color: 'navy' })],
  },
  'mens.v-shape': {
    fires: [regularTee(), outer('bomber jacket', { color: 'navy' }), slimJeans()],
    misses: [regularTee(), outer('bomber jacket', { color: 'navy' }), wideJeans()],
  },

  // Womenswear
  'womens.midi-grounded': { fires: [dress('midi dress'), flats()], misses: [dress('midi dress'), heels()] },
  'womens.mini-weight': {
    fires: [fittedTee(), bottom('mini skirt', { track: 'womenswear' }), chelsea()],
    misses: [fittedTee(), bottom('mini skirt', { track: 'womenswear' }), heels()],
  },
  'womens.maxi-lift': { fires: [dress('maxi dress'), heels()], misses: [dress('maxi dress'), flats()] },
  'womens.heels-dressy': {
    fires: [dress('slip dress', { formality: 4 }), heels()],
    misses: [regularTee(), straightJeans(), heels()],
  },
  'womens.heels-casual': {
    fires: [regularTee(), bottom('joggers', { formality: 1 }), heels()],
    misses: [regularTee(), relaxedTrousers(), heels()],
  },
};

const profileFor = (c: RuleCase): RulesProfile => ({ track: 'both', goals: [], ...c.profile });

describe('rule coverage', () => {
  it('every rule has a unique id', () => {
    const ids = ALL_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every rule has a test case', () => {
    expect(Object.keys(CASES).sort()).toEqual(ALL_RULES.map((r) => r.id).sort());
  });
});

describe.each(ALL_RULES.map((rule) => [rule.id, rule] as const))('%s', (id, rule) => {
  const testCase = CASES[id];
  if (!testCase) return;
  const profile = profileFor(testCase);

  it('fires on its example outfit', () => {
    expect(rule.when(buildContext(testCase.fires, profile))).toBeTruthy();
  });

  it('stays quiet on the near-miss', () => {
    expect(rule.when(buildContext(testCase.misses, profile))).toBeFalsy();
  });

  it('writes a complete, well-formed reason', () => {
    const [reason] = scoreOutfit(testCase.fires, profile, [rule]).reasons;
    expect(reason?.ruleId).toBe(id);
    expect(reason?.positive).toBe(rule.effect > 0);
    expect(reason?.text).not.toMatch(/[{}]/);
    expect(reason?.text).toMatch(/^[A-Z].*\.$/);
  });
});
