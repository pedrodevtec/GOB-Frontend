"use client";

import { useCharacterStore } from "@/stores/character-store";

export function useActiveCharacter() {
  return useCharacterStore((state) => state.activeCharacter);
}
