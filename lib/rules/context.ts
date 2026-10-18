import { heightBandFor } from '@/rules/tuning';
import type { ItemTags } from '@/lib/types';
import { colorInfo } from './color';
import { isDenim } from './garment';
import type { ColorInfo, RuleContext, RulesProfile } from './types';

export const DEFAULT_RULES_PROFILE: RulesProfile = { track: 'menswear', goals: [] };

/** Sorts an outfit's items into slots and precomputes what rules need. */
export function buildContext(items: ItemTags[], profile: RulesProfile = DEFAULT_RULES_PROFILE): RuleContext {
  const first = (category: ItemTags['category']) => items.find((i) => i.category === category);
  const clothing = items.filter((i) => i.category !== 'shoes' && i.category !== 'accessory');
  const shoes = first('shoes');

  const colors = new Map<string, ColorInfo>();
  const color = (item: ItemTags) => {
    let info = colors.get(item.id);
    if (!info) {
      info = colorInfo(item, isDenim(item));
      colors.set(item.id, info);
    }
    return info;
  };

  return {
    items,
    top: first('top'),
    bottom: first('bottom'),
    onepiece: first('onepiece'),
    outerwear: first('outerwear'),
    shoes,
    accessories: items.filter((i) => i.category === 'accessory'),
    clothing,
    worn: shoes ? [...clothing, shoes] : clothing,
    profile,
    heightBand: heightBandFor(profile.track, profile.heightCm),
    color,
  };
}
