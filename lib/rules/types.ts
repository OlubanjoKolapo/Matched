import type { ColorFamilyId, ColorGroup } from '@/rules/colors';
import type { HeightBand, ItemTags, Profile, Reason, ReasonKind, Verdict } from '@/lib/types';

/** The parts of a profile that change the advice. */
export type RulesProfile = Pick<Profile, 'track' | 'goals' | 'heightCm'>;

/**
 * Tags group rules so profile modifiers can boost or soften them together.
 * - volume: big shapes (softened for the taller band)
 * - tonal: one-color dressing
 * - leg-line: anything that lengthens or shortens the leg
 * - v-shape: structure on top, slim below
 * - dark-base: dark, clean foundations
 * - polish: put-together, consistent formality
 */
export type RuleTag = 'volume' | 'tonal' | 'leg-line' | 'v-shape' | 'dark-base' | 'polish';

export interface ColorInfo {
  hex: string;
  family: ColorFamilyId;
  label: string;
  group: ColorGroup;
  tone: string;
  /** CIE L*, 0 (black) to 100 (white). */
  lightness: number;
}

export interface RuleContext {
  items: ItemTags[];
  top?: ItemTags;
  bottom?: ItemTags;
  /** Dress or jumpsuit: does the job of top and bottom. */
  onepiece?: ItemTags;
  outerwear?: ItemTags;
  shoes?: ItemTags;
  accessories: ItemTags[];
  /** Tops, bottoms, one-pieces and outerwear: the main pieces. */
  clothing: ItemTags[];
  /** Clothing plus shoes. */
  worn: ItemTags[];
  profile: RulesProfile;
  heightBand: HeightBand;
  /** The main color of an item, resolved to a family. */
  color: (item: ItemTags) => ColorInfo;
}

/** Extra slot values for a reason. Items render as their label ("olive overshirt"). */
export type Slots = Record<string, string | string[] | ItemTags>;

export interface Rule {
  /** Stable id: '<area>.<name>', e.g. 'shoes.weight-for-volume'. */
  id: string;
  kind: ReasonKind;
  /** Points added (positive) or removed (negative) when the rule fires. */
  effect: number;
  /**
   * The reason, in the Matched voice. Slots in braces are filled in:
   * {top} {bottom} {shoes} {outerwear} {onepiece} always, plus any the rule returns.
   * Write slots as objects of a phrase ("your {shoes}") so verbs never need to
   * agree with them: item names can be singular or plural.
   */
  text: string;
  tags?: RuleTag[];
  /** Return false when the rule doesn't apply; true, or extra slots, when it does. */
  when: (ctx: RuleContext) => boolean | Slots;
}

export interface ProfileModifier {
  id: string;
  applies: (profile: RulesProfile, band: HeightBand) => boolean;
  tags: RuleTag[];
  factor: number;
  /** Which rules to scale: rewards, penalties, or both. */
  on: 'positive' | 'negative' | 'both';
}

export interface RuleHit {
  rule: Rule;
  /** Effect after profile modifiers. */
  points: number;
  reason: Reason;
}

export interface ScoreResult {
  score: number;
  verdict: Verdict;
  /** The 2–4 most important reasons, strongest first. */
  reasons: Reason[];
  /** Every rule that fired, for debugging and tests. */
  hits: RuleHit[];
}
