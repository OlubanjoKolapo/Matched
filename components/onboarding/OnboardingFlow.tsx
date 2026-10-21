'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Wordmark } from '@/components/shell/Wordmark';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useProfile } from '@/lib/hooks/data';
import { ease } from '@/lib/motion';
import { DEFAULT_LOOK, GOAL_OPTIONS, type Step } from '@/lib/onboarding/content';
import { saveDraft } from '@/lib/onboarding/save';
import { sampleLook } from '@/lib/sample/looks';
import { PROGRESS_STEPS, useOnboarding } from '@/lib/store/onboarding';
import { defaultUnits, formatHeight } from '@/lib/units';
import { AvatarStage } from './AvatarStage';
import { AvatarStep } from './steps/AvatarStep';
import { FirstMatchStep } from './steps/FirstMatchStep';
import { GoalsStep } from './steps/GoalsStep';
import { HeightStep } from './steps/HeightStep';
import { TrackStep } from './steps/TrackStep';
import { WardrobeStep } from './steps/WardrobeStep';
import { WelcomeStep } from './steps/WelcomeStep';

const EDIT_STEPS: Step[] = ['track', 'height', 'goals', 'avatar'];

/** Steps a person can skip; the track question is required. */
const SKIPPABLE: Step[] = ['height', 'goals', 'avatar'];

export function OnboardingFlow() {
  const router = useRouter();
  const profile = useProfile();
  const { ready, step, direction, mode, draft, start, reset, next, back, setHeight } = useOnboarding();

  // Start once the saved profile is known. ?edit=1 reopens it from Settings.
  useEffect(() => {
    if (ready || profile === undefined) return;
    const params = new URLSearchParams(window.location.search);
    const edit = params.get('edit') === '1' && !!profile;
    // ?step=first-match: straight to the payoff once someone has added their own three pieces.
    const firstMatch = params.get('step') === 'first-match' && !!profile;
    start({
      mode: edit ? 'edit' : 'new',
      profile: edit || firstMatch ? profile : null,
      units: profile?.units ?? defaultUnits(navigator.language),
      step: firstMatch ? 'first-match' : undefined,
    });
  }, [profile, ready, start]);

  // Leaving onboarding clears the flow, so the next visit starts fresh.
  useEffect(() => reset, [reset]);

  // The figure dresses for the most recent goal picked.
  const look = useMemo(() => {
    const goal = GOAL_OPTIONS.find((g) => g.value === draft.goals[draft.goals.length - 1]);
    return sampleLook(goal?.look ?? DEFAULT_LOOK);
  }, [draft.goals]);

  if (!ready) return <div className="min-h-dvh bg-paper" aria-busy="true" />;
  if (step === 'welcome') return <WelcomeStep onStart={next} />;

  const steps = mode === 'edit' ? EDIT_STEPS : PROGRESS_STEPS;
  const position = steps.indexOf(step) + 1;
  const stepLabel = `Step ${position} of ${steps.length}`;
  const showStage = step !== 'first-match';
  const canGoBack = !(mode === 'edit' && step === 'track') && step !== 'first-match';

  async function finishEdit() {
    await saveDraft(draft);
    router.push('/settings');
  }

  function skip() {
    if (step === 'height') setHeight(undefined);
    if (mode === 'edit' && step === 'avatar') void finishEdit();
    else next();
  }

  const stageOutfit = step === 'track' || step === 'height' ? [] : look;
  const caption =
    step === 'height' && draft.heightCm ? (
      <p className="caps numerals text-ink-muted">{formatHeight(draft.heightCm, draft.units)}</p>
    ) : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-(--z-nav) bg-paper pt-safe">
        <div className="flex h-masthead items-center justify-between px-2 lg:px-6">
          <div className="flex w-24 items-center">
            {canGoBack ? <IconButton icon="arrow-left" label="Back" onClick={back} /> : null}
          </div>
          <Wordmark className="text-lead" />
          <div className="flex w-24 justify-end">
            {SKIPPABLE.includes(step) ? (
              <button type="button" onClick={skip} className="caps h-hit px-3 text-ink-muted transition-colors hover:text-ink">
                Skip
              </button>
            ) : null}
          </div>
        </div>
        <ProgressBar value={position / steps.length} label={`Onboarding progress, ${stepLabel.toLowerCase()}`} />
      </header>

      {/* overflow-x-clip: steps slide in from the side; without it phones briefly widen and zoom the page. */}
      <main className={showStage ? 'grid flex-1 overflow-x-clip lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]' : 'flex flex-1 flex-col overflow-x-clip'}>
        {showStage ? <AvatarStage avatar={draft.avatar} heightCm={draft.heightCm} outfit={stageOutfit} caption={caption} /> : null}

        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.28, ease: ease.emphasized }}
            className="flex min-w-0 flex-1 flex-col"
          >
            {step === 'track' ? <TrackStep label={stepLabel} /> : null}
            {step === 'height' ? <HeightStep label={stepLabel} /> : null}
            {step === 'goals' ? <GoalsStep label={stepLabel} /> : null}
            {step === 'avatar' ? (
              <AvatarStep label={stepLabel} onDone={mode === 'edit' ? finishEdit : next} doneLabel={mode === 'edit' ? 'Save changes' : 'Continue'} />
            ) : null}
            {step === 'wardrobe' ? <WardrobeStep label={stepLabel} /> : null}
            {step === 'first-match' ? <FirstMatchStep label={stepLabel} /> : null}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
