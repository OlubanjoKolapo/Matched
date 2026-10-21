'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * Reads a query parameter in the browser without making the page dynamic.
 * False during server render, then the real value after hydration.
 */
export function useSearchParam(name: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );
}

/** False during server render and hydration, true after. Search params are real from then on. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
