import { COLOR_FAMILIES } from '@/rules/colors';
import { BOTTOM_VOLUME, KEYWORDS, TOP_VOLUME } from '@/rules/garments';
import type { ItemTags } from '@/lib/types';
import { hexToFamily, isFamily, mainColor } from './color';

/** True when the item's subtype contains any keyword. */
export function hasKeyword(item: ItemTags | undefined, keywords: readonly string[]): boolean {
  if (!item) return false;
  const subtype = item.subtype.toLowerCase();
  return keywords.some((k) => subtype.includes(k));
}

export function topVolume(item: ItemTags | undefined): number | undefined {
  return item?.fit ? TOP_VOLUME[item.fit] : undefined;
}

export function bottomVolume(item: ItemTags | undefined): number | undefined {
  return item?.fit ? BOTTOM_VOLUME[item.fit] : undefined;
}

export function isSkirt(item: ItemTags | undefined): boolean {
  return hasKeyword(item, KEYWORDS.skirt);
}

/** Trousers, jeans, shorts: anything with legs. */
export function hasLegs(item: ItemTags | undefined): item is ItemTags {
  return !!item && item.category === 'bottom' && !isSkirt(item);
}

export function isDenim(item: ItemTags | undefined): boolean {
  if (!item) return false;
  return item.material?.toLowerCase() === 'denim' || hasKeyword(item, KEYWORDS.denim);
}

export function isCasualBottom(item: ItemTags | undefined): boolean {
  return hasKeyword(item, KEYWORDS.casualBottom);
}

export function isTailored(item: ItemTags | undefined): boolean {
  return !!item && item.formality >= 3 && hasKeyword(item, KEYWORDS.tailored) && !isCasualBottom(item) && !isDenim(item);
}

export function isCropped(item: ItemTags | undefined): boolean {
  return !!item && (item.fit === 'cropped' || item.fit === 'boxy' || item.length === 'cropped');
}

/** Skirt or dress hem length. */
export function hemLength(item: ItemTags | undefined): 'mini' | 'midi' | 'maxi' | undefined {
  if (!item) return undefined;
  if (hasKeyword(item, KEYWORDS.hem.mini)) return 'mini';
  if (hasKeyword(item, KEYWORDS.hem.midi)) return 'midi';
  if (hasKeyword(item, KEYWORDS.hem.maxi)) return 'maxi';
  if (item.category === 'onepiece' || isSkirt(item)) {
    if (item.length === 'cropped') return 'mini';
    if (item.length === 'long') return 'maxi';
  }
  return undefined;
}

// ── Shoes ──────────────────────────────────────────────

export const isChunky = (shoe: ItemTags | undefined) => shoe?.shoeProfile === 'chunky';
export const isBoot = (shoe: ItemTags | undefined) => shoe?.shoeProfile === 'boot';
export const isHeel = (shoe: ItemTags | undefined) => shoe?.shoeProfile === 'heel';
export const isLowShoe = (shoe: ItemTags | undefined) => shoe?.shoeProfile === 'low';
export const isRunningShoe = (shoe: ItemTags | undefined) => hasKeyword(shoe, KEYWORDS.shoe.running);
export const isChelsea = (shoe: ItemTags | undefined) => hasKeyword(shoe, KEYWORDS.shoe.chelsea);
export const isFlat = (shoe: ItemTags | undefined) => isLowShoe(shoe) || hasKeyword(shoe, KEYWORDS.shoe.flat);

/** Loafers, derbies, Chelsea boots and minimal leather sneakers. */
export function isPolishedShoe(shoe: ItemTags | undefined): boolean {
  const { loafer, derby, chelsea, minimal } = KEYWORDS.shoe;
  return hasKeyword(shoe, [...loafer, ...derby, ...chelsea, ...minimal]);
}

/** A shoe with weight: chunky soles and boots. */
export const hasWeight = (shoe: ItemTags | undefined) => isChunky(shoe) || isBoot(shoe);

/** A shoe that keeps a low, sleek line: low profiles and Chelsea boots. */
export const isSleek = (shoe: ItemTags | undefined) => isLowShoe(shoe) || isChelsea(shoe);

// ── Layers and patterns ────────────────────────────────

export const isLayer = (item: ItemTags | undefined) => hasKeyword(item, KEYWORDS.layer);
export const isStructured = (item: ItemTags | undefined) => hasKeyword(item, KEYWORDS.structured);
export const isBridge = (item: ItemTags | undefined) => hasKeyword(item, KEYWORDS.bridge);

export function isPatterned(item: ItemTags): boolean {
  return item.pattern !== 'solid' && item.pattern !== 'texture';
}

/** Lower-case name for reasons: "forest green hoodie", or "olive overshirt" when unnamed. */
export function itemLabel(item: ItemTags): string {
  if (item.name) return item.name.toLowerCase();
  const main = mainColor(item);
  const family = main ? (isFamily(main.family) ? main.family : hexToFamily(main.hex)) : undefined;
  const color = family ? COLOR_FAMILIES[family].label : '';
  return `${color} ${item.subtype}`.trim().toLowerCase();
}
