import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

type TextVariant = 'lead' | 'body' | 'caption';
type TextTone = 'ink' | 'muted' | 'subtle';

const variants: Record<TextVariant, string> = {
  lead: 'text-lead',
  body: 'text-body',
  caption: 'text-caption',
};

const tones: Record<TextTone, string> = {
  ink: 'text-ink',
  muted: 'text-ink-muted',
  subtle: 'text-ink-subtle',
};

export function Text({
  as: Tag = 'p',
  variant = 'body',
  tone = 'ink',
  className,
  children,
}: {
  as?: 'p' | 'span' | 'div';
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={cx(variants[variant], tones[tone], className)}>{children}</Tag>;
}
