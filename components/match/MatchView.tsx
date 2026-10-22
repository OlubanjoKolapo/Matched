'use client';

import { useEffect, useMemo, useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { PageHeader } from '@/components/ui/PageHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useProfile, useWardrobe } from '@/lib/hooks/data';
import { useSearchParam } from '@/lib/hooks/useSearchFlag';
import { scrollBehavior } from '@/lib/motion';
import { fillBest, slotsFromItems, type Slots } from '@/lib/outfit/slots';
import { useMatchBuilder } from '@/lib/store/match';
import { OutfitBuilder } from './OutfitBuilder';
import { OwnMode } from './OwnMode';
import { SavedLooks } from './SavedLooks';

type Mode = 'build' | 'own';

export function MatchView() {
  const wardrobe = useWardrobe();
  const profile = useProfile();
  const setSlots = useMatchBuilder((s) => s.setSlots);
  const [mode, setMode] = useState<Mode>('build');
  const requested = useSearchParam('items');

  // ?items=a,b,c opens the builder with that outfit (from Today, item detail and lessons).
  useEffect(() => {
    if (!requested || !wardrobe) return;
    const ids = new Set(requested.split(','));
    setSlots(slotsFromItems(wardrobe.filter((i) => ids.has(i.id))));
  }, [requested, wardrobe, setSlots]);

  const rules = useMemo(
    () => (profile ? { track: profile.track, goals: profile.goals, heightCm: profile.heightCm } : undefined),
    [profile],
  );

  // First visit with an empty builder: start from the best outfit, so there's something to swipe.
  useEffect(() => {
    if (requested || !wardrobe || !rules) return;
    const { slots } = useMatchBuilder.getState();
    if (!Object.values(slots).some(Boolean)) setSlots(fillBest({}, wardrobe, rules));
  }, [requested, wardrobe, rules, setSlots]);

  function open(slots: Slots) {
    setSlots(slots);
    setMode('build');
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  }

  if (!wardrobe || !profile || !rules) return <div className="min-h-dvh" aria-busy="true" />;

  const header = (
    <PageHeader
      eyebrow={
        <Eyebrow>
          <span>Match</span>
          <span>{mode === 'build' ? 'Outfit builder' : 'I own…'}</span>
        </Eyebrow>
      }
      title={
        mode === 'build' ? (
          <>
            What goes with what. <em>Swipe to try.</em>
          </>
        ) : (
          <>
            Start from what you own. <em>We’ll do the rest.</em>
          </>
        )
      }
      actions={
        <SegmentedControl<Mode>
          label="Match mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'build', label: 'Build' },
            { value: 'own', label: 'I own…' },
          ]}
        />
      }
    />
  );

  if (wardrobe.length < 2) {
    return (
      <>
        {header}
        <EmptyState
          index="No. 03"
          title="Nothing to match yet."
          body="Add a top, a bottom and a pair of shoes, and you can build outfits here."
          actions={
            <ButtonLink href="/add" size="lg">
              Add a piece
            </ButtonLink>
          }
        />
      </>
    );
  }

  return (
    <>
      {header}
      <div className="flex flex-col gap-12 pb-8">
        {mode === 'build' ? <OutfitBuilder wardrobe={wardrobe} profile={profile} /> : <OwnMode wardrobe={wardrobe} rules={rules} onOpen={open} />}
        <SavedLooks wardrobe={wardrobe} onOpen={open} />
      </div>
    </>
  );
}
