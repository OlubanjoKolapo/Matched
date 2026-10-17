'use client';

import { motion } from 'motion/react';
import { useId, useRef, type KeyboardEvent } from 'react';
import { cx } from '@/lib/cx';
import { spring } from '@/lib/motion';
import { Icon, type IconName } from './Icon';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

/** Single-choice toggle (Rail / Grid, cm / ft). Arrow keys move the selection. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  size = 'md',
  className,
}: {
  /** Accessible name for the group. */
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const indicatorId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent, index: number) {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    const option = options[next];
    if (!option) return;
    onChange(option.value);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx('inline-flex rounded-pill border border-rule-strong p-1', className)}
    >
      {options.map((option, index) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cx(
              'relative inline-flex items-center gap-1.5 rounded-pill font-semibold',
              'transition-colors duration-(--duration-fast) ease-standard',
              size === 'sm' ? 'h-7 px-3 text-micro' : 'h-8 px-4 text-caption',
              checked ? 'text-on-ink' : 'text-ink-muted hover:text-ink',
            )}
          >
            {checked ? (
              <motion.span
                layoutId={indicatorId}
                transition={spring.settle}
                aria-hidden
                className="absolute inset-0 rounded-pill bg-ink"
              />
            ) : null}
            {option.icon ? <Icon name={option.icon} className="relative size-4" /> : null}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
