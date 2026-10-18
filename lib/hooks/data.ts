'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { getDB, getProfile } from '@/lib/db';
import type { Item, Profile } from '@/lib/types';

/** The saved profile: undefined while loading, null when there is none yet. */
export function useProfile(): Profile | null | undefined {
  return useLiveQuery(async () => (await getProfile()) ?? null, []);
}

/** Every item in the wardrobe, newest first. Undefined while loading. */
export function useWardrobe(): Item[] | undefined {
  return useLiveQuery(() => getDB().items.orderBy('createdAt').reverse().toArray(), []);
}

/**
 * One object URL per image Blob, created on first use and reused after.
 * Keyed weakly by the Blob, so repeated renders and live-query refreshes
 * never mint duplicates. Wardrobes are small, so URLs live for the session.
 */
const blobUrls = new WeakMap<Blob, string>();

export function imageUrl(item: Item): string {
  const blob = item.cutout ?? item.photo;
  let url = blobUrls.get(blob);
  if (!url) {
    url = URL.createObjectURL(blob);
    blobUrls.set(blob, url);
  }
  return url;
}

/** Image URLs (cutout first, else the photo) for a list of items, keyed by id. */
export function useItemImages(items: Item[] | undefined): Map<string, string> {
  return useMemo(() => new Map((items ?? []).map((i) => [i.id, imageUrl(i)])), [items]);
}
