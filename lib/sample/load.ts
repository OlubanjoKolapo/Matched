import { getDB } from '@/lib/db';
import type { Item } from '@/lib/types';
import { SAMPLE_WARDROBE } from './wardrobe';

/** Fetches the sample illustrations and stores the sample wardrobe in IndexedDB. */
export async function loadSampleWardrobe(db = getDB()): Promise<number> {
  const createdAt = new Date().toISOString();
  const items = await Promise.all(
    SAMPLE_WARDROBE.map(async ({ image, ...tags }): Promise<Item> => {
      const response = await fetch(image);
      if (!response.ok) throw new Error(`Could not load sample image ${image}`);
      const blob = await response.blob();
      return { ...tags, photo: blob, cutout: blob, wornDates: [], createdAt, taggedBy: 'user' };
    }),
  );
  await db.items.bulkPut(items);
  return items.length;
}
