import { saveProfile } from '@/lib/db';
import type { OnboardingDraft } from '@/lib/store/onboarding';

/** Writes the onboarding answers to the profile, keeping lessons and streak intact. */
export function saveDraft({ track, heightCm, units, goals, avatar }: OnboardingDraft) {
  return saveProfile({ track, heightCm, units, goals, avatar });
}
