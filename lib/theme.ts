'use client';

import { create } from 'zustand';
import { DARK_QUERY, THEME_STORAGE_KEY } from './theme-script';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // Storage can be blocked (private mode); fall back to system.
  }
  return 'system';
}

function resolve(preference: ThemePreference): ResolvedTheme {
  if (preference !== 'system') return preference;
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

function apply(theme: ResolvedTheme) {
  document.documentElement.dataset.theme = theme;
}

interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  hydrated: boolean;
  setPreference: (preference: ThemePreference) => void;
  toggle: () => void;
  /** Reads storage and subscribes to OS changes. Returns an unsubscribe. */
  hydrate: () => () => void;
}

export const useTheme = create<ThemeState>((set, get) => ({
  preference: 'system',
  resolved: 'light',
  hydrated: false,

  setPreference: (preference) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // Non-fatal: the choice still applies for this session.
    }
    const resolved = resolve(preference);
    apply(resolved);
    set({ preference, resolved });
  },

  toggle: () => get().setPreference(get().resolved === 'dark' ? 'light' : 'dark'),

  hydrate: () => {
    const preference = readPreference();
    const resolved = resolve(preference);
    apply(resolved);
    set({ preference, resolved, hydrated: true });

    const media = window.matchMedia(DARK_QUERY);
    const onChange = () => {
      if (get().preference !== 'system') return;
      const next = resolve('system');
      apply(next);
      set({ resolved: next });
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  },
}));
