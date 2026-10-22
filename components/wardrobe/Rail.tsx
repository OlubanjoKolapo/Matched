'use client';

import { animate, motion, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, type MotionValue } from 'motion/react';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { HangTag } from '@/components/ui/HangTag';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/cx';
import { haptic } from '@/lib/haptics';
import { spring } from '@/lib/motion';
import type { Item } from '@/lib/types';
import type { HangTagLabel } from '@/lib/wardrobe/insights';
import { Hanger } from './Hanger';
import { ItemImage } from './ItemImage';

export type SearchPhase = 'idle' | 'spin' | 'reveal';

export interface RailSearch {
  phase: SearchPhase;
  selectedId?: string;
  matched?: Set<string>;
}

/** How long the theatrical search spin may run. The results are already computed. */
const SPIN_MS = 1150;

function railIndex(scroller: HTMLDivElement): number {
  const first = scroller.querySelector<HTMLElement>('[data-rail-item]');
  if (!first) return 0;
  const gap = parseFloat(getComputedStyle(scroller).columnGap) || 0;
  return Math.round(scroller.scrollLeft / (first.offsetWidth + gap));
}

function scrollToIndex(scroller: HTMLDivElement, index: number, smooth = true) {
  const target = scroller.querySelectorAll<HTMLElement>('[data-rail-item]')[index];
  if (!target) return;
  const left = target.offsetLeft - (scroller.clientWidth - target.offsetWidth) / 2;
  scroller.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
}

function stateOf(item: Item, search: RailSearch) {
  const active = search.phase !== 'idle';
  const selected = search.selectedId === item.id;
  const revealed = search.phase === 'reveal';
  const matched = revealed && !!search.matched?.has(item.id);
  const dimmed = revealed && !selected && !matched;
  return { active, selected, matched, dimmed };
}

/** One piece on a hanger. The whole hanger swings from its hook. */
function HangingPiece({
  item,
  focused,
  tag,
  search,
  swing,
  onClick,
}: {
  item: Item;
  focused: boolean;
  tag?: HangTagLabel;
  search: RailSearch;
  swing: MotionValue<number>;
  onClick: () => void;
}) {
  const { selected, matched, dimmed } = stateOf(item, search);
  const hangerKind = item.category === 'bottom' ? 'clip' : 'coat';
  return (
    <motion.button
      type="button"
      data-rail-item
      onClick={onClick}
      aria-label={`${item.name ?? item.subtype}${focused ? ', focused' : ''}`}
      aria-current={focused ? 'true' : undefined}
      className="relative flex w-36 shrink-0 snap-center flex-col items-center outline-offset-4 sm:w-44 lg:w-52"
      style={{ rotate: swing, transformOrigin: '50% 0%' }}
      animate={{
        scale: selected ? 1.1 : focused && search.phase === 'idle' ? 1.05 : matched ? 1.03 : dimmed ? 0.93 : 1,
        y: selected ? -10 : matched ? -4 : dimmed ? 6 : 0,
        opacity: dimmed ? 0.35 : 1,
      }}
      transition={spring.settle}
    >
      <Hanger kind={hangerKind} className="relative z-10 -mb-1 w-3/5" />
      <span
        className={cx(
          'relative block aspect-[4/5] w-full rounded-sm transition-[box-shadow,background-color] duration-(--duration-base)',
          focused && search.phase === 'idle' ? 'bg-paper-raised/60 ring-1 ring-ink' : '',
          selected ? 'bg-paper-raised/70 ring-2 ring-accent' : '',
        )}
      >
        <span className={cx('absolute inset-x-[6%] bottom-[4%]', hangerKind === 'clip' ? 'top-0' : 'top-[2%]')}>
          <ItemImage item={item} layoutId={`item-${item.id}`} />
        </span>
        {matched || tag ? (
          <span className="absolute -top-1 right-1 rotate-6">
            <HangTag tone={matched ? 'matched' : tag === 'Most versatile' ? 'ink' : 'paper'}>{matched ? 'Matched' : tag}</HangTag>
          </span>
        ) : null}
      </span>
    </motion.button>
  );
}

