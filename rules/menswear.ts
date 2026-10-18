/**
 * Menswear rules: tailoring, layering and shape. These run for the menswear
 * and both tracks, on top of rules/shared.ts.
 */
import {
  bottomVolume,
  hasLegs,
  isLayer,
  isPolishedShoe,
  isRunningShoe,
  isStructured,
  isTailored,
} from '@/lib/rules/garment';
import type { Rule } from '@/lib/rules/types';
import { VOLUME } from './garments';

export const menswearRules: Rule[] = [
  {
    id: 'mens.tailoring-polish',
    kind: 'shoes',
    effect: 10,
    tags: ['polish'],
    text: 'Polished shoes like your {shoes} suit tailoring like your {bottom}.',
    when: ({ bottom, shoes }) => isTailored(bottom) && isPolishedShoe(shoes),
  },
  {
    id: 'mens.tailoring-runners',
    kind: 'shoes',
    effect: -14,
    text: 'Running shoes pull your {bottom} toward the gym. Loafers, derbies or a clean leather sneaker suit tailoring better.',
    when: ({ bottom, shoes }) => isTailored(bottom) && isRunningShoe(shoes),
  },
  {
    id: 'mens.open-layer',
    kind: 'proportion',
    effect: 6,
    tags: ['leg-line'],
    text: 'An open {outerwear} over your {top} adds a vertical line and a second texture.',
    when: ({ top, outerwear }) => !!top && isLayer(outerwear),
  },
  {
    id: 'mens.v-shape',
    kind: 'proportion',
    effect: 5,
    tags: ['v-shape'],
    text: 'Structure up top from your {piece}, with your slimmer {bottom} below, builds a V shape.',
    when: ({ top, outerwear, bottom }) => {
      if (!hasLegs(bottom) || (bottomVolume(bottom) ?? Infinity) > VOLUME.cleanLine) return false;
      if (isStructured(outerwear)) return { piece: outerwear! };
      if (top?.material?.toLowerCase() === 'knit') return { piece: top };
      return false;
    },
  },
];
