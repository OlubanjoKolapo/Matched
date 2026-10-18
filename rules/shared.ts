/**
 * Rules that apply to every track: proportion, shoes for leg volume, color,
 * denim and formality.
 *
 * Writing a rule:
 * - `when` reads the outfit context and returns false, true, or extra slots.
 * - `text` is one or two short sentences in the Matched voice: a confident,
 *   friendly stylist. No jargon, never judgemental about bodies.
 * - Put slots after "your", "of" or "with" so verbs never have to agree with
 *   them ("your {shoes}", not "{shoes} keeps").
 * - Every rule needs a test in lib/rules/rules.test.ts.
 */
import {
  bottomVolume,
  hasLegs,
  hasWeight,
  isBridge,
  isChunky,
  isCropped,
  isDenim,
  isLowShoe,
  isPatterned,
  isPolishedShoe,
  isSkirt,
  isSleek,
  itemLabel,
  topVolume,
} from '@/lib/rules/garment';
import type { Rule, RuleContext } from '@/lib/rules/types';
import type { ItemTags } from '@/lib/types';
import { CLASHES, DENIM_WASH, EARTH_FRIENDS, TONAL_MAX_LIGHTNESS_SPREAD, TONE_LABELS } from './colors';
import { BOTTOM_VOLUME, TOP_VOLUME, VOLUME } from './garments';

const unique = <T>(values: T[]) => [...new Set(values)];

function lightnessSpread(ctx: RuleContext, items: ItemTags[]): number {
  const values = items.map((i) => ctx.color(i).lightness);
  return Math.max(...values) - Math.min(...values);
}

function isDoubleVolume({ top, bottom }: RuleContext): boolean {
  return (topVolume(top) ?? 0) >= VOLUME.big && hasLegs(bottom) && (bottomVolume(bottom) ?? 0) >= VOLUME.big;
}

/** What makes big-on-big look deliberate: a cropped top or a shoe with weight. */
function streetwearSignal({ top, shoes }: RuleContext): string | undefined {
  if (shoes && hasWeight(shoes)) return `the weight of your ${itemLabel(shoes)}`;
  if (top && isCropped(top)) return `the cropped length of your ${itemLabel(top)}`;
  return undefined;
}

/** The first pair of main pieces whose colors are listed in CLASHES. */
function findClash(ctx: RuleContext): [ItemTags, ItemTags] | undefined {
  for (const a of ctx.clothing) {
    for (const b of ctx.clothing) {
      const [fa, fb] = [ctx.color(a).family, ctx.color(b).family];
      if (CLASHES.some(([x, y]) => x === fa && y === fb)) return [a, b];
    }
  }
  return undefined;
}

function isTonal(ctx: RuleContext): boolean {
  if (ctx.clothing.length < 2) return false;
  return (
    unique(ctx.clothing.map((i) => ctx.color(i).tone)).length === 1 &&
    lightnessSpread(ctx, ctx.clothing) <= TONAL_MAX_LIGHTNESS_SPREAD
  );
}

// ── Proportion ─────────────────────────────────────────

