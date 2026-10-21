import { getDB, getProfile, newId } from '@/lib/db';
import { normalizeDraft, type DraftTags } from '@/lib/tagging/draft';
import type { Item } from '@/lib/types';

/** Saves a new piece. The cutout is optional: without one the original photo shows on a neutral tile. */
export async function addItem({
  tags,
  photo,
  cutout,
  taggedBy,
}: {
  tags: DraftTags;
  photo: Blob;
  cutout?: Blob;
  taggedBy: Item['taggedBy'];
}): Promise<Item> {
  const profile = await getProfile();
  const item: Item = {
    ...normalizeDraft(tags),
    id: newId(),
    track: profile?.track ?? 'menswear',
    photo,
    cutout,
    wornDates: [],
    createdAt: new Date().toISOString(),
    taggedBy,
  };
  await getDB().items.add(item);
  return item;
}

export async function updateItemTags(id: string, tags: DraftTags): Promise<void> {
  await getDB().items.update(id, { ...normalizeDraft(tags), taggedBy: 'user' });
}

export async function deleteItem(id: string): Promise<void> {
  await getDB().items.delete(id);
}
