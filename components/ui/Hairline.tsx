import { cx } from '@/lib/cx';

/** Fine 1px rule, horizontal by default. Decorative. */
export function Hairline({
  orientation = 'horizontal',
  strong = false,
  className,
}: {
  orientation?: 'horizontal' | 'vertical';
  strong?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cx(
        'block shrink-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px self-stretch',
        strong ? 'bg-rule-strong' : 'bg-rule',
        className,
      )}
    />
  );
}
