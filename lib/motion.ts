import type { Transition } from 'motion/react';

/**
 * Motion tokens for Motion (Framer Motion). CSS-side durations and easings
 * live in styles/tokens.css; keep the two in step when tuning.
 *
 * Reduced motion is handled globally by <MotionConfig reducedMotion="user">
 * in app/providers.tsx, which drops transform and layout animations.
 */

export const spring = {
  /** The Matched snap: two pieces locking together. Fast, firm, tiny overshoot. */
  snap: { type: 'spring', stiffness: 560, damping: 32, mass: 0.9 },
  /** Chips and toggles popping on select. */
  pop: { type: 'spring', stiffness: 640, damping: 20 },
  /** Indicators, layout shifts and shared-element morphs. */
  settle: { type: 'spring', stiffness: 260, damping: 30 },
  /** Hangers swinging on the rail. Loose, visible overshoot. */
  swing: { type: 'spring', stiffness: 140, damping: 9 },
  /** Garments dropping onto the avatar. */
  drop: { type: 'spring', stiffness: 380, damping: 18, mass: 1.1 },
  /** Large surfaces: sheets, page sections. */
  gentle: { type: 'spring', stiffness: 170, damping: 26 },
} as const satisfies Record<string, Transition>;

/** Scale factors for press and pop feedback. */
export const scale = {
  /** Pressed state for tappable chips and cards. */
  tap: 0.94,
  /** Peak of the chip "pop" on select. */
  pop: 1.08,
} as const;

/** Cubic-bezier easings, matching --ease-* tokens. */
export const ease = {
  standard: [0.2, 0, 0, 1],
  emphasized: [0.22, 1, 0.36, 1],
  exit: [0.4, 0, 1, 1],
} as const;

/** Seconds, matching --duration-* tokens. */
export const duration = {
  instant: 0.09,
  fast: 0.14,
  base: 0.24,
  slow: 0.42,
  /** Score ring fill. */
  ring: 1.1,
} as const;
