"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type CooldownSource = "success" | "conflict";

export interface GameplayCooldownEntry {
  nextAvailableAt: string;
  message?: string;
  source: CooldownSource;
}

interface GameplayCooldownState {
  cooldowns: Record<string, GameplayCooldownEntry>;
  setCooldown: (
    characterId: string,
    action: string,
    referenceId: string,
    entry: GameplayCooldownEntry
  ) => void;
  clearCooldown: (characterId: string, action: string, referenceId: string) => void;
}

export function gameplayCooldownKey(characterId: string, action: string, referenceId: string) {
  return `${characterId}:${action}:${referenceId}`;
}

export const useGameplayCooldownStore = create<GameplayCooldownState>()(
  persist(
    (set) => ({
      cooldowns: {},
      setCooldown: (characterId, action, referenceId, entry) =>
        set((state) => ({
          cooldowns: {
            ...state.cooldowns,
            [gameplayCooldownKey(characterId, action, referenceId)]: entry
          }
        })),
      clearCooldown: (characterId, action, referenceId) =>
        set((state) => {
          const next = { ...state.cooldowns };
          delete next[gameplayCooldownKey(characterId, action, referenceId)];
          return { cooldowns: next };
        })
    }),
    { name: "gob-gameplay-cooldowns" }
  )
);
