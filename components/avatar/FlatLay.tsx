import { itemLabel } from '@/lib/rules/garment';
import { cx } from '@/lib/cx';
import type { Category, ItemTags } from '@/lib/types';

export interface FlatLayPiece {
  item: ItemTags;
  /** Cutout image URL (object URL or public path). */
  src: string;
}

/**
 * Magazine-style flat-lay: each category has a spot in the composition,
 * expressed as percentages so the layout scales with its container.
 */
const SPOTS: Record<Category, { left: number; top: number; width: number; rotate: number; z: number }> = {
  outerwear: { left: 4, top: 4, width: 50, rotate: -5, z: 1 },
  top: { left: 42, top: 3, width: 50, rotate: 3, z: 2 },
  onepiece: { left: 24, top: 3, width: 52, rotate: 0, z: 2 },
  bottom: { left: 10, top: 40, width: 44, rotate: -2, z: 1 },
  shoes: { left: 54, top: 60, width: 40, rotate: 6, z: 3 },
  accessory: { left: 64, top: 42, width: 24, rotate: -8, z: 4 },
};

/** Without outerwear, the top takes the lead spot. */
const TOP_ALONE = { left: 18, top: 3, width: 54, rotate: -3, z: 2 };

export function FlatLay({ pieces, className }: { pieces: FlatLayPiece[]; className?: string }) {
  const hasOuter = pieces.some((p) => p.item.category === 'outerwear');
  return (
    <div
      className={cx('relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-paper-sunken', className)}
      role="group"
      aria-label="Flat-lay of the outfit"
    >
      {pieces.map(({ item, src }) => {
        const spot = item.category === 'top' && !hasOuter ? TOP_ALONE : SPOTS[item.category];
        return (
          // Cutouts are local object URLs or static SVGs; next/image adds nothing here.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.id}
            src={src}
            alt={itemLabel(item)}
            className="absolute h-auto drop-shadow-garment"
            style={{
              left: `${spot.left}%`,
              top: `${spot.top}%`,
              width: `${spot.width}%`,
              transform: `rotate(${spot.rotate}deg)`,
              zIndex: spot.z,
            }}
          />
        );
      })}
    </div>
  );
}
