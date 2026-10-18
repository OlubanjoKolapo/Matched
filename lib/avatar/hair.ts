import type { Figure, Pt } from './geometry';
import { path } from './geometry';

/**
 * Hairstyles. Each returns a front layer (drawn over the head) and an optional
 * back layer (drawn behind the body). Styles are offered to everyone.
 */
export interface HairPaths {
  front: string;
  back?: string;
  /** Separate pieces drawn over the front layer (e.g. locs falling over the shoulders). */
  strands?: string;
}

interface HeadBox {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  top: number;
  chin: number;
  shoulderY: number;
  chestY: number;
  headH: number;
}

const n = (v: number) => (Math.round(v * 10) / 10).toFixed(1);

/** A circle as two arcs; used to build curls and volume. */
function circle(x: number, y: number, r: number): string {
  return `M${n(x - r)} ${n(y)} A${n(r)} ${n(r)} 0 1 1 ${n(x + r)} ${n(y)} A${n(r)} ${n(r)} 0 1 1 ${n(x - r)} ${n(y)} Z`;
}

/** Points around an ellipse between two angles (degrees, 0 = right, clockwise in SVG). */
function arcPoints(cx: number, cy: number, rx: number, ry: number, from: number, to: number, count: number): Pt[] {
  return Array.from({ length: count }, (_, i) => {
    const a = ((from + ((to - from) * i) / (count - 1)) * Math.PI) / 180;
    return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry };
  });
}

/**
 * Close-cropped hair over the skull, with the hairline at `hairline` × ry above
 * the head's centre. A cubic only reaches ¾ of the way to its control points,
 * so the controls are placed to make the crown peak `height` above the head top.
 */
function cap(h: HeadBox, height: number, hairline = 0.5): string {
  const { cx, cy, rx, ry, top } = h;
  const start = cy - ry * 0.02;
  const control = (top - height - 0.25 * start) / 0.75;
  return path()
    .M({ x: cx - rx - 0.6, y: start })
    .C({ x: cx - rx - 1.2, y: control }, { x: cx + rx + 1.2, y: control }, { x: cx + rx + 0.6, y: start })
    .C({ x: cx + rx - 1.5, y: cy - ry * hairline }, { x: cx - rx + 1.5, y: cy - ry * hairline }, { x: cx - rx - 0.6, y: cy - ry * 0.02 })
    .Z()
    .toString();
}

function crop(h: HeadBox): string {
  const { cx, cy, rx, ry, top } = h;
  return path()
    .M({ x: cx - rx - 1.2, y: cy + ry * 0.05 })
    .C({ x: cx - rx - 3, y: top - 7 }, { x: cx + rx + 3, y: top - 7 }, { x: cx + rx + 1.2, y: cy + ry * 0.05 })
    .C({ x: cx + rx - 1, y: cy - ry * 0.35 }, { x: cx + rx * 0.5, y: cy - ry * 0.62 }, { x: cx + rx * 0.05, y: cy - ry * 0.56 })
    .C({ x: cx - rx * 0.45, y: cy - ry * 0.64 }, { x: cx - rx + 1, y: cy - ry * 0.42 }, { x: cx - rx - 1.2, y: cy + ry * 0.05 })
    .Z()
    .toString();
}

