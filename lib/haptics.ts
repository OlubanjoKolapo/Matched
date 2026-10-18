/** Haptic patterns, in milliseconds. Silently ignored where unsupported. */
export const HAPTICS = {
  /** The Matched snap. */
  snap: [12],
  /** Selecting a chip or option. */
  tick: [6],
} as const;

export function haptic(pattern: readonly number[] = HAPTICS.tick): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  try {
    navigator.vibrate([...pattern]);
  } catch {
    // Some browsers throw outside a user gesture; haptics are a nicety.
  }
}
