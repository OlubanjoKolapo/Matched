'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';
import { scale, spring } from '@/lib/motion';

const MotionLink = motion.create(Link);

/** Floating "+" that opens Add item from anywhere in the app. */
export function AddButton() {
  const pathname = usePathname();
  if (pathname.startsWith('/add')) return null;

  return (
    <MotionLink
      href="/add"
      aria-label="Add a piece"
      title="Add a piece"
      whileHover="hover"
      whileTap={{ scale: scale.tap }}
      transition={spring.pop}
      className={cx(
        'fixed right-gutter z-(--z-fab) grid size-fab place-items-center rounded-pill bg-ink text-on-ink shadow-float',
        'bottom-[calc(var(--spacing-tabbar)+var(--spacing-gutter)+env(safe-area-inset-bottom))] lg:bottom-gutter',
      )}
    >
      <motion.span variants={{ hover: { rotate: 90 } }} transition={spring.pop} className="grid place-items-center">
        <Icon name="plus" className="size-6" />
      </motion.span>
    </MotionLink>
  );
}
