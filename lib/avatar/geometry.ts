import { AVERAGE_HEIGHT_CM } from '@/rules/tuning';
import type { Build, Frame } from '@/lib/types';

/**
 * Figure geometry for the avatar. Everything is computed in a fixed SVG
 * coordinate space; the feet always stand on FLOOR so height changes read as
 * the figure growing upward.
 */
export const VIEW = { width: 240, height: 520, cx: 120, floor: 500 } as const;

/** Standing height, head to floor, at the track's average height. */
const BASE_HEIGHT = 430;
const HEIGHT_SCALE = { min: 0.88, max: 1.12 } as const;

export interface Pt {
  x: number;
  y: number;
}

interface FrameShape {
  neck: number;
  shoulder: number;
  chest: number;
  waist: number;
  hip: number;
  thigh: number;
  knee: number;
  calf: number;
  ankle: number;
  upperArm: number;
  forearm: number;
  wrist: number;
  headRx: number;
}

/** Half-widths in view units. Two cuts; neither is a gender. */
const FRAME_SHAPES: Record<Frame, FrameShape> = {
  menswear: {
    neck: 7.5,
    shoulder: 43,
    chest: 34,
    waist: 28.5,
    hip: 30.5,
    thigh: 13.5,
    knee: 8.5,
    calf: 9,
    ankle: 5,
    upperArm: 8.6,
    forearm: 7,
    wrist: 4.8,
    headRx: 16.5,
  },
  womenswear: {
    neck: 6.4,
    shoulder: 37,
    chest: 30.5,
    waist: 23.5,
    hip: 33.5,
    thigh: 14.5,
    knee: 8,
    calf: 8.6,
    ankle: 4.6,
    upperArm: 7.6,
    forearm: 6.2,
    wrist: 4.3,
    headRx: 15.5,
  },
};

const BUILD_SCALE: Record<Build, { shoulder: number; torso: number; limb: number }> = {
  slim: { shoulder: 0.93, torso: 0.9, limb: 0.88 },
  average: { shoulder: 1, torso: 1, limb: 1 },
  broad: { shoulder: 1.1, torso: 1.13, limb: 1.14 },
};

export interface Widths {
  neck: number;
  shoulder: number;
  chest: number;
  waist: number;
  hip: number;
  thigh: number;
  knee: number;
  calf: number;
  ankle: number;
}

export interface Arm {
  shoulder: Pt;
  elbow: Pt;
  wrist: Pt;
  /** Half-widths along the arm. */
  upper: number;
  fore: number;
  wristW: number;
}

export interface Figure {
  cx: number;
  floor: number;
  top: number;
  scale: number;
  headH: number;
  head: { cx: number; cy: number; rx: number; ry: number };
  chin: number;
  neckY: number;
  shoulderY: number;
  chestY: number;
  armpitY: number;
  waistY: number;
  hipY: number;
  crotchY: number;
  kneeY: number;
  calfY: number;
  ankleY: number;
  legLen: number;
  /** Leg centre offset from cx at the hip joint and at the ankle. */
  legX: number;
  footX: number;
  w: Widths;
  /** Right arm (viewer's right). Mirror for the left. */
  arm: Arm;
}

export function heightScale(frame: Frame, heightCm?: number): number {
  if (!heightCm) return 1;
  const s = heightCm / AVERAGE_HEIGHT_CM[frame];
  return Math.min(HEIGHT_SCALE.max, Math.max(HEIGHT_SCALE.min, s));
}

export function buildFigure({ frame, build, heightCm }: { frame: Frame; build: Build; heightCm?: number }): Figure {
  const { cx, floor } = VIEW;
  const s = heightScale(frame, heightCm);
  const shape = FRAME_SHAPES[frame];
  const b = BUILD_SCALE[build];
  // Taller figures get slightly wider and a longer leg share; shorter, the reverse.
  const wScale = 1 + (s - 1) * 0.45;

  const H = BASE_HEIGHT * s;
  const top = floor - H;
  const legShare = 0.49 + (s - 1) * 0.35;
  const legLen = H * legShare;
  const crotchY = floor - legLen;
  const headH = (crotchY - top) / 4.05;
  const chin = top + headH;

  const w: Widths = {
    neck: shape.neck * wScale * b.limb,
    shoulder: shape.shoulder * wScale * b.shoulder,
    chest: shape.chest * wScale * b.torso,
    waist: shape.waist * wScale * b.torso,
    hip: shape.hip * wScale * b.torso,
    thigh: shape.thigh * wScale * b.limb,
    knee: shape.knee * wScale * b.limb,
    calf: shape.calf * wScale * b.limb,
    ankle: shape.ankle * wScale,
  };

  const shoulderY = chin + 0.3 * headH;
  const waistY = chin + 1.75 * headH;
  const hipY = chin + 2.45 * headH;
  const upper = shape.upperArm * wScale * b.limb;
  const fore = shape.forearm * wScale * b.limb;

  return {
    cx,
    floor,
    top,
    scale: s,
    headH,
    head: { cx, cy: top + headH / 2, rx: shape.headRx * wScale, ry: (headH / 2) * 0.98 },
    chin,
    neckY: chin + 0.17 * headH,
    shoulderY,
    chestY: chin + 0.85 * headH,
    armpitY: chin + 0.95 * headH,
    waistY,
    hipY,
    crotchY,
    kneeY: crotchY + legLen * 0.47,
    calfY: crotchY + legLen * 0.66,
    ankleY: floor - legLen * 0.07,
    legLen,
    legX: w.hip * 0.47,
    footX: w.hip * 0.5,
    w,
    arm: {
      shoulder: { x: cx + w.shoulder - upper * 0.55, y: shoulderY + upper + 1 },
      elbow: { x: cx + w.chest + upper + 9, y: waistY - 2 },
      wrist: { x: cx + w.hip + fore + 17, y: crotchY - 0.12 * headH },
      upper,
      fore,
      wristW: shape.wrist * wScale * b.limb,
    },
  };
}

