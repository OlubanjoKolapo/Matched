import { getDB, getProfile, saveProfile } from '@/lib/db';
import { dayKey } from '@/lib/outfit/today';
import { nextStreak } from './index';

/** Marks a lesson read and keeps the "days of style" streak. Safe to call repeatedly. */
export async function markLessonRead(id: string, today = dayKey()): Promise<void> {
  const db = getDB();
  await db.transaction('rw', db.profile, async () => {
    const profile = await getProfile(db);
    if (!profile) return;
    const lessonsRead = profile.lessonsRead.includes(id) ? profile.lessonsRead : [...profile.lessonsRead, id];
    const streak = nextStreak(profile.streak, today);
    if (lessonsRead === profile.lessonsRead && streak === profile.streak) return;
    await saveProfile({ lessonsRead, streak }, db);
  });
}
