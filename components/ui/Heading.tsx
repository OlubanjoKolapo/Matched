import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';

export type HeadingSize = 'display' | 'headline' | 'subhead' | 'title';

const sizes: Record<HeadingSize, string> = {
  display: 'text-display tracking-display',
  headline: 'text-headline tracking-display',
  subhead: 'text-subhead tracking-tight',
  title: 'text-title tracking-tight',
};

/** Display-serif heading. Wrap a word in <em> for the editorial italic. */
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
    <Tag className={cx('font-display font-normal text-ink [&_em]:italic', sizes[size], className)}>{children}</Tag>
  );
}
