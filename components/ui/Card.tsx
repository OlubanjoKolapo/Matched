import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

type CardTone = 'raised' | 'sunken' | 'ink';

const tones: Record<CardTone, string> = {
  raised: 'bg-paper-raised border border-rule',
  sunken: 'bg-paper-sunken',
  ink: 'bg-ink text-on-ink',
};

export function Card({
  as: Tag = 'div',
  tone = 'raised',
  interactive = false,
  className,
  children,
}: {
  as?: 'div' | 'article' | 'section' | 'li';
  tone?: CardTone;
  /** Lifts on hover; use when the whole card is a link target. */
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cx(
        'rounded-sm p-5 lg:p-6',
        tones[tone],
        interactive &&
          'transition-[box-shadow,transform] duration-(--duration-base) ease-emphasized hover:-translate-y-0.5 hover:shadow-lift',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
