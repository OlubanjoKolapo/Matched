import { rulesFor } from '@/rules';
import { PROFILE_MODIFIERS, SCORING } from '@/rules/tuning';
import type { ItemTags, Reason } from '@/lib/types';
import { verdictFor } from '@/lib/verdict';
import { buildContext, DEFAULT_RULES_PROFILE } from './context';
import { itemLabel } from './garment';
import type { ProfileModifier, Rule, RuleContext, RuleHit, RulesProfile, ScoreResult, Slots } from './types';

/** Combined multiplier from every modifier that touches this rule. */
function modifierFactor(rule: Rule, modifiers: ProfileModifier[]): number {
  const positive = rule.effect > 0;
  return modifiers.reduce((factor, m) => {
    const appliesToSign = m.on === 'both' || (m.on === 'positive') === positive;
    const sharesTag = rule.tags?.some((t) => m.tags.includes(t));
    return appliesToSign && sharesTag ? factor * m.factor : factor;
  }, 1);
}

function joinList(values: string[]): string {
  if (values.length <= 1) return values[0] ?? '';
  return `${values.slice(0, -1).join(', ')} and ${values[values.length - 1]}`;
}

function slotText(value: Slots[string] | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return joinList(value);
  return itemLabel(value);
}

/** Fills {slots} from the rule's own slots, then the outfit's pieces. */
export function fillReason(text: string, ctx: RuleContext, slots: Slots): string {
  const pieces: Slots = {};
  for (const key of ['top', 'bottom', 'shoes', 'outerwear', 'onepiece'] as const) {
    const item = ctx[key];
    if (item) pieces[key] = item;
  }
  const filled = text.replace(/\{(\w+)\}/g, (_, key: string) => slotText(slots[key] ?? pieces[key]) ?? 'piece');
  return filled.charAt(0).toUpperCase() + filled.slice(1);
}

/** Up to maxReasons, keeping room for the most important warnings. Strongest first. */
function pickReasons(hits: RuleHit[]): Reason[] {
  const byStrength = [...hits].sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
  const warnings = byStrength.filter((h) => h.points < 0).slice(0, SCORING.maxWarnings);
  const positives = byStrength.filter((h) => h.points > 0);
  return [...warnings, ...positives]
    .slice(0, SCORING.maxReasons)
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points))
    .map((h) => h.reason);
}

/**
 * Scores an outfit from 0 to 100 and explains why.
 * Pure and deterministic: same items and profile, same result.
 */
export function scoreOutfit(
  items: ItemTags[],
  profile: RulesProfile = DEFAULT_RULES_PROFILE,
  rules: Rule[] = rulesFor(profile.track),
): ScoreResult {
  const ctx = buildContext(items, profile);
  const modifiers = PROFILE_MODIFIERS.filter((m) => m.applies(profile, ctx.heightBand));

  const hits: RuleHit[] = [];
  for (const rule of rules) {
    const result = rule.when(ctx);
    if (!result) continue;
    const slots = result === true ? {} : result;
    hits.push({
      rule,
      points: rule.effect * modifierFactor(rule, modifiers),
      reason: { ruleId: rule.id, kind: rule.kind, positive: rule.effect > 0, text: fillReason(rule.text, ctx, slots) },
    });
  }

  const rewards = hits.reduce((sum, h) => (h.points > 0 ? sum + h.points : sum), 0);
  const penalty = hits.reduce((sum, h) => (h.points < 0 ? sum + h.points : sum), 0);
  const bonus = SCORING.maxBonus * (1 - Math.exp(-rewards / SCORING.bonusCurve));
  const score = Math.round(Math.min(100, Math.max(0, SCORING.base + bonus + penalty)));

  return { score, verdict: verdictFor(score), reasons: pickReasons(hits), hits };
}
