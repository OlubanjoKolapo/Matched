import Link from 'next/link';
import { cx } from '@/lib/cx';

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cx('font-display text-title tracking-tight text-ink', className)} aria-label="Matched, home">
      Matched<span className="text-accent">.</span>
    </Link>
  );
}
