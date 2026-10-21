'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { IconButton } from '@/components/ui/IconButton';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useProfile, useWardrobe } from '@/lib/hooks/data';
import { useHydrated, useSearchParam } from '@/lib/hooks/useSearchFlag';
import { lessonsFor, tryItWith, type Lesson } from '@/lib/lessons';
import { markLessonRead } from '@/lib/lessons/actions';
import { dayKey } from '@/lib/outfit/today';
import type { Item, Profile } from '@/lib/types';
import { LessonCard, type TryIt } from './LessonCard';
import { StreakBadge } from './StreakBadge';

/** A lesson counts as read once it has been on screen this long. */
const READ_AFTER_MS = 1600;

function tryItFor(lesson: Lesson, wardrobe: Item[], profile: Profile): TryIt {
  if (!wardrobe.length) return { hint: 'Add a few pieces and this lesson will pick an outfit from your own clothes.' };
  const items = tryItWith(lesson, wardrobe, { track: profile.track, goals: profile.goals, heightCm: profile.heightCm });
  if (!items) return { hint: 'Nothing in your wardrobe shows this one yet. Keep it in mind for your next piece.' };
  return { href: `/match?items=${items.map((i) => i.id).join(',')}` };
}

function Deck({ lessons, profile, wardrobe, start }: { lessons: Lesson[]; profile: Profile; wardrobe: Item[]; start: number }) {
  const [active, setActive] = useState(start);
  const scroller = useRef<HTMLDivElement>(null);
  const [today] = useState(() => dayKey());
  const lesson = lessons[active];

  // Open on the requested or next unread lesson.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = start * el.clientWidth;
  }, [start]);

  // Reading a lesson: it has to stay on screen for a moment.
  useEffect(() => {
    if (!lesson) return;
    const timer = window.setTimeout(() => void markLessonRead(lesson.id, today), READ_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [lesson, today]);

  const tryIt = useMemo(() => (lesson ? tryItFor(lesson, wardrobe, profile) : undefined), [lesson, wardrobe, profile]);

  function go(index: number) {
    const el = scroller.current;
    if (!el) return;
    const next = Math.max(0, Math.min(lessons.length - 1, index));
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  }

  const readCount = lessons.filter((l) => profile.lessonsRead.includes(l.id)).length;

  return (
    <section className="flex flex-col gap-6 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <StreakBadge streak={profile.streak} today={today} />
        <p className="caps text-ink-muted">
          <span className="numerals">{readCount}</span> of <span className="numerals">{lessons.length}</span> read
        </p>
      </div>

      <div className="-mx-gutter">
        <div
          ref={scroller}
          role="region"
          aria-roledescription="carousel"
          aria-label="Lessons. Swipe or use the arrows."
          tabIndex={0}
          onScroll={(e) => {
            const el = e.currentTarget;
            const index = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
            if (index !== active) setActive(index);
          }}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] focus-visible:outline-offset-[-2px] [&::-webkit-scrollbar]:hidden"
        >
          {lessons.map((l, i) => (
            <LessonCard
              key={l.id}
              lesson={l}
              index={i}
              total={lessons.length}
              profile={profile}
              read={profile.lessonsRead.includes(l.id)}
              showFigure={Math.abs(i - active) <= 1}
              tryIt={i === active ? tryIt : undefined}
              onTry={() => void markLessonRead(l.id, today)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <IconButton icon="arrow-left" label="Previous lesson" variant="outline" onClick={() => go(active - 1)} disabled={active === 0} />
        <div className="flex flex-1 flex-col gap-2">
          <ProgressBar value={(active + 1) / lessons.length} label="Lesson position" />
          <p className="caps numerals text-ink-muted" aria-live="polite">
            {String(active + 1).padStart(2, '0')} / {String(lessons.length).padStart(2, '0')}
          </p>
        </div>
        <IconButton
          icon="arrow-right"
          label="Next lesson"
          variant="outline"
          onClick={() => go(active + 1)}
          disabled={active === lessons.length - 1}
        />
      </div>
    </section>
  );
}

export function LearnView() {
  const profile = useProfile();
  const wardrobe = useWardrobe();
  const requested = useSearchParam('lesson');
  const hydrated = useHydrated();

  const lessons = useMemo(
    () => (profile ? lessonsFor({ track: profile.track, goals: profile.goals, heightCm: profile.heightCm }) : []),
    [profile],
  );

  // Fixed once per visit, so reading a lesson never jumps the deck.
  const [start, setStart] = useState<number>();
  if (start === undefined && hydrated && profile && lessons.length) {
    const asked = requested ? lessons.findIndex((l) => l.id === requested) : -1;
    const unread = lessons.findIndex((l) => !profile.lessonsRead.includes(l.id));
    setStart(asked >= 0 ? asked : Math.max(0, unread));
  }

  const header = (
    <PageHeader
      eyebrow={
        <Eyebrow>
          <span>Learn</span>
          <span>{lessons.length ? `${lessons.length} lessons for you` : 'Style lessons'}</span>
        </Eyebrow>
      }
      title={
        <>
          The rules, <em>one at a time.</em>
        </>
      }
      lede="Short lessons on proportion, shoes, color and formality, picked for your height and goals. Each one ends with an outfit from your own wardrobe."
    />
  );

  if (!profile || !wardrobe || start === undefined) return <div className="min-h-dvh" aria-busy="true">{header}</div>;

  return (
    <>
      {header}
      <Deck lessons={lessons} profile={profile} wardrobe={wardrobe} start={start} />
      {!wardrobe.length ? (
        <ButtonLink href="/add" variant="secondary" className="mb-8">
          Add clothes to try lessons with
        </ButtonLink>
      ) : null}
    </>
  );
}
