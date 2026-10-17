'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';
import { spring } from '@/lib/motion';
import { isActive, NAV_ITEMS } from './nav';
import { ThemeToggle } from './ThemeToggle';
import { Wordmark } from './Wordmark';

/**
 * Primary navigation. Mobile: fixed bottom tab bar. Desktop (lg): a left rail
 * styled like a magazine contents page.
 */
export function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cx(
        'fixed inset-x-0 bottom-0 z-(--z-nav) border-t border-rule bg-paper pb-safe',
        'lg:inset-y-0 lg:right-auto lg:flex lg:w-rail lg:flex-col lg:border-t-0 lg:border-r lg:px-6 lg:pt-8 lg:pb-6',
      )}
    >
      <Wordmark className="mb-14 hidden lg:block" />
      <p className="caps mb-4 hidden text-ink-muted lg:block">Contents</p>

      <ul className="flex lg:flex-col lg:gap-1">
        {NAV_ITEMS.map((item, index) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1 lg:flex-none">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'group flex h-tabbar flex-col items-center justify-center gap-1 transition-colors duration-(--duration-fast) ease-standard',
                  'lg:h-auto lg:flex-row lg:items-baseline lg:justify-start lg:gap-3 lg:py-2',
                  active ? 'text-ink' : 'text-ink-muted hover:text-ink',
                )}
              >
                {/* Mobile: accent bar above the active icon. */}
                <span className="flex h-0.5 w-6 lg:hidden">
                  {active ? (
                    <motion.span layoutId="nav-indicator" transition={spring.settle} className="h-full w-full bg-accent" />
                  ) : null}
                </span>
                <Icon name={item.icon} className="lg:hidden" />
                <span className="caps lg:hidden">{item.label}</span>

                {/* Desktop: contents-page entry. */}
                <span className={cx('caps numerals hidden lg:inline', active ? 'text-accent' : 'text-ink-subtle')}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className={cx(
                    'hidden font-display text-title tracking-tight lg:inline',
                    active && 'italic',
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto hidden items-center justify-between border-t border-rule pt-4 lg:flex">
        <Link
          href="/settings"
          aria-current={isActive(pathname, '/settings') ? 'page' : undefined}
          className="caps text-ink-muted transition-colors duration-(--duration-fast) hover:text-ink aria-[current=page]:text-ink"
        >
          Settings
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  );
}
