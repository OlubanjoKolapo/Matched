import type { AvatarConfig, Goal, Track } from '@/lib/types';

/** Onboarding copy and presets. Voice: a confident, friendly stylist. */

export const STEPS = ['welcome', 'track', 'height', 'goals', 'avatar', 'wardrobe', 'first-match'] as const;
export type Step = (typeof STEPS)[number];

export const TRACK_OPTIONS: { value: Track; title: string; body: string; early?: boolean }[] = [
  { value: 'menswear', title: 'Menswear', body: 'Tailoring, denim, sneakers and everything between.' },
  { value: 'womenswear', title: 'Womenswear', body: 'Dresses, skirts, heels and flats, with the same rules underneath.', early: true },
  { value: 'both', title: 'Both', body: 'Shop across the floor. You pick the cut of your figure.' },
];

export const GOAL_OPTIONS: { value: Goal; label: string; tip: string; look: string[] }[] = [
  {
    value: 'taller',
    label: 'Look taller',
    tip: 'One color head to toe, and shoes that match your trousers, draw one long line.',
    look: ['sample-boxy-tee', 'sample-black-jeans', 'sample-chelsea'],
  },
  {
    value: 'broader',
    label: 'Look broader',
    tip: 'Structure up top, slimmer below. An overshirt or a heavy knit builds the V.',
    look: ['sample-white-tee', 'sample-overshirt', 'sample-chinos', 'sample-white-sneakers'],
  },
  {
    value: 'leaner',
    label: 'Look leaner',
    tip: 'A dark base and clean, straight lines keep the silhouette long and sharp.',
    look: ['sample-boxy-tee', 'sample-chinos', 'sample-chelsea'],
  },
  {
    value: 'put-together',
    label: 'Look more put-together',
    tip: 'Keep every piece at the same level of dressiness. Polish is consistency.',
    look: ['sample-oxford', 'sample-trousers', 'sample-loafers'],
  },
  {
    value: 'match',
    label: 'Just make it match',
    tip: 'No agenda. Just clothes that work together, every time.',
    look: ['sample-knit', 'sample-black-jeans', 'sample-white-sneakers'],
  },
];

/** What the figure wears before any goal is picked. */
export const DEFAULT_LOOK = ['sample-knit', 'sample-black-jeans', 'sample-chelsea'];

/** The welcome screen cycles three looks on three different figures. */
export const WELCOME_LOOKS: { avatar: AvatarConfig; items: string[] }[] = [
  {
    avatar: { skinTone: 'tone-6', hair: 'textured', hairColor: 'black', build: 'average', frame: 'menswear' },
    items: ['sample-knit', 'sample-black-jeans', 'sample-chelsea'],
  },
  {
    avatar: { skinTone: 'tone-2', hair: 'waves', hairColor: 'brown', build: 'slim', frame: 'womenswear' },
    items: ['sample-boxy-tee', 'sample-wide-jeans', 'sample-chunky-sneakers'],
  },
  {
    avatar: { skinTone: 'tone-9', hair: 'locs', hairColor: 'black', build: 'broad', frame: 'menswear' },
    items: ['sample-green-hoodie', 'sample-overshirt', 'sample-chinos', 'sample-white-sneakers'],
  },
];

export const PRIVACY_LINE = 'Everything stays on this device.';
