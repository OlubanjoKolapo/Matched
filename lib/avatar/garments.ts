import type { Fit, ItemTags, Pattern, ShoeProfile } from '@/lib/types';
import { armAt, lerp, mirrorD, path, smoothPath, type Figure, type Pt } from './geometry';

/**
 * Garment specs and path templates. A spec is derived from an item's tags;
 * a template turns a spec plus the figure into SVG paths. Every template
 * emits the same commands for every spec, so fit changes morph smoothly.
 */

export type Texture = 'denim' | 'knit' | 'leather' | 'suede' | 'twill' | 'none';

export interface GarmentLook {
  color: string;
  pattern: Pattern;
  texture: Texture;
}

const has = (item: ItemTags, words: string[]) => words.some((w) => item.subtype.toLowerCase().includes(w));

export function textureOf(item: ItemTags): Texture {
  const m = `${item.material ?? ''} ${item.subtype}`.toLowerCase();
  if (/denim|jean/.test(m)) return 'denim';
  if (/knit|wool|cashmere|merino|sweater|jumper|cardigan/.test(m)) return 'knit';
  if (/suede/.test(m)) return 'suede';
  if (/leather/.test(m)) return 'leather';
  if (/twill|canvas|chino|cord/.test(m)) return 'twill';
  return 'none';
}

export function lookOf(item: ItemTags): GarmentLook {
  const main = [...item.colors].sort((a, b) => b.share - a.share)[0];
  return { color: main?.hex ?? '#8c8c8c', pattern: item.pattern, texture: textureOf(item) };
}

// ── Tops ────────────────────────────────────────────────

export interface TopSpec {
  template: 'top';
  ease: number;
  hem: 'cropped' | 'waist' | 'hip' | 'low' | 'long';
  /** Sleeve length along the arm: 0 sleeveless, 1 to the wrist. */
  sleeve: number;
  /** Dropped shoulder, 0–1. */
  drop: number;
  neckline: 'crew' | 'collar' | 'hood' | 'v';
  placket: boolean;
  pocket: 'kangaroo' | 'chest' | 'none';
}

const TOP_FIT: Record<Fit, Pick<TopSpec, 'ease' | 'hem' | 'drop'>> = {
  skinny: { ease: 1.5, hem: 'hip', drop: 0 },
  slim: { ease: 2, hem: 'hip', drop: 0 },
  fitted: { ease: 2, hem: 'hip', drop: 0 },
  regular: { ease: 5, hem: 'hip', drop: 0 },
  straight: { ease: 5, hem: 'hip', drop: 0 },
  relaxed: { ease: 8, hem: 'low', drop: 0.25 },
  boxy: { ease: 11, hem: 'waist', drop: 0.45 },
  cropped: { ease: 5, hem: 'cropped', drop: 0 },
  oversized: { ease: 13, hem: 'long', drop: 0.7 },
  wide: { ease: 13, hem: 'long', drop: 0.7 },
  baggy: { ease: 13, hem: 'long', drop: 0.7 },
};

const SLEEVELESS = ['tank', 'vest top', 'camisole', 'cami', 'singlet'];
const SHORT_SLEEVE = ['t-shirt', 'tee', 'polo', 'crop top', 'short sleeve'];
const COLLARED = ['shirt', 'oxford', 'polo', 'blouse'];

export function topSpec(item: ItemTags): TopSpec {
  const fit = TOP_FIT[item.fit ?? 'regular'];
  const isTee = has(item, ['t-shirt', 'tee']);
  const sleeve = has(item, SLEEVELESS) ? 0 : has(item, SHORT_SLEEVE) ? (fit.drop > 0.4 ? 0.42 : 0.33) : 0.96;
  let hem = fit.hem;
  // A cropped length on a boxy or regular top sits at the waistband; only crop tops bare the midriff.
  if (item.length === 'cropped') hem = item.fit === 'cropped' ? 'cropped' : 'waist';
  if (item.length === 'long') hem = 'long';
  return {
    template: 'top',
    ...fit,
    hem,
    sleeve,
    neckline: has(item, ['hood']) ? 'hood' : has(item, ['v-neck']) ? 'v' : !isTee && has(item, COLLARED) ? 'collar' : 'crew',
    placket: !isTee && has(item, ['shirt', 'oxford', 'blouse', 'polo']),
    pocket: has(item, ['hood']) ? 'kangaroo' : !isTee && has(item, ['shirt', 'oxford']) ? 'chest' : 'none',
  };
}

function topHemY(f: Figure, hem: TopSpec['hem']): number {
  const h = f.headH;
  return { cropped: f.waistY - 0.05 * h, waist: f.waistY + 0.5 * h, hip: f.hipY + 0.2 * h, low: f.hipY + 0.45 * h, long: f.crotchY + 0.22 * h }[hem];
}

/** Body half-width at a given height, interpolating the torso landmarks. */
function bodyHalfAt(f: Figure, y: number): number {
  if (y <= f.waistY) return lerp(f.w.chest, f.w.waist, Math.max(0, (y - f.armpitY) / (f.waistY - f.armpitY)));
  if (y <= f.hipY) return lerp(f.w.waist, f.w.hip, (y - f.waistY) / (f.hipY - f.waistY));
  return f.w.hip;
}

interface Upper {
  ease: number;
  hemY: number;
  sleeve: number;
  drop: number;
  neckOpen: number;
}

