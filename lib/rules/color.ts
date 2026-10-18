import { COLOR_FAMILIES, MAIN_COLOR_MIN_SHARE, type ColorFamilyId } from '@/rules/colors';
import type { ItemColor, ItemTags } from '@/lib/types';
import type { ColorInfo } from './types';

type Lab = [number, number, number];

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Invalid hex color: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

/** sRGB → CIE Lab (D65). */
export function hexToLab(hex: string): Lab {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function lightness(hex: string): number {
  return hexToLab(hex)[0];
}

function distance(a: Lab, b: Lab): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

const anchorLabs: [ColorFamilyId, Lab][] = Object.entries(COLOR_FAMILIES).flatMap(([id, family]) =>
  family.anchors.map((hex): [ColorFamilyId, Lab] => [id as ColorFamilyId, hexToLab(hex)]),
);

/** Nearest color family to a hex, by perceptual distance to the family anchors. */
export function hexToFamily(hex: string): ColorFamilyId {
  const lab = hexToLab(hex);
  let best: ColorFamilyId = 'grey';
  let bestDistance = Infinity;
  for (const [id, anchor] of anchorLabs) {
    const d = distance(lab, anchor);
    if (d < bestDistance) {
      bestDistance = d;
      best = id;
    }
  }
  return best;
}

export function isFamily(value: string): value is ColorFamilyId {
  return value in COLOR_FAMILIES;
}

/** The color covering the most of a garment. */
export function mainColor(item: ItemTags): ItemColor | undefined {
  return [...item.colors].sort((a, b) => b.share - a.share)[0];
}

/**
 * Resolve an item's main color to a family. Uses the tagged family when it's
 * a known one, otherwise the nearest by hex. Blue denim becomes 'denim'.
 */
export function colorInfo(item: ItemTags, isDenim: boolean): ColorInfo {
  const main = mainColor(item) ?? { hex: '#8c8c8c', family: 'grey', share: 1 };
  let family = isFamily(main.family) ? main.family : hexToFamily(main.hex);
  if (isDenim && COLOR_FAMILIES[family].tone === 'blue') family = 'denim';
  const data = COLOR_FAMILIES[family];
  return {
    hex: main.hex,
    family,
    label: data.label,
    group: data.group,
    tone: data.tone,
    lightness: lightness(main.hex),
  };
}

/** Families covering a meaningful share of the garment (main color plus large secondaries). */
export function significantFamilies(item: ItemTags): ColorFamilyId[] {
  return item.colors
    .filter((c) => c.share >= MAIN_COLOR_MIN_SHARE)
    .map((c) => (isFamily(c.family) ? c.family : hexToFamily(c.hex)));
}
