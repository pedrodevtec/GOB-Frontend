"use client";

import { MvpState } from "@/components/states/mvp-state";
import { MyCharacterReadonlyPanel } from "@/features/mvp/components/character-builder/my-character-readonly-panel";
import { useMyMvpCharacter } from "@/features/mvp/hooks/use-mvp";

export function MyMvpCharacterPanel({ tableId }: { tableId: string }) {
  const character = useMyMvpCharacter(tableId);

  if (character.isLoading) {
    return <MvpState variant="loading" title="Carregando meu personagem" />;
  }

  if (character.isError) {
    return (
      <MvpState
        variant="error"
        title="Meu personagem indisponivel"
        description={(character.error as Error)?.message}
      />
    );
  }

  return (
    <MyCharacterReadonlyPanel
      character={character.data}
      emptyTitle="Voce ainda nao tem personagem neste piloto"
      emptyDescription="Quando o rascunho for salvo no Builder, a ficha consolidada aparecera aqui em modo somente leitura."
    />
  );
}
