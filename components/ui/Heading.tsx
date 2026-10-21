import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

export type HeadingSize = 'display' | 'headline' | 'subhead' | 'title';

const sizes: Record<HeadingSize, string> = {
  display: 'text-display tracking-display',
  headline: 'text-headline tracking-display',
  subhead: 'text-subhead tracking-tight',
  title: 'text-title tracking-tight',
};

/**
 * Display heading. Wrap words in <em> for the two-tone emphasis: the
 * emphasised part drops to a softer ink, the way premium product pages do.
 */
export function Heading({
  as: Tag = 'h2',
  size = 'headline',
  className,
  children,
}: {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p';
  size?: HeadingSize;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={cx('font-display font-heading text-ink [&_em]:text-ink-subtle [&_em]:not-italic', sizes[size], className)}>{children}</Tag>
  );
}
