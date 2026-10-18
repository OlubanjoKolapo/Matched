/**
 * Womenswear starter rules: EARLY. Proportion and color logic is shared
 * (rules/shared.ts); this file adds dresses, skirt lengths and heels.
 * Contributions very welcome: see CONTRIBUTING.md.
 */
import { hasWeight, hemLength, isBoot, isCasualBottom, isChunky, isFlat, isHeel } from '@/lib/rules/garment';
import type { Rule, RuleContext } from '@/lib/rules/types';

/** The piece whose hem matters: a dress, or a skirt. */
const hemOf = ({ onepiece, bottom }: RuleContext) => hemLength(onepiece) ?? hemLength(bottom);

const DRESSY_FORMALITY = 3;

export const womenswearRules: Rule[] = [
  {
    id: 'womens.midi-grounded',
    kind: 'shoes',
    effect: 10,
    text: 'A midi hem with flat shoes or boots, like your {shoes}, stays easy and grounded.',
    when: (ctx) => hemOf(ctx) === 'midi' && (isFlat(ctx.shoes) || isBoot(ctx.shoes)),
  },
  {
    id: 'womens.mini-weight',
    kind: 'shoes',
    effect: 10,
    text: 'Chunky shoes or boots, like your {shoes}, give a mini hem some weight and balance.',
    when: (ctx) => hemOf(ctx) === 'mini' && hasWeight(ctx.shoes),
  },
  {
    id: 'womens.maxi-lift',
    kind: 'shoes',
    effect: 6,
    text: 'A maxi length likes a little lift, like the sole on your {shoes}.',
    when: (ctx) => hemOf(ctx) === 'maxi' && (isChunky(ctx.shoes) || isHeel(ctx.shoes) || isBoot(ctx.shoes)),
  },
  {
    id: 'womens.heels-dressy',
    kind: 'formality',
    effect: 8,
    tags: ['polish'],
    text: 'Heels suit the dressier pieces in this outfit.',
    when: ({ shoes, clothing }) => {
      if (!isHeel(shoes) || !clothing.length) return false;
      const average = clothing.reduce((sum, i) => sum + i.formality, 0) / clothing.length;
      return average >= DRESSY_FORMALITY;
    },
  },
  {
    id: 'womens.heels-casual',
    kind: 'formality',
    effect: -8,
    text: 'Heels feel out of place with your {bottom}. Flats, boots or clean sneakers fit better.',
    when: ({ shoes, bottom }) => isHeel(shoes) && isCasualBottom(bottom),
  },
];
