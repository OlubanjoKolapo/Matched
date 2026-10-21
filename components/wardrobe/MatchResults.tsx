'use client';

import { motion } from 'motion/react';
import { useState } from 'react';
import { MatchedMoment } from '@/components/match/MatchedMoment';
import { ReasonList } from '@/components/match/ReasonList';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Heading';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Text } from '@/components/ui/Text';
import { imageUrl } from '@/lib/hooks/data';
import type { GeneratedOutfit } from '@/lib/rules';
import { spring } from '@/lib/motion';
import type { Item } from '@/lib/types';
import { VERDICT_LABEL } from '@/lib/verdict';

/** After the search spin: the best pieces snap beside the chosen one, with the reasons. */
export function MatchResults({ item, outfits, onDone }: { item: Item; outfits: GeneratedOutfit<Item>[]; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const outfit = outfits[index];

  if (!outfit) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <Heading as="h2" size="title">
          Nothing pairs well with your {item.name ?? item.subtype} yet.
        </Heading>
        <Text tone="muted">Add a few more pieces, especially shoes and bottoms, and search again.</Text>
        <Button variant="secondary" onClick={onDone}>
          Back to the rail
        </Button>
      </div>
    );
  }

  const pieces = outfit.items.map((p) => ({ item: p, src: imageUrl(p) }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.gentle}
      aria-labelledby="match-results"
      className="grid gap-8 lg:grid-cols-2 lg:items-center"
    >
      <div className="overflow-hidden rounded-md bg-studio p-6">
        <MatchedMoment key={index} pieces={pieces} className="min-h-56" />
      </div>
      <div className="flex flex-col gap-5">
        <Eyebrow tone="accent">
          <span>{VERDICT_LABEL[outfit.result.verdict]}</span>
          <span>
            {index + 1} of {outfits.length}
          </span>
        </Eyebrow>
        <div className="flex items-center gap-5">
          <ScoreRing key={index} score={outfit.result.score} size="md" />
          <Heading as="h2" size="title">
            <span id="match-results">{outfit.items.filter((p) => p.id !== item.id).map((p) => p.name ?? p.subtype).join(' and ')}</span>
          </Heading>
        </div>
        <ReasonList key={index} reasons={outfit.result.reasons} delay={0.3} />
        <div className="flex gap-3">
          {outfits.length > 1 ? (
            <Button variant="secondary" onClick={() => setIndex((i) => (i + 1) % outfits.length)}>
              Next combination
            </Button>
          ) : null}
          <Button variant="ghost" onClick={onDone}>
            Done
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
