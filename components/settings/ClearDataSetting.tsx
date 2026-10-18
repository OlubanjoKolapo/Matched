'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { clearAllData } from '@/lib/db';

const CONFIRM_WINDOW_MS = 4000;

/** Two taps to wipe everything: the first arms it, the second (within a few seconds) clears. */
export function ClearDataSetting() {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), CONFIRM_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [armed]);

  async function onClick() {
    if (!armed) {
      setArmed(true);
      return;
    }
    setBusy(true);
    await clearAllData();
    router.replace('/onboarding');
  }

  return (
    <Button variant={armed ? 'accent' : 'secondary'} size="sm" onClick={onClick} disabled={busy} aria-live="polite">
      {busy ? 'Clearing…' : armed ? 'Tap again to clear everything' : 'Clear all data'}
    </Button>
  );
}
