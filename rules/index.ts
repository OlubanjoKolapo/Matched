import type { Rule } from '@/lib/rules/types';
import type { Track } from '@/lib/types';
import { menswearRules } from './menswear';
import { sharedRules } from './shared';
import { womenswearRules } from './womenswear';

export const RULESETS = {
  shared: sharedRules,
  menswear: menswearRules,
  womenswear: womenswearRules,
} as const;

/** Menswear is complete; womenswear is a starter set and says so in the UI. */
export const TRACK_STATUS: Record<Exclude<Track, 'both'>, 'complete' | 'early'> = {
  menswear: 'complete',
  womenswear: 'early',
};

export function rulesFor(track: Track): Rule[] {
  switch (track) {
    case 'menswear':
      return [...sharedRules, ...menswearRules];
    case 'womenswear':
      return [...sharedRules, ...womenswearRules];
    case 'both':
      return [...sharedRules, ...menswearRules, ...womenswearRules];
  }
}

export const ALL_RULES: Rule[] = rulesFor('both');
