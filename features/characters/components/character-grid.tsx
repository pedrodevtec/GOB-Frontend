"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCharacters, useDeleteCharacter } from "@/features/characters/hooks/use-characters";
import {
  resolveAvatarGlyph,
  resolveBannerClass,
  resolveTitleLabel
} from "@/lib/personalization";
import { formatCompactNumber } from "@/lib/utils";
import { useCharacterStore } from "@/stores/character-store";
import {
  getCharacterCustomization,
  useProfileCustomizationStore
} from "@/stores/profile-customization-store";

export function CharacterGrid() {
  const { data, isLoading, isError, error, refetch } = useCharacters();
  const removeCharacter = useDeleteCharacter();
  const activeCharacterId = useCharacterStore((state) => state.activeCharacterId);
  const setActiveCharacter = useCharacterStore((state) => state.setActiveCharacter);
  const characters = useProfileCustomizationStore((state) => state.characters);

  if (isLoading) {
    return <LoadingState label="Carregando personagens..." />;
  }

  if (isError) {
    return (
      <ErrorState
        description={(error as Error).message}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="Nenhum personagem encontrado"
        description="Crie seu primeiro herói para liberar a jornada principal."
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {data.map((character) => {
        const customization = getCharacterCustomization(characters, character.id);

        return (
          <Card
            key={character.id}
            className={
              activeCharacterId === character.id
                ? `space-y-4 border-primary/60 ${resolveBannerClass(customization.bannerId)}`
                : `space-y-4 ${resolveBannerClass(customization.bannerId)}`
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-2xl">
                  {resolveAvatarGlyph(customization.avatarId)} {character.name}
                </p>
                <p className="text-sm text-primary">{resolveTitleLabel(customization.titleId)}</p>
                <p className="text-sm text-muted-foreground">
                  Nível {character.level} • XP {formatCompactNumber(character.xp)}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setActiveCharacter(character)}>
                {activeCharacterId === character.id ? "Ativo" : "Ativar"}
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-muted-foreground">HP</p>
                <p className="mt-1 font-semibold">{character.hp}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-muted-foreground">Stamina</p>
                <p className="mt-1 font-semibold">{character.stamina}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-muted-foreground">Gold</p>
                <p className="mt-1 font-semibold">{character.gold}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={`/characters/${character.id}`} onClick={() => setActiveCharacter(character)}>
                  Abrir
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/characters/${character.id}/summary`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Resumo
                </Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={() => removeCharacter.mutate(character.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
