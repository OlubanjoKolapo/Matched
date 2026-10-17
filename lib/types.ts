/**
 * Core domain types for Matched. Enumerations are defined once as const arrays
 * so UI (chips, filters) and validation (Zod, in the tagging step) share them.
 */

export const TRACKS = ['menswear', 'womenswear', 'both'] as const;
export type Track = (typeof TRACKS)[number];

export const CATEGORIES = ['top', 'bottom', 'onepiece', 'outerwear', 'shoes', 'accessory'] as const;
export type Category = (typeof CATEGORIES)[number];

export const FITS = [
  'skinny',
  'slim',
  'fitted',
  'straight',
  'regular',
  'relaxed',
  'wide',
  'baggy',
  'oversized',
  'cropped',
  'boxy',
] as const;
export type Fit = (typeof FITS)[number];

export const SHOE_PROFILES = ['low', 'standard', 'chunky', 'boot', 'heel'] as const;
export type ShoeProfile = (typeof SHOE_PROFILES)[number];

export const RISES = ['low', 'mid', 'high'] as const;
export type Rise = (typeof RISES)[number];

export const LENGTHS = ['cropped', 'regular', 'long'] as const;
export type Length = (typeof LENGTHS)[number];

export const PATTERNS = ['solid', 'stripe', 'check', 'graphic', 'print', 'texture'] as const;
export type Pattern = (typeof PATTERNS)[number];

export const FORMALITY_LEVELS = [1, 2, 3, 4, 5] as const;
/** 1 gym · 2 casual · 3 smart casual · 4 business · 5 suit */
export type Formality = (typeof FORMALITY_LEVELS)[number];

export const GOALS = ['taller', 'broader', 'leaner', 'put-together', 'match'] as const;
export type Goal = (typeof GOALS)[number];

export const BUILDS = ['slim', 'average', 'broad'] as const;
export type Build = (typeof BUILDS)[number];

export const REASON_KINDS = ['proportion', 'shoes', 'color', 'formality'] as const;
export type ReasonKind = (typeof REASON_KINDS)[number];

export const VERDICTS = ['matched', 'works', 'rethink'] as const;
export type Verdict = (typeof VERDICTS)[number];

/** Height relative to the track's average. Drives lesson personalisation. */
export type HeightBand = 'shorter' | 'average' | 'taller';

export interface ItemColor {
  hex: string;
  /** Named color family, e.g. 'navy', 'olive'. Looked up in the harmony table. */
  family: string;
  /** Share of the garment's visible area, 0–1. */
  share: number;
}

export interface Item {
  id: string;
  track: Track;
  category: Category;
  /** Free-form garment type: 'hoodie', 'jeans', 'loafer', 'midi skirt'. */
  subtype: string;
  fit?: Fit;
  shoeProfile?: ShoeProfile;
  rise?: Rise;
  length?: Length;
  colors: ItemColor[];
  pattern: Pattern;
  /** 'denim', 'knit', 'leather'… */
  material?: string;
  formality: Formality;
  photo: Blob;
  cutout?: Blob;
  wornDates: string[];
  createdAt: string;
  taggedBy: 'ai' | 'user';
}

export interface AvatarConfig {
  skinTone: string;
  hair: string;
  hairColor: string;
  build: Build;
}

export interface Profile {
  track: Track;
  heightCm?: number;
  units: 'metric' | 'imperial';
  goals: Goal[];
  avatar: AvatarConfig;
  /** The user's own Anthropic key. Stored only in IndexedDB on this device. */
  apiKey?: string;
  lessonsRead: string[];
  streak: { count: number; lastDay: string };
}

export interface Reason {
  ruleId: string;
  kind: ReasonKind;
  positive: boolean;
  text: string;
}

export interface Outfit {
  id: string;
  itemIds: string[];
  score: number;
  verdict: Verdict;
  reasons: Reason[];
  savedAt?: string;
}
