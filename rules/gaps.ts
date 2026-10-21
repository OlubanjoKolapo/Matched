import type { LookPiece } from '@/lib/lessons/types';
import type { Track } from '@/lib/types';

/**
 * Gap Finder's shopping list: hard-working basics it tries against your
 * wardrobe. Each is phrased as you'd say it out loud. `pair` pieces read as
 * "a pair of …". Add pieces here; nothing else needs to change.
 *
 * No outerwear: a jacket layers over outfits you can already wear, so it
 * never unlocks a new one, and its count would drown out everything else.
 */
export interface GapCandidate {
  id: string;
  label: string;
  pair?: boolean;
  tracks: Exclude<Track, 'both'>[];
  piece: LookPiece;
}

const BOTH: GapCandidate['tracks'] = ['menswear', 'womenswear'];

export const GAP_CANDIDATES: GapCandidate[] = [
  // Shoes
  { id: 'white-sneakers', label: 'white low-profile sneakers', pair: true, tracks: BOTH, piece: { category: 'shoes', subtype: 'leather sneaker', shoeProfile: 'low', color: 'white', formality: 3 } },
  { id: 'black-chelsea', label: 'black Chelsea boots', pair: true, tracks: BOTH, piece: { category: 'shoes', subtype: 'chelsea boot', shoeProfile: 'boot', color: 'black', formality: 4 } },
  { id: 'brown-loafers', label: 'brown suede loafers', pair: true, tracks: BOTH, piece: { category: 'shoes', subtype: 'penny loafer', shoeProfile: 'low', color: 'brown', material: 'suede', formality: 4 } },
  { id: 'chunky-sneakers', label: 'grey chunky sneakers', pair: true, tracks: BOTH, piece: { category: 'shoes', subtype: 'chunky sneaker', shoeProfile: 'chunky', color: 'grey', formality: 2 } },
  { id: 'black-flats', label: 'black ballet flats', pair: true, tracks: ['womenswear'], piece: { category: 'shoes', subtype: 'ballet flat', shoeProfile: 'low', color: 'black', formality: 3 } },

  // Tops
  { id: 'white-tee', label: 'plain white tee', tracks: BOTH, piece: { category: 'top', subtype: 't-shirt', fit: 'regular', color: 'white', formality: 2 } },
  { id: 'black-tee', label: 'plain black tee', tracks: BOTH, piece: { category: 'top', subtype: 't-shirt', fit: 'regular', color: 'black', formality: 2 } },
  { id: 'grey-hoodie', label: 'grey hoodie', tracks: BOTH, piece: { category: 'top', subtype: 'hoodie', fit: 'relaxed', color: 'grey', formality: 2 } },
  { id: 'navy-knit', label: 'navy crewneck knit', tracks: BOTH, piece: { category: 'top', subtype: 'crewneck sweater', fit: 'regular', color: 'navy', material: 'knit', formality: 3 } },
  { id: 'cream-knit', label: 'cream knit', tracks: BOTH, piece: { category: 'top', subtype: 'crewneck sweater', fit: 'relaxed', color: 'cream', material: 'knit', formality: 3 } },
  { id: 'oxford', label: 'light blue oxford shirt', tracks: ['menswear'], piece: { category: 'top', subtype: 'oxford shirt', fit: 'regular', color: 'light-blue', formality: 3 } },
  { id: 'white-shirt', label: 'crisp white shirt', tracks: BOTH, piece: { category: 'top', subtype: 'shirt', fit: 'regular', color: 'white', formality: 3 } },
  { id: 'fitted-tee', label: 'fitted black tee', tracks: ['womenswear'], piece: { category: 'top', subtype: 't-shirt', fit: 'fitted', color: 'black', formality: 2 } },

  // Bottoms
  { id: 'black-jeans', label: 'black straight jeans', pair: true, tracks: BOTH, piece: { category: 'bottom', subtype: 'jeans', fit: 'straight', color: 'black', material: 'denim', formality: 2 } },
  { id: 'mid-jeans', label: 'mid-wash straight jeans', pair: true, tracks: BOTH, piece: { category: 'bottom', subtype: 'jeans', fit: 'straight', color: 'denim', material: 'denim', formality: 2 } },
  { id: 'navy-chinos', label: 'navy slim chinos', pair: true, tracks: ['menswear'], piece: { category: 'bottom', subtype: 'chinos', fit: 'slim', color: 'navy', formality: 3 } },
  { id: 'beige-chinos', label: 'beige chinos', pair: true, tracks: ['menswear'], piece: { category: 'bottom', subtype: 'chinos', fit: 'straight', color: 'beige', formality: 3 } },
  { id: 'charcoal-trousers', label: 'charcoal tailored trousers', pair: true, tracks: BOTH, piece: { category: 'bottom', subtype: 'trousers', fit: 'straight', color: 'charcoal', formality: 4 } },
  { id: 'black-midi', label: 'black midi skirt', tracks: ['womenswear'], piece: { category: 'bottom', subtype: 'midi skirt', rise: 'high', color: 'black', formality: 3 } },
  { id: 'wide-jeans', label: 'high-rise wide jeans', pair: true, tracks: ['womenswear'], piece: { category: 'bottom', subtype: 'jeans', fit: 'wide', rise: 'high', color: 'denim', material: 'denim', formality: 2 } },

  // One-pieces
  { id: 'navy-dress', label: 'navy midi dress', tracks: ['womenswear'], piece: { category: 'onepiece', subtype: 'midi dress', fit: 'regular', color: 'navy', formality: 3 } },

];
