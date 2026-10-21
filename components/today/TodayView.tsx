'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Avatar } from '@/components/avatar/Avatar';
import { FlatLay } from '@/components/avatar/FlatLay';
import { ReasonList } from '@/components/match/ReasonList';
import { ItemImage } from '@/components/wardrobe/ItemImage';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Swatch } from '@/components/ui/Swatch';
import { avatarSupports } from '@/lib/avatar/garments';
import { haptic, HAPTICS } from '@/lib/haptics';
import { imageUrl, useProfile, useWardrobe } from '@/lib/hooks/data';
import { spring } from '@/lib/motion';
import { getDay, shuffleToday, wearToday } from '@/lib/outfit/actions';
import { outfitKey } from '@/lib/outfit/slots';
import { dayKey, todaysFit } from '@/lib/outfit/today';
import { colorInfo, scoreOutfit } from '@/lib/rules';
import { isDenim } from '@/lib/rules/garment';
import { loadSampleWardrobe } from '@/lib/sample/load';
import type { Item } from '@/lib/types';
import { VERDICT_LABEL } from '@/lib/verdict';
import { TodayDate } from './TodayDate';

function Piece({ item }: { item: Item }) {
  const color = colorInfo(item, isDenim(item));
  return (
    <li className="flex items-center gap-3">
      <span className="block size-14 shrink-0 rounded-sm bg-studio p-1">
        <ItemImage item={item} shadow={false} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-body font-medium">{item.name ?? item.subtype}</span>
        <Swatch hex={color.hex} name={color.label} showName className="text-ink-muted" />
      </span>
    </li>
  );
}

export function TodayView() {
  const wardrobe = useWardrobe();
  const profile = useProfile();
  const [date] = useState(() => dayKey());
  const day = useLiveQuery(() => getDay(date), [date]);
  const [view, setView] = useState<'avatar' | 'flatlay'>('avatar');
  const [loadingSample, setLoadingSample] = useState(false);

  const rules = useMemo(
    () => (profile ? { track: profile.track, goals: profile.goals, heightCm: profile.heightCm } : undefined),
    [profile],
  );

  // Once worn, the day is locked to what was worn; otherwise today's pick for this shuffle.
  const fit = useMemo(() => {
    if (!wardrobe || !day) return undefined;
    if (day.wornItemIds?.length) {
      const items = day.wornItemIds.flatMap((id) => wardrobe.find((i) => i.id === id) ?? []);
      if (items.length) return { items, result: scoreOutfit(items, rules) };
    }
    return todaysFit(wardrobe, rules, { date, shuffle: day.shuffle });
  }, [wardrobe, day, rules, date]);

  const header = (
    <PageHeader
      eyebrow={
        <Eyebrow>
          <span>Today</span>
          <TodayDate />
        </Eyebrow>
      }
      title={
        <>
          Today’s fit. <em>Picked from your wardrobe.</em>
        </>
      }
    />
  );

  if (wardrobe === undefined || !profile || day === undefined) return <div className="min-h-dvh" aria-busy="true" />;

  if (!fit) {
    return (
      <>
        {header}
        <EmptyState
          index="No. 01"
          title="Your first fit is three photos away."
          body="Add a top, a bottom and a pair of shoes. Matched puts them together every morning and tells you why they work."
          actions={
            <>
              <ButtonLink href="/add" size="lg">
                <Icon name="plus" />
                Add a piece
              </ButtonLink>
              {!wardrobe.length ? (
                <Button
                  size="lg"
                  variant="secondary"
                  disabled={loadingSample}
                  onClick={async () => {
                    setLoadingSample(true);
                    await loadSampleWardrobe();
                    setLoadingSample(false);
                  }}
                >
                  {loadingSample ? 'Hanging it up…' : 'Use the sample wardrobe'}
                </Button>
              ) : null}
            </>
          }
        />
      </>
    );
  }

  const key = outfitKey(fit.items);
  const worn = !!day.wornItemIds?.length;
  const canAvatar = avatarSupports(fit.items);
  const mode = canAvatar ? view : 'flatlay';

  return (
    <>
      {header}
      <div className="grid gap-8 pb-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-12">
        <div className="relative h-[56svh] overflow-hidden rounded-md bg-studio lg:sticky lg:top-8 lg:h-[76dvh]">
          <div className="absolute inset-0 px-6 pt-6 pb-3">
            {mode === 'avatar' ? (
              <Avatar config={profile.avatar} heightCm={profile.heightCm} outfit={fit.items} />
            ) : (
              <div className="mx-auto h-full max-w-xs">
                <FlatLay pieces={fit.items.map((i) => ({ item: i, src: imageUrl(i) }))} className="h-full bg-transparent" />
              </div>
            )}
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
          <div className="absolute bottom-3 left-3 rounded-pill bg-paper p-1 shadow-lift">
            <ScoreRing key={key} score={fit.result.score} size="sm" />
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
            transition={spring.gentle}
            className="flex flex-col gap-7"
          >
            <Eyebrow tone={fit.result.verdict === 'matched' ? 'accent' : 'muted'}>
              <span>{VERDICT_LABEL[fit.result.verdict]}</span>
              <span>Score {fit.result.score}</span>
              {worn ? <span>Worn today</span> : null}
            </Eyebrow>
            <ul className="grid gap-3 sm:grid-cols-2">
              {fit.items.map((i) => (
                <Piece key={i.id} item={i} />
              ))}
            </ul>
            <ReasonList reasons={fit.result.reasons} delay={0.15} />
            <div className="flex flex-wrap gap-3">
              {worn ? (
                <Button size="lg" disabled>
                  <Icon name="check" />
                  Worn today
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    onClick={async () => {
                      haptic(HAPTICS.snap);
                      await wearToday(fit.items, date);
                    }}
                  >
                    <Icon name="check" />
                    Wear this
                  </Button>
                  <Button size="lg" variant="secondary" onClick={() => shuffleToday(date)}>
                    <Icon name="shuffle" />
                    Shuffle
                  </Button>
                </>
              )}
              <ButtonLink href={`/match?items=${fit.items.map((i) => i.id).join(',')}`} size="lg" variant="ghost">
                Open in Match
              </ButtonLink>
            </div>
            {worn ? (
              <p className="text-caption text-ink-muted">These pieces rest for a few days, so tomorrow brings something new.</p>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
