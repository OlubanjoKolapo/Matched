import type { AvatarConfig, Build, Frame, Track } from '@/lib/types';

/** Ten skin tones, lightest to deepest. Named by number, never by label. */
export const SKIN_TONES = [
  { id: 'tone-1', hex: '#f6e2d3' },
  { id: 'tone-2', hex: '#efd0b8' },
  { id: 'tone-3', hex: '#e4b996' },
  { id: 'tone-4', hex: '#d6a37b' },
  { id: 'tone-5', hex: '#c28961' },
  { id: 'tone-6', hex: '#a8704a' },
  { id: 'tone-7', hex: '#8c5a3b' },
  { id: 'tone-8', hex: '#6e4630' },
  { id: 'tone-9', hex: '#553424' },
  { id: 'tone-10', hex: '#3d2519' },
] as const;

export const HAIR_COLORS = [
  { id: 'black', label: 'Black', hex: '#1b1714' },
  { id: 'espresso', label: 'Espresso', hex: '#3a2a20' },
  { id: 'brown', label: 'Brown', hex: '#6a4630' },
  { id: 'auburn', label: 'Auburn', hex: '#7d3524' },
  { id: 'copper', label: 'Copper', hex: '#b3602f' },
  { id: 'blonde', label: 'Blonde', hex: '#d4b27a' },
  { id: 'platinum', label: 'Platinum', hex: '#e6dece' },
  { id: 'grey', label: 'Grey', hex: '#9b968f' },
] as const;

export const HAIR_STYLES = [
  { id: 'buzz', label: 'Buzz' },
  { id: 'crop', label: 'Crop' },
  { id: 'textured', label: 'Textured' },
  { id: 'side-part', label: 'Side part' },
  { id: 'curly-top', label: 'Curly top' },
  { id: 'afro', label: 'Afro' },
  { id: 'locs', label: 'Locs' },
  { id: 'bun', label: 'Bun' },
  { id: 'ponytail', label: 'Ponytail' },
  { id: 'bob', label: 'Bob' },
  { id: 'long', label: 'Long' },
  { id: 'waves', label: 'Waves' },
] as const;

export const BUILD_OPTIONS: { value: Build; label: string }[] = [
  { value: 'slim', label: 'Slim' },
  { value: 'average', label: 'Average' },
  { value: 'broad', label: 'Broad' },
];

export const skinHex = (id: string) => SKIN_TONES.find((t) => t.id === id)?.hex ?? SKIN_TONES[4].hex;
export const hairHex = (id: string) => HAIR_COLORS.find((c) => c.id === id)?.hex ?? HAIR_COLORS[1].hex;

export function frameForTrack(track: Track, current?: Frame): Frame {
  if (track === 'menswear' || track === 'womenswear') return track;
  return current ?? 'menswear';
}

function pick<T>(list: readonly T[], random: () => number): T {
  return list[Math.floor(random() * list.length)]!;
}

export function randomAvatar(frame: Frame, random: () => number = Math.random): AvatarConfig {
  return {
    skinTone: pick(SKIN_TONES, random).id,
    hair: pick(HAIR_STYLES, random).id,
    hairColor: pick(HAIR_COLORS.slice(0, 6), random).id,
    build: pick(BUILD_OPTIONS, random).value,
    frame,
  };
}

/** Neutral "fitting room" basics shown on empty slots. */
export const BASICS = {
  top: '#d8d0c2',
  bottom: '#b9af9e',
  shoes: '#8b8274',
} as const;
