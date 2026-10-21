import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { Hairline } from './Hairline';
import { Heading } from './Heading';
import { Text } from './Text';

/**
 * Editorial empty state: a numbered aside, a display line, a short
 * explanation and one or two actions.
 */
export function EmptyState({
  index,
  title,
  body,
  actions,
  className,
}: {
  /** Small folio label, e.g. "No. 01". */
  index?: string;
  title: ReactNode;
  body?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx('flex flex-col gap-6', className)}>
      <Hairline />
      <div className="grid gap-6 lg:grid-cols-12">
        {index ? <p className="caps text-ink-muted lg:col-span-2">{index}</p> : null}
        <div className={cx('flex flex-col gap-5', index ? 'lg:col-span-7' : 'lg:col-span-8')}>
          <Heading size="subhead">
            {title}
          </Heading>
          {body ? (
            <Text variant="lead" tone="muted" className="max-w-prose">
              {body}
            </Text>
          ) : null}
          {actions ? <div className="flex flex-wrap gap-3 pt-2">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}
