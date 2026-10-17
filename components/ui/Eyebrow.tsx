import { Children, Fragment, type ReactNode } from 'react';
import { cx } from '@/lib/cx';

/**
 * Small-caps lookbook label. Each child is a segment, divided by a hairline:
 * <Eyebrow><span>Your wardrobe</span><span>24 pieces</span></Eyebrow>
 */
export function Eyebrow({
  as: Tag = 'p',
  tone = 'muted',
  className,
  children,
}: {
  as?: 'p' | 'span' | 'h2' | 'h3';
  tone?: 'muted' | 'ink' | 'accent';
  className?: string;
  children: ReactNode;
}) {
  const segments = Children.toArray(children);
  return (
    <Tag
      className={cx(
        'caps flex flex-wrap items-center gap-x-2.5',
        tone === 'muted' && 'text-ink-muted',
        tone === 'ink' && 'text-ink',
        tone === 'accent' && 'text-accent',
        className,
      )}
    >
      {segments.map((segment, i) => (
        <Fragment key={i}>
          {i > 0 ? <span aria-hidden className="h-3 w-px bg-rule-strong" /> : null}
          {segment}
        </Fragment>
      ))}
    </Tag>
  );
}
