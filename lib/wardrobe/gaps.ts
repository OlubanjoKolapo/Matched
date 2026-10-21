import { GAP_CANDIDATES, type GapCandidate } from '@/rules/gaps';
import { combinations, scoreOutfit, type RulesProfile } from '@/lib/rules';
import { colorInfo, familyHex } from '@/lib/rules/color';
import { isDenim } from '@/lib/rules/garment';
import type { ItemTags, Track } from '@/lib/types';
import { VERDICT_THRESHOLDS } from '@/lib/verdict';

export interface Gap {
  candidate: GapCandidate;
  /** New working outfits this one piece would make possible. */
  unlocks: number;
}

/** A candidate as a taggable item. */
export function candidateItem(candidate: GapCandidate, track: Track): ItemTags {
  const { piece } = candidate;
  return {
    id: `gap-${candidate.id}`,
    track: track === 'womenswear' ? 'womenswear' : 'menswear',
    category: piece.category,
    subtype: piece.subtype,
    fit: piece.fit,
    shoeProfile: piece.shoeProfile,
    rise: piece.rise,
    length: piece.length,
    colors: [{ hex: familyHex(piece.color), family: piece.color, share: 1 }],
    pattern: piece.pattern ?? 'solid',
    material: piece.material,
    formality: piece.formality,
  };
}

/** Already owned: same kind of piece in the same color. */
function owns(wardrobe: ItemTags[], candidate: ItemTags): boolean {
  const family = colorInfo(candidate, isDenim(candidate)).family;
  const subtype = candidate.subtype.toLowerCase();
  return wardrobe.some((item) => {
    if (item.category !== candidate.category) return false;
    if (colorInfo(item, isDenim(item)).family !== family) return false;
    if (item.category === 'shoes') return item.shoeProfile === candidate.shoeProfile;
    const other = item.subtype.toLowerCase();
    return other.includes(subtype) || subtype.includes(other);
  });
}

/** Base outfits (no layers) that include `piece`, built from the rest of the wardrobe. */
function outfitsWith(wardrobe: ItemTags[], piece: ItemTags): ItemTags[][] {
  const others = wardrobe.filter((i) => i.category !== piece.category && i.category !== 'outerwear');
  return combinations([...others, piece], 'never');
}

function forTrack(candidate: GapCandidate, track: Track): boolean {
  return track === 'both' || candidate.tracks.includes(track);
}

/**
 * Gap Finder: every candidate you don't own yet, ranked by how many new
 * working outfits it would unlock. Only gaps that unlock something are kept.
 */
export function findGaps(wardrobe: ItemTags[], profile: RulesProfile): Gap[] {
  if (wardrobe.length < 3) return [];
  return GAP_CANDIDATES.filter((c) => forTrack(c, profile.track))
    .map((candidate) => ({ candidate, item: candidateItem(candidate, profile.track) }))
    .filter(({ item }) => !owns(wardrobe, item))
    .map(({ candidate, item }) => ({
      candidate,
      unlocks: outfitsWith(wardrobe, item).filter(
        (outfit) => scoreOutfit(outfit, profile).score >= VERDICT_THRESHOLDS.works,
      ).length,
    }))
    .filter((gap) => gap.unlocks > 0)
    .sort((a, b) => b.unlocks - a.unlocks);
}

/** The single piece that would unlock the most. */
export function biggestGap(wardrobe: ItemTags[], profile: RulesProfile): Gap | undefined {
  return findGaps(wardrobe, profile)[0];
}

/** "A pair of white low-profile sneakers", "An olive overshirt". */
export function gapPhrase(candidate: GapCandidate): string {
  if (candidate.pair) return `A pair of ${candidate.label}`;
  return `${/^[aeiou]/i.test(candidate.label) ? 'An' : 'A'} ${candidate.label}`;
}
