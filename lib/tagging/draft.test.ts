import { describe, expect, it } from 'vitest';
import { draftFromTags, manualDraft, normalizeDraft, suggestName } from './draft';
import { TagSchema, type TagResult } from './schema';

const result: TagResult = {
  pieces_visible: 1,
  name: 'Light Wash Wide Jeans',
  category: 'bottom',
  subtype: 'Jeans',
  fit: 'wide',
  shoe_profile: null,
  rise: 'high',
  length: null,
  colors: [{ hex: '#8fb0d0', family: 'light-blue', share: 1 }],
  pattern: 'solid',
  material: 'denim',
  formality: 2,
  confidence: { category: 0.98, subtype: 0.95, fit: 0.45, colors: 0.9, pattern: 0.92, formality: 0.5 },
};

describe('draftFromTags', () => {
  it('maps Claude’s tags to editable fields', () => {
    const { draft } = draftFromTags(result);
    expect(draft).toMatchObject({ category: 'bottom', subtype: 'jeans', fit: 'wide', rise: 'high', material: 'denim', formality: 2 });
  });

  it('flags low-confidence fields for confirmation', () => {
    expect(draftFromTags(result).uncertain.sort()).toEqual(['fit', 'formality']);
  });

  it('accepts what the schema accepts', () => {
    expect(TagSchema.safeParse(result).success).toBe(true);
    expect(TagSchema.safeParse({ ...result, category: 'hat' }).success).toBe(false);
  });
});

describe('normalizeDraft', () => {
  it('drops fields that do not apply and fills sensible defaults', () => {
    const shoes = normalizeDraft({ ...manualDraft([]), category: 'shoes', subtype: '', fit: 'wide', rise: 'high' });
    expect(shoes.fit).toBeUndefined();
    expect(shoes.rise).toBeUndefined();
    expect(shoes.shoeProfile).toBe('standard');
    expect(shoes.subtype).toBe('leather sneaker');
  });

  it('replaces a fit that does not suit the category', () => {
    expect(normalizeDraft({ ...manualDraft([]), category: 'bottom', fit: 'regular' }).fit).toBe('straight');
  });

  it('names an unnamed piece from its color and type', () => {
    const d = { ...manualDraft([{ hex: '#1f2a44', family: 'navy', share: 1 }]), subtype: 'chinos' };
    expect(suggestName(d)).toBe('Navy Chinos');
    expect(normalizeDraft(d).name).toBe('Navy Chinos');
  });
});
