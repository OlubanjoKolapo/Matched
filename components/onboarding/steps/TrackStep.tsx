'use client';

import { useRef, type KeyboardEvent } from 'react';
import { Avatar } from '@/components/avatar/Avatar';
import { Button } from '@/components/ui/Button';
import { HangTag } from '@/components/ui/HangTag';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';
import { haptic } from '@/lib/haptics';
import { TRACK_OPTIONS } from '@/lib/onboarding/content';
import { useOnboarding } from '@/lib/store/onboarding';
import type { AvatarConfig, Track } from '@/lib/types';
import { StepFrame } from '../StepFrame';

function Silhouette({ avatar, track }: { avatar: AvatarConfig; track: Track }) {
  const frames = track === 'both' ? (['menswear', 'womenswear'] as const) : [track];
  return (
    <span aria-hidden className="flex h-28 w-20 shrink-0 items-end justify-center">
      {frames.map((frame, i) => (
        <span key={frame} className={cx('h-full', frames.length > 1 ? 'w-1/2' : 'w-full', i > 0 && '-ml-2')}>
          <Avatar config={{ ...avatar, frame }} idle={false} label="" />
        </span>
      ))}
    </span>
  );
}

/** "What do you shop for?" Never asks about gender: this picks rule sets and the figure's cut. */
export function TrackStep({ label }: { label: string }) {
  const { draft, setTrack, next } = useOnboarding();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent, index: number) {
    const step = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const nextIndex = (index + step + TRACK_OPTIONS.length) % TRACK_OPTIONS.length;
    setTrack(TRACK_OPTIONS[nextIndex]!.value);
    refs.current[nextIndex]?.focus();
  }

  return (
    <StepFrame
      label={label}
      title={
        <>
          What do you <em>shop</em> for?
        </>
      }
      lede="This picks the style rules Matched uses. You can change it any time."
      footer={
        <Button size="lg" block onClick={next}>
          Continue
          <Icon name="arrow-right" />
        </Button>
      }
    >
      <div role="radiogroup" aria-label="What you shop for" className="flex flex-col gap-3">
        {TRACK_OPTIONS.map((option, index) => {
          const selected = draft.track === option.value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onKeyDown={(e) => onKeyDown(e, index)}
              onClick={() => {
                haptic();
                setTrack(option.value);
              }}
              className={cx(
                'flex items-center gap-4 rounded-sm border p-4 text-left transition-[border-color,background-color,box-shadow] duration-(--duration-fast) ease-standard',
                selected ? 'border-ink bg-paper-raised shadow-lift' : 'border-rule-strong hover:border-ink-muted',
              )}
            >
              <Silhouette avatar={draft.avatar} track={option.value} />
              <span className="flex flex-1 flex-col gap-1">
                <span className="flex flex-wrap items-center gap-3">
                  <span className="font-display text-title">{option.title}</span>
                  {option.early ? <HangTag>Early — rules growing</HangTag> : null}
                </span>
                <span className="text-caption text-ink-muted">{option.body}</span>
              </span>
              <span
                aria-hidden
                className={cx(
                  'grid size-6 shrink-0 place-items-center rounded-pill border transition-colors duration-(--duration-fast)',
                  selected ? 'border-ink bg-ink text-on-ink' : 'border-rule-strong',
                )}
              >
                {selected ? <Icon name="check" className="size-4" /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </StepFrame>
  );
}
