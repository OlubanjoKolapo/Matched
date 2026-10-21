'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Avatar } from '@/components/avatar/Avatar';
import { Wordmark } from '@/components/shell/Wordmark';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { HangTag } from '@/components/ui/HangTag';
import { Heading } from '@/components/ui/Heading';
import { Icon } from '@/components/ui/Icon';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Text } from '@/components/ui/Text';
import { WELCOME_LOOKS } from '@/lib/onboarding/content';
import { scoreOutfit } from '@/lib/rules';
import { spring } from '@/lib/motion';
import { sampleLook } from '@/lib/sample/looks';

const CYCLE_MS = 3600;

/** Full-bleed opener: three people, three outfits, each one snapping to Matched. */
export function WelcomeStep({ onStart }: { onStart: () => void }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const looks = useMemo(
    () => WELCOME_LOOKS.map((look) => ({ ...look, outfit: sampleLook(look.items), score: scoreOutfit(sampleLook(look.items)).score })),
    [],
  );
  const look = looks[index]!;

  useEffect(() => {
    if (reduce) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % looks.length), CYCLE_MS);
    return () => clearInterval(timer);
  }, [reduce, looks.length]);

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] overflow-x-clip lg:grid-cols-2 lg:grid-rows-1">
      <header className="flex h-masthead items-center px-gutter pt-safe lg:absolute lg:top-0 lg:left-0 lg:px-12">
        <Wordmark />
      </header>

      <div className="relative row-start-2 flex items-end justify-center overflow-hidden bg-studio px-gutter pt-6 lg:col-start-2 lg:row-start-1 lg:pt-16">
        <p className="caps absolute top-4 right-gutter numerals text-ink-subtle lg:top-8 lg:right-12">
          Look {String(index + 1).padStart(2, '0')} / {String(looks.length).padStart(2, '0')}
        </p>
        <div className="h-hero w-full max-w-sm lg:h-[82dvh]">
          <Avatar config={look.avatar} outfit={look.outfit} label={`Look ${index + 1}: an illustrated figure in a matched outfit`} />
        </div>
        <div className="absolute bottom-6 left-gutter flex flex-col items-start gap-3 lg:bottom-12 lg:left-12">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={index}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={spring.snap}
              className="flex flex-col items-start gap-3"
            >
              <HangTag tone="matched">Matched</HangTag>
              <div className="rounded-pill bg-paper p-1.5 shadow-lift">
                <ScoreRing score={look.score} size="sm" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="row-start-3 flex flex-col justify-center gap-6 px-gutter pt-8 pb-[calc(var(--spacing-gutter)*1.5+env(safe-area-inset-bottom))] lg:col-start-1 lg:row-start-1 lg:px-12 lg:py-section">
        <Eyebrow>
          <span>Wardrobe stylist</span>
          <span>Open source</span>
        </Eyebrow>
        <Heading as="h1" size="display">
          Your clothes, <em>matched.</em>
        </Heading>
        <Text variant="lead" tone="muted" className="max-w-prose">
          Photograph what you already own. Matched shows what goes with what, and tells you exactly why.
        </Text>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button size="lg" onClick={onStart} className="sm:w-auto" block>
            Get started
            <Icon name="arrow-right" />
          </Button>
          <Text variant="caption" tone="muted">
            Under a minute. No account.
          </Text>
        </div>
      </div>
    </div>
  );
}
