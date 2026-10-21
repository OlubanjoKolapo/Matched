'use client';

import { AnimatePresence, LayoutGroup } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { haptic, HAPTICS } from '@/lib/haptics';
import { useProfile, useWardrobe } from '@/lib/hooks/data';
import type { GeneratedOutfit, RulesProfile } from '@/lib/rules';
import { loadSampleWardrobe } from '@/lib/sample/load';
import type { Item } from '@/lib/types';
import { goesWith, hangTags, versatility } from '@/lib/wardrobe/insights';
import { applyFilter, Filters, type WardrobeFilter } from './Filters';
import { GridView } from './GridView';
import { ItemSheet } from './ItemSheet';
import { MatchResults } from './MatchResults';
import { Rail, type RailSearch } from './Rail';

type View = 'rail' | 'grid';

interface Search extends RailSearch {
  outfits?: GeneratedOutfit<Item>[];
}

const IDLE: Search = { phase: 'idle' };

export function WardrobeView() {
  const wardrobe = useWardrobe();
  const profile = useProfile();
  const [view, setView] = useState<View>('rail');
  const [filter, setFilter] = useState<WardrobeFilter>({ category: 'all', family: 'all' });
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState<Search>(IDLE);
  const [loadingSample, setLoadingSample] = useState(false);

  const rules: RulesProfile | undefined = useMemo(
    () => (profile ? { track: profile.track, goals: profile.goals, heightCm: profile.heightCm } : undefined),
    [profile],
  );
  const counts = useMemo(() => versatility(wardrobe ?? [], rules), [wardrobe, rules]);
  const tags = useMemo(() => hangTags(wardrobe ?? [], counts), [wardrobe, counts]);
  const filtered = useMemo(() => applyFilter(wardrobe ?? [], filter), [wardrobe, filter]);
  const railItems = filtered.filter((i) => i.category !== 'shoes');
  const shoes = filtered.filter((i) => i.category === 'shoes');
  const open = wardrobe?.find((i) => i.id === openId);
  const selected = wardrobe?.find((i) => i.id === search.selectedId);

  function findMatches(item: Item) {
    const outfits = goesWith(item, wardrobe ?? [], rules, 5);
    const matched = new Set(outfits.slice(0, 3).flatMap((o) => o.items.map((p) => p.id)).filter((id) => id !== item.id));
    setFilter({ category: 'all', family: 'all' });
    setSearch({ phase: 'spin', selectedId: item.id, matched, outfits });
  }

  const onSpinDone = useCallback(() => {
    haptic(HAPTICS.snap);
    setSearch((s) => (s.phase === 'spin' ? { ...s, phase: 'reveal' } : s));
  }, []);

  const onClose = useCallback(() => setOpenId(null), []);

  if (wardrobe === undefined) return <div className="min-h-dvh" aria-busy="true" />;

  if (!wardrobe.length) {
    return (
      <>
        <PageHeader
          eyebrow={
            <Eyebrow>
              <span>Your wardrobe</span>
              <span>0 pieces</span>
            </Eyebrow>
          }
          title={
            <>
              The rail. <em>Empty, for now.</em>
            </>
          }
        />
        <EmptyState
          index="No. 02"
          title="Hang your first piece."
          body="Take a photo or upload one. Matched cuts it out and hangs it here. Or start with the sample wardrobe and swap in your own later."
          actions={
            <>
              <ButtonLink href="/add" size="lg">
                <Icon name="plus" />
                Add a piece
              </ButtonLink>
              <Button
                size="lg"
                variant="secondary"
                disabled={loadingSample}
                onClick={async () => {
                  setLoadingSample(true);
                  await loadSampleWardrobe();
                  setLoadingSample(false);
                }}
              >
                {loadingSample ? 'Hanging it up…' : 'Use the sample wardrobe'}
              </Button>
            </>
          }
        />
      </>
    );
  }

  return (
    <LayoutGroup>
      <PageHeader
        eyebrow={
          <Eyebrow>
            <span>Your wardrobe</span>
            <span>
              {wardrobe.length} {wardrobe.length === 1 ? 'piece' : 'pieces'}
            </span>
          </Eyebrow>
        }
        title={
          view === 'rail' ? (
            <>
              The rail. <em>Swipe to browse.</em>
            </>
          ) : (
            <>
              Everything. <em>At a glance.</em>
            </>
          )
        }
        actions={
          <SegmentedControl<View>
            label="Wardrobe view"
            value={view}
            onChange={(v) => {
              setSearch(IDLE);
              setView(v);
            }}
            options={[
              { value: 'rail', label: 'Rail', icon: 'rail' },
              { value: 'grid', label: 'Grid', icon: 'grid' },
            ]}
          />
        }
      />

      <div className="flex flex-col gap-8 pb-8">
        {search.phase === 'idle' ? <Filters items={wardrobe} value={filter} onChange={setFilter} /> : null}

        {view === 'rail' ? (
          <>
            {railItems.length || shoes.length ? (
              <Rail
                items={search.phase === 'idle' ? railItems : wardrobe.filter((i) => i.category !== 'shoes')}
                shoes={search.phase === 'idle' ? shoes : wardrobe.filter((i) => i.category === 'shoes')}
                tags={tags}
                search={search}
                onOpen={(item) => setOpenId(item.id)}
                onFindMatches={findMatches}
                onSpinDone={onSpinDone}
              />
            ) : (
              <p className="py-12 text-center text-ink-muted">Nothing matches these filters.</p>
            )}
            {search.phase === 'spin' ? <p className="caps text-center text-ink-muted">Searching your wardrobe · tap to skip</p> : null}
            {search.phase === 'reveal' && selected ? (
              <MatchResults item={selected} outfits={search.outfits ?? []} onDone={() => setSearch(IDLE)} />
            ) : null}
          </>
        ) : filtered.length ? (
          <GridView items={filtered} tags={tags} onOpen={(item) => setOpenId(item.id)} />
        ) : (
          <p className="py-12 text-center text-ink-muted">Nothing matches these filters.</p>
        )}
      </div>

      <AnimatePresence>
        {open ? <ItemSheet key={open.id} item={open} wardrobe={wardrobe} profile={rules} onClose={onClose} /> : null}
      </AnimatePresence>
    </LayoutGroup>
  );
}
