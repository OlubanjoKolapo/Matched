'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useProfile } from '@/lib/hooks/data';

/**
 * Sends people without a profile to onboarding. The app is rendered (so the
 * HTML is ready) but stays invisible until the profile check resolves, so a
 * first-time visitor never sees an empty Today flash past.
 */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const profile = useProfile();

  useEffect(() => {
    if (profile === null) router.replace('/onboarding');
  }, [profile, router]);

  const ready = !!profile;
  return (
    <div aria-busy={!ready} className={ready ? 'transition-opacity duration-(--duration-base)' : 'opacity-0'}>
      {children}
    </div>
  );
}
