import { SAMPLE_WARDROBE, type SampleItem } from './wardrobe';

/** Sample items by id, in the order given. Unknown ids are skipped. */
export function sampleLook(ids: readonly string[]): SampleItem[] {
  return ids.flatMap((id) => SAMPLE_WARDROBE.find((i) => i.id === id) ?? []);
}
