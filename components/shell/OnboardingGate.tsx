'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { markOnboarded } from '@/lib/db';
import { useProfile } from '@/lib/hooks/data';

/**
 * Sends people without a profile to onboarding. Returning visitors (flagged
 * before paint by the theme script) see the app straight away; first-timers
 * see nothing until the redirect, so an empty Today never flashes past.
 */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const profile = useProfile();

  useEffect(() => {
    if (profile === null) {
      markOnboarded(false);
      router.replace('/onboarding');
    } else if (profile) markOnboarded(true);
  }, [profile, router]);

  const ready = !!profile;
  return (
    <div
      aria-busy={!ready}
      className={ready ? 'transition-opacity duration-(--duration-base)' : 'opacity-0 onboarded:opacity-100'}
    >
      {children}
    </div>
  );
}
