import { z } from 'zod';
import { COLOR_FAMILIES } from '@/rules/colors';
import { CATEGORIES, FITS, LENGTHS, PATTERNS, RISES, SHOE_PROFILES } from '@/lib/types';

const FAMILY_IDS = Object.keys(COLOR_FAMILIES) as [string, ...string[]];

/** 0–1. Bounds live in descriptions; values are clamped after parsing. */
const confidence = z.number().describe('How sure you are, from 0 (guess) to 1 (certain).');

/**
 * What Claude returns for one photo. Mirrors the Item tag fields, plus a
 * confidence per field so the app can ask the person to confirm weak guesses.
 */
export const TagSchema = z.object({
  pieces_visible: z
    .number()
    .describe('How many separate garments or shoes are clearly visible. Tag only the most prominent one.'),
  name: z.string().describe('Short display name, Title Case, color first: "Forest Green Hoodie", "Light Wash Wide Jeans".'),
  category: z.enum(CATEGORIES),
  subtype: z.string().describe('Lower-case garment type: "hoodie", "oxford shirt", "jeans", "chelsea boot", "midi skirt".'),
  fit: z.enum(FITS).nullable().describe('Silhouette of tops, bottoms and outerwear. Null for shoes and accessories.'),
  shoe_profile: z.enum(SHOE_PROFILES).nullable().describe('Shoes only: low (sleek, thin sole), standard, chunky (thick sole), boot, heel.'),
  rise: z.enum(RISES).nullable().describe('Bottoms only, if visible.'),
  length: z.enum(LENGTHS).nullable().describe('cropped, regular or long, relative to a typical version of this garment.'),
  colors: z
    .array(
      z.object({
        hex: z.string().describe('#rrggbb sampled from the fabric in neutral light.'),
        family: z.enum(FAMILY_IDS),
        share: z.number().describe('Fraction of the visible garment, 0–1.'),
      }),
    )
    .describe('Main colors, largest first, 1 to 3 entries.'),
  pattern: z.enum(PATTERNS),
  material: z.string().nullable().describe('Main fabric if identifiable: denim, knit, leather, suede, cotton, wool, linen, twill.'),
  formality: z.number().describe('1 gym, 2 casual, 3 smart casual, 4 business, 5 suit or evening.'),
  confidence: z.object({
    category: confidence,
    subtype: confidence,
    fit: confidence,
    colors: confidence,
    pattern: confidence,
    formality: confidence,
  }),
});

export type TagResult = z.infer<typeof TagSchema>;
