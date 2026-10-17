import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cx } from '@/lib/cx';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-sans font-semibold whitespace-nowrap select-none ' +
  'transition-[background-color,color,border-color,transform,opacity] duration-(--duration-fast) ease-standard ' +
  'active:scale-(--scale-press) disabled:pointer-events-none disabled:opacity-(--opacity-disabled) ' +
  'aria-disabled:pointer-events-none aria-disabled:opacity-(--opacity-disabled)';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-on-ink hover:bg-ink/88',
  accent: 'bg-accent text-accent-ink hover:bg-accent/90',
  secondary: 'border border-rule-strong text-ink hover:border-ink hover:bg-paper-sunken',
  ghost: 'text-ink hover:bg-paper-sunken',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-caption',
  md: 'h-hit px-5 text-body',
  lg: 'h-14 px-7 text-lead',
};

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  block = false,
}: { variant?: ButtonVariant; size?: ButtonSize; block?: boolean } = {}) {
  return cx(base, variants[variant], sizes[size], block && 'w-full');
}

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the container width. */
  block?: boolean;
}

export function Button({
  variant,
  size,
  block,
  className,
  type = 'button',
  ...props
}: StyleProps & ComponentProps<'button'>) {
  return <button type={type} className={cx(buttonStyles({ variant, size, block }), className)} {...props} />;
}

export function ButtonLink({ variant, size, block, className, ...props }: StyleProps & ComponentProps<typeof Link>) {
  return <Link className={cx(buttonStyles({ variant, size, block }), className)} {...props} />;
}
