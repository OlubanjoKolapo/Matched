'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Avatar } from '@/components/avatar/Avatar';
import { MatchedMoment } from '@/components/match/MatchedMoment';
import { ReasonList } from '@/components/match/ReasonList';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { HangTag } from '@/components/ui/HangTag';
import { Heading } from '@/components/ui/Heading';
import { Icon } from '@/components/ui/Icon';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Text } from '@/components/ui/Text';
import { useItemImages, useWardrobe } from '@/lib/hooks/data';
import { spring } from '@/lib/motion';
import { PRIVACY_LINE } from '@/lib/onboarding/content';
import { generateOutfits } from '@/lib/rules';
import { useOnboarding } from '@/lib/store/onboarding';
import { VERDICT_LABEL } from '@/lib/verdict';

/** After the snap, how long the pieces hold before the figure puts them on. */
const DRESS_DELAY_MS = 900;

const HEADLINES = {
  matched: (
    <>
      Made for <em>each other.</em>
    </>
  ),
  works: (
    <>
      A solid <em>start.</em>
    </>
  ),
  rethink: (
    <>
      Close. One <em>swap</em> away.
    </>
  ),
};

/** The payoff: the best outfit in the wardrobe snaps together, then the figure wears it. */
export function FirstMatchStep({ label }: { label: string }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { draft } = useOnboarding();
  const wardrobe = useWardrobe();
  const images = useItemImages(wardrobe);
  const [phase, setPhase] = useState<'pieces' | 'snapped' | 'dressed'>('pieces');

  const best = useMemo(() => {
    if (!wardrobe) return undefined;
    return generateOutfits(wardrobe, { track: draft.track, goals: draft.goals, heightCm: draft.heightCm }, { outerwear: 'never', limit: 1 })[0] ?? null;
  }, [wardrobe, draft.track, draft.goals, draft.heightCm]);

  const pieces = useMemo(
    () => (best ? best.items.flatMap((item) => (images.get(item.id) ? [{ item, src: images.get(item.id)! }] : [])) : []),
    [best, images],
  );

  useEffect(() => {
    if (phase !== 'snapped') return;
    const timer = setTimeout(() => setPhase('dressed'), reduce ? 0 : DRESS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [phase, reduce]);

  if (best === null) {
    return (
      <div className="flex flex-col gap-6 px-gutter py-section lg:px-12">
        <Heading as="h1" size="subhead">
          Your first match needs <em>three pieces.</em>
        </Heading>
        <Text tone="muted">Add a top, a bottom and a pair of shoes, and Matched will put them together.</Text>
        <ButtonLink href="/add" size="lg">
          Add a piece
        </ButtonLink>
      </div>
    );
  }

  const ready = best && pieces.length === best.items.length;
  const snapped = phase !== 'pieces';

  return (
    <div className="grid min-h-full lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="relative flex h-[min(52svh,34rem)] items-center justify-center overflow-hidden bg-paper-sunken px-gutter lg:sticky lg:top-0 lg:h-dvh">
        <AnimatePresence mode="wait">
          {phase !== 'dressed' && ready ? (
            <motion.div key="pieces" exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.3 }} className="w-full max-w-md">
              <MatchedMoment pieces={pieces} onSnap={() => setPhase('snapped')} />
            </motion.div>
          ) : null}
          {phase === 'dressed' ? (
            <motion.div key="figure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full max-w-xs pt-6 pb-3">
              <Avatar config={draft.avatar} heightCm={draft.heightCm} outfit={best!.items} dropIn />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {snapped && best ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={spring.snap}
              className="absolute bottom-4 left-gutter flex flex-col items-start gap-2 lg:bottom-12 lg:left-12"
            >
              <HangTag tone={best.result.verdict === 'matched' ? 'matched' : 'ink'}>{VERDICT_LABEL[best.result.verdict]}</HangTag>
              <div className="rounded-pill bg-paper p-1.5 shadow-lift">
                <ScoreRing score={best.result.score} size="sm" />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <section aria-labelledby="first-match-title" className="flex flex-col gap-6 px-gutter pt-8 pb-[calc(var(--spacing-gutter)*1.5+env(safe-area-inset-bottom))] lg:px-12 lg:pt-24">
        <Eyebrow tone="accent">
          <span>{label}</span>
          <span>Your first match</span>
        </Eyebrow>
        <Heading as="h1" size="headline">
          <span id="first-match-title">{best ? HEADLINES[best.result.verdict] : 'Finding your best outfit…'}</span>
        </Heading>
        {best && snapped ? (
          <>
            <Text tone="muted">
              {best.items.map((i) => i.name ?? i.subtype).join(', ')}. Here is why it works.
            </Text>
            <ReasonList reasons={best.result.reasons} delay={0.2} />
          </>
        ) : (
          <Text tone="muted">Pulling the best three pieces from your wardrobe…</Text>
        )}
        <div className="mt-auto flex flex-col gap-4 pt-4">
          <p className="caps flex items-center gap-2 text-ink-muted">
            <span aria-hidden className="size-1.5 rounded-pill bg-accent" />
            {PRIVACY_LINE}
          </p>
          <Button size="lg" block disabled={!snapped} onClick={() => router.push('/')}>
            See today’s fit
            <Icon name="arrow-right" />
          </Button>
        </div>
      </section>
    </div>
  );
}
