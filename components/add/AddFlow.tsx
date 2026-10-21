'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useMemo, useRef, useState, type DragEvent } from 'react';
import { TagEditor } from '@/components/wardrobe/TagEditor';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Heading } from '@/components/ui/Heading';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { cx } from '@/lib/cx';
import { haptic, HAPTICS } from '@/lib/haptics';
import { useProfile, useWardrobe } from '@/lib/hooks/data';
import { useSearchParam } from '@/lib/hooks/useSearchFlag';
import { removeBackgroundSafe } from '@/lib/image/background';
import { dominantColors } from '@/lib/image/colors';
import { resizeImage, samplePixels, trimTransparent } from '@/lib/image/process';
import { ease, spring } from '@/lib/motion';
import { combinations } from '@/lib/rules';
import { autoTag, taggingSource, type TagSource } from '@/lib/tagging/client';
import { draftFromTags, manualDraft, type DraftField, type DraftTags } from '@/lib/tagging/draft';
import { addItem } from '@/lib/wardrobe/items';
import { PeelReveal } from './PeelReveal';

type Phase = 'cutting' | 'tagging' | 'review' | 'saving' | 'saved' | 'failed';

interface Entry {
  photo: Blob;
  photoUrl: string;
  cutout?: Blob | null;
  cutoutUrl?: string | null;
  progress: number;
  phase: Phase;
  draft?: DraftTags;
  uncertain: DraftField[];
  source: TagSource;
  taggedByAi: boolean;
  notice?: string;
}

/** Stored originals stay sharp enough for the detail view without bloating storage. */
const PHOTO_MAX = 1600;
const CUTOUT_MAX = 1000;

const TIPS = ['Lay it flat or hang it up', 'Plain background, good light', 'One piece per photo'];

