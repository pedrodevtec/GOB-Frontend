"use client";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useClaimReward, useRewards } from "@/features/rewards/hooks/use-rewards";

export function RewardsList({ characterId }: { characterId: string }) {
  const { data, isLoading, isError, error, refetch } = useRewards(characterId);
  const claim = useClaimReward(characterId);

  if (!characterId) {
    return (
      <EmptyState
        title="Nenhum personagem selecionado"
        description="Ative um personagem para carregar as recompensas."
      />
    );
  }

  if (isLoading) {
    return <LoadingState label="Carregando recompensas..." />;
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
        title="Sem recompensas pendentes"
        description="As próximas claims aparecerão quando você avançar na jornada."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {data.map((reward) => (
        <Card key={reward.id} className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold">{reward.title}</p>
            <p className="text-sm text-muted-foreground">{reward.description}</p>
          </div>
          <Button
            variant={reward.claimable ? "default" : "secondary"}
            disabled={!reward.claimable}
            onClick={() =>
              claim.mutate({
                claimKey: reward.id,
                type: reward.gold ? "COINS" : "XP",
                value: reward.gold ?? reward.xp ?? 0,
                metadata: reward.items?.join(",")
              })
            }
          >
            {reward.claimable ? "Resgatar" : "Indisponível"}
          </Button>
        </Card>
      ))}
    </div>
  );
}
