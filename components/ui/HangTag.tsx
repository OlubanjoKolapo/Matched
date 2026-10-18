import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

type HangTagTone = 'paper' | 'matched' | 'ink';

const tones: Record<HangTagTone, string> = {
  paper: 'bg-paper-raised text-ink',
  matched: 'bg-matched text-accent-ink',
  ink: 'bg-ink text-on-ink',
};

/** Garment hang-tag label: "Matched", "New", "Most versatile". */
export function HangTag({
  tone = 'paper',
  className,
  children,
}: {
  tone?: HangTagTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        'shape-hang-tag caps inline-flex h-6 items-center gap-1.5 pr-2.5 pl-3.5 whitespace-nowrap drop-shadow-garment',
        tones[tone],
        className,
      )}
    >
      <span aria-hidden className="size-1 rounded-pill bg-paper-sunken" />
      {children}
    </span>
  );
}