export function AddFlow() {
  const reduce = useReducedMotion();
  const profile = useProfile();
  const wardrobe = useWardrobe();
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<File[]>([]);
  const [index, setIndex] = useState(0);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // ?first=1 when arriving from onboarding: the first match is the goal.
  const firstVisit = useSearchParam('first') === '1';

  const source = taggingSource(profile?.apiKey);
  const firstMatchReady = useMemo(() => !!wardrobe && combinations(wardrobe, 'never').length > 0, [wardrobe]);

  function patch(update: Partial<Entry>) {
    setEntry((current) => (current ? { ...current, ...update } : current));
  }

  async function process(file: File) {
    let photo: Blob;
    try {
      photo = await resizeImage(file, { maxSide: PHOTO_MAX, type: 'image/jpeg', quality: 0.86 });
    } catch {
      setEntry(null);
      setQueue([]);
      setError('That file couldn’t be opened. Try a JPEG or PNG photo.');
      return;
    }
    setError(null);
    const photoUrl = URL.createObjectURL(photo);
    setEntry({ photo, photoUrl, progress: 0, phase: 'cutting', uncertain: [], source, taggedByAi: false });

    const raw = await removeBackgroundSafe(photo, (p) => patch({ progress: p }));
    const cutout = raw ? await resizeImage(await trimTransparent(raw), { maxSide: CUTOUT_MAX, type: 'image/png' }) : null;
    patch({ cutout, cutoutUrl: cutout ? URL.createObjectURL(cutout) : null, phase: source === 'manual' ? 'review' : 'tagging' });

    const colors = dominantColors(await samplePixels(cutout ?? photo));
    if (source === 'manual') {
      patch({ draft: manualDraft(colors), phase: 'review' });
      return;
    }

    const outcome = await autoTag(cutout ?? photo, profile?.apiKey);
    if ('tags' in outcome) {
      const { draft, uncertain } = draftFromTags(outcome.tags);
      // Our pixel-measured colors are more faithful than a described hex when the families agree.
      const merged = draft.colors.map((c) => colors.find((m) => m.family === c.family) ?? c);
      patch({
        draft: { ...draft, colors: merged },
        uncertain,
        taggedByAi: true,
        phase: 'review',
        notice:
          outcome.tags.pieces_visible > 1
            ? `We spotted ${outcome.tags.pieces_visible} pieces and tagged the most prominent. One piece per photo works best.`
            : undefined,
      });
    } else {
      patch({ draft: manualDraft(colors), phase: 'review', notice: 'error' in outcome ? outcome.error : undefined });
    }
  }

  function start(files: FileList | File[] | null) {
    const list = [...(files ?? [])].filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name));
    if (!list.length) return;
    setQueue(list);
    setIndex(0);
    void process(list[0]!);
  }

  async function save() {
    if (!entry?.draft) return;
    patch({ phase: 'saving' });
    await addItem({ tags: entry.draft, photo: entry.photo, cutout: entry.cutout ?? undefined, taggedBy: entry.taggedByAi ? 'ai' : 'user' });
    haptic(HAPTICS.snap);
    setTimeout(() => patch({ phase: 'saved' }), reduce ? 0 : 650);
  }

  function nextInQueue() {
    if (entry) {
      URL.revokeObjectURL(entry.photoUrl);
      if (entry.cutoutUrl) URL.revokeObjectURL(entry.cutoutUrl);
    }
    const next = index + 1;
    if (next < queue.length) {
      setIndex(next);
      void process(queue[next]!);
    } else {
      setEntry(null);
      setQueue([]);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    start(e.dataTransfer.files);
  }

  const inputs = (
    <>
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          start(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={libraryInput}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          start(e.target.files);
          e.target.value = '';
        }}
      />
    </>
  );

  // ── Choose a photo ────────────────────────────────────
  if (!entry) {
    return (
      <div
        className="grid gap-10 pt-8 pb-8 lg:grid-cols-2 lg:items-center lg:pt-section"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {inputs}
        <div className="flex flex-col gap-6">
          <Eyebrow>
            <span>Add</span>
            <span>{firstVisit ? 'Your first pieces' : 'New piece'}</span>
          </Eyebrow>
          <Heading as="h1" size="headline">
            Add a piece. <em>Or ten.</em>
          </Heading>
          <Text variant="lead" tone="muted" className="max-w-prose">
            Take a photo, or upload from your library. Matched cuts each piece out and reads its details
            {source === 'manual' ? ', then you confirm them with a tap' : ''}.
          </Text>
          {firstVisit ? (
            <Text tone="muted">Start with three: a top, a bottom and a pair of shoes. Then you’ll see your first match.</Text>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => cameraInput.current?.click()}>
              <Icon name="camera" />
              Take a photo
            </Button>
            <Button size="lg" variant="secondary" onClick={() => libraryInput.current?.click()}>
              <Icon name="upload" />
              Upload from library
            </Button>
          </div>
          {error ? (
            <p className="flex items-center gap-2 text-caption text-rethink" role="alert">
              <Icon name="alert" className="size-4" />
              {error}
            </p>
          ) : null}
          {firstMatchReady && firstVisit ? <FirstMatchCallout /> : null}
        </div>

        <button
          type="button"
          onClick={() => libraryInput.current?.click()}
          className={cx(
            'group relative hidden aspect-[4/3] flex-col items-center justify-center gap-4 rounded-md border border-dashed bg-studio transition-colors duration-(--duration-base) lg:flex',
            dragging ? 'border-accent' : 'border-rule-strong hover:border-ink-muted',
          )}
        >
          <Icon name="upload" className="size-8 text-ink-muted transition-transform duration-(--duration-base) group-hover:-translate-y-1" />
          <span className="font-display font-heading text-title tracking-tight">Drop photos here</span>
          <span className="caps text-ink-muted">or click to browse · several at once is fine</span>
        </button>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 lg:col-span-2">
          {TIPS.map((tip, i) => (
            <li key={tip} className="caps flex items-center gap-2 text-ink-muted">
              <span className="numerals text-accent">{String(i + 1).padStart(2, '0')}</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const busy = entry.phase === 'cutting' || entry.phase === 'tagging';
  const counter = queue.length > 1 ? `Photo ${index + 1} of ${queue.length}` : 'New piece';

  // ── Saved ─────────────────────────────────────────────
  if (entry.phase === 'saved') {
    const more = index + 1 < queue.length;
    return (
      <div className="flex flex-col items-start gap-6 pt-12 pb-8 lg:pt-section">
        {inputs}
        <Eyebrow tone="accent">
          <span>Saved</span>
          <span>{counter}</span>
        </Eyebrow>
        <Heading as="h1" size="headline">
          On the rail. <em>{more ? 'Next one?' : 'Add another?'}</em>
        </Heading>
        <div className="flex flex-wrap gap-3">
          {more ? (
            <Button size="lg" onClick={nextInQueue}>
              Next photo
              <Icon name="arrow-right" />
            </Button>
          ) : (
            <>
              <Button size="lg" onClick={() => cameraInput.current?.click()}>
                <Icon name="camera" />
                Take another
              </Button>
              <Button size="lg" variant="secondary" onClick={() => libraryInput.current?.click()}>
                <Icon name="upload" />
                Upload more
              </Button>
            </>
          )}
          <ButtonLink href="/wardrobe" size="lg" variant="ghost">
            See your wardrobe
          </ButtonLink>
        </div>
        {firstMatchReady && firstVisit ? <FirstMatchCallout /> : null}
      </div>
    );
  }

  // ── Processing and review ─────────────────────────────
  return (
    <div className="grid gap-8 pt-6 pb-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-12 lg:pt-12">
      {inputs}
      <div className="lg:sticky lg:top-8 lg:self-start">
        <AnimatePresence>
          {entry.phase !== 'saving' ? (
            <motion.div key="stage" exit={reduce ? { opacity: 0 } : { scale: 0.18, y: 360, opacity: 0, rotate: -8 }} transition={{ duration: 0.6, ease: ease.emphasized }}>
              <PeelReveal
                photoUrl={entry.photoUrl}
                cutoutUrl={entry.cutoutUrl}
                working={entry.phase === 'cutting'}
                progress={entry.progress}
                alt={entry.draft?.name || 'Your new piece'}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-6">
        <Eyebrow>
          <span>{counter}</span>
          <span>
            {entry.phase === 'cutting'
              ? 'Cutting it out'
              : entry.phase === 'tagging'
                ? 'Reading the details'
                : entry.taggedByAi
                  ? 'Check the details'
                  : 'Tag it'}
          </span>
        </Eyebrow>
        <Heading as="h1" size="subhead">
          {busy ? (
            <>
              One moment. <em>{entry.phase === 'cutting' ? 'Lifting it off the background.' : 'Reading the fabric.'}</em>
            </>
          ) : entry.taggedByAi ? (
            <>
              Here’s what we see. <em>Tap anything to change it.</em>
            </>
          ) : (
            <>
              What is it? <em>A few taps and it’s on the rail.</em>
            </>
          )}
        </Heading>

        {entry.notice ? (
          <p className="flex items-start gap-2 rounded-sm bg-rethink-soft px-3 py-2 text-caption text-ink" role="status">
            <Icon name="alert" className="mt-0.5 size-4 text-rethink" />
            {entry.notice}
          </p>
        ) : null}

        {busy || !entry.draft ? (
          <div className="flex flex-col gap-6" aria-busy="true" aria-label="Reading the details">
            {[5, 7, 4, 6].map((n, row) => (
              <div key={row} className="flex flex-col gap-3">
                <span className="shimmer h-3 w-20 rounded-xs" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: n }, (_, i) => (
                    <span key={i} className="shimmer h-9 rounded-pill" style={{ width: `${4.5 + ((i * 7 + row * 3) % 5)}rem` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring.gentle}>
            <TagEditor
              value={entry.draft}
              onChange={(draft) => patch({ draft })}
              uncertain={entry.uncertain}
              onConfirm={(field) => patch({ uncertain: entry.uncertain.filter((f) => f !== field) })}
            />
          </motion.div>
        )}

        <div className="sticky bottom-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom))] -mx-gutter border-t border-rule bg-paper px-gutter py-3 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0">
          <div className="flex gap-3">
            <Button variant="ghost" size="lg" onClick={nextInQueue} disabled={entry.phase === 'saving'}>
              {index + 1 < queue.length ? 'Skip' : 'Discard'}
            </Button>
            <Button size="lg" block onClick={save} disabled={busy || !entry.draft || entry.phase === 'saving'}>
              {entry.phase === 'saving' ? 'Hanging it up…' : 'Save to wardrobe'}
              <Icon name="check" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FirstMatchCallout() {
  return (
    <Link
      href="/onboarding?step=first-match"
      className="group flex w-full max-w-md items-center gap-4 rounded-md border border-ink bg-paper-raised p-4 shadow-lift transition-transform duration-(--duration-base) hover:-translate-y-0.5"
    >
      <span className="grid size-10 place-items-center rounded-pill bg-matched text-accent-ink">
        <Icon name="match" />
      </span>
      <span className="flex flex-1 flex-col">
        <span className="font-display font-heading text-title tracking-tight">Your first match is ready</span>
        <span className="text-caption text-ink-muted">A top, a bottom and shoes. See how they pair.</span>
      </span>
      <Icon name="arrow-right" className="transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
