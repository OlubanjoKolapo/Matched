'use client';

import type { ReactNode } from 'react';
import { ItemImage } from '@/components/wardrobe/ItemImage';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { cx } from '@/lib/cx';
import type { Item } from '@/lib/types';

/** A compact outfit row: overlapping cutouts, names, the top reason and the score. */
export function OutfitCard({
  items,
  score,
  reason,
  onClick,
  action,
  className,
}: {
  items: Item[];
  score: number;
  reason?: string;
  onClick?: () => void;
  action?: ReactNode;
  className?: string;
}) {
  const body = (
    <>
      <span className="flex shrink-0 -space-x-4">
        {items.map((i) => (
          <span key={i.id} className="block size-16 rounded-sm bg-studio p-1 ring-2 ring-paper-raised">
            <ItemImage item={i} shadow={false} />
          </span>
        ))}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
        <span className="text-body font-medium text-ink">{items.map((i) => i.name ?? i.subtype).join(' + ')}</span>
        {reason ? <span className="line-clamp-2 text-caption text-ink-muted">{reason}</span> : null}
      </span>
      <ScoreRing score={score} size="sm" />
    </>
  );
  return (
    <div className={cx('flex items-center gap-3 rounded-md bg-paper-raised p-3 ring-1 ring-rule', className)}>
      {onClick ? (
        <button type="button" onClick={onClick} className="flex min-w-0 flex-1 items-center gap-4">
          {body}
        </button>
      ) : (
        <span className="flex min-w-0 flex-1 items-center gap-4">{body}</span>
      )}
      {action}
    </div>
  );
}
