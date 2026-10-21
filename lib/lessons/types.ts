import type { ColorFamilyId } from '@/rules/colors';
import type { Category, Fit, Formality, Goal, HeightBand, Length, Pattern, ReasonKind, Rise, ShoeProfile, Track } from '@/lib/types';

/** One piece of a lesson's example look. Plain tags, so the mannequin can draw it. */
export interface LookPiece {
  category: Category;
  subtype: string;
  fit?: Fit;
  shoeProfile?: ShoeProfile;
  rise?: Rise;
  length?: Length;
  color: ColorFamilyId;
  pattern?: Pattern;
  material?: string;
  formality: Formality;
}

/**
 * A lesson: one rule, explained once, with a look that demonstrates it.
 * Empty `tracks`, `bands` or `goals` means "everyone".
 */
export interface Lesson {
  id: string;
  title: string;
  /** The one-line rule. Shown large. */
  rule: string;
  /** Two or three sentences of why and how. */
  body: string;
  kind: ReasonKind;
  tracks: Track[];
  bands: HeightBand[];
  goals: Goal[];
  /** Engine rules this lesson teaches. "Try it" finds an outfit where one fires. */
  ruleIds: string[];
  look: LookPiece[];
}