/** Right half of an upper garment: neck, shoulder, sleeve end (outer, inner), armpit, hem corner. */
function upperPoints(f: Figure, u: Upper) {
  const { cx, w, headH } = f;
  const shoulder = { x: cx + w.shoulder + u.ease * 0.35 + u.drop * 7, y: f.shoulderY - 0.5 + u.drop * 2 };
  const a = armAt(f.arm, Math.max(0.04, u.sleeve));
  // Long sleeves run a little wider so no skin shows between sleeve and body.
  const sleeveHalf = a.half + 1.5 + u.ease * 0.35 + (u.sleeve > 0.6 ? 3.5 : 0);
  const sleeveOuter = { x: a.centre.x + a.normal.x * sleeveHalf, y: a.centre.y + a.normal.y * sleeveHalf };
  const sleeveInner = { x: a.centre.x - a.normal.x * sleeveHalf, y: a.centre.y - a.normal.y * sleeveHalf };
  const armpit = { x: cx + w.chest + u.ease, y: f.armpitY + u.drop * headH * 0.3 };
  const hem = { x: cx + Math.max(bodyHalfAt(f, u.hemY), w.waist) + u.ease, y: u.hemY };
  const neck = { x: cx + u.neckOpen, y: f.neckY - 1 };
  return { neck, shoulder, sleeveOuter, sleeveInner, armpit, hem };
}

/** The inner edge of a long sleeve, drawn as a soft line so sleeves read apart from the body. */
function sleeveEdges(p: ReturnType<typeof upperPoints>, sleeve: number): string | undefined {
  if (sleeve < 0.6) return undefined;
  const edge = path()
    .M(p.armpit)
    .C({ x: p.armpit.x + 2, y: p.armpit.y + 6 }, { x: p.sleeveInner.x - 1, y: p.sleeveInner.y - 6 }, p.sleeveInner)
    .toString();
  return `${edge} ${mirrorD(edge)}`;
}

/** Each sleeve as its own region, so it can be lit as a rounded form. */
function sleeveShapes(p: ReturnType<typeof upperPoints>): [string, string] {
  const sleeve = path()
    .M(p.shoulder)
    .C({ x: p.shoulder.x + 6, y: p.shoulder.y + 2 }, { x: p.sleeveOuter.x, y: lerp(p.shoulder.y, p.sleeveOuter.y, 0.55) }, p.sleeveOuter)
    .L(p.sleeveInner)
    .C({ x: p.sleeveInner.x - 1, y: p.sleeveInner.y - 6 }, { x: p.armpit.x + 2, y: p.armpit.y + 6 }, p.armpit)
    .C({ x: p.armpit.x - 2, y: p.armpit.y - 8 }, { x: p.shoulder.x - 5, y: p.shoulder.y + 6 }, p.shoulder)
    .Z()
    .toString();
  return [mirrorD(sleeve), sleeve];
}

/** A short soft crease across the sleeve at arm position t. */
function sleeveCrease(f: Figure, t: number, half: number, lift: number): string {
  const a = armAt(f.arm, t);
  const tangent = { x: -a.normal.y, y: a.normal.x };
  const at = (v: number, u: number): Pt => ({
    x: a.centre.x + a.normal.x * v + tangent.x * u,
    y: a.centre.y + a.normal.y * v + tangent.y * u,
  });
  return smoothPath([at(-half * 0.85, lift), at(0, lift + 2.2), at(half * 0.7, lift - 0.5)], false);
}

/**
 * Fabric folds for an upper garment (right side, mirrored): two creases where
 * the sleeve bends, a drape line from the armpit and a pull line at the hem.
 * Always four strokes per side, so folds morph with the fit.
 */
function upperFolds(f: Figure, p: ReturnType<typeof upperPoints>, sleeve: number, ease: number): string {
  const { cx } = f;
  const split =
    Math.hypot(f.arm.elbow.x - f.arm.shoulder.x, f.arm.elbow.y - f.arm.shoulder.y) /
    (Math.hypot(f.arm.elbow.x - f.arm.shoulder.x, f.arm.elbow.y - f.arm.shoulder.y) +
      Math.hypot(f.arm.wrist.x - f.arm.elbow.x, f.arm.wrist.y - f.arm.elbow.y));
  const t = Math.max(0.05, Math.min(sleeve - 0.06, split - 0.02));
  const half = armAt(f.arm, t).half + 1.5 + ease * 0.3;
  const hemHalf = p.hem.x - cx;
  const side = [
    sleeveCrease(f, t, half, 0),
    sleeveCrease(f, Math.min(sleeve - 0.02, t + 0.07), half, 1.5),
    smoothPath(
      [
        { x: p.armpit.x - 2, y: p.armpit.y + 5 },
        { x: cx + hemHalf * 0.84, y: lerp(p.armpit.y, p.hem.y, 0.28) },
        { x: cx + hemHalf * 0.74, y: lerp(p.armpit.y, p.hem.y, 0.5) },
      ],
      false,
    ),
    smoothPath(
      [
        { x: cx + hemHalf * 0.3, y: p.hem.y - 3 },
        { x: cx + hemHalf * 0.5, y: p.hem.y - 10 },
        { x: cx + hemHalf * 0.72, y: p.hem.y - 14 },
      ],
      false,
    ),
  ].join(' ');
  return `${side} ${mirrorD(side)}`;
}

