'use client';

import { resizeImage, toBase64 } from '@/lib/image/process';
import type { TagResult } from './schema';

export type TagSource = 'own-key' | 'demo' | 'manual';

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

/** Order from the brief: the person's own key, then the hosted demo, otherwise manual chips. */
export function taggingSource(apiKey?: string): TagSource {
  if (apiKey) return 'own-key';
  if (DEMO_MODE) return 'demo';
  return 'manual';
}

export type TagOutcome =
  | { source: 'own-key' | 'demo'; tags: TagResult }
  | { source: TagSource; error: string }
  | { source: 'manual' };

/**
 * Tags a photo (the cutout when available). Never throws: failures come back
 * as an error message and the person tags with chips instead.
 */
export async function autoTag(image: Blob, apiKey?: string): Promise<TagOutcome> {
  const source = taggingSource(apiKey);
  if (source === 'manual') return { source };

  try {
    const jpeg = await resizeImage(image, { maxSide: 1000, type: 'image/jpeg', quality: 0.8 });
    const base64 = await toBase64(jpeg);

    if (source === 'own-key') {
      // Loaded on demand so the SDK only ships to people who tag with their own key.
      const [{ default: Anthropic }, { tagImage }] = await Promise.all([import('@anthropic-ai/sdk'), import('./claude')]);
      // The key is the person's own, kept on their device; calls go straight to Anthropic.
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
      try {
        return { source, tags: await tagImage(client, base64) };
      } catch (error) {
        if (error instanceof Anthropic.AuthenticationError) return { source, error: 'Your API key was rejected. Check it in Settings.' };
        if (error instanceof Anthropic.RateLimitError) return { source, error: 'Your key hit its rate limit. Try again shortly.' };
        throw error;
      }
    }

    const response = await fetch('/api/tag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 }),
    });
    const body = (await response.json()) as TagResult | { error: string };
    if (!response.ok || 'error' in body) return { source, error: 'error' in body ? body.error : 'Tagging failed.' };
    return { source, tags: body };
  } catch {
    return { source, error: 'Couldn’t reach the tagging service. Tag it by hand below.' };
  }
}
