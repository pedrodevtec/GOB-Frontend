"use client";

import { useEffect } from "react";

import { useCharacters } from "@/features/characters/hooks/use-characters";
import { useCharacterStore } from "@/stores/character-store";

export function ActiveCharacterSync() {
  const { data } = useCharacters();
  const activeCharacterId = useCharacterStore((state) => state.activeCharacterId);
  const activeCharacter = useCharacterStore((state) => state.activeCharacter);
  const setActiveCharacter = useCharacterStore((state) => state.setActiveCharacter);

  useEffect(() => {
    if (!data?.length) {
      if (activeCharacter) {
        setActiveCharacter(null);
      }
      return;
    }

    if (!activeCharacter) {
      setActiveCharacter(data[0]);
      return;
    }

    const targetId = activeCharacterId ?? activeCharacter.id;
    const synced = data.find((character) => character.id === targetId);
    if (synced) {
      setActiveCharacter(synced);
      return;
    }

    setActiveCharacter(data[0]);
  }, [activeCharacter, activeCharacterId, data, setActiveCharacter]);

  return null;
}