/** Soft shadow the hem casts on whatever is underneath. */
function hemShadowPath(f: Figure, hem: Pt): string {
  const { cx } = f;
  const l = 2 * cx - hem.x;
  return path()
    .M({ x: l + 2, y: hem.y - 2 })
    .C({ x: cx - 12, y: hem.y + 2 }, { x: cx + 12, y: hem.y + 2 }, { x: hem.x - 2, y: hem.y - 2 })
    .L({ x: hem.x - 3, y: hem.y + 6 })
    .C({ x: cx + 12, y: hem.y + 10 }, { x: cx - 12, y: hem.y + 10 }, { x: l + 3, y: hem.y + 6 })
    .Z()
    .toString();
}

export function topPaths(f: Figure, spec: TopSpec) {
  const { cx, headH } = f;
  const hemY = topHemY(f, spec.hem);
  const neckOpen = f.w.neck + 3 + spec.ease * 0.15;
  const p = upperPoints(f, { ease: spec.ease, hemY, sleeve: spec.sleeve, drop: spec.drop, neckOpen });
  const dip = spec.neckline === 'v' ? headH * 0.55 : spec.neckline === 'collar' ? headH * 0.2 : headH * 0.12;
  const left = (q: Pt) => ({ x: 2 * cx - q.x, y: q.y });

  const body = path()
    .M(left(p.neck))
    .C({ x: left(p.neck).x + 2, y: p.neck.y + dip }, { x: p.neck.x - 2, y: p.neck.y + dip }, p.neck)
    .C({ x: p.neck.x + 8, y: p.neck.y + 2 }, { x: p.shoulder.x - 9, y: p.shoulder.y - 3 }, p.shoulder)
    .C({ x: p.shoulder.x + 6, y: p.shoulder.y + 2 }, { x: p.sleeveOuter.x, y: lerp(p.shoulder.y, p.sleeveOuter.y, 0.55) }, p.sleeveOuter)
    .L(p.sleeveInner)
    .C({ x: p.sleeveInner.x - 1, y: p.sleeveInner.y - 6 }, { x: p.armpit.x + 2, y: p.armpit.y + 6 }, p.armpit)
    .C({ x: p.armpit.x + 1, y: lerp(p.armpit.y, hemY, 0.5) }, { x: p.hem.x + 1, y: hemY - 18 }, p.hem)
    .C({ x: p.hem.x - 18, y: hemY + 3 }, { x: left(p.hem).x + 18, y: hemY + 3 }, left(p.hem))
    .C(left({ x: p.hem.x + 1, y: hemY - 18 }), left({ x: p.armpit.x + 1, y: lerp(p.armpit.y, hemY, 0.5) }), left(p.armpit))
    .C(left({ x: p.armpit.x + 2, y: p.armpit.y + 6 }), left({ x: p.sleeveInner.x - 1, y: p.sleeveInner.y - 6 }), left(p.sleeveInner))
    .L(left(p.sleeveOuter))
    .C(left({ x: p.sleeveOuter.x, y: lerp(p.shoulder.y, p.sleeveOuter.y, 0.55) }), left({ x: p.shoulder.x + 6, y: p.shoulder.y + 2 }), left(p.shoulder))
    .C(left({ x: p.shoulder.x - 9, y: p.shoulder.y - 3 }), left({ x: p.neck.x + 8, y: p.neck.y + 2 }), left(p.neck))
    .Z()
    .toString();

  // Neckline trim follows the neck dip.
  const trim = path()
    .M({ x: left(p.neck).x - 1, y: p.neck.y + 1 })
    .C({ x: left(p.neck).x + 2, y: p.neck.y + dip + 2.5 }, { x: p.neck.x - 2, y: p.neck.y + dip + 2.5 }, { x: p.neck.x + 1, y: p.neck.y + 1 })
    .toString();

  // Shirt collar: two points either side of the neck.
  const collarSide = path()
    .M({ x: cx + 0.5, y: p.neck.y + dip })
    .L({ x: p.neck.x + 3, y: p.neck.y - 3 })
    .L({ x: p.neck.x + 6, y: p.neck.y + headH * 0.32 })
    .Z()
    .toString();
  const collar = `${collarSide} ${mirrorD(collarSide)}`;

  const placket = path()
    .M({ x: cx, y: p.neck.y + dip })
    .L({ x: cx, y: hemY - 1 })
    .toString();

  const bodyHalf = Math.max(bodyHalfAt(f, hemY), f.w.waist) + spec.ease;
  const pocketTop = lerp(f.waistY, hemY, 0.15);
  const kangaroo = path()
    .M({ x: cx - bodyHalf * 0.5, y: pocketTop })
    .L({ x: cx + bodyHalf * 0.5, y: pocketTop })
    .L({ x: cx + bodyHalf * 0.66, y: hemY - 7 })
    .L({ x: cx - bodyHalf * 0.66, y: hemY - 7 })
    .Z()
    .toString();
  const chestPocket = path()
    .M({ x: cx + f.w.chest * 0.25, y: f.chestY })
    .L({ x: cx + f.w.chest * 0.25 + 10, y: f.chestY })
    .L({ x: cx + f.w.chest * 0.25 + 10, y: f.chestY + 11 })
    .L({ x: cx + f.w.chest * 0.25, y: f.chestY + 11 })
    .Z()
    .toString();

  // Hood bunched behind the neck; the head is drawn over its top.
  const hood = path()
    .M({ x: cx - neckOpen - 9, y: f.neckY + 3 })
    .C({ x: cx - neckOpen - 8, y: f.neckY - headH * 0.4 }, { x: cx + neckOpen + 8, y: f.neckY - headH * 0.4 }, { x: cx + neckOpen + 9, y: f.neckY + 3 })
    .C({ x: cx + neckOpen + 2, y: f.neckY + 7 }, { x: cx - neckOpen - 2, y: f.neckY + 7 }, { x: cx - neckOpen - 9, y: f.neckY + 3 })
    .Z()
    .toString();
  const drawstring = path()
    .M({ x: cx - 4, y: f.neckY + 4 })
    .L({ x: cx - 5, y: f.neckY + headH * 0.75 })
    .toString();

  return {
    body,
    sleeves: sleeveEdges(p, spec.sleeve),
    sleeveShapes: sleeveShapes(p),
    folds: upperFolds(f, p, Math.max(0.12, spec.sleeve), spec.ease),
    hemShadow: hemShadowPath(f, p.hem),
    trim,
    collar: spec.neckline === 'collar' ? collar : undefined,
    placket: spec.placket ? placket : undefined,
    pocket: spec.pocket === 'kangaroo' ? kangaroo : spec.pocket === 'chest' ? chestPocket : undefined,
    hood: spec.neckline === 'hood' ? hood : undefined,
    drawstrings: spec.neckline === 'hood' ? `${drawstring} ${mirrorD(drawstring)}` : undefined,
  };
}

