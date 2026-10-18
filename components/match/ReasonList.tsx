'use client';

import { motion } from 'motion/react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';
import { ease } from '@/lib/motion';
import type { Reason, ReasonKind } from '@/lib/types';

const KIND_LABEL: Record<ReasonKind, string> = {
  proportion: 'Proportion',
  shoes: 'Shoes',
  color: 'Color',
  formality: 'Formality',
};

/** The 2–4 reasons behind a score, each tagged by kind and marked as a strength or a warning. */
export function ReasonList({ reasons, delay = 0, className }: { reasons: Reason[]; delay?: number; className?: string }) {
  return (
    <ul className={cx('flex flex-col', className)}>
      {reasons.map((reason, i) => (
        <motion.li
          key={reason.ruleId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + i * 0.09, duration: 0.4, ease: ease.emphasized }}
          className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-rule py-4 first:border-t-0 first:pt-0"
        >
          <span
            className={cx(
              'row-span-2 mt-0.5 grid size-6 place-items-center rounded-pill',
              reason.positive ? 'bg-accent-soft text-accent' : 'bg-rethink-soft text-rethink',
            )}
          >
            <Icon name={reason.positive ? 'check' : 'alert'} className="size-4" />
          </span>
          <span className={cx('caps', reason.positive ? 'text-ink-muted' : 'text-rethink')}>
            {KIND_LABEL[reason.kind]}
            <span className="sr-only">{reason.positive ? ', works' : ', warning'}</span>
          </span>
          <span className="text-body text-ink">{reason.text}</span>
        </motion.li>
      ))}
    </ul>
  );
}
