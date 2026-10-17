import { useId, type ComponentProps, type ReactNode } from 'react';
import { cx } from '@/lib/cx';

/** Editorial underline field with a small-caps label. */
export function TextField({
  label,
  hint,
  error,
  className,
  id,
  ...props
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
} & ComponentProps<'input'>) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const describedBy = error || hint ? hintId : undefined;

  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <label htmlFor={inputId} className="caps text-ink-muted">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(
          'h-hit w-full border-0 border-b bg-transparent px-0 text-lead text-ink placeholder:text-ink-subtle',
          'transition-colors duration-(--duration-fast) ease-standard',
          'focus-visible:border-ink focus-visible:outline-none',
          error ? 'border-rethink' : 'border-rule-strong hover:border-ink-muted',
        )}
        {...props}
      />
      {error || hint ? (
        <p id={hintId} className={cx('text-caption', error ? 'text-rethink' : 'text-ink-muted')}>
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}
