'use client';

import type { ReactNode } from 'react';
import { Avatar } from '@/components/avatar/Avatar';
import { cx } from '@/lib/cx';
import type { AvatarConfig, ItemTags } from '@/lib/types';

/** The figure that reacts to every answer. Short on phones, full height on desktop. */
export function AvatarStage({
  avatar,
  heightCm,
  outfit,
  caption,
  className,
}: {
  avatar: AvatarConfig;
  heightCm?: number;
  outfit?: ItemTags[];
  caption?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        // Pinned under the header on phones so the figure stays in view while you answer.
        'sticky top-[calc(var(--spacing-masthead)+env(safe-area-inset-top)+2px)] z-(--z-stage) flex h-stage flex-col items-center justify-end overflow-hidden bg-studio px-gutter pt-4 pb-3',
        'lg:top-0 lg:h-dvh lg:pt-24 lg:pb-12',
        className,
      )}
    >
      <div className="h-full w-full max-w-sm">
        <Avatar config={avatar} heightCm={heightCm} outfit={outfit} />
      </div>
      {caption ? <div className="absolute top-4 left-gutter lg:top-24 lg:left-12">{caption}</div> : null}
    </div>
  );
}
