import { hexToFamily, hexToLab } from '@/lib/rules/color';
import type { ItemColor } from '@/lib/types';

type RGB = [number, number, number];

const toHex = ([r, g, b]: RGB) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

/** Minimum share of the garment for a color to be listed. */
const MIN_SHARE = 0.08;
const CLUSTERS = 5;
const ITERATIONS = 8;

function labOf(rgb: RGB) {
  return hexToLab(toHex(rgb));
}

function dist(a: number[], b: number[]) {
  return Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!);
}

/**
 * The main colors of a garment from its pixels: k-means in Lab space with a
 * deterministic farthest-point start, merged by color family, largest first.
 */
export function dominantColors(pixels: RGB[], max = 3): ItemColor[] {
  if (!pixels.length) return [];
  const labs = pixels.map(labOf);

  // Farthest-point initialisation: stable results for the same image.
  const centres: number[][] = [labs[Math.floor(labs.length / 2)]!];
  while (centres.length < Math.min(CLUSTERS, labs.length)) {
    let best = 0;
    let bestD = -1;
    labs.forEach((l, i) => {
      const d = Math.min(...centres.map((c) => dist(l, c)));
      if (d > bestD) {
        bestD = d;
        best = i;
      }
    });
    centres.push(labs[best]!);
  }

  let assignment = new Array<number>(labs.length).fill(0);
  for (let iter = 0; iter < ITERATIONS; iter++) {
    assignment = labs.map((l) => {
      let best = 0;
      centres.forEach((c, i) => {
        if (dist(l, c) < dist(l, centres[best]!)) best = i;
      });
      return best;
    });
    centres.forEach((_, i) => {
      const members = labs.filter((_, j) => assignment[j] === i);
      if (members.length) centres[i] = [0, 1, 2].map((k) => members.reduce((s, m) => s + m[k]!, 0) / members.length);
    });
  }

  // Average RGB per cluster, then merge clusters that land in the same family.
  const byFamily = new Map<string, { sum: RGB; count: number }>();
  const clusters = centres.map((_, i) => {
    const members = pixels.filter((_, j) => assignment[j] === i);
    const sum = members.reduce<RGB>((s, m) => [s[0] + m[0], s[1] + m[1], s[2] + m[2]], [0, 0, 0]);
    return { members: members.length, rgb: members.length ? (sum.map((v) => v / members.length) as RGB) : ([0, 0, 0] as RGB) };
  });
  for (const c of clusters) {
    if (!c.members) continue;
    const family = hexToFamily(toHex(c.rgb));
    const entry = byFamily.get(family) ?? { sum: [0, 0, 0] as RGB, count: 0 };
    entry.sum = [entry.sum[0] + c.rgb[0] * c.members, entry.sum[1] + c.rgb[1] * c.members, entry.sum[2] + c.rgb[2] * c.members];
    entry.count += c.members;
    byFamily.set(family, entry);
  }

  return [...byFamily.entries()]
    .map(([family, { sum, count }]) => ({
      hex: toHex(sum.map((v) => v / count) as RGB),
      family,
      share: count / pixels.length,
    }))
    .filter((c) => c.share >= MIN_SHARE)
    .sort((a, b) => b.share - a.share)
    .slice(0, max)
    .map((c) => ({ ...c, share: Math.round(c.share * 100) / 100 }));
}
