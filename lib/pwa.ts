'use client';

import { useSyncExternalStore } from 'react';

/** Registers the offline service worker. Production only: in dev it would cache stale code. */
export function registerServiceWorker(): void {
  if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
  const register = () =>
    void navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => undefined);
  // After load, so precaching never competes with the first paint. Hydration often
  // finishes after load has already fired, so check before waiting for it.
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}

/** Chrome's install event. Not in the DOM typings yet. */
export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// The browser fires beforeinstallprompt once, often before Settings mounts, so it's kept here.
let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    notify();
  });
}

export type InstallState = 'unknown' | 'installed' | 'available' | 'ios' | 'manual';

function installState(): InstallState {
  if (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone) {
    return 'installed';
  }
  if (deferred) return 'available';
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return 'ios';
  return 'manual';
}

export function useInstallState(): InstallState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    installState,
    () => 'unknown',
  );
}

/** Shows the browser's install dialog, where one is available. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const event = deferred;
  await event.prompt();
  const { outcome } = await event.userChoice;
  deferred = null;
  notify();
  return outcome === 'accepted';
}