export function Rail({
  items,
  shoes,
  tags,
  search,
  onOpen,
  onFindMatches,
  onSpinDone,
}: {
  items: Item[];
  shoes: Item[];
  tags: Map<string, HangTagLabel>;
  search: RailSearch;
  onOpen: (item: Item) => void;
  onFindMatches: (item: Item) => void;
  onSpinDone: () => void;
}) {
  const reduce = useReducedMotion();
  const scroller = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState(0);
  const spinStop = useRef<(() => void) | null>(null);

  // Hangers sway with the rail's speed and settle on a loose spring.
  const { scrollX } = useScroll({ container: scroller });
  const velocity = useVelocity(scrollX);
  const lean = useTransform(velocity, [-2400, 0, 2400], [9, 0, -9], { clamp: true });
  const swing = useSpring(lean, spring.swing);
  const still = useSpring(0);

  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el || search.phase === 'spin') return;
    const next = Math.min(items.length - 1, Math.max(0, railIndex(el)));
    setFocus((current) => {
      if (current !== next) haptic();
      return next;
    });
  }, [items.length, search.phase]);

  // The search spin: race to the far end of the rail and back to the chosen piece.
  useEffect(() => {
    const el = scroller.current;
    if (search.phase !== 'spin' || !el) return;
    const target = items.findIndex((i) => i.id === search.selectedId);
    if (reduce || target < 0) {
      onSpinDone();
      return;
    }
    const start = el.scrollLeft;
    const far = start < (el.scrollWidth - el.clientWidth) / 2 ? el.scrollWidth - el.clientWidth : 0;
    const node = el.querySelectorAll<HTMLElement>('[data-rail-item]')[target]!;
    const end = node.offsetLeft - (el.clientWidth - node.offsetWidth) / 2;
    const controls = animate(start, [start, far, end], {
      duration: SPIN_MS / 1000,
      times: [0, 0.48, 1],
      ease: ['easeIn', 'easeOut'],
      onUpdate: (v) => {
        el.scrollLeft = v;
      },
      onComplete: onSpinDone,
    });
    spinStop.current = () => {
      controls.stop();
      el.scrollLeft = end;
      onSpinDone();
    };
    return () => controls.stop();
  }, [search.phase, search.selectedId, items, reduce, onSpinDone]);

  function onKeyDown(e: KeyboardEvent) {
    const el = scroller.current;
    if (!el) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = Math.min(items.length - 1, Math.max(0, focus + (e.key === 'ArrowRight' ? 1 : -1)));
      scrollToIndex(el, next);
    }
  }

  const focused = items[focus];

  return (
    <div className="flex flex-col gap-8" onPointerDownCapture={() => search.phase === 'spin' && spinStop.current?.()}>
      <div className="relative -mx-gutter">
        {/* The rod. */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-[0.55rem] z-0 h-1.5 rounded-pill shadow-lift"
          style={{ background: 'linear-gradient(to bottom, var(--color-metal-highlight), var(--color-metal) 55%, var(--color-metal-shadow))' }}
        />
        <div
          ref={scroller}
          role="group"
          aria-roledescription="rail"
          aria-label="Clothes rail. Use the arrow keys to browse."
          tabIndex={0}
          onScroll={onScroll}
          onKeyDown={onKeyDown}
          className={cx(
            'relative flex gap-4 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            'px-[calc(50%-4.5rem)] sm:px-[calc(50%-5.5rem)] lg:px-[calc(50%-6.5rem)]',
            search.phase === 'spin' ? 'snap-none' : 'snap-x snap-mandatory',
          )}
        >
          {items.map((item, i) => (
            <HangingPiece
              key={item.id}
              item={item}
              focused={i === focus}
              tag={tags.get(item.id)}
              search={search}
              swing={reduce ? still : swing}
              onClick={() => {
                if (search.phase !== 'idle') return;
                if (i === focus) onOpen(item);
                else if (scroller.current) scrollToIndex(scroller.current, i);
              }}
            />
          ))}
        </div>
      </div>

      {/* Focused piece: name and the search button. */}
      {focused && search.phase === 'idle' ? (
        <motion.div
          key={focused.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring.gentle}
          className="flex flex-col items-center gap-3 text-center"
        >
          <p className="font-display font-heading text-title tracking-tight">{focused.name ?? focused.subtype}</p>
          <div className="flex gap-2">
            <Button variant="accent" size="sm" onClick={() => onFindMatches(focused)}>
              <Icon name="match" className="size-4" />
              Find matches
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onOpen(focused)}>
              Details
            </Button>
          </div>
        </motion.div>
      ) : null}

      {/* Shoes stand on a low shelf beneath the rail. */}
      {shoes.length ? (
        <div className="flex flex-col gap-2">
          <p className="caps text-ink-muted">Shoe shelf</p>
          <div className="relative -mx-gutter">
            <div className="flex gap-3 overflow-x-auto px-gutter pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {shoes.map((item) => {
                const { selected, matched, dimmed } = stateOf(item, search);
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => search.phase === 'idle' && onOpen(item)}
                    aria-label={item.name ?? item.subtype}
                    className="relative h-24 w-28 shrink-0 sm:h-28 sm:w-32"
                    animate={{ opacity: dimmed ? 0.35 : 1, y: matched || selected ? -6 : 0, scale: dimmed ? 0.94 : 1 }}
                    transition={spring.settle}
                  >
                    <ItemImage item={item} layoutId={`item-${item.id}`} />
                    {matched ? (
                      <span className="absolute -top-2 right-0">
                        <HangTag tone="matched">Matched</HangTag>
                      </span>
                    ) : null}
                  </motion.button>
                );
              })}
            </div>
            <span aria-hidden className="absolute inset-x-0 bottom-2 h-2 rounded-xs bg-paper-raised shadow-lift" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
