'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { ItemImage } from '@/components/wardrobe/ItemImage';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { cx } from '@/lib/cx';
import { haptic } from '@/lib/haptics';
import { spring } from '@/lib/motion';
import { outfitsFromOwned } from '@/lib/outfit/own';
import { slotOf, slotsFromItems, SLOT_KEYS, SLOT_LABEL } from '@/lib/outfit/slots';
import type { RulesProfile } from '@/lib/rules';
import type { Item } from '@/lib/types';
import { OutfitCard } from './OutfitCard';

/** "I own…": tick a few pieces and see every outfit that works with them, ranked. */
export function OwnMode({ wardrobe, rules, onOpen }: { wardrobe: Item[]; rules: RulesProfile; onOpen: (slots: ReturnType<typeof slotsFromItems>) => void }) {
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const selected = useMemo(() => wardrobe.filter((i) => chosen.has(i.id)), [wardrobe, chosen]);
  const outfits = useMemo(() => outfitsFromOwned(selected, wardrobe, rules), [selected, wardrobe, rules]);

  function toggle(id: string) {
    haptic();
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <section aria-labelledby="own-pick" className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="own-pick" className="font-display font-heading text-title tracking-tight">
              What are you working with?
            </h2>
            <Text variant="caption" tone="muted">
              Tick a few pieces. Missing shoes or bottoms come from the rest of your wardrobe.
            </Text>
          </div>
          {chosen.size ? (
            <Button variant="ghost" size="sm" onClick={() => setChosen(new Set())}>
              Clear
            </Button>
          ) : null}
        </div>
        {SLOT_KEYS.map((slot) => {
          const items = wardrobe.filter((i) => slotOf(i) === slot);
          if (!items.length) return null;
          return (
            <div key={slot} className="flex flex-col gap-2">
              <p className="caps text-ink-muted">{SLOT_LABEL[slot]}</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {items.map((item) => {
                  const on = chosen.has(item.id);
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(item.id)}
                      whileTap={{ scale: 0.95 }}
                      transition={spring.pop}
                      className={cx(
                        'relative flex flex-col gap-1 rounded-sm p-2 text-left ring-1 transition-[box-shadow,background-color] duration-(--duration-fast)',
                        on ? 'bg-paper-raised ring-2 ring-ink' : 'ring-rule hover:ring-ink-muted',
                      )}
                    >
                      <span className="block aspect-square w-full">
                        <ItemImage item={item} shadow={false} />
                      </span>
                      <span className="line-clamp-2 text-micro font-medium text-ink">{item.name ?? item.subtype}</span>
                      <span
                        aria-hidden
                        className={cx(
                          'absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-pill border transition-colors',
                          on ? 'border-ink bg-ink text-on-ink' : 'border-rule-strong bg-paper',
                        )}
                      >
                        {on ? <Icon name="check" className="size-3.5" /> : null}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <section aria-labelledby="own-results" aria-live="polite" className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">
        <h2 id="own-results" className="caps text-ink-muted">
          {chosen.size ? `${outfits.length} ${outfits.length === 1 ? 'outfit works' : 'outfits work'}` : 'Outfits'}
        </h2>
        {!chosen.size ? (
          <Text tone="muted">Your outfits appear here, best first.</Text>
        ) : !outfits.length ? (
          <Text tone="muted">Nothing works with just these yet. Try adding a different bottom or shoes.</Text>
        ) : (
          <ul className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {outfits.map((o) => (
                <motion.li
                  key={o.items.map((i) => i.id).join('+')}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={spring.gentle}
                >
                  <OutfitCard
                    items={o.items}
                    score={o.result.score}
                    reason={o.result.reasons[0]?.text}
                    onClick={() => onOpen(slotsFromItems(o.items))}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </section>
    </div>
  );
}
