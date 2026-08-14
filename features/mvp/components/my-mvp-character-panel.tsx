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
        description="Sua ficha continua guardada. Tente novamente em alguns instantes."
      />
    );
  }

  return (
    <MyCharacterReadonlyPanel
      character={character.data}
      tableId={tableId}
      emptyTitle="Voce ainda nao tem personagem neste piloto"
      emptyDescription="Quando você começar a criação e salvar suas respostas, a ficha aparecerá aqui para consulta."
    />
  );
}
