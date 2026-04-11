"use client";

import { useCharacterSummary } from "@/features/characters/hooks/use-characters";
import { useActiveCharacter } from "@/hooks/use-active-character";

export function useActiveCharacterSummary() {
  const activeCharacter = useActiveCharacter();
  return useCharacterSummary(activeCharacter?.id ?? "");
}
