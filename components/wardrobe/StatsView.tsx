'use client';

import { useMemo, type ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Heading';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { Swatch } from '@/components/ui/Swatch';
import { Text } from '@/components/ui/Text';
import { cx } from '@/lib/cx';
import { useProfile, useWardrobe } from '@/lib/hooks/data';
import { familyHex } from '@/lib/rules/color';
import { COLOR_FAMILIES } from '@/rules/colors';
import type { Category, Item } from '@/lib/types';
import { findGaps, gapPhrase } from '@/lib/wardrobe/gaps';
import { wardrobeStats } from '@/lib/wardrobe/stats';
import { ItemImage } from './ItemImage';

const CATEGORY_LABEL: Record<Category, string> = {
  top: 'Tops',
  bottom: 'Bottoms',
  onepiece: 'Dresses & one-pieces',
  outerwear: 'Layers',
  shoes: 'Shoes',
  accessory: 'Accessories',
};

function pct(part: number, whole: number): string {
  return whole ? `${Math.round((part / whole) * 100)}%` : '0%';
}

function StatTile({ value, label, note, accent }: { value: number; label: string; note?: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-2 border-t border-rule pt-4">
      <p className={cx('numerals font-display text-numeral font-heading tracking-display', accent ? 'text-accent' : 'text-ink')}>
        {value.toLocaleString()}
      </p>
      <p className="caps text-ink-muted">{label}</p>
      {note ? <Text variant="caption" tone="subtle">{note}</Text> : null}
    </div>
  );
}

interface Segment {
  key: string;
  label: string;
  value: number;
  /** A token class or an inline color. */
  className?: string;
  color?: string;
}

/**
 * A single stacked bar with a 2px paper gap between segments and a legend
 * underneath that doubles as the table view. Identity is never color alone.
 */
function StackedBar({ segments, total, label }: { segments: Segment[]; total: number; label: string }) {
  const shown = segments.filter((s) => s.value > 0);
  return (
    <figure className="flex flex-col gap-4">
      <div role="img" aria-label={`${label}: ${shown.map((s) => `${s.label} ${s.value}`).join(', ')}`} className="flex h-3 w-full gap-0.5">
        {shown.map((s, i) => (
          <span
            key={s.key}
            title={`${s.label}: ${s.value} (${pct(s.value, total)})`}
            className={cx(
              'h-full min-w-1 shadow-[inset_0_0_0_1px_var(--color-rule)]',
              i === 0 && 'rounded-l-xs',
              i === shown.length - 1 && 'rounded-r-xs',
              s.className,
            )}
            style={{ flexGrow: s.value, flexBasis: 0, backgroundColor: s.color }}
          />
        ))}
      </div>
      <figcaption>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
          {shown.map((s) => (
            <li key={s.key} className="flex items-baseline justify-between gap-3 border-b border-rule pb-2 text-body">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden
                  className={cx('size-2.5 shrink-0 rounded-pill shadow-[inset_0_0_0_1px_var(--color-rule-strong)]', s.className)}
                  style={{ backgroundColor: s.color }}
                />
                <span className="truncate capitalize">{s.label}</span>
              </span>
              <span className="numerals text-ink-muted">{s.value}</span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

function Section({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 border-t border-rule pt-8">
      <div className="flex flex-col gap-2">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Heading as="h2" size="title">
          {title}
        </Heading>
      </div>
      {children}
    </section>
  );
}

function Stats({ wardrobe, rules }: { wardrobe: Item[]; rules: Parameters<typeof wardrobeStats>[1] }) {
  const stats = useMemo(() => wardrobeStats(wardrobe, rules), [wardrobe, rules]);
  const gaps = useMemo(() => findGaps(wardrobe, rules).slice(0, 3), [wardrobe, rules]);
  const possible = stats.verdicts.matched + stats.verdicts.works;

  return (
    <div className="flex flex-col gap-12 pb-12">
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        <StatTile value={possible} label="Possible outfits" note="Score 55 or more" accent />
        <StatTile value={stats.verdicts.matched} label="Matched" note="Score 75 or more" />
        <StatTile value={stats.combinations} label="Combinations" note="Every top, bottom, shoe and layer" />
        <StatTile value={stats.pieces} label="Pieces" />
      </div>

      {stats.combinations ? (
        <Section title="How your combinations score" eyebrow="Verdicts">
          <StackedBar
            label="Verdicts"
            total={stats.combinations}
            segments={[
              { key: 'matched', label: 'Matched', value: stats.verdicts.matched, className: 'bg-matched' },
              { key: 'works', label: 'Works', value: stats.verdicts.works, className: 'bg-works' },
              { key: 'rethink', label: 'Rethink', value: stats.verdicts.rethink, className: 'bg-rethink' },
            ]}
          />
        </Section>
      ) : null}

      {stats.mostVersatile ? (
        <Section title="Your hardest-working piece" eyebrow="Most versatile">
          <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-5">
            <span className="block aspect-[4/5] rounded-sm bg-studio p-2">
              <ItemImage item={stats.mostVersatile.item} shadow={false} />
            </span>
            <div className="flex flex-col gap-2">
              <p className="text-lead font-semibold">{stats.mostVersatile.item.name ?? stats.mostVersatile.item.subtype}</p>
              <Text tone="muted">
                In <span className="numerals font-semibold text-ink">{stats.mostVersatile.outfits}</span> of your{' '}
                <span className="numerals">{possible}</span> possible outfits ({pct(stats.mostVersatile.outfits, possible)}).
              </Text>
              <ButtonLink href={`/match?items=${stats.mostVersatile.item.id}`} variant="secondary" size="sm" className="self-start">
                Build around it
              </ButtonLink>
            </div>
          </div>
        </Section>
      ) : null}

      <Section title="Your colors" eyebrow="Main color of each piece">
        <StackedBar
          label="Colors"
          total={stats.pieces}
          segments={stats.colors.map((c) => ({ key: c.family, label: c.label, value: c.count, color: c.hex }))}
        />
      </Section>

      <Section title="What's on the rail" eyebrow="By category">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
          {(Object.keys(CATEGORY_LABEL) as Category[])
            .filter((c) => stats.byCategory[c] > 0)
            .map((c) => (
              <li key={c} className="flex items-baseline justify-between gap-3 border-b border-rule pb-2">
                <span>{CATEGORY_LABEL[c]}</span>
                <span className="numerals text-ink-muted">{stats.byCategory[c]}</span>
              </li>
            ))}
        </ul>
      </Section>

      {gaps.length ? (
        <Section title="What would unlock the most" eyebrow="Gap finder">
          <ol className="flex flex-col">
            {gaps.map((gap, i) => (
              <li key={gap.candidate.id} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-rule py-3">
                <span className="caps numerals text-ink-subtle">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-body font-medium">{gapPhrase(gap.candidate)}</span>
                  <Swatch
                    hex={familyHex(gap.candidate.piece.color)}
                    name={COLOR_FAMILIES[gap.candidate.piece.color].label}
                    showName
                    className="text-ink-muted"
                  />
                </span>
                <span className="text-right">
                  <span className="numerals font-display text-title font-heading text-accent">+{gap.unlocks}</span>
                  <span className="caps block text-ink-muted">outfits</span>
                </span>
              </li>
            ))}
          </ol>
          <Text variant="caption" tone="muted">
            Suggestions only. Matched never links to shops.
          </Text>
        </Section>
      ) : null}
    </div>
  );
}

export function StatsView() {
  const wardrobe = useWardrobe();
  const profile = useProfile();
  const rules = useMemo(
    () => (profile ? { track: profile.track, goals: profile.goals, heightCm: profile.heightCm } : undefined),
    [profile],
  );

  const header = (
    <PageHeader
      eyebrow={
        <Eyebrow>
          <span>Your wardrobe</span>
          <span>In numbers</span>
        </Eyebrow>
      }
      title={
        <>
          What you own, <em>and what it can do.</em>
        </>
      }
      actions={
        <ButtonLink href="/wardrobe" variant="ghost">
          <Icon name="arrow-left" />
          Back to the rail
        </ButtonLink>
      }
    />
  );

  if (!wardrobe || !rules) return <div className="min-h-dvh" aria-busy="true">{header}</div>;

  if (!wardrobe.length) {
    return (
      <>
        {header}
        <EmptyState
          index="No. 05"
          title="Nothing to count yet."
          body="Add a few pieces and this page fills with every outfit they make, your most versatile piece and the colors you lean on."
          actions={
            <ButtonLink href="/add" size="lg">
              <Icon name="plus" />
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
      <Stats wardrobe={wardrobe} rules={rules} />
    </>
  );
}