// ── Outerwear ───────────────────────────────────────────

export interface OuterSpec {
  template: 'outer';
  ease: number;
  hem: 'hip' | 'low' | 'thigh' | 'knee';
  sleeve: number;
  lapel: boolean;
  chestPockets: boolean;
}

export function outerSpec(item: ItemTags): OuterSpec {
  const base = TOP_FIT[item.fit ?? 'regular'];
  const hem: OuterSpec['hem'] = has(item, ['coat', 'trench', 'parka', 'mac'])
    ? 'knee'
    : has(item, ['blazer', 'suit', 'sport', 'overshirt', 'shacket', 'shirt jacket', 'chore', 'cardigan'])
      ? 'low'
      : 'hip';
  return {
    template: 'outer',
    ease: base.ease + 5 + (has(item, ['puffer', 'down']) ? 6 : 0),
    hem,
    sleeve: has(item, ['vest', 'gilet']) ? 0 : 0.97,
    lapel: has(item, ['blazer', 'suit', 'coat', 'trench']),
    chestPockets: has(item, ['overshirt', 'shacket', 'shirt jacket', 'chore', 'trucker', 'denim jacket']),
  };
}

export function outerPaths(f: Figure, spec: OuterSpec) {
  const { cx, headH } = f;
  const hemY = { hip: f.hipY + 0.1 * headH, low: f.hipY + 0.55 * headH, thigh: f.crotchY + 0.6 * headH, knee: f.kneeY }[spec.hem];
  const neckOpen = f.w.neck + 5;
  const p = upperPoints(f, { ease: spec.ease, hemY, sleeve: spec.sleeve, drop: 0.1, neckOpen });
  const gap = f.w.chest * 0.2;
  const hemInner = { x: cx + gap, y: hemY };
  const lapelPoint = { x: cx + gap * 0.75, y: f.chestY + headH * (spec.lapel ? 0.55 : 0.1) };
  const neckTop = { x: p.neck.x, y: p.neck.y - 3 };

  const panel = path()
    .M(neckTop)
    .C({ x: neckTop.x + 8, y: neckTop.y + 2 }, { x: p.shoulder.x - 9, y: p.shoulder.y - 3 }, p.shoulder)
    .C({ x: p.shoulder.x + 6, y: p.shoulder.y + 2 }, { x: p.sleeveOuter.x, y: lerp(p.shoulder.y, p.sleeveOuter.y, 0.55) }, p.sleeveOuter)
    .L(p.sleeveInner)
    .C({ x: p.sleeveInner.x - 1, y: p.sleeveInner.y - 6 }, { x: p.armpit.x + 2, y: p.armpit.y + 6 }, p.armpit)
    .C({ x: p.armpit.x + 1, y: lerp(p.armpit.y, hemY, 0.5) }, { x: p.hem.x + 1, y: hemY - 20 }, p.hem)
    .L(hemInner)
    .C({ x: hemInner.x - 1, y: lerp(hemY, lapelPoint.y, 0.4) }, { x: lapelPoint.x, y: lapelPoint.y + 20 }, lapelPoint)
    .C({ x: lapelPoint.x + 2, y: lapelPoint.y - 14 }, { x: neckTop.x - 3, y: neckTop.y + 12 }, neckTop)
    .Z()
    .toString();

  const lapelSide = path()
    .M(neckTop)
    .L({ x: neckTop.x + 7, y: f.chestY - headH * 0.05 })
    .L(lapelPoint)
    .Z()
    .toString();

  const pocketSide = path()
    .M({ x: cx + f.w.chest * 0.38, y: f.chestY })
    .L({ x: cx + f.w.chest * 0.38 + 12, y: f.chestY })
    .L({ x: cx + f.w.chest * 0.38 + 12, y: f.chestY + 6 })
    .L({ x: cx + f.w.chest * 0.38, y: f.chestY + 6 })
    .Z()
    .toString();

  return {
    body: `${panel} ${mirrorD(panel)}`,
    panels: [mirrorD(panel), panel] as [string, string],
    sleeves: sleeveEdges(p, spec.sleeve),
    sleeveShapes: sleeveShapes(p),
    folds: upperFolds(f, p, Math.max(0.12, spec.sleeve), spec.ease),
    lapels: spec.lapel ? `${lapelSide} ${mirrorD(lapelSide)}` : undefined,
    pockets: spec.chestPockets ? `${pocketSide} ${mirrorD(pocketSide)}` : undefined,
  };
}

