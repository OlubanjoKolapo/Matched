import type { ReactNode } from 'react';
import { Heading } from '@/components/ui/Heading';
import { Text } from '@/components/ui/Text';
import { cx } from '@/lib/cx';

/**
 * Layout for one onboarding question: small-caps step label, serif question,
 * optional lede, the controls, and an action footer that sticks to the bottom
 * on phones.
 */
export function StepFrame({
  label,
  title,
  lede,
  children,
  footer,
  className,
}: {
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx('flex min-h-full flex-col', className)} aria-labelledby="step-title">
      <div className="flex flex-1 flex-col gap-6 px-gutter pt-6 pb-8 lg:px-12 lg:pt-12">
        <div className="flex flex-col gap-3">
          <p className="caps text-accent">{label}</p>
          <Heading as="h1" size="subhead" className="lg:text-headline">
            <span id="step-title">{title}</span>
          </Heading>
          {lede ? (
            <Text variant="lead" tone="muted" className="max-w-prose">
              {lede}
            </Text>
          ) : null}
        </div>
        {children}
      </div>
      <div className="sticky bottom-0 border-t border-rule bg-paper px-gutter pt-3 pb-[calc(var(--spacing-gutter)+env(safe-area-inset-bottom))] lg:static lg:border-t-0 lg:bg-transparent lg:px-12 lg:pb-12">
        {footer}
      </div>
    </section>
  );
}
