import { cx } from '@/lib/cx';

/**
 * A garment color dot. The color name is always shown or announced as text,
 * never conveyed by color alone.
 */
export function Swatch({
  hex,
  name,
  showName = false,
  className,
}: {
  hex: string;
  name: string;
  showName?: boolean;
  className?: string;
}) {
  return (
    // relative: contains the sr-only name, which would otherwise escape scrolling rows and widen the page.
    <span className={cx('relative inline-flex items-center gap-1.5', className)}>
      <span
        aria-hidden
        className="size-swatch shrink-0 rounded-pill border border-rule-strong"
        style={{ backgroundColor: hex }}
      />
      <span className={cx('text-caption capitalize', !showName && 'sr-only')}>{name}</span>
    </span>
  );
}
