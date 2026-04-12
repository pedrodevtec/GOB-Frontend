"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  AvatarOptionId,
  BannerOptionId,
  ThemeOptionId,
  TitleOptionId
} from "@/lib/personalization";

export interface CharacterCustomization {
  avatarId: AvatarOptionId;
  titleId: TitleOptionId;
  bannerId: BannerOptionId;
}

interface ProfileCustomizationState {
  theme: ThemeOptionId;
  characters: Record<string, CharacterCustomization>;
  setTheme: (theme: ThemeOptionId) => void;
  setCharacterCustomization: (
    characterId: string,
    customization: Partial<CharacterCustomization>
  ) => void;
}

const defaultCharacterCustomization: CharacterCustomization = {
  avatarId: "blade",
  titleId: "wanderer",
  bannerId: "royal"
};

export function getCharacterCustomization(
  characters: Record<string, CharacterCustomization>,
  characterId?: string | null
) {
  if (!characterId) return defaultCharacterCustomization;
  return characters[characterId] ?? defaultCharacterCustomization;
}

export const useProfileCustomizationStore = create<ProfileCustomizationState>()(
  persist(
    (set) => ({
      theme: "default",
      characters: {},
      setTheme: (theme) => set({ theme }),
      setCharacterCustomization: (characterId, customization) =>
        set((state) => ({
          characters: {
            ...state.characters,
            [characterId]: {
              ...getCharacterCustomization(state.characters, characterId),
              ...customization
            }
          }
        }))
    }),
    { name: "gob-profile-customization" }
  )
);
