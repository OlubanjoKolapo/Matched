import { COLOR_FAMILIES, type ColorFamilyId } from '@/rules/colors';
import type { Category, ItemTags } from '@/lib/types';

let counter = 0;

const DENIM_HEX: Record<'light' | 'mid' | 'dark', string> = {
  light: '#8fb0d0',
  mid: '#4a6a8f',
  dark: '#243650',
};

type PieceOptions = Partial<Omit<ItemTags, 'colors'>> & {
  /** Color family; hex comes from the family's first anchor. */
  color?: ColorFamilyId;
  hex?: string;
  /** Shortcut for blue denim washes. */
  wash?: keyof typeof DENIM_HEX;
};

/** Builds a tagged item for tests: piece('bottom', 'jeans', { fit: 'wide', wash: 'light' }). */
export function piece(category: Category, subtype: string, options: PieceOptions = {}): ItemTags {
  const { color = 'grey', hex, wash, ...rest } = options;
  const resolvedHex = hex ?? (wash ? DENIM_HEX[wash] : COLOR_FAMILIES[color].anchors[0]) ?? '#8c8c8c';
  return {
    id: `${subtype.replace(/\s+/g, '-')}-${++counter}`,
    track: 'menswear',
    category,
    subtype,
    colors: [{ hex: resolvedHex, family: wash ? 'denim' : color, share: 1 }],
    pattern: 'solid',
    formality: 2,
    ...(wash ? { material: 'denim' } : {}),
    ...rest,
  };
}

export const top = (subtype: string, o?: PieceOptions) => piece('top', subtype, o);
export const bottom = (subtype: string, o?: PieceOptions) => piece('bottom', subtype, o);
export const shoes = (subtype: string, o?: PieceOptions) => piece('shoes', subtype, o);
export const outer = (subtype: string, o?: PieceOptions) => piece('outerwear', subtype, o);
export const dress = (subtype: string, o?: PieceOptions) => piece('onepiece', subtype, { track: 'womenswear', ...o });