// ── Bottoms ─────────────────────────────────────────────

export interface TrouserSpec {
  template: 'trousers';
  /** Extra half-width over the body at thigh and knee, and absolute hem half-width over the ankle. */
  thigh: number;
  knee: number;
  hem: number;
  crotchDrop: number;
  rise: 'low' | 'mid' | 'high';
  length: 'short' | 'cropped' | 'full' | 'stacked';
  creased: boolean;
  denim: boolean;
}

const TROUSER_FIT: Record<Fit, Pick<TrouserSpec, 'thigh' | 'knee' | 'hem' | 'crotchDrop'>> = {
  skinny: { thigh: 1, knee: 1.5, hem: 2.5, crotchDrop: 0.03 },
  slim: { thigh: 3, knee: 3, hem: 5, crotchDrop: 0.04 },
  fitted: { thigh: 3, knee: 3, hem: 5, crotchDrop: 0.04 },
  straight: { thigh: 4.5, knee: 6, hem: 10, crotchDrop: 0.05 },
  regular: { thigh: 4.5, knee: 6, hem: 10, crotchDrop: 0.05 },
  cropped: { thigh: 4.5, knee: 6, hem: 10, crotchDrop: 0.05 },
  relaxed: { thigh: 7.5, knee: 10, hem: 14, crotchDrop: 0.1 },
  boxy: { thigh: 7.5, knee: 10, hem: 14, crotchDrop: 0.1 },
  wide: { thigh: 9, knee: 14, hem: 21, crotchDrop: 0.15 },
  oversized: { thigh: 11, knee: 15, hem: 20, crotchDrop: 0.3 },
  baggy: { thigh: 12, knee: 16, hem: 20, crotchDrop: 0.35 },
};

export function trouserSpec(item: ItemTags): TrouserSpec {
  const fit = item.fit ?? 'straight';
  const isShorts = has(item, ['short']);
  return {
    template: 'trousers',
    ...TROUSER_FIT[fit],
    rise: item.rise ?? 'mid',
    length: isShorts ? 'short' : item.length === 'cropped' || fit === 'cropped' ? 'cropped' : fit === 'baggy' ? 'stacked' : 'full',
    creased: has(item, ['trouser', 'slacks', 'suit', 'pleat', 'chino']),
    denim: textureOf(item) === 'denim',
  };
}

function riseY(f: Figure, rise: 'low' | 'mid' | 'high'): number {
  return { high: f.waistY + 0.08 * f.headH, mid: lerp(f.waistY, f.hipY, 0.45), low: f.hipY - 0.12 * f.headH }[rise];
}

