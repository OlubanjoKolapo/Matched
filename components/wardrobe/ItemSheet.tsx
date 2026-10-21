'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ReasonList } from '@/components/match/ReasonList';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Heading';
import { IconButton } from '@/components/ui/IconButton';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Text } from '@/components/ui/Text';
import type { RulesProfile } from '@/lib/rules';
import { cx } from '@/lib/cx';
import { ease, spring } from '@/lib/motion';
import { draftFromItem, type DraftTags } from '@/lib/tagging/draft';
import type { Item } from '@/lib/types';
import { goesWith } from '@/lib/wardrobe/insights';
import { deleteItem, updateItemTags } from '@/lib/wardrobe/items';
import { ItemImage } from './ItemImage';
import { TagEditor } from './TagEditor';

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });

/** Detail for one piece: the cutout, what it goes with and why, and its tags. */
export function ItemSheet({
  item,
  wardrobe,
  profile,
  onClose,
}: {
  item: Item;
  wardrobe: Item[];
  profile?: RulesProfile;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [draft, setDraft] = useState<DraftTags>(() => draftFromItem(item));
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [openOutfit, setOpenOutfit] = useState<number | null>(0);
  const outfits = useMemo(() => goesWith(item, wardrobe, profile, 6), [item, wardrobe, profile]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);

  async function save() {
    await updateItemTags(item.id, draft);
    setDirty(false);
  }

  async function remove() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteItem(item.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-(--z-overlay)" role="dialog" aria-modal="true" aria-labelledby="item-sheet-title">
      <motion.button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        className="absolute inset-0 bg-scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className={cx(
          'absolute inset-x-0 bottom-0 max-h-[94dvh] overflow-y-auto rounded-t-lg bg-paper pb-[env(safe-area-inset-bottom)] shadow-float',
          'lg:inset-x-auto lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:max-h-[90dvh] lg:w-[min(68rem,92vw)] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-lg',
        )}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0, transition: { duration: 0.2 } }}
        transition={spring.gentle}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-paper/95 px-gutter py-2 backdrop-blur-sm lg:px-8">
          <Eyebrow>
            <span>{item.subtype}</span>
            <span>Added {dateFormat.format(new Date(item.createdAt))}</span>
          </Eyebrow>
          <IconButton ref={closeRef} icon="close" label="Close" onClick={onClose} />
        </div>

        <div className="grid gap-8 px-gutter pb-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:px-8 lg:pb-10">
          <div className="lg:sticky lg:top-16 lg:self-start">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-studio">
              <div className="absolute inset-[8%]">
                <ItemImage item={item} layoutId={`item-${item.id}`} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <Heading as="h2" size="subhead">
              <span id="item-sheet-title">{item.name ?? item.subtype}</span>
            </Heading>

            <section aria-labelledby="goes-with" className="flex flex-col gap-4">
              <h3 id="goes-with" className="caps text-ink-muted">
                Goes with
              </h3>
              {outfits.length ? (
                <ul className="flex flex-col gap-3">
                  {outfits.map((outfit, i) => {
                    const partners = outfit.items.filter((p) => p.id !== item.id);
                    const open = openOutfit === i;
                    return (
                      <li key={outfit.items.map((p) => p.id).join('-')} className="rounded-md bg-paper-raised ring-1 ring-rule">
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => setOpenOutfit(open ? null : i)}
                          className="flex w-full items-center gap-4 p-3 text-left"
                        >
                          <span className="flex -space-x-3">
                            {partners.map((p) => (
                              <span key={p.id} className="block size-16 rounded-sm bg-studio p-1 ring-2 ring-paper-raised">
                                <ItemImage item={p} shadow={false} />
                              </span>
                            ))}
                          </span>
                          <span className="flex flex-1 flex-col gap-1">
                            <span className="text-body font-medium">{partners.map((p) => p.name ?? p.subtype).join(' + ')}</span>
                            <span className="line-clamp-2 text-caption text-ink-muted">{outfit.result.reasons[0]?.text}</span>
                          </span>
                          <ScoreRing score={outfit.result.score} size="sm" />
                        </button>
                        <AnimatePresence initial={false}>
                          {open ? (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: ease.emphasized }}
                              className="overflow-hidden"
                            >
                              <ReasonList reasons={outfit.result.reasons} className="px-4" />
                              <div className="px-4 pt-1 pb-4">
                                <ButtonLink href={`/match?items=${outfit.items.map((p) => p.id).join(',')}`} variant="secondary" size="sm">
                                  Open in Match
                                </ButtonLink>
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Text tone="muted">Nothing in your wardrobe pairs well with this yet. Add a few more pieces and check back.</Text>
              )}
            </section>

            <section aria-labelledby="tags" className="flex flex-col gap-4">
              <h3 id="tags" className="caps text-ink-muted">
                Tags
              </h3>
              <TagEditor
                value={draft}
                onChange={(next) => {
                  setDraft(next);
                  setDirty(true);
                }}
              />
            </section>

            <div className="sticky bottom-0 -mx-gutter flex gap-3 border-t border-rule bg-paper px-gutter py-3 lg:-mx-8 lg:px-8">
              <Button variant={confirmDelete ? 'accent' : 'ghost'} onClick={remove}>
                {confirmDelete ? 'Tap again to delete' : 'Delete'}
              </Button>
              <Button block onClick={save} disabled={!dirty}>
                {dirty ? 'Save changes' : 'Saved'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
