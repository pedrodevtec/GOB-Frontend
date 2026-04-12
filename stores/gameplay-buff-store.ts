"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GameplayBuffEntry {
  percent: number;
  expiresAt: string;
  cost?: number;
  npcId?: string;
  npcName?: string;
}

interface GameplayBuffState {
  buffs: Record<string, GameplayBuffEntry>;
  setBuff: (characterId: string, buff: GameplayBuffEntry) => void;
  clearBuff: (characterId: string) => void;
}

export const useGameplayBuffStore = create<GameplayBuffState>()(
  persist(
    (set) => ({
      buffs: {},
      setBuff: (characterId, buff) =>
        set((state) => ({
          buffs: {
            ...state.buffs,
            [characterId]: buff
          }
        })),
      clearBuff: (characterId) =>
        set((state) => {
          const next = { ...state.buffs };
          delete next[characterId];
          return { buffs: next };
        })
    }),
    { name: "gob-gameplay-buffs" }
  )
);