const STYLES: Record<string, (h: HeadBox) => HairPaths> = {
  buzz: (h) => ({ front: cap(h, 2.5) }),

  crop: (h) => ({ front: crop(h) }),

  /** Short, tight texture: small coils over a close cap. */
  textured: (h) => {
    const { cx, cy, rx, ry } = h;
    const coils = [
      ...arcPoints(cx, cy - ry * 0.18, rx * 0.98, ry * 0.86, 192, 348, 11),
      ...arcPoints(cx, cy - ry * 0.3, rx * 0.6, ry * 0.62, 210, 330, 5),
    ]
      .map((p) => circle(p.x, p.y, rx * 0.21))
      .join(' ');
    return { front: `${cap(h, 3, 0.42)} ${coils}` };
  },

  'side-part': (h) => {
    const { cx, cy, rx, ry, top } = h;
    return {
      front: path()
        .M({ x: cx - rx - 1.5, y: cy + ry * 0.1 })
        .C({ x: cx - rx - 4, y: top - 6 }, { x: cx + rx * 0.2, y: top - 10 }, { x: cx + rx + 2.5, y: cy - ry * 0.3 })
        .C({ x: cx + rx + 2, y: cy - ry * 0.05 }, { x: cx + rx + 1, y: cy + ry * 0.1 }, { x: cx + rx + 0.8, y: cy + ry * 0.12 })
        .C({ x: cx + rx * 0.4, y: cy - ry * 0.35 }, { x: cx - rx * 0.2, y: cy - ry * 0.72 }, { x: cx - rx * 0.45, y: cy - ry * 0.58 })
        .C({ x: cx - rx * 0.7, y: cy - ry * 0.45 }, { x: cx - rx + 0.5, y: cy - ry * 0.25 }, { x: cx - rx - 1.5, y: cy + ry * 0.1 })
        .Z()
        .toString(),
    };
  },

  'curly-top': (h) => {
    const { cx, cy, rx, ry } = h;
    const curls = arcPoints(cx, cy - ry * 0.12, rx * 0.88, ry * 0.86, 190, 350, 8)
      .map((p) => circle(p.x, p.y, rx * 0.34))
      .join(' ');
    return { front: `${cap(h, 3, 0.35)} ${curls} ${circle(cx, cy - ry * 0.82, rx * 0.4)}` };
  },

  afro: (h) => {
    const { cx, cy, rx, ry } = h;
    const centre = { x: cx, y: cy - ry * 0.28 };
    const puffs = arcPoints(centre.x, centre.y, rx * 1.55, ry * 1.25, 0, 336, 15)
      .map((p) => circle(p.x, p.y, rx * 0.42))
      .join(' ');
    const core = `M${n(centre.x - rx * 1.55)} ${n(centre.y)} A${n(rx * 1.55)} ${n(ry * 1.25)} 0 1 1 ${n(centre.x + rx * 1.55)} ${n(centre.y)} A${n(rx * 1.55)} ${n(ry * 1.25)} 0 1 1 ${n(centre.x - rx * 1.55)} ${n(centre.y)} Z`;
    return { back: `${core} ${puffs}`, front: cap(h, 5, 0.55) };
  },

  locs: (h) => {
    const { cx, cy, rx, ry, shoulderY, headH } = h;
    const end = shoulderY + headH * 0.6;
    const r = 1.9; // half-width of a loc
    // Six locs each side. Each starts under the scalp (the head hides its top)
    // and fans outward, with small gaps, to a rounded tip around the shoulders.
    const strands = [-1, 1]
      .flatMap((side) =>
        Array.from({ length: 6 }, (_, i) => {
          const top = { x: cx + side * (rx * 0.15 + i * 1.8), y: cy - ry * 0.3 };
          const bottom = { x: cx + side * (rx * 0.65 + i * 5.2), y: end - (5 - i) * 2.5 };
          return path()
            .M({ x: top.x - r, y: top.y })
            .C({ x: top.x - r, y: top.y + 22 }, { x: bottom.x - r - 0.3, y: bottom.y - 22 }, { x: bottom.x - r, y: bottom.y - r })
            .C({ x: bottom.x - r, y: bottom.y + r * 0.7 }, { x: bottom.x + r, y: bottom.y + r * 0.7 }, { x: bottom.x + r, y: bottom.y - r })
            .C({ x: bottom.x + r + 0.3, y: bottom.y - 22 }, { x: top.x + r, y: top.y + 22 }, { x: top.x + r, y: top.y })
            .Z()
            .toString();
        }),
      )
      .join(' ');
    // Three locs each side fall in front of the shoulders, so the texture reads at a glance.
    const front = [-1, 1]
      .flatMap((side) =>
        Array.from({ length: 3 }, (_, i) => {
          const top = { x: cx + side * (rx * 0.62 + i * 1.4), y: cy - ry * 0.75 };
          const bottom = { x: cx + side * (rx + 2.5 + i * 4.6), y: h.chestY + headH * (0.05 + i * 0.07) };
          return path()
            .M({ x: top.x - r, y: top.y })
            .C({ x: top.x - r, y: top.y + 18 }, { x: bottom.x - r - 0.3, y: bottom.y - 18 }, { x: bottom.x - r, y: bottom.y - r })
            .C({ x: bottom.x - r, y: bottom.y + r * 0.7 }, { x: bottom.x + r, y: bottom.y + r * 0.7 }, { x: bottom.x + r, y: bottom.y - r })
            .C({ x: bottom.x + r + 0.3, y: bottom.y - 18 }, { x: top.x + r, y: top.y + 18 }, { x: top.x + r, y: top.y })
            .Z()
            .toString();
        }),
      )
      .join(' ');
    return { back: strands, front: cap(h, 4, 0.5), strands: front };
  },

  bun: (h) => {
    const { cx, rx, top } = h;
    return { front: `${cap(h, 3.5, 0.55)} ${circle(cx, top - rx * 0.32, rx * 0.5)}` };
  },

  ponytail: (h) => {
    const { cx, cy, rx, ry, shoulderY, headH } = h;
    return {
      front: cap(h, 3.5, 0.55),
      back: path()
        .M({ x: cx + rx * 0.2, y: cy - ry * 0.75 })
        .C({ x: cx + rx * 1.6, y: cy - ry * 0.6 }, { x: cx + rx * 1.75, y: shoulderY }, { x: cx + rx * 1.15, y: shoulderY + headH * 0.75 })
        .C({ x: cx + rx * 1.0, y: shoulderY + headH * 0.3 }, { x: cx + rx * 0.9, y: cy }, { x: cx + rx * 0.2, y: cy - ry * 0.45 })
        .Z()
        .toString(),
    };
  },

  bob: (h) => {
    const { cx, cy, rx, ry, top, chin } = h;
    return {
      back: path()
        .M({ x: cx - rx - 4, y: chin + 1 })
        .C({ x: cx - rx - 6, y: top - 2 }, { x: cx + rx + 6, y: top - 2 }, { x: cx + rx + 4, y: chin + 1 })
        .C({ x: cx + rx * 0.5, y: chin + 3 }, { x: cx - rx * 0.5, y: chin + 3 }, { x: cx - rx - 4, y: chin + 1 })
        .Z()
        .toString(),
      front: path()
        .M({ x: cx - rx - 3.5, y: chin })
        .C({ x: cx - rx - 4, y: top - 4 }, { x: cx + rx + 4, y: top - 4 }, { x: cx + rx + 3.5, y: chin })
        .L({ x: cx + rx - 1, y: chin })
        .C({ x: cx + rx - 2, y: cy - ry * 0.2 }, { x: cx + rx * 0.3, y: cy - ry * 0.55 }, { x: cx - rx * 0.3, y: cy - ry * 0.5 })
        .C({ x: cx - rx * 0.8, y: cy - ry * 0.3 }, { x: cx - rx + 1, y: cy }, { x: cx - rx + 1, y: chin })
        .Z()
        .toString(),
    };
  },

  long: (h) => longHair(h, false),
  waves: (h) => longHair(h, true),
};