const proportion: Rule[] = [
  {
    id: 'proportion.volume-on-top',
    kind: 'proportion',
    effect: 10,
    text: 'Volume up top, a clean line below. Your roomy {top} balances out your slimmer {bottom}.',
    when: ({ top, bottom }) =>
      (topVolume(top) ?? 0) >= VOLUME.roomyTop &&
      !isCropped(top) &&
      hasLegs(bottom) &&
      (bottomVolume(bottom) ?? Infinity) <= VOLUME.cleanLine,
  },
  {
    id: 'proportion.volume-below',
    kind: 'proportion',
    effect: 8,
    text: 'Your {top} keeps the top half neat, so the volume in your {bottom} can lead.',
    when: ({ top, bottom }) =>
      (topVolume(top) ?? Infinity) <= VOLUME.neatTop &&
      !isCropped(top) &&
      hasLegs(bottom) &&
      (bottomVolume(bottom) ?? 0) >= VOLUME.big,
  },
  {
    id: 'proportion.double-volume',
    kind: 'proportion',
    effect: -16,
    tags: ['volume'],
    text: 'Oversized on top and wide below swamps the frame. Slim down one half, or anchor it with a chunky shoe.',
    when: (ctx) => isDoubleVolume(ctx) && !streetwearSignal(ctx),
  },
  {
    id: 'proportion.deliberate-volume',
    kind: 'proportion',
    effect: 6,
    tags: ['volume'],
    text: 'Big on big, done on purpose: {signal} gives all that volume a deliberate streetwear shape.',
    when: (ctx) => {
      const signal = isDoubleVolume(ctx) && streetwearSignal(ctx);
      return signal ? { signal } : false;
    },
  },
  {
    id: 'proportion.raised-waist',
    kind: 'proportion',
    effect: 8,
    tags: ['leg-line'],
    text: 'The short length of your {top} over high-rise {bottom} lifts the waistline, so your legs read longer.',
    when: ({ top, bottom }) =>
      isCropped(top) &&
      bottom?.rise === 'high' &&
      (isSkirt(bottom) || (bottomVolume(bottom) ?? 0) >= VOLUME.cleanLine),
  },
  {
    id: 'proportion.low-rise-crop',
    kind: 'proportion',
    effect: -8,
    tags: ['leg-line'],
    text: 'A short {top} with low-rise {bottom} leaves a gap at the middle that shortens the legs. A higher rise fixes it.',
    when: ({ top, bottom }) => isCropped(top) && bottom?.rise === 'low',
  },
  {
    id: 'proportion.even',
    kind: 'proportion',
    effect: 3,
    text: 'Your {top} and {bottom} share an easy, even silhouette. Not loud, never wrong.',
    when: ({ top, bottom }) =>
      topVolume(top) === TOP_VOLUME.regular && hasLegs(bottom) && bottomVolume(bottom) === BOTTOM_VOLUME.straight,
  },
  {
    id: 'proportion.long-top-short-leg',
    kind: 'proportion',
    effect: -8,
    tags: ['leg-line'],
    text: 'The length of your {top} hides where your legs start. A half-tuck or a hip-length cut gives them back.',
    when: ({ top, heightBand, profile }) =>
      (heightBand === 'shorter' || profile.goals.includes('taller')) &&
      (topVolume(top) ?? 0) >= VOLUME.big &&
      top?.length === 'long',
  },
];

// ── Shoes and leg volume ───────────────────────────────

const shoes: Rule[] = [
  {
    id: 'shoes.weight-for-volume',
    kind: 'shoes',
    effect: 12,
    text: "There's a lot of fabric in your {bottom}, and the weight of your {shoes} holds its own against it.",
    when: ({ bottom, shoes }) => hasLegs(bottom) && (bottomVolume(bottom) ?? 0) >= VOLUME.big && hasWeight(shoes),
  },
  {
    id: 'shoes.swallowed',
    kind: 'shoes',
    effect: -14,
    text: 'A slim shoe gets swallowed by the extra fabric in your {bottom}. Something chunkier, like a skate shoe or a boot, keeps it balanced.',
    when: ({ bottom, shoes }) => hasLegs(bottom) && (bottomVolume(bottom) ?? 0) >= VOLUME.big && isLowShoe(shoes),
  },
  {
    id: 'shoes.clean-line',
    kind: 'shoes',
    effect: 10,
    text: 'The low profile of your {shoes} follows the clean line of your {bottom}.',
    when: ({ bottom, shoes }) =>
      hasLegs(bottom) && (bottomVolume(bottom) ?? Infinity) <= VOLUME.cleanLine && isSleek(shoes),
  },
  {
    id: 'shoes.relaxed-leg',
    kind: 'shoes',
    effect: 4,
    text: 'A relaxed leg like your {bottom} has room for a shoe with some substance, like your {shoes}.',
    when: ({ bottom, shoes }) =>
      hasLegs(bottom) && bottomVolume(bottom) === BOTTOM_VOLUME.relaxed && !!shoes && !isLowShoe(shoes),
  },
  {
    id: 'shoes.relaxed-low',
    kind: 'shoes',
    effect: -3,
    text: 'A relaxed leg like your {bottom} looks a little loose over a low shoe. A slightly chunkier sole would ground it.',
    when: ({ bottom, shoes }) =>
      hasLegs(bottom) && bottomVolume(bottom) === BOTTOM_VOLUME.relaxed && isLowShoe(shoes) && !isPolishedShoe(shoes),
  },
  {
    id: 'shoes.heavy-on-narrow',
    kind: 'shoes',
    effect: -12,
    text: 'A chunky sole looks heavy under a narrow leg like your {bottom}. A sleeker shoe suits the line.',
    when: ({ bottom, shoes }) => hasLegs(bottom) && bottomVolume(bottom) === BOTTOM_VOLUME.skinny && isChunky(shoes),
  },
];

// ── Color ──────────────────────────────────────────────

