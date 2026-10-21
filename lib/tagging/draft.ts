import { COLOR_FAMILIES, type ColorFamilyId } from '@/rules/colors';
import type { Category, Fit, Formality, Item, ItemColor, Length, Pattern, Rise, ShoeProfile } from '@/lib/types';
import type { TagResult } from './schema';

/** Editable tags for one piece while it's being added or edited. */
export interface DraftTags {
  name: string;
  category: Category;
  subtype: string;
  fit?: Fit;
  shoeProfile?: ShoeProfile;
  rise?: Rise;
  length?: Length;
  colors: ItemColor[];
  pattern: Pattern;
  material?: string;
  formality: Formality;
}

export type DraftField = keyof DraftTags;

/** Below this, a field is highlighted for the person to confirm. */
export const CONFIDENT = 0.6;

export const SUBTYPES: Record<Category, string[]> = {
  top: ['t-shirt', 'shirt', 'oxford shirt', 'polo', 'hoodie', 'sweater', 'tank top', 'blouse'],
  bottom: ['jeans', 'chinos', 'trousers', 'pleated trousers', 'joggers', 'shorts', 'midi skirt', 'mini skirt'],
  shoes: ['leather sneaker', 'chunky sneaker', 'running shoe', 'loafer', 'chelsea boot', 'derby', 'heel', 'ballet flat'],
  outerwear: ['overshirt', 'denim jacket', 'bomber jacket', 'blazer', 'coat', 'trench coat', 'cardigan', 'puffer'],
  onepiece: ['midi dress', 'mini dress', 'maxi dress', 'slip dress', 'jumpsuit'],
  accessory: ['cap', 'bag', 'belt', 'scarf', 'watch'],
};

export const FITS_FOR: Partial<Record<Category, Fit[]>> = {
  top: ['fitted', 'regular', 'relaxed', 'oversized', 'boxy', 'cropped'],
  bottom: ['skinny', 'slim', 'straight', 'relaxed', 'wide', 'baggy'],
  outerwear: ['fitted', 'regular', 'relaxed', 'oversized'],
  onepiece: ['fitted', 'regular', 'relaxed'],
};

/** The everyday fit for each category, used when none is picked. */
export const DEFAULT_FIT: Partial<Record<Category, Fit>> = { top: 'regular', bottom: 'straight', outerwear: 'regular', onepiece: 'regular' };

export const MATERIALS = ['cotton', 'denim', 'knit', 'wool', 'linen', 'twill', 'leather', 'suede', 'synthetic'];

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

/** "Navy Chinos" from the main color and type, when no name is given. */
export function suggestName(draft: Pick<DraftTags, 'colors' | 'subtype'>): string {
  const family = draft.colors[0]?.family as ColorFamilyId | undefined;
  const color = family && COLOR_FAMILIES[family] ? COLOR_FAMILIES[family].label : '';
  return titleCase(`${color} ${draft.subtype}`.trim());
}

/** Tags from Claude, plus which fields to ask about. */
export function draftFromTags(r: TagResult): { draft: DraftTags; uncertain: DraftField[] } {
  const draft: DraftTags = {
    name: r.name,
    category: r.category,
    subtype: r.subtype.toLowerCase(),
    fit: r.fit ?? undefined,
    shoeProfile: r.shoe_profile ?? undefined,
    rise: r.rise ?? undefined,
    length: r.length ?? undefined,
    colors: r.colors.length ? r.colors : [{ hex: '#8c8c8c', family: 'grey', share: 1 }],
    pattern: r.pattern,
    material: r.material ?? undefined,
    formality: r.formality as Formality,
  };
  const c = r.confidence;
  const uncertain = (
    [
      ['category', c.category],
      ['subtype', c.subtype],
      ['fit', c.fit],
      ['colors', c.colors],
      ['pattern', c.pattern],
      ['formality', c.formality],
    ] as [DraftField, number][]
  )
    .filter(([, v]) => v < CONFIDENT)
    .map(([k]) => k);
  return { draft, uncertain };
}

/** Starting point for tagging by hand: detected colors, everything else a sensible default. */
export function manualDraft(colors: ItemColor[]): DraftTags {
  return {
    name: '',
    category: 'top',
    subtype: '',
    fit: 'regular',
    colors: colors.length ? colors : [{ hex: '#8c8c8c', family: 'grey', share: 1 }],
    pattern: 'solid',
    formality: 2,
  };
}

/** Drops fields that don't apply to the category, e.g. a sole profile on a shirt. */
export function normalizeDraft(d: DraftTags): DraftTags {
  const fits = FITS_FOR[d.category];
  return {
    ...d,
    name: d.name.trim() || suggestName(d),
    subtype: d.subtype.trim().toLowerCase() || SUBTYPES[d.category][0]!,
    fit: fits ? (d.fit && fits.includes(d.fit) ? d.fit : DEFAULT_FIT[d.category]) : undefined,
    shoeProfile: d.category === 'shoes' ? (d.shoeProfile ?? 'standard') : undefined,
    rise: d.category === 'bottom' ? d.rise : undefined,
    length: d.category === 'shoes' || d.category === 'accessory' ? undefined : d.length,
  };
}

export function draftFromItem(item: Item): DraftTags {
  const { name, category, subtype, fit, shoeProfile, rise, length, colors, pattern, material, formality } = item;
  return { name: name ?? '', category, subtype, fit, shoeProfile, rise, length, colors, pattern, material, formality };
}
