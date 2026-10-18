import type { ReactNode } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { OnboardingGate } from '@/components/shell/OnboardingGate';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <OnboardingGate>
      <AppShell>{children}</AppShell>
    </OnboardingGate>
  );
}
