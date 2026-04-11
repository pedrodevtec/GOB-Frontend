"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CharacterSummary } from "@/types/app";

interface CharacterState {
  activeCharacterId: string | null;
  activeCharacter: CharacterSummary | null;
  setActiveCharacter: (character: CharacterSummary | null) => void;
}

function looksLikeUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set) => ({
      activeCharacterId: null,
      activeCharacter: null,
      setActiveCharacter: (character) =>
        set({
          activeCharacterId: character?.id ?? null,
          activeCharacter: character
        })
    }),
    {
      name: "gob-active-character",
      version: 2,
      partialize: (state) => ({
        activeCharacterId: state.activeCharacterId
      }),
      migrate: (persistedState) => {
        const state = persistedState as Partial<CharacterState> | undefined;
        return {
          activeCharacterId: looksLikeUuid(state?.activeCharacterId)
            ? state.activeCharacterId
            : null,
          activeCharacter: null
        };
      }
    }
  )
);