export function trouserPaths(f: Figure, spec: TrouserSpec) {
  const { cx, w, headH, legLen } = f;
  const topY = riseY(f, spec.rise);
  const waistHalf = bodyHalfAt(f, topY) + 1.5 + spec.thigh * 0.15;
  const hipY = Math.max(f.hipY, topY + 8);
  const hipHalf = w.hip + 1.5 + spec.thigh * 0.55;
  const hemY = {
    short: f.crotchY + legLen * 0.3,
    cropped: f.ankleY - legLen * 0.1,
    full: f.ankleY + 3,
    stacked: f.ankleY + 5,
  }[spec.length];
  const kneeY = spec.length === 'short' ? lerp(f.crotchY, hemY, 0.55) : f.kneeY;
  const kneeC = cx + lerp(f.legX, f.footX, 0.5);
  const hemC = cx + f.footX;
  const kneeHalf = spec.length === 'short' ? w.thigh + spec.thigh : w.knee + spec.knee;
  const hemHalf = spec.length === 'short' ? w.thigh + spec.thigh + 1 : w.ankle + spec.hem;
  const inner = (c: number, half: number) => Math.max(cx + 1.5, c - half);
  const outer = (c: number, half: number) => c + half + Math.max(0, cx + 1.5 - (c - half));
  const crotch = { x: cx, y: f.crotchY + spec.crotchDrop * headH };

  const WL = { x: cx - waistHalf, y: topY };
  const WR = { x: cx + waistHalf, y: topY };
  const HR = { x: cx + hipHalf, y: hipY };
  const KO = { x: outer(kneeC, kneeHalf), y: kneeY };
  const KI = { x: inner(kneeC, kneeHalf), y: kneeY };
  const HO = { x: outer(hemC, hemHalf), y: hemY };
  const HI = { x: inner(hemC, hemHalf), y: hemY };
  const L = (p: Pt) => ({ x: 2 * cx - p.x, y: p.y });
  const upper = kneeY - hipY;
  const lower = hemY - kneeY;

  const body = path()
    .M(WL)
    .L(WR)
    .C({ x: WR.x + 1, y: WR.y + 8 }, { x: HR.x, y: HR.y - 12 }, HR)
    .C({ x: HR.x + 1, y: HR.y + upper * 0.45 }, { x: KO.x + 1, y: KO.y - upper * 0.3 }, KO)
    .C({ x: KO.x, y: KO.y + lower * 0.4 }, { x: HO.x, y: HO.y - lower * 0.35 }, HO)
    .L(HI)
    .C({ x: HI.x, y: HI.y - lower * 0.35 }, { x: KI.x, y: KI.y + lower * 0.4 }, KI)
    .C({ x: KI.x, y: KI.y - (kneeY - crotch.y) * 0.45 }, { x: cx + 4, y: crotch.y + 4 }, crotch)
    .C({ x: cx - 4, y: crotch.y + 4 }, L({ x: KI.x, y: KI.y - (kneeY - crotch.y) * 0.45 }), L(KI))
    .C(L({ x: KI.x, y: KI.y + lower * 0.4 }), L({ x: HI.x, y: HI.y - lower * 0.35 }), L(HI))
    .L(L(HO))
    .C(L({ x: HO.x, y: HO.y - lower * 0.35 }), L({ x: KO.x, y: KO.y + lower * 0.4 }), L(KO))
    .C(L({ x: KO.x + 1, y: KO.y - upper * 0.3 }), L({ x: HR.x + 1, y: HR.y + upper * 0.45 }), L(HR))
    .C(L({ x: HR.x, y: HR.y - 12 }), L({ x: WR.x + 1, y: WR.y + 8 }), WL)
    .Z()
    .toString();

  const waistband = path().M({ x: WL.x + 0.5, y: topY + 4.5 }).L({ x: WR.x - 0.5, y: topY + 4.5 }).toString();
  const fly = path()
    .M({ x: cx + 1.5, y: topY + 5 })
    .C({ x: cx + 2, y: lerp(topY, crotch.y, 0.55) }, { x: cx + 2, y: lerp(topY, crotch.y, 0.75) }, { x: cx - 4, y: crotch.y - 5 })
    .toString();
  const creaseSide = path()
    .M({ x: lerp(kneeC, cx + hipHalf * 0.5, 0.5), y: hipY + 6 })
    .L({ x: (HO.x + HI.x) / 2, y: hemY - 3 })
    .toString();
  const pocketSide = path()
    .M({ x: WR.x - 1, y: topY + 6 })
    .C({ x: WR.x - 8, y: topY + 9 }, { x: WR.x - 12, y: topY + 15 }, { x: WR.x - 13, y: topY + 22 })
    .toString();

  // Each leg as its own region, so it can be lit as a rounded form.
  const leg = path()
    .M({ x: cx, y: topY })
    .L(WR)
    .C({ x: WR.x + 1, y: WR.y + 8 }, { x: HR.x, y: HR.y - 12 }, HR)
    .C({ x: HR.x + 1, y: HR.y + upper * 0.45 }, { x: KO.x + 1, y: KO.y - upper * 0.3 }, KO)
    .C({ x: KO.x, y: KO.y + lower * 0.4 }, { x: HO.x, y: HO.y - lower * 0.35 }, HO)
    .L(HI)
    .C({ x: HI.x, y: HI.y - lower * 0.35 }, { x: KI.x, y: KI.y + lower * 0.4 }, KI)
    .C({ x: KI.x, y: KI.y - (kneeY - crotch.y) * 0.45 }, { x: cx + 4, y: crotch.y + 4 }, crotch)
    .Z()
    .toString();

  // Folds per leg: a pull line from the crotch, two creases at the knee and
  // two breaks above the hem. Stacked hems break deeper.
  const midAt = (y: number) => {
    const t = Math.min(1, Math.max(0, (y - kneeY) / (hemY - kneeY || 1)));
    const c = lerp((KO.x + KI.x) / 2, (HO.x + HI.x) / 2, t);
    const half = lerp((KO.x - KI.x) / 2, (HO.x - HI.x) / 2, t);
    return { c, half };
  };
  const crease = (y: number, spread: number, drop: number) => {
    const { c, half } = midAt(y);
    return smoothPath(
      [
        { x: c - half * spread, y },
        { x: c, y: y + drop },
        { x: c + half * spread * 0.8, y: y - 0.5 },
      ],
      false,
    );
  };
  const breakDepth = spec.length === 'stacked' ? 3.5 : 2;
  const legFolds = [
    smoothPath(
      [
        { x: cx + 3, y: crotch.y + 3 },
        { x: lerp(cx, KI.x, 0.6) + 2, y: lerp(crotch.y, kneeY, 0.3) },
        { x: lerp(KI.x, KO.x, 0.35), y: lerp(crotch.y, kneeY, 0.6) },
      ],
      false,
    ),
    crease(kneeY - 5, 0.6, 2.5),
    crease(kneeY + 4, 0.5, 2),
    crease(hemY - 16, 0.7, breakDepth),
    crease(hemY - 7, 0.8, breakDepth + 0.5),
  ].join(' ');

  return {
    body,
    legShapes: [mirrorD(leg), leg] as [string, string],
    folds: `${legFolds} ${mirrorD(legFolds)}`,
    waistband,
    fly,
    creases: spec.creased ? `${creaseSide} ${mirrorD(creaseSide)}` : undefined,
    pockets: `${pocketSide} ${mirrorD(pocketSide)}`,
    hemline: spec.denim
      ? `${path().M({ x: HI.x + 1, y: hemY - 3 }).L({ x: HO.x - 1, y: hemY - 3 }).toString()} ${mirrorD(
          path().M({ x: HI.x + 1, y: hemY - 3 }).L({ x: HO.x - 1, y: hemY - 3 }).toString(),
        )}`
      : undefined,
  };
}

// ── Skirts and dresses ──────────────────────────────────

export type Hem = 'mini' | 'knee' | 'midi' | 'maxi';

function hemOf(item: ItemTags): Hem {
  if (has(item, ['mini'])) return 'mini';
  if (has(item, ['midi'])) return 'midi';
  if (has(item, ['maxi'])) return 'maxi';
  if (item.length === 'cropped') return 'mini';
  if (item.length === 'long') return 'maxi';
  return 'knee';
}

