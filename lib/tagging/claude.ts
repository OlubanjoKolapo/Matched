import type Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { COLOR_FAMILIES } from '@/rules/colors';
import { TagSchema, type TagResult } from './schema';

/** The brief specifies Claude Haiku for tagging: fast and inexpensive per photo. */
export const TAGGING_MODEL = 'claude-haiku-5-5';

const familyList = Object.entries(COLOR_FAMILIES)
  .map(([id, f]) => `${id} (${f.group})`)
  .join(', ');

/** Kept byte-stable so it can be cached across requests. */
const SYSTEM = `You tag clothing photos for Matched, a wardrobe app that pairs the pieces a person owns.

Look at the single most prominent garment or pair of shoes in the photo. If several pieces are visible, say how many in pieces_visible and tag only the most prominent one.

Be precise about silhouette, because outfit advice depends on it:
- Tops: fitted (close to the body), regular, relaxed, oversized (dropped shoulders, roomy), boxy (wide and short), cropped (ends above the waist).
- Bottoms: skinny, slim, straight, relaxed, wide, baggy. Wide and baggy legs are much broader at the hem than the knee.
- Shoes: low (sleek sole, e.g. loafers, minimal leather sneakers), standard, chunky (thick, bulky sole), boot, heel.

Colors: give the fabric's real color as it would look in neutral daylight, ignoring shadows and background. Map each to one of these families: ${familyList}. Blue jeans use a blue family; their material is denim.

Formality runs from 1 (gym) to 5 (suit or evening). Jeans and t-shirts are about 2, chinos and oxford shirts 3, tailored trousers and loafers 4.

Set each confidence honestly. Use below 0.6 when the photo doesn't show enough to be sure; the app will ask the person to confirm those fields.`;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Normalises values the schema only describes: confidences, shares, formality, hex format. */
function tidy(result: TagResult): TagResult {
  const colors = result.colors
    .filter((c) => /^#[0-9a-f]{6}$/i.test(c.hex))
    .slice(0, 3)
    .map((c) => ({ ...c, hex: c.hex.toLowerCase(), share: clamp(c.share, 0, 1) }));
  return {
    ...result,
    formality: clamp(Math.round(result.formality), 1, 5),
    colors,
    confidence: Object.fromEntries(
      Object.entries(result.confidence).map(([k, v]) => [k, clamp(v, 0, 1)]),
    ) as TagResult['confidence'],
  };
}

export class TaggingRefused extends Error {}

/**
 * Tags one JPEG (base64, no data: prefix). Works in the browser with the
 * person's own key and on the server with the demo key: the caller supplies
 * the client.
 */
export async function tagImage(client: Anthropic, imageBase64: string): Promise<TagResult> {
  const response = await client.messages.parse({
    model: TAGGING_MODEL,
    max_tokens: 4000,
    // Classification: low effort keeps it quick and cheap.
    output_config: { effort: 'low', format: zodOutputFormat(TagSchema) },
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
          { type: 'text', text: 'Tag this piece.' },
        ],
      },
    ],
  });

  if (response.stop_reason === 'refusal') throw new TaggingRefused('This photo could not be tagged.');
  if (!response.parsed_output) throw new Error('Tagging returned an unexpected format.');
  return tidy(response.parsed_output);
}
