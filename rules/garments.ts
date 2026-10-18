import type { Fit } from '@/lib/types';

/**
 * Garment data the rules read: how much volume each fit carries, and the
 * subtype keywords that identify shoe styles, tailoring, layers and so on.
 * Keywords match anywhere in an item's subtype, case-insensitively.
 */

/** Visual volume of a top, 0 (close to the body) to 4 (oversized). */
export const TOP_VOLUME: Record<Fit, number> = {
  skinny: 0,
  slim: 0,
  fitted: 0,
  straight: 2,
  regular: 2,
  cropped: 2,
  relaxed: 3,
  boxy: 3,
  wide: 4,
  baggy: 4,
  oversized: 4,
};

/** Visual volume of trousers or jeans, 0 (skinny) to 5 (baggy). */
export const BOTTOM_VOLUME: Record<Fit, number> = {
  skinny: 0,
  slim: 1,
  fitted: 1,
  straight: 2,
  regular: 2,
  cropped: 2,
  relaxed: 3,
  boxy: 3,
  wide: 4,
  oversized: 4,
  baggy: 5,
};

export const VOLUME = {
  /** Tops at or above this read as roomy. */
  roomyTop: 3,
  /** At or above this, a top or bottom reads as big. */
  big: 4,
  /** Bottoms at or below this have a clean, narrow line. */
  cleanLine: 2,
  /** Tops at or below this have a neat cut. */
  neatTop: 2,
} as const;

export const KEYWORDS = {
  denim: ['jean', 'denim', 'trucker'],
  tailored: ['trouser', 'slacks', 'suit', 'dress pant', 'pleated'],
  casualBottom: ['jogger', 'sweatpant', 'track', 'cargo', 'gym short'],
  skirt: ['skirt'],
  hem: { mini: ['mini'], midi: ['midi'], maxi: ['maxi'] },

  shoe: {
    running: ['running', 'runner', 'trainer'],
    loafer: ['loafer', 'moccasin'],
    derby: ['derby', 'oxford', 'brogue', 'monk'],
    chelsea: ['chelsea'],
    minimal: ['leather sneaker', 'minimal sneaker', 'court'],
    flat: ['flat', 'ballet', 'mary jane', 'sandal', 'mule'],
  },

  /** Open layers that add a vertical line over a top. */
  layer: ['overshirt', 'shacket', 'shirt jacket', 'chore', 'cardigan', 'flannel', 'denim jacket'],
  /** Pieces that add structure at the shoulder. */
  structured: ['blazer', 'jacket', 'overshirt', 'bomber', 'trucker', 'coat', 'chore', 'shacket'],
  /**
   * Smart-casual bridge pieces: they sit comfortably with both dressier and
   * more casual items, so they can close a formality gap.
   */
  bridge: [
    'loafer',
    'chelsea',
    'leather sneaker',
    'minimal sneaker',
    'overshirt',
    'knit',
    'sweater',
    'cardigan',
    'oxford shirt',
    'polo',
    'chore',
  ],
} as const;
