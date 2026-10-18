/**
 * Color families and harmony data.
 *
 * Every tagged color is mapped to one of these families (by the tag itself,
 * or by the nearest anchor hex in perceptual Lab space). Rules then reason
 * about families, groups and tones rather than raw hex values.
 *
 * Contributors: add anchors to improve detection, or adjust groups, tones,
 * EARTH_FRIENDS and CLASHES to change how colors pair.
 */

/**
 * - neutral: pairs with anything.
 * - earth: pairs with denim, cream, white, black and each other.
 * - statement: a bold color. One per outfit.
 */
export type ColorGroup = 'neutral' | 'earth' | 'statement';

export interface ColorFamily {
  /** Display name used in reasons: "olive", "light blue". */
  label: string;
  group: ColorGroup;
  /** Families sharing a tone read as one color for tonal outfits. */
  tone: string;
  /** Representative hexes. More anchors = better detection. */
  anchors: string[];
}

export const COLOR_FAMILIES = {
  black: { label: 'black', group: 'neutral', tone: 'dark', anchors: ['#0f0f0f', '#1a1a1a', '#232323'] },
  charcoal: { label: 'charcoal', group: 'neutral', tone: 'dark', anchors: ['#36393d', '#3f3f3f', '#4a4a4f'] },
  grey: { label: 'grey', group: 'neutral', tone: 'grey', anchors: ['#6e6e6e', '#8c8c8c', '#a9a9a9', '#c0c0c0'] },
  white: { label: 'white', group: 'neutral', tone: 'light', anchors: ['#ffffff', '#f5f5f5', '#ececec'] },
  cream: { label: 'cream', group: 'neutral', tone: 'light', anchors: ['#f2ead9', '#efe6d2', '#e8dcc2'] },
  beige: { label: 'beige', group: 'neutral', tone: 'sand', anchors: ['#d8c8aa', '#cbb994', '#d6c6a8'] },
  navy: { label: 'navy', group: 'neutral', tone: 'blue', anchors: ['#1f2a44', '#1b2638', '#23304d', '#283655'] },
  /** Blue denim. Assigned by material (jeans, denim), never by hex alone. */
  denim: { label: 'denim', group: 'neutral', tone: 'blue', anchors: [] },
  'light-blue': { label: 'light blue', group: 'neutral', tone: 'blue', anchors: ['#a9c4e2', '#b7cfe8', '#9bb8d8', '#c4d8ec'] },

  tan: { label: 'tan', group: 'earth', tone: 'sand', anchors: ['#c19a6b', '#b48a5a', '#a87c4f'] },
  khaki: { label: 'khaki', group: 'earth', tone: 'sand', anchors: ['#a89f7a', '#b5a77c', '#9e9466'] },
  brown: { label: 'brown', group: 'earth', tone: 'brown', anchors: ['#5b3a29', '#6f4a33', '#4a2f22', '#7a4b2a'] },
  olive: { label: 'olive', group: 'earth', tone: 'green', anchors: ['#4b5320', '#5a5f3a', '#3d4a2f', '#6b6b47'] },
  rust: { label: 'rust', group: 'earth', tone: 'rust', anchors: ['#b7410e', '#a0522d', '#9c4a2e'] },

  blue: { label: 'blue', group: 'statement', tone: 'blue', anchors: ['#2f5fa7', '#3a6fb0', '#1f4e9c', '#4a7bc0'] },
  green: { label: 'green', group: 'statement', tone: 'green', anchors: ['#2f6b3a', '#2f4a35', '#3f7d4c', '#1e5a3a'] },
  teal: { label: 'teal', group: 'statement', tone: 'teal', anchors: ['#1f6f6f', '#2a7f7a'] },
  red: { label: 'red', group: 'statement', tone: 'red', anchors: ['#c0392b', '#b22222', '#d23a2e'] },
  burgundy: { label: 'burgundy', group: 'statement', tone: 'red', anchors: ['#6d1a2a', '#7b2233', '#5e1825'] },
  pink: { label: 'pink', group: 'statement', tone: 'pink', anchors: ['#e8a0b0', '#f2b8c6', '#d97a95'] },
  orange: { label: 'orange', group: 'statement', tone: 'rust', anchors: ['#e67e22', '#f08a24'] },
  yellow: { label: 'yellow', group: 'statement', tone: 'yellow', anchors: ['#f1c40f', '#e8c547', '#d4a017'] },
  purple: { label: 'purple', group: 'statement', tone: 'purple', anchors: ['#5b2a86', '#6a3d9a'] },
  lavender: { label: 'lavender', group: 'statement', tone: 'purple', anchors: ['#b8a6d9', '#c9b8e8'] },
} as const satisfies Record<string, ColorFamily>;

export type ColorFamilyId = keyof typeof COLOR_FAMILIES;

/** How a tone is named in reasons: "Head to toe in {tone}". */
export const TONE_LABELS: Record<string, string> = {
  dark: 'black',
  grey: 'grey',
  light: 'white and cream',
  sand: 'sand and stone',
  blue: 'blue',
  brown: 'brown',
  green: 'green',
  rust: 'rust',
  teal: 'teal',
  red: 'red',
  pink: 'pink',
  yellow: 'yellow',
  purple: 'purple',
};

/** Families that sit naturally with earth tones (besides other earth tones). */
export const EARTH_FRIENDS: ColorFamilyId[] = ['denim', 'cream', 'white', 'black', 'beige', 'light-blue', 'navy'];

/** Pairs that fight when both appear at similar weight on main pieces. */
export const CLASHES: [ColorFamilyId, ColorFamilyId][] = [['brown', 'black']];

/** Denim-on-denim thresholds, in Lab lightness (L*) points between washes. */
export const DENIM_WASH = {
  /** At least this far apart: clearly different washes. */
  contrastMin: 18,
  /** Closer than this: nearly the same wash. */
  tooCloseMax: 10,
} as const;

/**
 * Pieces only read as one tone when their lightness (L*) stays within this
 * spread. Navy with light-wash denim shares a tone but isn't tonal.
 */
export const TONAL_MAX_LIGHTNESS_SPREAD = 30;

/** A color must cover at least this share of a garment to count as its main color. */
export const MAIN_COLOR_MIN_SHARE = 0.3;