const color: Rule[] = [
  {
    id: 'color.tonal',
    kind: 'color',
    effect: 12,
    tags: ['tonal'],
    text: 'Head to toe in {tone}. One unbroken column of color reads taller and more deliberate.',
    when: (ctx) => {
      if (!isTonal(ctx)) return false;
      const tone = ctx.color(ctx.clothing[0]!).tone;
      return { tone: TONE_LABELS[tone] ?? tone };
    },
  },
  {
    id: 'color.leg-line',
    kind: 'color',
    effect: 6,
    tags: ['leg-line', 'tonal'],
    text: 'Matching your {shoes} to your {bottom} carries the color down to the floor and lengthens the leg.',
    when: (ctx) => {
      const { bottom, shoes } = ctx;
      if (!bottom || !shoes || !hasLegs(bottom)) return false;
      return (
        ctx.color(bottom).tone === ctx.color(shoes).tone &&
        lightnessSpread(ctx, [bottom, shoes]) <= TONAL_MAX_LIGHTNESS_SPREAD
      );
    },
  },
  {
    id: 'color.all-neutral',
    kind: 'color',
    effect: 8,
    text: 'An all-neutral palette of {colors}. Nothing competes, so the shapes do the talking.',
    when: (ctx) => {
      if (ctx.worn.length < 2 || isTonal(ctx)) return false;
      const infos = ctx.worn.map((i) => ctx.color(i));
      if (!infos.every((c) => c.group === 'neutral')) return false;
      return { colors: unique(infos.map((c) => c.label)) };
    },
  },
  {
    id: 'color.one-statement',
    kind: 'color',
    effect: 8,
    text: 'The {color} of your {statement} is the one bold note against a quiet base. That is the right dose.',
    when: (ctx) => {
      const statements = ctx.worn.filter((i) => ctx.color(i).group === 'statement');
      const first = statements[0];
      if (!first || unique(statements.map((i) => ctx.color(i).tone)).length !== 1) return false;
      return { statement: first, color: ctx.color(first).label };
    },
  },
  {
    id: 'color.competing',
    kind: 'color',
    effect: -14,
    text: 'The {colorA} of your {a} and the {colorB} of your {b} both want attention. Keep one bold color and let neutrals carry the rest.',
    when: (ctx) => {
      const statements = ctx.worn.filter((i) => ctx.color(i).group === 'statement');
      const a = statements[0];
      const b = statements.find((i) => a && ctx.color(i).tone !== ctx.color(a).tone);
      if (!a || !b) return false;
      return { a, b, colorA: ctx.color(a).label, colorB: ctx.color(b).label };
    },
  },
  {
    id: 'color.earth-tones',
    kind: 'color',
    effect: 8,
    text: 'Earth tones like {earth} sit naturally with {others}.',
    when: (ctx) => {
      const infos = ctx.worn.map((i) => ctx.color(i));
      const earth = infos.filter((c) => c.group === 'earth');
      const others = infos.filter((c) => c.group !== 'earth');
      if (!earth.length || !others.every((c) => EARTH_FRIENDS.includes(c.family))) return false;
      if (ctx.worn.length < 2 || findClash(ctx)) return false;
      return {
        earth: unique(earth.map((c) => c.label)),
        others: others.length ? unique(others.map((c) => c.label)) : 'each other',
      };
    },
  },
  {
    id: 'color.clash',
    kind: 'color',
    effect: -10,
    text: '{colorA} and {colorB} at the same weight, in your {a} and your {b}, tend to fight. Let one be a small accent instead.',
    when: (ctx) => {
      const clash = findClash(ctx);
      if (!clash) return false;
      const [a, b] = clash;
      return { a, b, colorA: ctx.color(a).label, colorB: ctx.color(b).label };
    },
  },
  {
    id: 'color.pattern-clash',
    kind: 'color',
    effect: -12,
    text: 'Your {a} and {b} both carry a pattern, so they compete. Keep one and make the other plain.',
    when: ({ worn }) => {
      const [a, b] = worn.filter(isPatterned);
      return a && b ? { a, b } : false;
    },
  },
  {
    id: 'color.one-pattern',
    kind: 'color',
    effect: 4,
    text: 'One pattern, on your {a}, with plain pieces around it. Easy on the eye.',
    when: ({ worn }) => {
      const patterned = worn.filter(isPatterned);
      return worn.length >= 2 && patterned.length === 1 ? { a: patterned[0]! } : false;
    },
  },
  {
    id: 'color.dark-base',
    kind: 'color',
    effect: 4,
    tags: ['dark-base'],
    text: 'A dark base from your {bottom} keeps the silhouette clean and long.',
    when: (ctx) => !!ctx.bottom && !isTonal(ctx) && ctx.color(ctx.bottom).lightness < 30,
  },
];

