'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Avatar } from '@/components/avatar/Avatar';
import { ShareButton } from '@/components/share/ShareButton';
import { FlatLay } from '@/components/avatar/FlatLay';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Text } from '@/components/ui/Text';
import { avatarSupports } from '@/lib/avatar/garments';
import { cx } from '@/lib/cx';
import { imageUrl } from '@/lib/hooks/data';
import { saveOutfit } from '@/lib/outfit/actions';
import { candidatesFor, fillBest, needsBottom, outfitKey, scoreSlots, slotItems, SLOT_KEYS } from '@/lib/outfit/slots';
import type { RulesProfile } from '@/lib/rules';
import { useMatchBuilder } from '@/lib/store/match';
import type { Item, Profile } from '@/lib/types';
import { VERDICT_LABEL } from '@/lib/verdict';
import { MatchedBurst } from './MatchedBurst';
import { ReasonList } from './ReasonList';
import { SlotPicker } from './SlotPicker';

/**
 * The outfit builder: swipe each slot, watch the figure change and the score
 * move. Crossing into Matched plays the snap.
 */
export function OutfitBuilder({ wardrobe, profile }: { wardrobe: Item[]; profile: Profile }) {
  const { slots, setSlot, setSlots, clear } = useMatchBuilder();
  const [view, setView] = useState<'avatar' | 'flatlay'>('avatar');
  const [saved, setSaved] = useState<string | null>(null);

  const rules: RulesProfile = useMemo(() => ({ track: profile.track, goals: profile.goals, heightCm: profile.heightCm }), [profile]);
  const items = useMemo(() => slotItems(slots, wardrobe), [slots, wardrobe]);
  const result = useMemo(() => scoreSlots(slots, wardrobe, rules), [slots, wardrobe, rules]);
  const key = outfitKey(items);
  const bottomNeeded = needsBottom(slots, wardrobe);
  const canAvatar = avatarSupports(items);
  const mode = canAvatar ? view : 'flatlay';

  async function save() {
    if (!result) return;
    await saveOutfit(items, result);
    setSaved(key);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-12">
      {/* Stage: pinned on phones so the figure stays in view while you swipe. */}
      <div className="sticky top-[calc(var(--spacing-masthead)+env(safe-area-inset-top))] z-(--z-stage) -mx-gutter lg:order-2 lg:mx-0 lg:top-8 lg:self-start">
        <div className="relative h-[40svh] overflow-hidden bg-studio lg:h-[78dvh] lg:rounded-md">
          <div className="absolute inset-0 px-6 pt-4 pb-3">
            {mode === 'avatar' ? (
              <Avatar config={profile.avatar} heightCm={profile.heightCm} outfit={items} />
            ) : items.length ? (
              <div className="mx-auto h-full max-w-xs">
                <FlatLay pieces={items.map((i) => ({ item: i, src: imageUrl(i) }))} className="h-full bg-transparent" />
              </div>
            ) : null}
          </div>
          <div className="absolute top-3 right-3">
            <SegmentedControl
              label="Outfit view"
              size="sm"
              value={mode}
              onChange={setView}
              options={canAvatar ? [{ value: 'avatar', label: 'Figure' }, { value: 'flatlay', label: 'Flat-lay' }] : [{ value: 'flatlay', label: 'Flat-lay' }]}
              className="bg-paper/80 backdrop-blur-sm"
            />
          </div>
          {result ? (
            <div className="absolute bottom-3 left-3 flex items-end gap-2">
              <div className="relative rounded-pill bg-paper p-1 shadow-lift">
                <ScoreRing key={key} score={result.score} size="sm" />
                <AnimatePresence>{result.verdict === 'matched' ? <MatchedBurst key={key} /> : null}</AnimatePresence>
              </div>
              <span className={cx('caps mb-2', result.verdict === 'matched' ? 'text-matched' : result.verdict === 'rethink' ? 'text-rethink' : 'text-ink-muted')}>
                {VERDICT_LABEL[result.verdict]}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:order-1">
        <div className="flex flex-col gap-5">
          {SLOT_KEYS.map((slot) => (
            <SlotPicker
              key={slot}
              slot={slot}
              items={candidatesFor(slot, wardrobe)}
              value={slots[slot]}
              onChange={(id) => setSlot(slot, id)}
              allowNone={slot === 'outer'}
              disabled={slot === 'bottom' && !bottomNeeded}
              disabledNote="Not needed with a dress"
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="accent" onClick={() => setSlots(fillBest(slots, wardrobe, rules))}>
            <Icon name="match" className="size-4" />
            Match it for me
          </Button>
          <Button variant="secondary" onClick={save} disabled={!result || saved === key}>
            {saved === key ? (
              <>
                <Icon name="check" className="size-4" />
                Saved
              </>
            ) : (
              'Save look'
            )}
          </Button>
          {result ? (
            <ShareButton
              key={key}
              outfit={items}
              result={result}
              mode={mode}
              avatar={profile.avatar}
              heightCm={profile.heightCm}
              imageFor={(item) => imageUrl(item as Item)}
              variant="secondary"
              size="md"
            />
          ) : null}
          <Button variant="ghost" onClick={clear} disabled={!items.length}>
            Clear
          </Button>
        </div>

        <section aria-labelledby="reasons" className="flex flex-col gap-3">
          <h2 id="reasons" className="caps text-ink-muted">
            Why
          </h2>
          {result ? (
            <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ReasonList reasons={result.reasons} />
            </motion.div>
          ) : (
            <Text tone="muted">Choose a top and a bottom (or a dress) to see the score and the reasons behind it.</Text>
          )}
        </section>
      </div>
    </div>
  );
}
