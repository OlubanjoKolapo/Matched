'use client';

import { useMemo } from 'react';
import { Avatar } from '@/components/avatar/Avatar';
import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Heading';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { cx } from '@/lib/cx';
import { lookItems, type Lesson } from '@/lib/lessons';
import { heightBandFor } from '@/rules/tuning';
import type { Profile, ReasonKind } from '@/lib/types';

const KIND_LABEL: Record<ReasonKind, string> = {
  proportion: 'Proportion',
  shoes: 'Shoes',
  color: 'Color',
  formality: 'Formality',
};

const GOAL_LABEL: Record<string, string> = {
  taller: 'look taller',
  broader: 'look broader',
  leaner: 'look leaner',
  'put-together': 'look put-together',
  match: 'make it match',
};

/** Why this lesson is in your feed: your height band first, then your goals. */
export function lessonAudience(lesson: Lesson, profile: Pick<Profile, 'track' | 'heightCm' | 'goals'>): string | undefined {
  const band = heightBandFor(profile.track, profile.heightCm);
  if (band !== 'average' && lesson.bands.includes(band)) return band === 'shorter' ? 'For your height' : 'For a tall frame';
  const goal = lesson.goals.find((g) => profile.goals.includes(g));
  return goal ? `To ${GOAL_LABEL[goal]}` : undefined;
}

/** The lesson's look on your own mannequin. */
export function LessonFigure({
  lesson,
  profile,
  detail = 'full',
  className,
}: {
  lesson: Lesson;
  profile: Pick<Profile, 'avatar' | 'heightCm' | 'track'>;
  detail?: 'full' | 'lite';
  className?: string;
}) {
  const outfit = useMemo(() => lookItems(lesson, profile.track), [lesson, profile.track]);
  return (
    <Avatar
      config={profile.avatar}
      heightCm={profile.heightCm}
      outfit={outfit}
      idle={false}
      detail={detail}
      className={className}
      label={`Example: ${lesson.title}`}
    />
  );
}

export interface TryIt {
  href?: string;
  /** Shown instead of the button when nothing owned shows the rule. */
  hint?: string;
}

/** One swipeable lesson: illustration, the rule, why, and "Try it with your clothes". */
export function LessonCard({
  lesson,
  index,
  total,
  profile,
  read,
  showFigure,
  tryIt,
  onTry,
}: {
  lesson: Lesson;
  index: number;
  total: number;
  profile: Profile;
  read: boolean;
  /** Only cards near the visible one draw the mannequin. */
  showFigure: boolean;
  tryIt?: TryIt;
  onTry?: () => void;
}) {
  const audience = lessonAudience(lesson, profile);
  const folio = String(index + 1).padStart(2, '0');

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}: ${lesson.title}`}
      className="grid w-full shrink-0 snap-center snap-always content-start gap-6 px-gutter lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-12"
    >
      <div className="relative h-stage overflow-hidden rounded-md bg-studio lg:h-[68dvh]">
        <div className="absolute inset-0 px-8 pt-6 pb-3">
          {showFigure ? <LessonFigure lesson={lesson} profile={profile} /> : null}
        </div>
        <span className="caps absolute top-3 left-3 rounded-pill bg-paper/80 px-2.5 py-1 text-ink-muted backdrop-blur-sm">
          The look
        </span>
        {/* Over the figure, not in the text: marking a lesson read must not move anything. */}
        {read ? (
          <span className="caps absolute top-3 right-3 inline-flex items-center gap-1 rounded-pill bg-paper/80 px-2.5 py-1 text-ink-muted backdrop-blur-sm">
            <Icon name="check" className="size-3.5" />
            Read
          </span>
        ) : null}
      </div>

      <div className="flex max-w-prose flex-col gap-5">
        <Eyebrow>
          <span className="numerals">No. {folio}</span>
          <span>{KIND_LABEL[lesson.kind]}</span>
          {audience ? <span className="text-accent">{audience}</span> : null}
        </Eyebrow>
        <Heading as="h2" size="subhead">
          {lesson.title}
        </Heading>
        <p className="font-display text-title font-heading tracking-tight text-ink">{lesson.rule}</p>
        <Text tone="muted">{lesson.body}</Text>
        <div className={cx('flex flex-col gap-2 pt-1')}>
          {tryIt?.href ? (
            <ButtonLink href={tryIt.href} size="lg" onClick={onTry} className="self-start">
              Try it with your clothes
              <Icon name="arrow-right" />
            </ButtonLink>
          ) : tryIt?.hint ? (
            <Text variant="caption" tone="muted">
              {tryIt.hint}
            </Text>
          ) : null}
        </div>
      </div>
    </div>
  );
}
