'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { LessonFigure, lessonAudience } from '@/components/learn/LessonCard';
import { StreakBadge } from '@/components/learn/StreakBadge';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Heading';
import { Icon } from '@/components/ui/Icon';
import { Swatch } from '@/components/ui/Swatch';
import { Text } from '@/components/ui/Text';
import { lessonOfTheDay } from '@/lib/lessons';
import { dayKey } from '@/lib/outfit/today';
import { familyHex } from '@/lib/rules/color';
import { COLOR_FAMILIES } from '@/rules/colors';
import type { Item, Profile } from '@/lib/types';
import { biggestGap, gapPhrase } from '@/lib/wardrobe/gaps';

const linkStyle =
  'inline-flex items-center gap-1.5 self-start text-body font-semibold text-ink underline decoration-rule-strong underline-offset-4 transition-colors hover:decoration-ink';

/** Below today's fit: the lesson of the day, the streak, and the one piece worth adding. */
export function TodayJournal({ profile, wardrobe }: { profile: Profile; wardrobe: Item[] }) {
  const [today] = useState(() => dayKey());
  const lesson = useMemo(() => lessonOfTheDay(profile, today), [profile, today]);
  const rules = useMemo(
    () => ({ track: profile.track, goals: profile.goals, heightCm: profile.heightCm }),
    [profile.track, profile.goals, profile.heightCm],
  );
  const gap = useMemo(() => biggestGap(wardrobe, rules), [wardrobe, rules]);

  if (!lesson && !gap) return null;
  const audience = lesson ? lessonAudience(lesson, profile) : undefined;

  return (
    <section aria-label="From your style journal" className="grid gap-4 border-t border-rule pt-8 pb-10 lg:grid-cols-2 lg:gap-6">
      {lesson ? (
        <article className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-5 rounded-sm border border-rule bg-paper-raised p-4 lg:p-5">
          <div className="relative h-40 overflow-hidden rounded-sm bg-studio">
            <div className="absolute inset-0 px-2 pt-3 pb-1">
              <LessonFigure lesson={lesson} profile={profile} detail="lite" />
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <Eyebrow>
              <span>Lesson of the day</span>
              {audience ? <span className="text-accent">{audience}</span> : null}
            </Eyebrow>
            <Heading as="h2" size="title">
              {lesson.title}
            </Heading>
            <Text variant="caption" tone="muted">
              {lesson.rule}
            </Text>
            <Link href={`/learn?lesson=${lesson.id}`} className={linkStyle}>
              Read the lesson
              <Icon name="arrow-right" className="size-4" />
            </Link>
            <StreakBadge streak={profile.streak} today={today} className="mt-auto pt-1" />
          </div>
        </article>
      ) : null}

      {gap ? (
        <article className="flex flex-col gap-4 rounded-sm bg-paper-sunken p-5 lg:p-6">
          <Eyebrow>
            <span>Gap finder</span>
            <span>One piece away</span>
          </Eyebrow>
          <Heading as="h2" size="title">
            {gapPhrase(gap.candidate)} would unlock{' '}
            <span className="numerals text-accent">{gap.unlocks}</span> new {gap.unlocks === 1 ? 'outfit' : 'outfits'}.
          </Heading>
          <Swatch
            hex={familyHex(gap.candidate.piece.color)}
            name={COLOR_FAMILIES[gap.candidate.piece.color].label}
            showName
            className="text-ink-muted"
          />
          <Text variant="caption" tone="muted">
            Just a suggestion. Matched never links to shops; any brand, any price, secondhand all count.
          </Text>
          <Link href="/wardrobe/stats" className={`${linkStyle} mt-auto`}>
            Your wardrobe in numbers
            <Icon name="arrow-right" className="size-4" />
          </Link>
        </article>
      ) : null}
    </section>
  );
}
