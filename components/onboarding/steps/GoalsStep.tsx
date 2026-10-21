'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';
import { haptic } from '@/lib/haptics';
import { ease, scale, spring } from '@/lib/motion';
import { GOAL_OPTIONS } from '@/lib/onboarding/content';
import { useOnboarding } from '@/lib/store/onboarding';
import { StepFrame } from '../StepFrame';

export function GoalsStep({ label }: { label: string }) {
  const { draft, toggleGoal, next } = useOnboarding();

  return (
    <StepFrame
      label={label}
      title={
        <>
          What do you want your outfits to <em>do?</em>
        </>
      }
      lede="Pick any. The figure dresses for your latest pick."
      footer={
        <Button size="lg" block onClick={next}>
          {draft.goals.length ? 'Continue' : 'Continue without goals'}
          <Icon name="arrow-right" />
        </Button>
      }
    >
      <ul className="flex flex-col gap-2">
        {GOAL_OPTIONS.map((goal) => {
          const selected = draft.goals.includes(goal.value);
          return (
            <li key={goal.value}>
              <motion.button
                type="button"
                aria-pressed={selected}
                whileTap={{ scale: scale.tap }}
                transition={spring.pop}
                onClick={() => {
                  haptic();
                  toggleGoal(goal.value);
                }}
                className={cx(
                  'flex w-full flex-col gap-1 rounded-sm border px-4 py-3 text-left transition-[border-color,background-color] duration-(--duration-fast) ease-standard',
                  selected ? 'border-ink bg-paper-raised' : 'border-rule-strong hover:border-ink-muted',
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-display font-heading text-title tracking-tight">{goal.label}</span>
                  <span
                    aria-hidden
                    className={cx(
                      'grid size-6 shrink-0 place-items-center rounded-xs border transition-colors duration-(--duration-fast)',
                      selected ? 'border-ink bg-ink text-on-ink' : 'border-rule-strong',
                    )}
                  >
                    {selected ? <Icon name="check" className="size-4" /> : null}
                  </span>
                </span>
                <AnimatePresence initial={false}>
                  {selected ? (
                    <motion.span
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: ease.emphasized }}
                      className="block overflow-hidden text-caption text-ink-muted"
                    >
                      {goal.tip}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.button>
            </li>
          );
        })}
      </ul>
    </StepFrame>
  );
}
