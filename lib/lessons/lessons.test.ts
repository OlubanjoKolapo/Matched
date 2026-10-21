import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { COLOR_FAMILIES } from '@/rules/colors';
import { ALL_RULES } from '@/rules';
import { AVERAGE_HEIGHT_CM } from '@/rules/tuning';
import { scoreOutfit, isComplete } from '@/lib/rules';
import { avatarSupports } from '@/lib/avatar/garments';
import { CATEGORIES, FITS, FORMALITY_LEVELS, GOALS, LENGTHS, PATTERNS, REASON_KINDS, RISES, SHOE_PROFILES, TRACKS } from '@/lib/types';
import { SAMPLE_WARDROBE } from '@/lib/sample/wardrobe';
import {
  LESSONS,
  currentStreak,
  lessonOfTheDay,
  lessonsFor,
  lookItems,
  nextStreak,
  tryItWith,
} from './index';

const LookPieceSchema = z.strictObject({
  category: z.enum(CATEGORIES),
  subtype: z.string().min(2),
  fit: z.enum(FITS).optional(),
  shoeProfile: z.enum(SHOE_PROFILES).optional(),
  rise: z.enum(RISES).optional(),
  length: z.enum(LENGTHS).optional(),
  color: z.enum(Object.keys(COLOR_FAMILIES) as [string, ...string[]]),
  pattern: z.enum(PATTERNS).optional(),
  material: z.string().optional(),
  formality: z.union(FORMALITY_LEVELS.map((n) => z.literal(n))),
});

const LessonSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(4).max(48),
  rule: z.string().min(10).max(90),
  body: z.string().min(40).max(260),
  kind: z.enum(REASON_KINDS),
  tracks: z.array(z.enum(TRACKS)),
  bands: z.array(z.enum(['shorter', 'average', 'taller'])),
  goals: z.array(z.enum(GOALS)),
  ruleIds: z.array(z.string()).min(1),
  look: z.array(LookPieceSchema).min(2),
});

const RULE_IDS = new Set(ALL_RULES.map((r) => r.id));

/** A person each lesson was written for. */
function audienceFor(lesson: (typeof LESSONS)[number]) {
  const track = lesson.tracks[0] ?? 'menswear';
  const average = AVERAGE_HEIGHT_CM[track];
  const band = lesson.bands[0] ?? 'average';
  const heightCm = band === 'shorter' ? average - 12 : band === 'taller' ? average + 12 : average;
  return { track, heightCm, goals: lesson.goals };
}

describe('lesson content', () => {
  it('has at least 30 lessons', () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(30);
  });

  it('has unique ids', () => {
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(LESSONS.length);
  });

  it.each(LESSONS.map((l) => [l.id, l] as const))('%s matches the schema and names real rules', (_, lesson) => {
    LessonSchema.parse(lesson);
    for (const id of lesson.ruleIds) expect(RULE_IDS, `unknown rule ${id}`).toContain(id);
  });

  it.each(LESSONS.map((l) => [l.id, l] as const))('%s: its look is complete, works, and shows the rule', (_, lesson) => {
    const audience = audienceFor(lesson);
    const items = lookItems(lesson, audience.track);
    expect(isComplete(items)).toBe(true);
    expect(avatarSupports(items), 'the mannequin can draw it').toBe(true);
    const result = scoreOutfit(items, audience);
    expect(result.score, result.reasons.map((r) => r.text).join(' / ')).toBeGreaterThanOrEqual(62);
    const fired = result.hits.map((h) => h.rule.id);
    expect(fired.some((id) => lesson.ruleIds.includes(id)), `fired: ${fired.join(', ')}`).toBe(true);
  });
});

