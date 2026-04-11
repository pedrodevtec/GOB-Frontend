"use client";

import { EntityCard } from "@/components/game/entity-card";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useActiveCharacter } from "@/hooks/use-active-character";
import { useBuy, useCatalog } from "@/features/shop/hooks/use-shop";

export function ShopCatalog() {
  const { data, isLoading, isError, error, refetch } = useCatalog();
  const buy = useBuy();
  const activeCharacter = useActiveCharacter();

  if (isLoading) {
    return <LoadingState label="Carregando catálogo..." />;
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
        title="Catálogo indisponível"
        description="Os produtos da loja aparecerão aqui quando a API estiver conectada."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.map((item) => (
        <EntityCard
          key={item.id}
          entity={item}
          actionLabel="Comprar"
          onAction={(selected) =>
            buy.mutate({
              characterId: activeCharacter?.id ?? "",
              productId: selected.id,
              quantity: 1
            })
          }
        />
      ))}
    </div>
  );
}
