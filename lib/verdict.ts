import type { Verdict } from './types';

export const VERDICT_THRESHOLDS = { matched: 75, works: 55 } as const;

export function verdictFor(score: number): Verdict {
  if (score >= VERDICT_THRESHOLDS.matched) return 'matched';
  if (score >= VERDICT_THRESHOLDS.works) return 'works';
  return 'rethink';
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  matched: 'Matched',
  works: 'Works',
  rethink: 'Rethink',
};