function hemYFor(f: Figure, hem: Hem): number {
  return { mini: f.crotchY + f.legLen * 0.16, knee: f.kneeY + 2, midi: f.calfY + f.legLen * 0.05, maxi: f.ankleY + 3 }[hem];
}

const FLARE: Record<Hem, number> = { mini: 7, knee: 9, midi: 12, maxi: 14 };

export interface SkirtSpec {
  template: 'skirt';
  hem: Hem;
  flare: number;
  rise: 'low' | 'mid' | 'high';
}

export function skirtSpec(item: ItemTags): SkirtSpec {
  const hem = hemOf(item);
  const pencil = has(item, ['pencil']);
  return { template: 'skirt', hem, flare: pencil ? 1 : FLARE[hem] + (has(item, ['pleat']) ? 4 : 0), rise: item.rise ?? 'high' };
}

export function skirtPaths(f: Figure, spec: SkirtSpec) {
  const { cx, w } = f;
  const topY = riseY(f, spec.rise);
  const waistHalf = bodyHalfAt(f, topY) + 1.5;
  const hipY = Math.max(f.hipY, topY + 8);
  const hemY = hemYFor(f, spec.hem);
  const hipR = { x: cx + w.hip + 2.5, y: hipY };
  const hemR = { x: cx + w.hip + 2.5 + spec.flare, y: hemY };
  const L = (p: Pt) => ({ x: 2 * cx - p.x, y: p.y });

  const body = path()
    .M({ x: cx - waistHalf, y: topY })
    .L({ x: cx + waistHalf, y: topY })
    .C({ x: cx + waistHalf + 1, y: topY + 8 }, { x: hipR.x, y: hipR.y - 12 }, hipR)
    .C({ x: hipR.x + 1, y: lerp(hipY, hemY, 0.4) }, { x: hemR.x - 1, y: lerp(hipY, hemY, 0.75) }, hemR)
    .C({ x: hemR.x - 20, y: hemY + 3 }, { x: L(hemR).x + 20, y: hemY + 3 }, L(hemR))
    .C(L({ x: hemR.x - 1, y: lerp(hipY, hemY, 0.75) }), L({ x: hipR.x + 1, y: lerp(hipY, hemY, 0.4) }), L(hipR))
    .C(L({ x: hipR.x, y: hipR.y - 12 }), { x: cx - waistHalf - 1, y: topY + 8 }, { x: cx - waistHalf, y: topY })
    .Z()
    .toString();

  return { body, waistband: path().M({ x: cx - waistHalf + 0.5, y: topY + 4 }).L({ x: cx + waistHalf - 0.5, y: topY + 4 }).toString() };
}

export interface DressSpec {
  template: 'dress';
  hem: Hem;
  flare: number;
  ease: number;
}

export function dressSpec(item: ItemTags): DressSpec {
  const hem = hemOf(item);
  const fit = item.fit ?? 'regular';
  return { template: 'dress', hem, flare: FLARE[hem] + (fit === 'relaxed' || fit === 'oversized' ? 6 : 0), ease: TOP_FIT[fit].ease * 0.6 };
}

export function dressPaths(f: Figure, spec: DressSpec) {
  const { cx, w, headH } = f;
  const hemY = hemYFor(f, spec.hem);
  const strapIn = { x: cx + w.chest * 0.38, y: f.shoulderY + 1 };
  const strapOut = { x: cx + w.chest * 0.6, y: f.shoulderY + 1 };
  const scoopY = f.chestY - headH * 0.05;
  const armpit = { x: cx + w.chest + 1 + spec.ease * 0.3, y: f.armpitY + 3 };
  const waist = { x: cx + w.waist + 1.5 + spec.ease, y: f.waistY };
  const hip = { x: cx + w.hip + 2 + spec.ease, y: f.hipY };
  const hem = { x: cx + w.hip + 2 + spec.ease + spec.flare, y: hemY };
  const L = (p: Pt) => ({ x: 2 * cx - p.x, y: p.y });

  const body = path()
    .M(L(strapIn))
    .C({ x: L(strapIn).x + 4, y: scoopY }, { x: strapIn.x - 4, y: scoopY }, strapIn)
    .L(strapOut)
    .C({ x: strapOut.x + 4, y: strapOut.y + 10 }, { x: armpit.x + 1, y: armpit.y - 8 }, armpit)
    .C({ x: armpit.x, y: armpit.y + 14 }, { x: waist.x, y: waist.y - 12 }, waist)
    .C({ x: waist.x, y: waist.y + 10 }, { x: hip.x, y: hip.y - 12 }, hip)
    .C({ x: hip.x + 1, y: lerp(hip.y, hemY, 0.4) }, { x: hem.x - 1, y: lerp(hip.y, hemY, 0.75) }, hem)
    .C({ x: hem.x - 20, y: hemY + 3 }, { x: L(hem).x + 20, y: hemY + 3 }, L(hem))
    .C(L({ x: hem.x - 1, y: lerp(hip.y, hemY, 0.75) }), L({ x: hip.x + 1, y: lerp(hip.y, hemY, 0.4) }), L(hip))
    .C(L({ x: hip.x, y: hip.y - 12 }), L({ x: waist.x, y: waist.y + 10 }), L(waist))
    .C(L({ x: waist.x, y: waist.y - 12 }), L({ x: armpit.x, y: armpit.y + 14 }), L(armpit))
    .C(L({ x: armpit.x + 1, y: armpit.y - 8 }), L({ x: strapOut.x + 4, y: strapOut.y + 10 }), L(strapOut))
    .L(L(strapIn))
    .Z()
    .toString();

  return { body, seam: path().M(L(waist)).L(waist).toString() };
}

