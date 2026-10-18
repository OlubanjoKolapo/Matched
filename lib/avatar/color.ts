import { hexToRgb } from '@/lib/rules/color';

const toHex = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');

/** Mixes a color toward black (amount < 0) or white (amount > 0). */
export function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const target = amount < 0 ? 0 : 255;
  const t = Math.abs(amount);
  return `#${toHex(r + (target - r) * t)}${toHex(g + (target - g) * t)}${toHex(b + (target - b) * t)}`;
}

/** Relative luminance, 0–1. */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Outline color for a fill: darker for light fills, lighter for very dark ones. */
export function outline(hex: string): string {
  return luminance(hex) < 0.03 ? shade(hex, 0.16) : shade(hex, -0.2);
}
