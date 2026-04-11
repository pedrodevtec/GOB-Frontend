"use client";

import { InventorySlot } from "@/components/game/inventory-slot";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useInventory, useInventoryAction } from "@/features/inventory/hooks/use-inventory";

export function InventoryGrid({ characterId }: { characterId: string }) {
  const { data, isLoading, isError, error, refetch } = useInventory(characterId);
  const action = useInventoryAction(characterId);

  if (!characterId) {
    return (
      <EmptyState
        title="Nenhum personagem selecionado"
        description="Ative um personagem para carregar o inventário."
      />
    );
  }

  if (isLoading) {
    return <LoadingState label="Carregando inventário..." />;
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
        title="Inventário vazio"
        description="Equipe itens, loot e recompensas aparecerão aqui."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.map((item) => (
        <InventorySlot
          key={item.id}
          item={item}
          onPrimaryAction={(selected) =>
            action.mutate({
              action: selected.equipped ? "unequip" : "equip",
              itemId: selected.id
            })
          }
          onSecondaryAction={(selected) =>
            action.mutate({ action: "use", itemId: selected.id })
          }
        />
      ))}
    </div>
  );
}