// ── Shoes ───────────────────────────────────────────────

export interface ShoeSpec {
  template: 'shoes';
  profile: ShoeProfile;
}

export function shoeSpec(item: ItemTags): ShoeSpec {
  return { template: 'shoes', profile: item.shoeProfile ?? (has(item, ['boot']) ? 'boot' : 'standard') };
}

export function shoePaths(f: Figure, spec: ShoeSpec) {
  const { cx, w, floor } = f;
  const fx = cx + f.footX;
  const shape = {
    low: { collar: f.ankleY + 4, aw: w.ankle + 2.4, toe: 12.5, sole: 3.4 },
    standard: { collar: f.ankleY + 1, aw: w.ankle + 3, toe: 13.5, sole: 4.8 },
    chunky: { collar: f.ankleY - 1, aw: w.ankle + 4.2, toe: 16, sole: 10 },
    boot: { collar: lerp(f.calfY, f.ankleY, 0.45), aw: w.calf + 1.4, toe: 13.5, sole: 5.5 },
    heel: { collar: f.ankleY + 6, aw: w.ankle + 1.2, toe: 9.5, sole: 2 },
  }[spec.profile];
  const out = 3.5; // toes turned slightly out
  const base = floor - shape.sole;
  const mid = lerp(shape.collar, base, 0.55);

  const upper = path()
    .M({ x: fx - shape.aw, y: shape.collar })
    .C({ x: fx - shape.aw * 0.5, y: shape.collar - 1.5 }, { x: fx + shape.aw * 0.5, y: shape.collar - 1.5 }, { x: fx + shape.aw, y: shape.collar })
    .C({ x: fx + shape.aw + 0.5, y: mid }, { x: fx + shape.toe + out, y: base - 6 }, { x: fx + shape.toe * 0.7 + out, y: base })
    .C({ x: fx + shape.toe * 0.2 + out, y: base + 1 }, { x: fx - shape.toe * 0.2 + out, y: base + 1 }, { x: fx - shape.toe * 0.7 + out, y: base })
    .C({ x: fx - shape.toe + out, y: base - 6 }, { x: fx - shape.aw - 0.5, y: mid }, { x: fx - shape.aw, y: shape.collar })
    .Z()
    .toString();
  const sole = path()
    .M({ x: fx - shape.toe * 0.85 + out, y: base })
    .L({ x: fx + shape.toe * 0.85 + out, y: base })
    .C({ x: fx + shape.toe + out + 1.5, y: base }, { x: fx + shape.toe + out + 1.5, y: floor }, { x: fx + shape.toe * 0.7 + out, y: floor })
    .L({ x: fx - shape.toe * 0.7 + out, y: floor })
    .C({ x: fx - shape.toe + out - 1.5, y: floor }, { x: fx - shape.toe + out - 1.5, y: base }, { x: fx - shape.toe * 0.85 + out, y: base })
    .Z()
    .toString();

  // Light catching the toe box.
  const toeLight = smoothPath(
    [
      { x: fx - shape.toe * 0.4 + out, y: base - 4.5 },
      { x: fx + shape.toe * 0.1 + out, y: base - 6 },
      { x: fx + shape.toe * 0.45 + out, y: base - 4 },
      { x: fx + out, y: base - 2.5 },
    ],
    true,
  );

  return {
    upper: `${upper} ${mirrorD(upper)}`,
    uppers: [mirrorD(upper), upper] as [string, string],
    sole: `${sole} ${mirrorD(sole)}`,
    toeLight: `${toeLight} ${mirrorD(toeLight)}`,
  };
}

// ── Dressing the figure ─────────────────────────────────

export type BottomSpec = TrouserSpec | SkirtSpec;

export interface Dressed<T extends ItemTags = ItemTags> {
  top?: { item: T; spec: TopSpec };
  bottom?: { item: T; spec: BottomSpec };
  dress?: { item: T; spec: DressSpec };
  outer?: { item: T; spec: OuterSpec };
  shoes?: { item: T; spec: ShoeSpec };
  /** Pieces the avatar can't draw; the outfit falls back to flat-lay when any are present. */
  unsupported: T[];
}

/** Accessories are left off the figure without forcing flat-lay. */
export function dressFigure<T extends ItemTags>(items: T[]): Dressed<T> {
  const dressed: Dressed<T> = { unsupported: [] };
  for (const item of items) {
    switch (item.category) {
      case 'top':
        dressed.top ??= { item, spec: topSpec(item) };
        break;
      case 'bottom':
        dressed.bottom ??= { item, spec: has(item, ['skirt']) ? skirtSpec(item) : trouserSpec(item) };
        break;
      case 'onepiece':
        if (has(item, ['dress', 'gown', 'pinafore'])) dressed.dress ??= { item, spec: dressSpec(item) };
        else dressed.unsupported.push(item);
        break;
      case 'outerwear':
        dressed.outer ??= { item, spec: outerSpec(item) };
        break;
      case 'shoes':
        dressed.shoes ??= { item, spec: shoeSpec(item) };
        break;
      case 'accessory':
        break;
    }
  }
  return dressed;
}

export function avatarSupports(items: ItemTags[]): boolean {
  return dressFigure(items).unsupported.length === 0;
}
