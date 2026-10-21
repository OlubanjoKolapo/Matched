'use client';

import { Chip } from '@/components/ui/Chip';
import { Swatch } from '@/components/ui/Swatch';
import { COLOR_FAMILIES, type ColorFamilyId } from '@/rules/colors';
import { colorInfo } from '@/lib/rules/color';
import { isDenim } from '@/lib/rules/garment';
import type { Category, Item } from '@/lib/types';

export interface WardrobeFilter {
  category: Category | 'all';
  family: string | 'all';
}

const CATEGORY_TABS: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'top', label: 'Tops' },
  { value: 'bottom', label: 'Bottoms' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'onepiece', label: 'Dresses' },
  { value: 'accessory', label: 'Accessories' },
];

export const familyOf = (item: Item) => colorInfo(item, isDenim(item)).family;

export function applyFilter(items: Item[], filter: WardrobeFilter): Item[] {
  return items.filter(
    (i) => (filter.category === 'all' || i.category === filter.category) && (filter.family === 'all' || familyOf(i) === filter.family),
  );
}

/** Category and color filters. Only options present in the wardrobe are shown. */
export function Filters({ items, value, onChange }: { items: Item[]; value: WardrobeFilter; onChange: (f: WardrobeFilter) => void }) {
  const categories = new Set(items.map((i) => i.category));
  const families = [...new Set(items.map(familyOf))];
  return (
    <div className="flex flex-col gap-3">
      <div className="-mx-gutter flex gap-2 overflow-x-auto px-gutter pb-1 [scrollbar-width:none]" role="group" aria-label="Filter by category">
        {CATEGORY_TABS.filter((t) => t.value === 'all' || categories.has(t.value)).map((t) => (
          <Chip key={t.value} selected={value.category === t.value} onClick={() => onChange({ ...value, category: t.value })}>
            {t.label}
          </Chip>
        ))}
      </div>
      {families.length > 1 ? (
        <div className="-mx-gutter flex gap-2 overflow-x-auto px-gutter pb-1 [scrollbar-width:none]" role="group" aria-label="Filter by color">
          <Chip selected={value.family === 'all'} onClick={() => onChange({ ...value, family: 'all' })}>
            Any color
          </Chip>
          {families.map((f) => {
            const fam = COLOR_FAMILIES[f as ColorFamilyId];
            return (
              <Chip
                key={f}
                selected={value.family === f}
                onClick={() => onChange({ ...value, family: value.family === f ? 'all' : f })}
                leading={<Swatch hex={fam?.anchors[0] ?? '#4a6a8f'} name={fam?.label ?? f} />}
              >
                {(fam?.label ?? f).replace(/^\w/, (c) => c.toUpperCase())}
              </Chip>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
