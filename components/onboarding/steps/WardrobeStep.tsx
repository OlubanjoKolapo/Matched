'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { cx } from '@/lib/cx';
import { getDB } from '@/lib/db';
import { PRIVACY_LINE } from '@/lib/onboarding/content';
import { saveDraft } from '@/lib/onboarding/save';
import { loadSampleWardrobe } from '@/lib/sample/load';
import { sampleLook } from '@/lib/sample/looks';
import { SAMPLE_WARDROBE } from '@/lib/sample/wardrobe';
import { useOnboarding } from '@/lib/store/onboarding';
import { StepFrame } from '../StepFrame';

const PREVIEW = sampleLook(['sample-green-hoodie', 'sample-wide-jeans', 'sample-chunky-sneakers']);

function Choice({
  title,
  body,
  visual,
  onClick,
  busy,
  primary,
}: {
  title: string;
  body: string;
  visual: ReactNode;
  onClick: () => void;
  busy?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-busy={busy}
      className={cx(
        'group flex items-center gap-4 rounded-sm border p-4 text-left transition-[border-color,box-shadow,transform] duration-(--duration-base) ease-emphasized',
        'hover:-translate-y-0.5 hover:shadow-lift active:scale-(--scale-press) disabled:cursor-progress',
        primary ? 'border-ink bg-paper-raised' : 'border-rule-strong',
      )}
    >
      <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xs bg-paper-sunken">{visual}</span>
      <span className="flex flex-1 flex-col gap-1">
        <span className="font-display font-heading text-title tracking-tight">{busy ? 'Hanging it up…' : title}</span>
        <span className="text-caption text-ink-muted">{body}</span>
      </span>
      <Icon name="arrow-right" className="transition-transform duration-(--duration-fast) group-hover:translate-x-1" />
    </button>
  );
}

export function WardrobeStep({ label }: { label: string }) {
  const router = useRouter();
  const { draft, next } = useOnboarding();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function trySample() {
    setBusy(true);
    setError(null);
    try {
      await saveDraft(draft);
      if ((await getDB().items.count()) === 0) await loadSampleWardrobe();
      next();
    } catch {
      setError('The sample wardrobe didn’t load. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function snap() {
    await saveDraft(draft);
    router.push('/add?first=1');
  }

  async function later() {
    await saveDraft(draft);
    router.push('/');
  }

  return (
    <StepFrame
      label={label}
      title={
        <>
          Start your <em>wardrobe.</em>
        </>
      }
      lede="Three pieces is all it takes: a top, a bottom and a pair of shoes."
      footer={
        <button type="button" onClick={later} className="caps h-hit w-full text-ink-muted transition-colors hover:text-ink">
          I’ll do this later
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        <Choice
          primary
          busy={busy}
          onClick={trySample}
          title="Try a sample wardrobe"
          body={`${SAMPLE_WARDROBE.length} pieces, ready to match. Swap in your own any time.`}
          visual={
            <span className="relative block size-full">
              {PREVIEW.map((item, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={item.id}
                  src={item.image}
                  alt=""
                  className="absolute w-3/5 drop-shadow-garment"
                  style={{ left: `${4 + i * 18}%`, top: `${6 + i * 14}%`, transform: `rotate(${(i - 1) * 8}deg)` }}
                />
              ))}
            </span>
          }
        />
        <Choice
          onClick={snap}
          title="Add my clothes"
          body="Take photos, or upload from your library. A top, a bottom and shoes to start."
          visual={<Icon name="camera" className="size-9 text-ink-muted" />}
        />
        {error ? (
          <Text variant="caption" className="text-rethink" as="p">
            {error}
          </Text>
        ) : null}
        <p className="caps mt-3 flex items-center gap-2 text-ink-muted">
          <span aria-hidden className="size-1.5 rounded-pill bg-accent" />
          {PRIVACY_LINE}
        </p>
      </div>
    </StepFrame>
  );
}
