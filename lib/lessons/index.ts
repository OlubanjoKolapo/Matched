import essentials from '@/content/lessons/essentials.json';
import polish from '@/content/lessons/polish.json';
import shape from '@/content/lessons/shape.json';
import tallFrame from '@/content/lessons/tall-frame.json';
import taller from '@/content/lessons/taller.json';
import womenswear from '@/content/lessons/womenswear.json';
import { heightBandFor } from '@/rules/tuning';
import { generateOutfits, type RulesProfile } from '@/lib/rules';
import { familyHex } from '@/lib/rules/color';
import type { HeightBand, ItemTags, Profile, Track } from '@/lib/types';
import type { Lesson } from './types';

export type { Lesson, LookPiece } from './types';

/** Every lesson, in authoring order. Validated against the schema in lessons.test.ts. */
export const LESSONS = [...taller, ...tallFrame, ...shape, ...polish, ...essentials, ...womenswear] as Lesson[];

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

function forTrack(lesson: Lesson, track: Track): boolean {
  if (!lesson.tracks.length || track === 'both') return true;
  return lesson.tracks.includes(track);
}

/** How well a lesson fits this person. Higher is more relevant; 0 still shows. */
function relevance(lesson: Lesson, band: HeightBand, profile: Pick<Profile, 'goals'>): number {
  const goalHits = lesson.goals.filter((g) => profile.goals.includes(g)).length;
  const bandHit = lesson.bands.includes(band) ? 1 : 0;
  return goalHits * 3 + bandHit * 2;
}

/**
 * The lessons for this person, most relevant first. Lessons written for a
 * different height band are left out: advice for a tall frame is wrong for a
 * short one. Ties keep authoring order.
 */
export function lessonsFor(profile: Pick<Profile, 'track' | 'goals' | 'heightCm'>): Lesson[] {
  const band = heightBandFor(profile.track, profile.heightCm);
  return LESSONS.map((lesson, index) => ({ lesson, index }))
    .filter(({ lesson }) => forTrack(lesson, profile.track))
    .filter(({ lesson }) => !lesson.bands.length || lesson.bands.includes(band))
    .map(({ lesson, index }) => ({ lesson, index, score: relevance(lesson, band, profile) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ lesson }) => lesson);
}

/**
 * Today's lesson: the most relevant one not read yet. Once everything has been
 * read, lessons come back round in order, one per day.
 */
export function lessonOfTheDay(
  profile: Pick<Profile, 'track' | 'goals' | 'heightCm' | 'lessonsRead'>,
  date: string,
): Lesson | undefined {
  const lessons = lessonsFor(profile);
  const unread = lessons.find((l) => !profile.lessonsRead.includes(l.id));
  if (unread) return unread;
  if (!lessons.length) return undefined;
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
  return lessons[day % lessons.length];
}

/** A lesson's look as taggable pieces, for the mannequin and the rules engine. */
export function lookItems(lesson: Lesson, track: Track = 'menswear'): ItemTags[] {
  return lesson.look.map((piece, i) => ({
    id: `lesson-${lesson.id}-${i}`,
    track: track === 'womenswear' ? 'womenswear' : 'menswear',
    category: piece.category,
    subtype: piece.subtype,
    fit: piece.fit,
    shoeProfile: piece.shoeProfile,
    rise: piece.rise,
    length: piece.length,
    colors: [{ hex: familyHex(piece.color), family: piece.color, share: 1 }],
    pattern: piece.pattern ?? 'solid',
    material: piece.material,
    formality: piece.formality,
  }));
}

/**
 * "Try it with your clothes": the best outfit you own where the engine sees
 * this lesson's rule at work. Undefined when nothing in the wardrobe shows it.
 */
export function tryItWith<T extends ItemTags>(lesson: Lesson, wardrobe: T[], profile: RulesProfile): T[] | undefined {
  const outfits = generateOutfits(wardrobe, profile, { limit: Infinity, minScore: 55 });
  return outfits.find(({ result }) => result.hits.some((h) => lesson.ruleIds.includes(h.rule.id)))?.items;
}

// ── Streak ───────────────────────────────────────────

/** Days between two YYYY-MM-DD dates. */
function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** The streak after reading a lesson today. Same day: unchanged. Next day: +1. Gap: starts again. */
export function nextStreak(streak: Profile['streak'], today: string): Profile['streak'] {
  if (streak.lastDay === today) return streak;
  const continues = streak.lastDay && daysBetween(streak.lastDay, today) === 1;
  return { count: continues ? streak.count + 1 : 1, lastDay: today };
}

/** The streak as it stands today: alive if a lesson was read today or yesterday. */
export function currentStreak(streak: Profile['streak'], today: string): number {
  if (!streak.lastDay) return 0;
  const gap = daysBetween(streak.lastDay, today);
  return gap === 0 || gap === 1 ? streak.count : 0;
}
