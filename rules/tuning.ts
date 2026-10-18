import type { HeightBand, Track } from '@/lib/types';
import type { ProfileModifier } from '@/lib/rules/types';

/** How rule points turn into a 0–100 score. */
export const SCORING = {
  /** Where every outfit starts. */
  base: 55,
  /**
   * Rewards have diminishing returns: bonus = maxBonus × (1 − e^(−points / bonusCurve)).
   * The first few strengths matter most, and 100 stays rare. Penalties are linear.
   */
  maxBonus: 45,
  bonusCurve: 40,
  /** Reasons shown with a score. */
  maxReasons: 4,
  minReasons: 2,
  /** At most this many warnings take up reason slots. */
  maxWarnings: 2,
} as const;

/** Average height per track, in cm. Height bands are relative to these. */
export const AVERAGE_HEIGHT_CM: Record<Track, number> = {
  menswear: 176,
  womenswear: 163,
  both: 170,
};

/** Within this many cm of the average counts as 'average'. */
export const HEIGHT_BAND_MARGIN_CM = 6;

export function heightBandFor(track: Track, heightCm?: number): HeightBand {
  if (heightCm === undefined) return 'average';
  const average = AVERAGE_HEIGHT_CM[track];
  if (heightCm < average - HEIGHT_BAND_MARGIN_CM) return 'shorter';
  if (heightCm > average + HEIGHT_BAND_MARGIN_CM) return 'taller';
  return 'average';
}

/**
 * Profile modifiers scale tagged rules for a person's goals and height.
 * Factors multiply; several can apply to the same rule.
 */
export const PROFILE_MODIFIERS: ProfileModifier[] = [
  {
    id: 'goal-taller',
    applies: (p) => p.goals.includes('taller'),
    tags: ['tonal', 'leg-line'],
    factor: 1.5,
    on: 'both',
  },
  {
    id: 'band-shorter',
    applies: (_, band) => band === 'shorter',
    tags: ['leg-line'],
    factor: 1.25,
    on: 'both',
  },
  {
    id: 'band-taller',
    applies: (_, band) => band === 'taller',
    tags: ['volume'],
    factor: 0.5,
    on: 'negative',
  },
  {
    id: 'goal-broader',
    applies: (p) => p.goals.includes('broader'),
    tags: ['v-shape'],
    factor: 1.6,
    on: 'positive',
  },
  {
    id: 'goal-leaner',
    applies: (p) => p.goals.includes('leaner'),
    tags: ['tonal', 'dark-base'],
    factor: 1.4,
    on: 'positive',
  },
  {
    id: 'goal-put-together',
    applies: (p) => p.goals.includes('put-together'),
    tags: ['polish'],
    factor: 1.3,
    on: 'both',
  },
];
