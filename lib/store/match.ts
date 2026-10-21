'use client';

import { create } from 'zustand';
import type { SlotKey, Slots } from '@/lib/outfit/slots';

/** The outfit on the builder. Lives outside the page so other screens can hand an outfit over. */
interface MatchState {
  slots: Slots;
  setSlot: (slot: SlotKey, id: string | undefined) => void;
  setSlots: (slots: Slots) => void;
  clear: () => void;
}

export const useMatchBuilder = create<MatchState>((set) => ({
  slots: {},
  setSlot: (slot, id) => set(({ slots }) => ({ slots: { ...slots, [slot]: id } })),
  setSlots: (slots) => set({ slots }),
  clear: () => set({ slots: {} }),
}));
