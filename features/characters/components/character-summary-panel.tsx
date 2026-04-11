"use client";

import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { useCharacterSummary } from "@/features/characters/hooks/use-characters";

export function CharacterSummaryPanel({ characterId }: { characterId: string }) {
  const { data, isLoading, isError, error, refetch } = useCharacterSummary(characterId);

  if (isLoading) {
    return <LoadingState label="Carregando resumo do personagem..." />;
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

  if (!data) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-sm text-muted-foreground">Vida atual</p>
          <p className="mt-2 text-2xl font-semibold">{data.currentHealth}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-2 text-2xl font-semibold">{data.status}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-sm text-muted-foreground">Coins</p>
          <p className="mt-2 text-2xl font-semibold">{data.inventory.coins}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-sm text-muted-foreground">Ultimas acoes</p>
          <p className="mt-2 text-2xl font-semibold">{data.recentGameplayActions.length}</p>
        </div>
      </Card>
      <Card className="space-y-3">
        <p className="text-sm font-medium">Recent gameplay actions</p>
        {data.recentGameplayActions.length ? (
          data.recentGameplayActions.slice(0, 6).map((action) => (
            <div key={action.id} className="rounded-xl bg-white/5 p-3 text-sm">
              <p className="font-medium">{action.actionType}</p>
              <p className="text-muted-foreground">
                {action.outcome}
                {action.availableAt ? ` • ate ${action.availableAt}` : ""}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma acao recente registrada.</p>
        )}
      </Card>
    </div>
  );
}
