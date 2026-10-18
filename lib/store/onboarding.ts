'use client';

import { create } from 'zustand';
import { frameForTrack, randomAvatar } from '@/lib/avatar/palette';
import { DEFAULT_PROFILE } from '@/lib/db';
import { STEPS, type Step } from '@/lib/onboarding/content';
import type { AvatarConfig, Goal, Profile, Track } from '@/lib/types';
import type { Units } from '@/lib/units';

export interface OnboardingDraft {
  track: Track;
  heightCm?: number;
  units: Units;
  goals: Goal[];
  avatar: AvatarConfig;
}

interface OnboardingState {
  /** True once start() has run for this visit. */
  ready: boolean;
  step: Step;
  /** 1 forward, -1 back: drives the slide direction. */
  direction: 1 | -1;
  /** 'edit' when reopened from Settings: ends after the avatar step. */
  mode: 'new' | 'edit';
  draft: OnboardingDraft;
  goTo: (step: Step) => void;
  next: () => void;
  back: () => void;
  setTrack: (track: Track) => void;
  setHeight: (heightCm: number | undefined) => void;
  setUnits: (units: Units) => void;
  toggleGoal: (goal: Goal) => void;
  setAvatar: (patch: Partial<AvatarConfig>) => void;
  randomise: () => void;
  start: (options: { mode: 'new' | 'edit'; profile?: Profile | null; units: Units }) => void;
  /** Clears the flow when leaving onboarding. */
  reset: () => void;
}

const freshDraft = (units: Units): OnboardingDraft => ({
  track: DEFAULT_PROFILE.track,
  units,
  goals: [],
  avatar: DEFAULT_PROFILE.avatar,
});

const indexOf = (step: Step) => STEPS.indexOf(step);

export const useOnboarding = create<OnboardingState>((set, get) => ({
  ready: false,
  step: 'welcome',
  direction: 1,
  mode: 'new',
  draft: freshDraft('metric'),

  goTo: (step) => set({ step, direction: indexOf(step) >= indexOf(get().step) ? 1 : -1 }),
  next: () => {
    const i = indexOf(get().step);
    if (i < STEPS.length - 1) set({ step: STEPS[i + 1]!, direction: 1 });
  },
  back: () => {
    const i = indexOf(get().step);
    const floor = get().mode === 'edit' ? indexOf('track') : 0;
    if (i > floor) set({ step: STEPS[i - 1]!, direction: -1 });
  },

  setTrack: (track) =>
    set(({ draft }) => ({ draft: { ...draft, track, avatar: { ...draft.avatar, frame: frameForTrack(track, draft.avatar.frame) } } })),
  setHeight: (heightCm) => set(({ draft }) => ({ draft: { ...draft, heightCm } })),
  setUnits: (units) => set(({ draft }) => ({ draft: { ...draft, units } })),
  toggleGoal: (goal) =>
    set(({ draft }) => ({
      draft: { ...draft, goals: draft.goals.includes(goal) ? draft.goals.filter((g) => g !== goal) : [...draft.goals, goal] },
    })),
  setAvatar: (patch) => set(({ draft }) => ({ draft: { ...draft, avatar: { ...draft.avatar, ...patch } } })),
  randomise: () => set(({ draft }) => ({ draft: { ...draft, avatar: randomAvatar(draft.avatar.frame) } })),

  start: ({ mode, profile, units }) =>
    set({
      ready: true,
      mode,
      step: mode === 'edit' ? 'track' : 'welcome',
      direction: 1,
      draft: profile
        ? { track: profile.track, heightCm: profile.heightCm, units: profile.units, goals: profile.goals, avatar: { ...DEFAULT_PROFILE.avatar, ...profile.avatar } }
        : freshDraft(units),
    }),
  reset: () => set({ ready: false, step: 'welcome', direction: 1, mode: 'new' }),
}));

/** Steps that show the progress bar and the shared avatar stage. */
export const PROGRESS_STEPS: Step[] = ['track', 'height', 'goals', 'avatar', 'wardrobe', 'first-match'];