describe('personalisation', () => {
  const short = { track: 'menswear' as const, heightCm: 165, goals: ['taller' as const] };
  const tall = { track: 'menswear' as const, heightCm: 190, goals: [] };

  it('changes with height', () => {
    const forShort = lessonsFor(short).map((l) => l.id);
    const forTall = lessonsFor(tall).map((l) => l.id);
    expect(forShort).toContain('one-long-line');
    expect(forShort).not.toContain('carry-volume');
    expect(forTall).toContain('carry-volume');
    expect(forTall).not.toContain('one-long-line');
  });

  it('puts lessons for your goals first', () => {
    const broader = lessonsFor({ track: 'menswear', heightCm: 176, goals: ['broader'] });
    expect(broader[0]!.goals).toContain('broader');
    const leaner = lessonsFor({ track: 'menswear', heightCm: 176, goals: ['leaner'] });
    expect(leaner[0]!.goals).toContain('leaner');
    expect(broader[0]!.id).not.toBe(leaner[0]!.id);
  });

  it('keeps womenswear lessons to womenswear and both', () => {
    const mens = lessonsFor({ track: 'menswear', goals: [] }).map((l) => l.id);
    const womens = lessonsFor({ track: 'womenswear', goals: [] }).map((l) => l.id);
    const both = lessonsFor({ track: 'both', goals: [] }).map((l) => l.id);
    expect(mens).not.toContain('midi-grounded');
    expect(womens).toContain('midi-grounded');
    expect(womens).not.toContain('polished-shoes');
    expect(both).toContain('midi-grounded');
    expect(both).toContain('polished-shoes');
  });

  it('gives a lesson of the day: unread first, then round again', () => {
    const profile = { ...short, lessonsRead: [] as string[] };
    const first = lessonOfTheDay(profile, '2026-10-21');
    expect(first?.id).toBe(lessonsFor(short)[0]!.id);
    const second = lessonOfTheDay({ ...profile, lessonsRead: [first!.id] }, '2026-10-21');
    expect(second?.id).not.toBe(first?.id);
    const all = lessonsFor(short).map((l) => l.id);
    const a = lessonOfTheDay({ ...profile, lessonsRead: all }, '2026-10-21');
    const b = lessonOfTheDay({ ...profile, lessonsRead: all }, '2026-10-22');
    expect(a && b && a.id !== b.id).toBe(true);
  });
});

describe('try it with your clothes', () => {
  const profile = { track: 'menswear' as const, heightCm: 176, goals: [] };

  it('finds an owned outfit that shows the rule', () => {
    const lesson = LESSONS.find((l) => l.id === 'wide-legs-weight')!;
    const items = tryItWith(lesson, SAMPLE_WARDROBE, profile);
    expect(items).toBeDefined();
    expect(scoreOutfit(items!, profile).hits.some((h) => lesson.ruleIds.includes(h.rule.id))).toBe(true);
  });

  it('returns nothing when the wardrobe cannot show it', () => {
    const lesson = LESSONS.find((l) => l.id === 'midi-grounded')!;
    expect(tryItWith(lesson, SAMPLE_WARDROBE, profile)).toBeUndefined();
  });

  it('most lessons can be tried with the sample wardrobe', () => {
    const mens = lessonsFor({ track: 'menswear', goals: [] });
    const tryable = mens.filter((l) => tryItWith(l, SAMPLE_WARDROBE, profile));
    expect(tryable.length / mens.length).toBeGreaterThan(0.6);
  });
});

describe('streak', () => {
  it('starts, continues, holds and resets', () => {
    let s = nextStreak({ count: 0, lastDay: '' }, '2026-10-20');
    expect(s).toEqual({ count: 1, lastDay: '2026-10-20' });
    s = nextStreak(s, '2026-10-20');
    expect(s.count).toBe(1);
    s = nextStreak(s, '2026-10-21');
    expect(s.count).toBe(2);
    expect(currentStreak(s, '2026-10-22')).toBe(2);
    expect(currentStreak(s, '2026-10-23')).toBe(0);
    expect(nextStreak(s, '2026-10-24')).toEqual({ count: 1, lastDay: '2026-10-24' });
  });

  it('crosses month ends', () => {
    expect(nextStreak({ count: 4, lastDay: '2026-10-31' }, '2026-11-01').count).toBe(5);
  });
});