// ── Denim on denim ─────────────────────────────────────

function denimPair({ top, outerwear, bottom }: RuleContext): [ItemTags, ItemTags] | undefined {
  const upper = [outerwear, top].find((i) => i && isDenim(i));
  return upper && bottom && isDenim(bottom) ? [upper, bottom] : undefined;
}

const denim: Rule[] = [
  {
    id: 'denim.contrast',
    kind: 'color',
    effect: 6,
    text: 'Denim on denim works when the washes differ, and your {a} and {b} are clearly apart.',
    when: (ctx) => {
      const pair = denimPair(ctx);
      return pair && lightnessSpread(ctx, pair) >= DENIM_WASH.contrastMin ? { a: pair[0], b: pair[1] } : false;
    },
  },
  {
    id: 'denim.too-close',
    kind: 'color',
    effect: -12,
    text: 'Your {a} and {b} are almost the same wash, so it reads like an accidental suit. Make one clearly lighter or darker.',
    when: (ctx) => {
      const pair = denimPair(ctx);
      return pair && lightnessSpread(ctx, pair) < DENIM_WASH.tooCloseMax ? { a: pair[0], b: pair[1] } : false;
    },
  },
];

// ── Formality ──────────────────────────────────────────

/** Formality gaps above this need a bridge piece; above maxBridgeable nothing helps. */
const FORMALITY = { maxGap: 2, maxBridgeable: 3, consistentGap: 1 } as const;

function formalitySpread({ worn }: RuleContext) {
  const sorted = [...worn].sort((a, b) => a.formality - b.formality);
  const low = sorted[0];
  const high = sorted[sorted.length - 1];
  return { low, high, gap: low && high ? high.formality - low.formality : 0 };
}

function bridgeFor(ctx: RuleContext) {
  const { low, high, gap } = formalitySpread(ctx);
  if (!low || !high || gap <= FORMALITY.maxGap || gap > FORMALITY.maxBridgeable) return undefined;
  const bridge = ctx.worn.find(isBridge);
  return bridge ? { bridge, low, high } : undefined;
}

const formality: Rule[] = [
  {
    id: 'formality.mismatch',
    kind: 'formality',
    effect: -16,
    tags: ['polish'],
    text: 'Your {high} and {low} sit at opposite ends of dressy and casual. Bring them closer, or add a piece that bridges the two.',
    when: (ctx) => {
      const { low, high, gap } = formalitySpread(ctx);
      if (!low || !high || gap <= FORMALITY.maxGap || bridgeFor(ctx)) return false;
      return { low, high };
    },
  },
  {
    id: 'formality.smart-casual',
    kind: 'formality',
    effect: 6,
    text: 'Smart-casual on purpose: pairing your {bridge} with your {other} lifts the look without tipping into formal.',
    when: (ctx) => {
      const found = bridgeFor(ctx);
      if (!found || (found.bridge !== found.low && found.bridge !== found.high)) return false;
      return { bridge: found.bridge, other: found.bridge === found.high ? found.low : found.high };
    },
  },
  {
    id: 'formality.bridged',
    kind: 'formality',
    effect: 6,
    text: 'Smart-casual on purpose: the gap between your {high} and your {low} is bridged by your {bridge}.',
    when: (ctx) => {
      const found = bridgeFor(ctx);
      if (!found || found.bridge === found.low || found.bridge === found.high) return false;
      return found;
    },
  },
  {
    id: 'formality.dressed-down',
    kind: 'formality',
    effect: 3,
    text: 'Pairing your {high} with your {low} dresses the look down a notch, which keeps it relaxed.',
    when: (ctx) => {
      const { low, high, gap } = formalitySpread(ctx);
      return low && high && gap === FORMALITY.maxGap ? { low, high } : false;
    },
  },
  {
    id: 'formality.consistent',
    kind: 'formality',
    effect: 6,
    tags: ['polish'],
    text: 'Every piece sits at the same level of dressiness, so the outfit feels intentional.',
    when: (ctx) => ctx.worn.length >= 2 && formalitySpread(ctx).gap <= FORMALITY.consistentGap,
  },
];

export const sharedRules: Rule[] = [...proportion, ...shoes, ...color, ...denim, ...formality];
