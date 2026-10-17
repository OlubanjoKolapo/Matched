import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { clearAllData, DEFAULT_PROFILE, getProfile, MatchedDB, newId, saveProfile } from './db';
import type { Item } from './types';

const db = new MatchedDB(`matched-test`);

afterEach(() => clearAllData(db));

describe('db', () => {
  it('has no profile until one is saved', async () => {
    expect(await getProfile(db)).toBeUndefined();
  });

  it('saves a profile by merging onto the defaults', async () => {
    await saveProfile({ heightCm: 170, goals: ['taller'] }, db);
    const profile = await getProfile(db);
    expect(profile).toEqual({ ...DEFAULT_PROFILE, heightCm: 170, goals: ['taller'] });
    expect(profile).not.toHaveProperty('id');
  });

  it('merges later patches onto the stored profile', async () => {
    await saveProfile({ track: 'womenswear' }, db);
    await saveProfile({ units: 'imperial' }, db);
    expect(await getProfile(db)).toMatchObject({ track: 'womenswear', units: 'imperial' });
  });

  it('stores items and finds them by category', async () => {
    const item: Item = {
      id: newId(),
      track: 'menswear',
      category: 'bottom',
      subtype: 'jeans',
      fit: 'wide',
      colors: [{ hex: '#2b3a55', family: 'denim', share: 1 }],
      pattern: 'solid',
      material: 'denim',
      formality: 2,
      photo: new Blob(['x'], { type: 'image/png' }),
      wornDates: [],
      createdAt: new Date().toISOString(),
      taggedBy: 'user',
    };
    await db.items.add(item);
    const bottoms = await db.items.where('category').equals('bottom').toArray();
    expect(bottoms.map((i) => i.subtype)).toEqual(['jeans']);
  });

  it('clears every table', async () => {
    await saveProfile({}, db);
    await db.outfits.add({ id: newId(), itemIds: [], score: 80, verdict: 'matched', reasons: [] });
    await clearAllData(db);
    expect(await getProfile(db)).toBeUndefined();
    expect(await db.outfits.count()).toBe(0);
  });
});
