'use client';

import { MotionConfig } from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import { registerServiceWorker } from '@/lib/pwa';
import { useTheme } from '@/lib/theme';

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => useTheme.getState().hydrate(), []);
  useEffect(() => registerServiceWorker(), []);

  // reducedMotion="user" honours prefers-reduced-motion for every Motion animation.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
