import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { Heading } from './Heading';
import { Text } from './Text';

/** Masthead for a screen: small-caps eyebrow, display title, optional lede and actions. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cx('flex flex-col gap-6 pt-8 pb-8 lg:flex-row lg:items-end lg:justify-between lg:pt-section', className)}>
      <div className="flex max-w-prose flex-col gap-4">
        {eyebrow}
        <Heading as="h1" size="headline">
          {title}
        </Heading>
        {lede ? (
          <Text variant="lead" tone="muted">
            {lede}
          </Text>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}