// ── Points and paths ────────────────────────────────────

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

/** Mirror a point across the figure's centre line. */
export const mirror = (p: Pt, cx = VIEW.cx): Pt => ({ x: 2 * cx - p.x, y: p.y });

/** A point along the right arm: t = 0 at the shoulder, 1 at the wrist. */
export function armAt(arm: Arm, t: number): { centre: Pt; half: number; normal: Pt } {
  const upperLen = Math.hypot(arm.elbow.x - arm.shoulder.x, arm.elbow.y - arm.shoulder.y);
  const foreLen = Math.hypot(arm.wrist.x - arm.elbow.x, arm.wrist.y - arm.elbow.y);
  const split = upperLen / (upperLen + foreLen);
  const onUpper = t <= split;
  const local = onUpper ? t / split : (t - split) / (1 - split);
  const [a, b] = onUpper ? [arm.shoulder, arm.elbow] : [arm.elbow, arm.wrist];
  const centre = lerpPt(a, b, local);
  const half = onUpper ? lerp(arm.upper, arm.fore, local) : lerp(arm.fore, arm.wristW, local);
  // Outward normal for the right arm (pointing away from the body).
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { centre, half, normal: { x: dy / len, y: -dx / len } };
}

/**
 * Builds an SVG path with fixed precision. Templates call the same commands in
 * the same order whatever the parameters, so Motion can morph between them.
 */
export class PathBuilder {
  private parts: string[] = [];

  private static n(v: number): string {
    return (Math.round(v * 10) / 10).toFixed(1);
  }

  private pts(...points: Pt[]): string {
    return points.map((p) => `${PathBuilder.n(p.x)} ${PathBuilder.n(p.y)}`).join(' ');
  }

  M(p: Pt) {
    this.parts.push(`M${this.pts(p)}`);
    return this;
  }

  L(p: Pt) {
    this.parts.push(`L${this.pts(p)}`);
    return this;
  }

  C(c1: Pt, c2: Pt, p: Pt) {
    this.parts.push(`C${this.pts(c1, c2, p)}`);
    return this;
  }

  Z() {
    this.parts.push('Z');
    return this;
  }

  toString() {
    return this.parts.join(' ');
  }
}

export const path = () => new PathBuilder();

/** Ellipse as four cubic curves, so it can morph like any other path. */
export function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  const k = 0.5523;
  return path()
    .M({ x: cx, y: cy - ry })
    .C({ x: cx + rx * k, y: cy - ry }, { x: cx + rx, y: cy - ry * k }, { x: cx + rx, y: cy })
    .C({ x: cx + rx, y: cy + ry * k }, { x: cx + rx * k, y: cy + ry }, { x: cx, y: cy + ry })
    .C({ x: cx - rx * k, y: cy + ry }, { x: cx - rx, y: cy + ry * k }, { x: cx - rx, y: cy })
    .C({ x: cx - rx, y: cy - ry * k }, { x: cx - rx * k, y: cy - ry }, { x: cx, y: cy - ry })
    .Z()
    .toString();
}

/**
 * Mirrors an absolute M/L/C/Z path across the centre line by flipping every
 * x coordinate. Keeps the structure identical, so mirrored halves still morph.
 */
export function mirrorD(d: string, cx = VIEW.cx): string {
  let index = 0;
  return d.replace(/-?\d+(\.\d+)?/g, (match) => {
    const value = Number(match);
    const isX = index++ % 2 === 0;
    return (isX ? 2 * cx - value : value).toFixed(1);
  });
}

/** Command letters plus number count: two paths morph cleanly when these match. */
export function pathSignature(d: string): string {
  const letters = d.replace(/[^A-Za-z]/g, '');
  const numbers = d.match(/-?\d+(\.\d+)?/g)?.length ?? 0;
  return `${letters}:${numbers}`;
}
