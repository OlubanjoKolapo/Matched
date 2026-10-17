import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cx } from '@/lib/cx';
import { Icon, type IconName } from './Icon';

type IconButtonVariant = 'ghost' | 'outline' | 'solid';
type IconButtonSize = 'sm' | 'md';

const base =
  'inline-grid place-items-center rounded-pill shrink-0 ' +
  'transition-[background-color,color,border-color,transform] duration-(--duration-fast) ease-standard ' +
  'active:scale-(--scale-press) disabled:pointer-events-none disabled:opacity-(--opacity-disabled)';

const variants: Record<IconButtonVariant, string> = {
  ghost: 'text-ink hover:bg-paper-sunken',
  outline: 'border border-rule-strong text-ink hover:border-ink',
  solid: 'bg-ink text-on-ink hover:bg-ink/88',
};

const sizes: Record<IconButtonSize, string> = {
  sm: 'size-9',
  md: 'size-hit',
};

interface StyleProps {
  icon: IconName;
  /** Required: icon buttons have no visible text. */
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  type = 'button',
  ...props
}: StyleProps & Omit<ComponentProps<'button'>, 'children'>) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      <Icon name={icon} />
    </button>
  );
}

export function IconLink({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  ...props
}: StyleProps & Omit<ComponentProps<typeof Link>, 'children'>) {
  return (
    <Link aria-label={label} title={label} className={cx(base, variants[variant], sizes[size], className)} {...props}>
      <Icon name={icon} />
    </Link>
  );
}
