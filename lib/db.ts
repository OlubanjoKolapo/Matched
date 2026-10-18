import Dexie, { type EntityTable } from 'dexie';
import type { Item, Outfit, Profile } from './types';

/** The profile is a single row keyed 'me'. */
export interface ProfileRecord extends Profile {
  id: 'me';
}

const PROFILE_ID = 'me' as const;

export class MatchedDB extends Dexie {
  items!: EntityTable<Item, 'id'>;
  outfits!: EntityTable<Outfit, 'id'>;
  profile!: EntityTable<ProfileRecord, 'id'>;

  constructor(name = 'matched') {
    super(name);
    // Only indexed fields are listed; Blobs and nested data are stored as-is.
    this.version(1).stores({
      items: 'id, category, track, createdAt',
      outfits: 'id, savedAt',
      profile: 'id',
    });
  }
}

let instance: MatchedDB | undefined;

/** Lazily opened so importing this module during SSR never touches IndexedDB. */
export function getDB(): MatchedDB {
  instance ??= new MatchedDB();
  return instance;
}

export const DEFAULT_PROFILE: Profile = {
  track: 'menswear',
  units: 'metric',
  goals: [],
  avatar: { skinTone: 'tone-5', hair: 'crop', hairColor: 'espresso', build: 'average', frame: 'menswear' },
  lessonsRead: [],
  streak: { count: 0, lastDay: '' },
};

export function newId(): string {
  return crypto.randomUUID();
}

export async function getProfile(db = getDB()): Promise<Profile | undefined> {
  const record = await db.profile.get(PROFILE_ID);
  if (!record) return undefined;
  const profile: Partial<ProfileRecord> = { ...record };
  delete profile.id;
  return profile as Profile;
}

export async function saveProfile(patch: Partial<Profile>, db = getDB()): Promise<Profile> {
  return db.transaction('rw', db.profile, async () => {
    const current = (await getProfile(db)) ?? DEFAULT_PROFILE;
    const next: Profile = { ...current, ...patch };
    await db.profile.put({ ...next, id: PROFILE_ID });
    return next;
  });
}

/** Wipes every table. Used by Settings → Clear all data. */
export async function clearAllData(db = getDB()): Promise<void> {
  await db.transaction('rw', [db.items, db.outfits, db.profile], async () => {
    await Promise.all([db.items.clear(), db.outfits.clear(), db.profile.clear()]);
  });
}
