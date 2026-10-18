'use client';

import { ButtonLink } from '@/components/ui/Button';
import { Avatar } from '@/components/avatar/Avatar';
import { Text } from '@/components/ui/Text';
import { useProfile } from '@/lib/hooks/data';
import { GOAL_OPTIONS, TRACK_OPTIONS } from '@/lib/onboarding/content';
import { formatHeight } from '@/lib/units';

/** Summary of the onboarding answers, with a way back in to change them. */
export function ProfileSettings() {
  const profile = useProfile();
  if (!profile) return null;

  const track = TRACK_OPTIONS.find((t) => t.value === profile.track)?.title ?? profile.track;
  const goals = profile.goals.map((g) => GOAL_OPTIONS.find((o) => o.value === g)?.label ?? g);
  const rows: [string, string][] = [
    ['Shops for', track],
    ['Height', profile.heightCm ? formatHeight(profile.heightCm, profile.units) : 'Not set'],
    ['Goals', goals.length ? goals.join(', ') : 'Just make it match'],
  ];

  return (
    <div className="flex items-start gap-5 py-6">
      <div className="h-36 w-24 shrink-0 rounded-sm bg-paper-sunken px-1 pt-2">
        <Avatar config={profile.avatar} heightCm={profile.heightCm} idle={false} label="Your figure" />
      </div>
      <div className="flex flex-1 flex-col gap-4">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          {rows.map(([term, value]) => (
            <div key={term} className="contents">
              <dt className="caps pt-0.5 text-ink-muted">{term}</dt>
              <dd>
                <Text as="span">{value}</Text>
              </dd>
            </div>
          ))}
        </dl>
        <ButtonLink href="/onboarding?edit=1" variant="secondary" size="sm" className="self-start">
          Edit profile
        </ButtonLink>
      </div>
    </div>
  );
}