function longHair(h: HeadBox, wavy: boolean): HairPaths {
  const { cx, cy, rx, ry, top, chin, shoulderY, chestY, headH } = h;
  const end = chestY + headH * 0.35;
  const swell = wavy ? 5 : 0;
  const back = path()
    .M({ x: cx - rx - 3, y: cy - ry * 0.3 })
    .C({ x: cx - rx - 5, y: top - 3 }, { x: cx + rx + 5, y: top - 3 }, { x: cx + rx + 3, y: cy - ry * 0.3 })
    .C({ x: cx + rx + 6 + swell, y: shoulderY }, { x: cx + rx + 8 - swell, y: chestY }, { x: cx + rx + 5 + swell, y: end })
    .L({ x: cx - rx - 5 - swell, y: end })
    .C({ x: cx - rx - 8 + swell, y: chestY }, { x: cx - rx - 6 - swell, y: shoulderY }, { x: cx - rx - 3, y: cy - ry * 0.3 })
    .Z()
    .toString();
  const crown = path()
    .M({ x: cx - rx - 3, y: cy + ry * 0.4 })
    .C({ x: cx - rx - 3.5, y: top - 3 }, { x: cx - 1, y: top - 4 }, { x: cx, y: cy - ry * 0.72 })
    .C({ x: cx + 1, y: top - 4 }, { x: cx + rx + 3.5, y: top - 3 }, { x: cx + rx + 3, y: cy + ry * 0.4 })
    .C({ x: cx + rx - 0.5, y: cy - ry * 0.1 }, { x: cx + rx * 0.45, y: cy - ry * 0.5 }, { x: cx, y: cy - ry * 0.62 })
    .C({ x: cx - rx * 0.45, y: cy - ry * 0.5 }, { x: cx - rx + 0.5, y: cy - ry * 0.1 }, { x: cx - rx - 3, y: cy + ry * 0.4 })
    .Z()
    .toString();
  // Lengths falling over the front of the shoulders: full panels framing the neck.
  const strand = (side: 1 | -1) => {
    const x = (v: number) => cx + side * v;
    return path()
      .M({ x: x(rx + 3), y: cy + ry * 0.2 })
      .C({ x: x(rx + 6 + swell * 0.5), y: chin + 4 }, { x: x(rx + 9 - swell * 0.5), y: shoulderY + 6 }, { x: x(rx + 7 + swell * 0.4), y: chestY + headH * 0.12 })
      .C({ x: x(rx + 3), y: chestY + headH * 0.2 }, { x: x(rx - 2), y: chestY + headH * 0.2 }, { x: x(rx - 5), y: chestY + headH * 0.08 })
      .C({ x: x(rx - 4), y: shoulderY }, { x: x(rx - 2), y: chin }, { x: x(rx - 1), y: cy + ry * 0.2 })
      .Z()
      .toString();
  };
  return { back, front: `${crown} ${strand(1)} ${strand(-1)}` };
}

export const HAIR_STYLE_IDS = Object.keys(STYLES);

export function hairPaths(style: string, f: Figure): HairPaths {
  const draw = STYLES[style] ?? STYLES.crop!;
  const box: HeadBox = {
    ...f.head,
    top: f.head.cy - f.head.ry,
    chin: f.head.cy + f.head.ry,
    shoulderY: f.shoulderY,
    chestY: f.chestY,
    headH: f.headH,
  };
  const hair = draw(box);
  // Every style sits on a scalp layer so no skin shows through at the crown.
  return { ...hair, front: style === 'buzz' ? hair.front : `${cap(box, 2, 0.45)} ${hair.front}` };
}
